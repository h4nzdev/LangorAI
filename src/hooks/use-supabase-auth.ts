'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      // Check for existing session first
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      // No session — sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        console.error('[Supabase] signInAnonymously failed:', error.message)
        console.error('[Supabase] Make sure Anonymous sign-in is enabled in your Supabase dashboard:')
        console.error('  → Authentication → Providers → Anonymous → Enable')
        setLoading(false)
        return
      }

      if (data.user) {
        setUser(data.user)
        syncLocalProfile(data.user.id)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

async function syncLocalProfile(userId: string) {
  try {
    const saved = localStorage.getItem('USER_PROFILE')
    const supabase = createClient()

    const username = saved
      ? (JSON.parse(saved).name || `Player_${userId.slice(0, 6)}`)
      : `Player_${userId.slice(0, 6)}`

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      username,
      ...(saved ? (() => {
        const p = JSON.parse(saved)
        return {
          avatar: p.avatar || '👤',
          level: p.level || 'Beginner',
          points: p.points || 0,
          streak: p.streak || 0,
          total_sessions: p.totalSessions || 0,
          total_minutes: p.totalMinutes || 0,
          learning_goal: p.learningGoal || null,
          proficiency_level: p.proficiencyLevel || null,
        }
      })() : {}),
    }, { onConflict: 'id' })

    if (error) {
      console.error('[Supabase] Profile sync failed:', error.message)
      console.error('[Supabase] Make sure you have run supabase/schema.sql in your SQL editor')
    }
  } catch (e) {
    console.error('[Supabase] syncLocalProfile error:', e)
  }
}
