import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'all-time'
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, username, avatar, level, points, wins, losses, draws, streak')
    .order('points', { ascending: false })
    .limit(limit)

  if (period === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('last_active_date', weekAgo.slice(0, 10))
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ranked = (data ?? []).map((profile, index) => ({
    rank: index + 1,
    ...profile,
    total_battles: (profile.wins ?? 0) + (profile.losses ?? 0) + (profile.draws ?? 0),
    win_rate: profile.wins > 0
      ? Math.round((profile.wins / ((profile.wins ?? 0) + (profile.losses ?? 0) + (profile.draws ?? 0))) * 100)
      : 0,
  }))

  return NextResponse.json(ranked)
}
