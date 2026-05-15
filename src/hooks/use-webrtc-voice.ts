'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTCVoice(
  roomId: string,
  currentUserId: string | undefined,
  opponentId:    string | undefined,
) {
  const [isConnected,  setIsConnected]  = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [voiceMuted,   setVoiceMuted]   = useState(false);

  const pcRef           = useRef<RTCPeerConnection | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const channelRef      = useRef<RealtimeChannel | null>(null);
  const supabaseRef     = useRef<ReturnType<typeof createClient> | null>(null);
  const negotiatedRef   = useRef(false);

  // Lex-smaller user_id is the WebRTC offerer
  const isOffererRef    = useRef(false);
  useEffect(() => {
    if (currentUserId && opponentId) {
      isOffererRef.current = currentUserId.localeCompare(opponentId) < 0;
    }
  }, [currentUserId, opponentId]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (audioRef.current) { audioRef.current.srcObject = null; audioRef.current = null; }
    if (supabaseRef.current && channelRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
    }
    channelRef.current  = null;
    supabaseRef.current = null;
    negotiatedRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendOffer = useCallback(async () => {
    const pc = pcRef.current;
    const ch = channelRef.current;
    if (!pc || !ch || !currentUserId || negotiatedRef.current) return;
    negotiatedRef.current = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ch.send({ type: 'broadcast', event: 'rtc_offer', payload: { sdp: offer, from: currentUserId } });
    } catch {
      negotiatedRef.current = false; // allow retry
    }
  }, [currentUserId]);

  const connect = useCallback(async () => {
    if (!currentUserId || !opponentId || !roomId) return;
    if (pcRef.current) return; // already connecting/connected

    setIsConnecting(true);

    // Acquire local audio
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      setIsConnecting(false);
      return;
    }
    localStreamRef.current = stream;

    // RTCPeerConnection
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;
    stream.getAudioTracks().forEach(t => pc.addTrack(t, stream));

    // Remote audio
    const audio = new Audio();
    audio.autoplay = true;
    audioRef.current = audio;

    pc.ontrack = (ev) => {
      audio.srcObject = ev.streams[0];
      setIsConnected(true);
      setIsConnecting(false);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate && channelRef.current && currentUserId) {
        channelRef.current.send({
          type: 'broadcast', event: 'rtc_ice',
          payload: { candidate: ev.candidate, from: currentUserId },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected')    { setIsConnected(true);  setIsConnecting(false); }
      if (state === 'disconnected' || state === 'failed') {
        setIsConnected(false); setIsConnecting(false);
      }
    };

    // Supabase signalling channel
    const supabase = createClient();
    supabaseRef.current = supabase;

    const ch: RealtimeChannel = supabase.channel(`webrtc:${roomId}`)
      .on('broadcast', { event: 'rtc_ready' }, async ({ payload }) => {
        if (payload.from === currentUserId) return;
        if (isOffererRef.current && !negotiatedRef.current) await sendOffer();
      })
      .on('broadcast', { event: 'rtc_offer' }, async ({ payload }) => {
        if (payload.from === currentUserId || !pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          channelRef.current?.send({
            type: 'broadcast', event: 'rtc_answer',
            payload: { sdp: answer, from: currentUserId },
          });
        } catch { /* ignore race */ }
      })
      .on('broadcast', { event: 'rtc_answer' }, async ({ payload }) => {
        if (payload.from === currentUserId || !pcRef.current) return;
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        } catch { /* ignore */ }
      })
      .on('broadcast', { event: 'rtc_ice' }, async ({ payload }) => {
        if (payload.from === currentUserId || !pcRef.current) return;
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore */ }
      });

    channelRef.current = ch;

    ch.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return;
      // Announce presence so the other side knows we're ready
      ch.send({ type: 'broadcast', event: 'rtc_ready', payload: { from: currentUserId } });
      // Offerer initiates immediately
      if (isOffererRef.current) void sendOffer();
    });
  }, [roomId, currentUserId, opponentId, sendOffer]);

  const disconnect = useCallback(() => { cleanup(); }, [cleanup]);

  const toggleVoiceMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVoiceMuted(!track.enabled);
  }, []);

  useEffect(() => () => { cleanup(); }, [cleanup]);

  return { isConnected, isConnecting, voiceMuted, connect, disconnect, toggleVoiceMute };
}
