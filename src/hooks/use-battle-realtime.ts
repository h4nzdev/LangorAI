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

interface BroadcastErrorPayload      { user_id: string; error_count: number; accuracy: number }
interface BroadcastEndPayload        { winner_id: string | null }
interface BroadcastSpeakPayload      { user_id: string; isSpeaking: boolean }
interface BroadcastTranscriptPayload { user_id: string; text: string }
interface BroadcastTurnPayload       { next_speaker_id: string }

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export function useBattleRealtime(roomId: string | null) {
  const [participants, setParticipants]         = useState<BattleParticipant[]>([])
  const [room, setRoom]                         = useState<BattleRoomState | null>(null)
  const [currentUserId, setCurrentUserId]       = useState<string | null>(null)
  const [opponentIsSpeaking, setOpponentIsSpeaking] = useState(false)
  const [opponentTranscript, setOpponentTranscript] = useState('')
  const [currentSpeakerId, setCurrentSpeakerId]  = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus]  = useState<ConnectionStatus>('connecting')

  const channelRef = useRef<RealtimeChannel | null>(null)
  const userIdRef  = useRef<string | null>(null)

  useEffect(() => {
    if (!roomId) return
    const supabase = createClient()

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        userIdRef.current = user.id
      }

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
        const ps = rawParticipants.map(normalizeParticipant)
        setParticipants(ps)
        // Deterministic first speaker: lexicographically smaller user_id goes first
        if (ps.length === 2) {
          const first = [...ps].sort((a, b) => a.user_id.localeCompare(b.user_id))[0]
          setCurrentSpeakerId(first.user_id)
        }
      }
    }

    load()

    channelRef.current = supabase
      .channel(`battle:${roomId}`)
      .on<BroadcastErrorPayload>('broadcast', { event: 'error_update' }, ({ payload }) => {
        setParticipants(prev =>
          prev.map(p =>
            p.user_id === payload.user_id
              ? { ...p, error_count: payload.error_count, accuracy: payload.accuracy }
              : p
          )
        )
      })
      .on<BroadcastEndPayload>('broadcast', { event: 'battle_end' }, ({ payload }) => {
        setRoom(prev => prev ? { ...prev, status: 'completed', winner_id: payload.winner_id } : null)
      })
      .on<BroadcastSpeakPayload>('broadcast', { event: 'speaking_state' }, ({ payload }) => {
        if (payload.user_id !== userIdRef.current) {
          setOpponentIsSpeaking(payload.isSpeaking)
          if (!payload.isSpeaking) setOpponentTranscript('')
        }
      })
      .on<BroadcastTranscriptPayload>('broadcast', { event: 'live_transcript' }, ({ payload }) => {
        if (payload.user_id !== userIdRef.current) {
          setOpponentTranscript(payload.text)
        }
      })
      .on<BroadcastTurnPayload>('broadcast', { event: 'turn_change' }, ({ payload }) => {
        setCurrentSpeakerId(payload.next_speaker_id)
        // Clear opponent transcript when their turn starts
        if (payload.next_speaker_id === userIdRef.current) {
          setOpponentTranscript('')
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('disconnected')
        }
      })

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

  const broadcastSpeaking = useCallback((isSpeaking: boolean) => {
    if (!channelRef.current || !userIdRef.current) return
    channelRef.current.send({
      type: 'broadcast', event: 'speaking_state',
      payload: { user_id: userIdRef.current, isSpeaking },
    })
  }, [])

  const broadcastTranscript = useCallback((text: string) => {
    if (!channelRef.current || !userIdRef.current) return
    channelRef.current.send({
      type: 'broadcast', event: 'live_transcript',
      payload: { user_id: userIdRef.current, text },
    })
  }, [])

  const broadcastTurnChange = useCallback((nextSpeakerId: string) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast', event: 'turn_change',
      payload: { next_speaker_id: nextSpeakerId },
    })
    setCurrentSpeakerId(nextSpeakerId)
  }, [])

  const player   = participants.find(p => p.user_id === currentUserId) ?? null
  const opponent = participants.find(p => p.user_id !== currentUserId) ?? null

  return {
    room, player, opponent, currentUserId, currentSpeakerId,
    opponentIsSpeaking, opponentTranscript, connectionStatus,
    reportError, broadcastSpeaking, broadcastTranscript, broadcastTurnChange,
  }
}

function normalizeParticipant(raw: Record<string, unknown>): BattleParticipant {
  const profile = raw.profiles as { username?: string; avatar?: string } | null
  return {
    user_id:     raw.user_id as string,
    username:    profile?.username ?? 'Player',
    avatar:      profile?.avatar   ?? '👤',
    error_count: (raw.error_count as number) ?? 0,
    accuracy:    (raw.accuracy    as number) ?? 100,
  }
}
