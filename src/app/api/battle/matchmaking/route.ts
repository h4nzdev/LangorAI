import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { errorLimit } = await request.json()
  if (![5, 10, 20].includes(errorLimit)) {
    return NextResponse.json({ error: 'Invalid error limit' }, { status: 400 })
  }

  // Clean up any stale queue entry for this user
  await service.from('matchmaking_queue').delete().eq('user_id', user.id)

  // Abandon any active battle rooms the user was already in (handles page close/refresh)
  const { data: staleParticipants } = await service
    .from('battle_participants')
    .select('room_id')
    .eq('user_id', user.id)

  if (staleParticipants?.length) {
    const roomIds = staleParticipants.map(r => r.room_id as string)
    const { data: activeRooms } = await service
      .from('battle_rooms')
      .select('id')
      .in('id', roomIds)
      .eq('status', 'active')

    for (const activeRoom of activeRooms ?? []) {
      // Opponent wins by default when a player abandons
      const { data: others } = await service
        .from('battle_participants')
        .select('user_id')
        .eq('room_id', activeRoom.id)
        .neq('user_id', user.id)

      const opponentId = others?.[0]?.user_id ?? null

      await service.from('battle_rooms').update({
        status: 'completed',
        winner_id: opponentId,
        ended_at: new Date().toISOString(),
      }).eq('id', activeRoom.id)

      // Award points for the abandoned room
      if (opponentId) {
        const { data: wp } = await service.from('profiles').select('wins, points').eq('id', opponentId).single()
        await service.from('profiles').update({
          wins: (wp?.wins ?? 0) + 1,
          points: (wp?.points ?? 0) + 20,
        }).eq('id', opponentId)
      }
      const { data: lp } = await service.from('profiles').select('losses, points').eq('id', user.id).single()
      await service.from('profiles').update({
        losses: (lp?.losses ?? 0) + 1,
        points: (lp?.points ?? 0) + 5,
      }).eq('id', user.id)

      // Notify the opponent still in that room
      const abandonedChannel = service.channel(`battle:${activeRoom.id}`)
      await abandonedChannel.send({
        type: 'broadcast',
        event: 'battle_end',
        payload: { winner_id: opponentId },
      })
    }
  }

  // Look for a waiting player with the same error limit
  const { data: opponent } = await service
    .from('matchmaking_queue')
    .select('*')
    .eq('error_limit', errorLimit)
    .neq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (opponent) {
    // Create battle room
    const { data: room, error: roomErr } = await service
      .from('battle_rooms')
      .insert({ error_limit: errorLimit, status: 'active', started_at: new Date().toISOString() })
      .select()
      .single()

    if (roomErr || !room) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }

    // Add both players
    await service.from('battle_participants').insert([
      { room_id: room.id, user_id: opponent.user_id },
      { room_id: room.id, user_id: user.id },
    ])

    // Remove both from queue
    await service.from('matchmaking_queue').delete().in('user_id', [opponent.user_id, user.id])

    return NextResponse.json({ roomId: room.id, matched: true })
  }

  // No opponent yet — add self to queue
  await service.from('matchmaking_queue').insert({ user_id: user.id, error_limit: errorLimit })
  return NextResponse.json({ roomId: null, matched: false })
}

export async function DELETE() {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await service.from('matchmaking_queue').delete().eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
