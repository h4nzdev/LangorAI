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

  const { data: roomData } = await service
    .from('battle_rooms')
    .select('status')
    .eq('id', roomId)
    .single()

  if (!roomData || roomData.status !== 'active') {
    return NextResponse.json({ error: 'Battle not active' }, { status: 400 })
  }

  const { data: allParticipants } = await service
    .from('battle_participants')
    .select('user_id')
    .eq('room_id', roomId)

  const opponentId = allParticipants?.find(p => p.user_id !== user.id)?.user_id ?? null

  await service.from('battle_rooms').update({
    status: 'completed',
    winner_id: opponentId,
    ended_at: new Date().toISOString(),
  }).eq('id', roomId)

  // Loser: losses +1, points +5 for participation
  const { data: lp } = await service.from('profiles').select('losses, points').eq('id', user.id).single()
  await service.from('profiles').update({
    losses: (lp?.losses ?? 0) + 1,
    points: (lp?.points ?? 0) + 5,
  }).eq('id', user.id)

  // Winner: wins +1, points +20
  if (opponentId) {
    const { data: wp } = await service.from('profiles').select('wins, points').eq('id', opponentId).single()
    await service.from('profiles').update({
      wins: (wp?.wins ?? 0) + 1,
      points: (wp?.points ?? 0) + 20,
    }).eq('id', opponentId)
  }

  // Broadcast so both clients see the battle_end event
  const broadcastChannel = service.channel(`battle:${roomId}`)
  await broadcastChannel.send({
    type: 'broadcast',
    event: 'battle_end',
    payload: { winner_id: opponentId },
  })

  return NextResponse.json({ success: true })
}
