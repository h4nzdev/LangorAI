import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['username', 'avatar', 'level', 'learning_goal', 'proficiency_level'] as const
  const update: ProfileUpdate = {}
  for (const key of allowed) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key]
  }

  const { data, error } = await supabase.from('profiles').update(update).eq('id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
