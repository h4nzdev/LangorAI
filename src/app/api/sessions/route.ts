import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: user.id,
      topic: body.topic ?? 'General',
      duration_minutes: body.duration_minutes ?? 0,
      grammar_score: body.grammar_score ?? 0,
      fluency_score: body.fluency_score ?? 0,
      confidence_score: body.confidence_score ?? 0,
      error_count: body.error_count ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update profile aggregate stats
  await supabase.rpc('increment_session_stats', {
    p_user_id: user.id,
    p_minutes: body.duration_minutes ?? 0,
  }).maybeSingle()

  return NextResponse.json(data, { status: 201 })
}
