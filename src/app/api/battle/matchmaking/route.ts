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
