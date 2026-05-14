import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    topic,
    durationMinutes,
    grammarScore,
    fluencyScore,
    confidenceScore,
    errorCount,
  } = await request.json()

  // Save the session record
  await service.from('practice_sessions').insert({
    user_id: user.id,
    topic: topic ?? 'General',
    duration_minutes: Math.max(1, durationMinutes ?? 1),
    grammar_score: grammarScore ?? 0,
    fluency_score: fluencyScore ?? 0,
    confidence_score: confidenceScore ?? 0,
    error_count: errorCount ?? 0,
  })

  // Update profile stats + streak
  const { data: profile } = await service
    .from('profiles')
    .select('last_active_date, streak, total_sessions, total_minutes')
    .eq('id', user.id)
    .single()

  if (profile) {
    const today      = new Date().toISOString().split('T')[0]
    const yesterday  = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const lastActive = profile.last_active_date as string | null

    let newStreak = profile.streak ?? 0
    if (!lastActive || lastActive < yesterday) {
      newStreak = 1                          // first session or gap — reset
    } else if (lastActive === yesterday) {
      newStreak = newStreak + 1              // consecutive day — extend
    }
    // lastActive === today → streak unchanged (already counted today)

    await service.from('profiles').update({
      total_sessions:  (profile.total_sessions ?? 0) + 1,
      total_minutes:   (profile.total_minutes  ?? 0) + Math.max(1, durationMinutes ?? 1),
      last_active_date: today,
      streak: lastActive === today ? newStreak : newStreak, // always write
    }).eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
