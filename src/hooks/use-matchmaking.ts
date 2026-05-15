'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMatchmaking(
  errorLimit: number,
  onMatchFound: (roomId: string) => void
) {
  const [searchTime, setSearchTime] = useState(0)
  const [status, setStatus] = useState('Searching for an opponent...')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchFoundRef = useRef(false)

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const cancel = useCallback(async () => {
    cleanup()
    await fetch('/api/battle/matchmaking', { method: 'DELETE' })
  }, [cleanup])

  useEffect(() => {
    const supabase = createClient()

    timerRef.current = setInterval(() => setSearchTime(prev => prev + 1), 1000)

    const start = async () => {
      // First attempt — may instantly match if another player is already waiting
      const res = await fetch('/api/battle/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLimit }),
      })

      if (!res.ok) {
        setStatus('Connection error. Retrying...')
        return
      }

      const data = await res.json()

      if (data.matched && data.roomId) {
        if (matchFoundRef.current) return
        matchFoundRef.current = true
        setStatus('Match found!')
        cleanup()
        setTimeout(() => onMatchFound(data.roomId), 600)
        return
      }

      // Poll every 2 s — checks if we've been added to a battle room by another player
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      pollRef.current = setInterval(async () => {
        if (matchFoundRef.current) return

        // Only match rooms that are currently active (guards against stale rooms from
        // a previous session the user left without properly ending)
        const { data: participants } = await supabase
          .from('battle_participants')
          .select('room_id')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(5)

        for (const row of participants ?? []) {
          const { data: room } = await supabase
            .from('battle_rooms')
            .select('status')
            .eq('id', row.room_id)
            .eq('status', 'active')
            .maybeSingle()

          if (room) {
            matchFoundRef.current = true
            setStatus('Match found!')
            cleanup()
            onMatchFound(row.room_id as string)
            return
          }
        }
      }, 2000)
    }

    start()

    return () => { cleanup() }
  }, [errorLimit, onMatchFound, cleanup])

  return { searchTime, status, cancel }
}
