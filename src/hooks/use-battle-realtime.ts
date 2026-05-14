'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface BattleParticipant {
  user_id: string
  username: string
  avatar: string
  error_count: number
  accuracy: number
}

export interface BattleRoomState {
  status: 'waiting' | 'active' | 'completed'
  winner_id: string | null
  error_limit: number
}

interface BroadcastErrorPayload {
  user_id: string
  error_count: number
  accuracy: number
}

interface BroadcastEndPayload {
  winner_id: string | null
}

export function useBattleRealtime(roomId: string | null) {
  const [participants, setParticipants] = useState<BattleParticipant[]>([])
  const [room, setRoom] = useState<BattleRoomState | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!roomId) return
    const supabase = createClient()

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // Initial DB fetch for room + participants (no publication needed — just a SELECT)
      const [{ data: roomData }, { data: rawParticipants }] = await Promise.all([
        supabase.from('battle_rooms').select('*').eq('id', roomId).single(),
        supabase
          .from('battle_participants')
          .select('user_id, error_count, accuracy, profiles(username, avatar)')
          .eq('room_id', roomId),
      ])

      if (roomData) {
        setRoom({ status: roomData.status, winner_id: roomData.winner_id, error_limit: roomData.error_limit })
      }
      if (rawParticipants) {
        setParticipants(rawParticipants.map(normalizeParticipant))
      }
    }

    load()

    // Broadcast channel — free on all Supabase plans, no publication/replica needed
    channelRef.current = supabase
      .channel(`battle:${roomId}`)
      .on<BroadcastErrorPayload>(
        'broadcast',
        { event: 'error_update' },
        ({ payload }) => {
          setParticipants(prev =>
            prev.map(p =>
              p.user_id === payload.user_id
                ? { ...p, error_count: payload.error_count, accuracy: payload.accuracy }
                : p
            )
          )
        }
      )
      .on<BroadcastEndPayload>(
        'broadcast',
        { event: 'battle_end' },
        ({ payload }) => {
          setRoom(prev => prev ? { ...prev, status: 'completed', winner_id: payload.winner_id } : null)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [roomId])

  const reportError = useCallback(async () => {
    if (!roomId) return
    await fetch(`/api/battle/${roomId}/error`, { method: 'POST' })
  }, [roomId])

  const player = participants.find(p => p.user_id === currentUserId) ?? null
  const opponent = participants.find(p => p.user_id !== currentUserId) ?? null

  return { room, player, opponent, currentUserId, reportError }
}

function normalizeParticipant(raw: Record<string, unknown>): BattleParticipant {
  const profile = raw.profiles as { username?: string; avatar?: string } | null
  return {
    user_id: raw.user_id as string,
    username: profile?.username ?? 'Player',
    avatar: profile?.avatar ?? '👤',
    error_count: (raw.error_count as number) ?? 0,
    accuracy: (raw.accuracy as number) ?? 100,
  }
}
