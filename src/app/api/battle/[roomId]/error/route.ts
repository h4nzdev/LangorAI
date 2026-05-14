import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: participant } = await service
    .from('battle_participants')
    .select('error_count')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Not in this room' }, { status: 404 })

  const { data: roomData } = await service
    .from('battle_rooms')
    .select('error_limit, status')
    .eq('id', roomId)
    .single()

  if (!roomData || roomData.status !== 'active') {
    return NextResponse.json({ error: 'Battle not active' }, { status: 400 })
  }

  const newErrorCount = participant.error_count + 1
  const newAccuracy = Math.max(0, Math.round(100 - (newErrorCount / roomData.error_limit) * 100))

  await service
    .from('battle_participants')
    .update({ error_count: newErrorCount, accuracy: newAccuracy })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  const battleEnded = newErrorCount >= roomData.error_limit
  let winnerId: string | null = null

  if (battleEnded) {
    const { data: allParticipants } = await service
      .from('battle_participants')
      .select('user_id, error_count')
      .eq('room_id', roomId)

    const opponent = allParticipants?.find(p => p.user_id !== user.id)
    winnerId = opponent?.user_id ?? null

    await service.from('battle_rooms').update({
      status: 'completed',
      winner_id: winnerId,
      ended_at: new Date().toISOString(),
    }).eq('id', roomId)

    // Award points — winner +20, loser +5 for participation
    if (winnerId) {
      const { data: wp } = await service
        .from('profiles')
        .select('wins, points')
        .eq('id', winnerId)
        .single()
      await service.from('profiles').update({
        wins: (wp?.wins ?? 0) + 1,
        points: (wp?.points ?? 0) + 20,
      }).eq('id', winnerId)
    }

    const { data: lp } = await service
      .from('profiles')
      .select('losses, points')
      .eq('id', user.id)
      .single()
    await service.from('profiles').update({
      losses: (lp?.losses ?? 0) + 1,
      points: (lp?.points ?? 0) + 5,
    }).eq('id', user.id)
  }

  // Broadcast via Supabase channel — free on all plans
  const broadcastChannel = service.channel(`battle:${roomId}`)
  await broadcastChannel.send({
    type: 'broadcast',
    event: 'error_update',
    payload: { user_id: user.id, error_count: newErrorCount, accuracy: newAccuracy },
  })
  if (battleEnded) {
    await broadcastChannel.send({
      type: 'broadcast',
      event: 'battle_end',
      payload: { winner_id: winnerId },
    })
  }

  return NextResponse.json({ errorCount: newErrorCount, accuracy: newAccuracy, battleEnded })
}
