'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Sparkles, Zap, AlertCircle, CheckCircle2, Lock, SendHorizonal, WifiOff, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBattleRealtime } from '@/hooks/use-battle-realtime';
import { useToast } from '@/hooks/use-toast';
import { checkGrammar, preprocessVoiceText } from '@/lib/grammar-checker';
import { pickTopicForGoal } from '@/lib/recommendations';

// ── Debate motions ────────────────────────────────────────────────────────────
const DEBATE_MOTIONS = [
  'Social media does more harm than good to society',
  'Artificial intelligence will replace most human jobs within 10 years',
  'Working from home is better than working in an office',
  'University education is no longer worth the cost',
  'Climate change should be the world\'s top priority',
  'Video games have a positive effect on young people',
  'Celebrities have too much influence on public opinion',
  'Owning a car in a city is unnecessary',
  'Learning a foreign language should be mandatory in schools',
  'Technology is making people less creative',
  'Fast food should be taxed like cigarettes',
  'Space exploration is a waste of money',
  'Traditional sports will be replaced by esports',
  'Remote work is here to stay permanently',
  'Social skills are more important than academic skills',
];

const MIN_WORDS        = 8;
const TURN_TIMEOUT_SEC = 10;

// ── Types ──────────────────────────────────────────────────────────────────────
interface BattleRoomProps {
  roomId: string;
  errorLimit: number;
  learningGoal?: string; // from user profile — weights debate topic selection
  onBattleEnd: (result: {
    playerErrors: number; opponentErrors: number; playerAccuracy: number;
    fluencyScore: number; pointsEarned: number; winner: 'player' | 'opponent' | 'draw';
  }) => void;
}

interface ErrorOverlay {
  originalText: string; correctedText: string; explanation: string; enhanced: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BattleRoom({ roomId, errorLimit, learningGoal, onBattleEnd }: BattleRoomProps) {
  const {
    room, player, opponent, currentUserId, currentSpeakerId,
    opponentIsSpeaking, opponentTranscript, connectionStatus,
    reportError, broadcastSpeaking, broadcastTranscript, broadcastTurnChange,
  } = useBattleRealtime(roomId);
  const { toast } = useToast();

  const [isMuted, setIsMuted]           = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [myTranscript, setMyTranscript] = useState('');
  const [errorOverlay, setErrorOverlay] = useState<ErrorOverlay | null>(null);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [battleEnded, setBattleEnded]   = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [aiMode, setAiMode]             = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [motion]                        = useState(() => pickTopicForGoal(roomId, learningGoal ?? 'General', DEBATE_MOTIONS));
  const [isSwitchingTurn, setIsSwitchingTurn]   = useState(false);
  const [tooShortWarning, setTooShortWarning]   = useState(false);
  const [timeExpiredFlash, setTimeExpiredFlash] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft]         = useState<number | null>(null);

  const recognitionRef       = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const isMutedRef           = useRef(false);
  const battleEndedRef       = useRef(false);
  const startTimeRef         = useRef(Date.now());
  // Always-current refs so callbacks never hold stale closures
  const opponentRef          = useRef(opponent);
  const handleFinalRef       = useRef<(text: string) => void>(() => {});
  const startRecognitionRef  = useRef<() => void>(() => {});
  const myTranscriptRef      = useRef('');
  const isMyTurnRef          = useRef(false);
  // Tracks whether the current recognition session already fired isFinal
  const finalizedRef         = useRef(false);
  // Set to true by stopRecognition so onend doesn't fight against an intentional abort
  const abortedRef           = useRef(false);
  // Tracks if the player has spoken at all this turn (prevents timer restarting on pause)
  const hasSpokenThisTurnRef = useRef(false);
  const turnTimerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleTimeExpiredRef = useRef<() => void>(() => {});

  useEffect(() => { isMutedRef.current     = isMuted;    }, [isMuted]);
  useEffect(() => { battleEndedRef.current = battleEnded; }, [battleEnded]);
  useEffect(() => { opponentRef.current    = opponent;    }, [opponent]);
  useEffect(() => { myTranscriptRef.current = myTranscript; }, [myTranscript]);

  // Debate position: lex-smaller user_id → FOR, larger → AGAINST
  const myPosition = currentUserId && opponent
    ? (currentUserId.localeCompare(opponent.user_id) < 0 ? 'FOR' : 'AGAINST')
    : null;

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) setSpeechSupported(false);
    setAiMode(!!localStorage.getItem('GEMINI_API_KEY'));
  }, []);

  // Derived turn state
  const isMyTurn       = currentSpeakerId === currentUserId;
  const isOpponentTurn = currentSpeakerId !== null && currentSpeakerId !== currentUserId;

  useEffect(() => { isMyTurnRef.current = isMyTurn; }, [isMyTurn]);

  // Reset "has spoken" flag every time a new turn starts for me
  useEffect(() => {
    if (isMyTurn) hasSpokenThisTurnRef.current = false;
  }, [isMyTurn]);

  // Track when the player first starts speaking this turn
  useEffect(() => {
    if (isListening) hasSpokenThisTurnRef.current = true;
  }, [isListening]);

  // ── 10-second response timer ─────────────────────────────────────────────────
  useEffect(() => {
    const clear = () => {
      if (turnTimerRef.current) { clearInterval(turnTimerRef.current); turnTimerRef.current = null; }
      setTurnTimeLeft(null);
    };

    // Only run when it's my turn, battle is live, and I haven't spoken yet
    if (!isMyTurn || room?.status !== 'active' || battleEnded || isSwitchingTurn ||
        isListening || hasSpokenThisTurnRef.current) {
      clear();
      return;
    }

    let remaining = TURN_TIMEOUT_SEC;
    setTurnTimeLeft(remaining);

    turnTimerRef.current = setInterval(() => {
      remaining -= 1;
      setTurnTimeLeft(remaining);
      if (remaining <= 0) {
        clear();
        handleTimeExpiredRef.current();
      }
    }, 1000);

    return clear;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, room?.status, battleEnded, isSwitchingTurn, isListening]);

  // ── Battle end ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (room?.status !== 'completed' || battleEnded) return;
    setBattleEnded(true);
    stopRecognition();
    const playerErrors   = player?.error_count  ?? 0;
    const opponentErrors = opponent?.error_count ?? 0;
    const playerWon = room.winner_id === currentUserId;
    const isDraw    = !room.winner_id;
    setTimeout(() => {
      onBattleEnd({
        playerErrors, opponentErrors,
        playerAccuracy: player?.accuracy ?? 100,
        fluencyScore: Math.round(100 - (playerErrors / errorLimit) * 50),
        pointsEarned: playerWon ? 20 : isDraw ? 10 : 5,
        winner: playerWon ? 'player' : isDraw ? 'draw' : 'opponent',
      });
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, room?.winner_id, battleEnded]);

  // ── Recognition helpers ──────────────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      abortedRef.current = true; // tell onend this was intentional — don't restart
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    broadcastSpeaking(false);
  }, [broadcastSpeaking]);

  const startRecognition = useCallback(() => {
    if (battleEndedRef.current || isMutedRef.current || recognitionRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) return;

    finalizedRef.current = false; // Reset for this new utterance
    abortedRef.current   = false; // Reset abort flag for this new utterance

    const rec = new SR();
    rec.lang            = 'en-US';
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      broadcastSpeaking(true);
    };

    rec.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const result = event.results[event.resultIndex];
      const text   = result[0].transcript;
      setMyTranscript(text);
      broadcastTranscript(text);

      if (result.isFinal) {
        finalizedRef.current = true;
        setMyTranscript('');
        handleFinalRef.current(text);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      broadcastSpeaking(false);

      // Intentionally stopped (turn switch, mute, manual send) — do nothing
      if (abortedRef.current) {
        abortedRef.current = false;
        return;
      }

      if (!finalizedRef.current && isMyTurnRef.current && !battleEndedRef.current) {
        const pending = myTranscriptRef.current.trim();
        const wordCount = pending.split(/\s+/).filter(Boolean).length;

        if (wordCount >= MIN_WORDS) {
          // Enough content — auto-submit (handles mobile where isFinal never fires)
          setMyTranscript('');
          setTimeout(() => handleFinalRef.current(pending), 80);
        } else {
          // Paused mid-sentence or no speech yet — restart mic so they can continue
          setTimeout(() => startRecognitionRef.current(), 400);
        }
      }
    };

    rec.onerror = (e: { error: string }) => {
      if (e.error === 'not-allowed') {
        toast({ variant: 'destructive', title: 'Microphone blocked', description: 'Allow microphone access to play.' });
        setBattleEnded(true);
      }
      // 'no-speech' and other errors let onend handle cleanup
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, [broadcastSpeaking, broadcastTranscript]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Switch turn ──────────────────────────────────────────────────────────────
  const switchTurn = useCallback(() => {
    if (!opponentRef.current || battleEndedRef.current) return;
    const nextId = opponentRef.current.user_id;
    setIsSwitchingTurn(true);
    setTimeout(() => {
      broadcastTurnChange(nextId);
      setIsSwitchingTurn(false);
    }, 1200); // Long enough to read "Switching…" without feeling rushed
  }, [broadcastTurnChange]);

  // ── Time-expired penalty ─────────────────────────────────────────────────────
  const handleTimeExpired = useCallback(() => {
    if (battleEndedRef.current || !isMyTurnRef.current) return;
    stopRecognition();
    setTimeExpiredFlash(true);
    setTimeout(() => setTimeExpiredFlash(false), 2200);
    void reportError();
    switchTurn();
  }, [stopRecognition, reportError, switchTurn]);

  useEffect(() => { handleTimeExpiredRef.current = handleTimeExpired; }, [handleTimeExpired]);

  // ── Grammar check & turn hand-off ────────────────────────────────────────────
  // IMPORTANT: turn switches FIRST, grammar check runs in background after.
  // This is the core fix for the "stuck turn" / lag bug — the API call must
  // never block the turn transition.
  const handleFinalUtterance = useCallback(async (text: string) => {
    if (!text.trim() || battleEndedRef.current) return;

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_WORDS) {
      setTooShortWarning(true);
      setTimeout(() => {
        setTooShortWarning(false);
        startRecognitionRef.current();
      }, 1800);
      return;
    }

    // Fix STT artefacts (lowercase "i", capitalise first word) before checking
    const processed = preprocessVoiceText(text);

    // ✅ Switch turn immediately — do NOT wait for grammar check
    switchTurn();

    // Local synchronous check (zero latency)
    const local = checkGrammar(processed);

    if (local.hasError && local.correctedText) {
      setErrorOverlay({
        originalText: local.originalText,
        correctedText: local.correctedText,
        explanation: local.explanation ?? '',
        enhanced: false,
      });
      // Fire-and-forget — DB update happens in background, doesn't block anything
      void reportError();
      setTimeout(() => setErrorOverlay(null), 4000);

      // Optional AI enhancement (fully non-blocking, decorative only)
      const apiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
      if (apiKey) {
        fetch('/api/battle/grammar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: processed, apiKey }),
        })
          .then(r => r.ok ? r.json() : null)
          .then((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (d?.hasError && d.corrections?.[0]) {
              setErrorOverlay(prev => prev ? {
                ...prev,
                correctedText: d.corrections[0].correct || prev.correctedText,
                explanation: d.corrections[0].explanation || prev.explanation,
                enhanced: true,
              } : null);
            }
          })
          .catch(() => null);
      }
      return;
    }

    // No local error — show correct flash, optionally run AI check
    setCorrectFlash(true);
    setTimeout(() => setCorrectFlash(false), 900);

    const apiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
    if (apiKey) {
      fetch('/api/battle/grammar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: processed, apiKey }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(async (d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          if (d?.hasError && d.corrections?.[0]) {
            const c = d.corrections[0];
            setErrorOverlay({ originalText: c.incorrect, correctedText: c.correct, explanation: c.explanation, enhanced: true });
            void reportError();
            setTimeout(() => setErrorOverlay(null), 4000);
          }
        })
        .catch(() => null);
    }
  }, [reportError, switchTurn]);

  // Keep refs in sync so recognition callbacks never hold stale closures
  useEffect(() => { handleFinalRef.current      = handleFinalUtterance; }, [handleFinalUtterance]);
  useEffect(() => { startRecognitionRef.current = startRecognition;     }, [startRecognition]);

  // ── Auto-manage mic based on turn ────────────────────────────────────────────
  useEffect(() => {
    if (room?.status !== 'active' || battleEnded || isSwitchingTurn) return;

    if (isMyTurn && !isMuted) {
      const timer = setTimeout(() => startRecognition(), 400);
      return () => clearTimeout(timer);
    } else {
      stopRecognition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, room?.status, isSwitchingTurn, isMuted]);

  // Watchdog: if it's my turn but the mic is stuck in "Ready" for > 1.2s, force-restart
  useEffect(() => {
    if (!isMyTurn || isListening || isMuted || battleEnded || isSwitchingTurn || room?.status !== 'active') return;
    const watchdog = setTimeout(() => {
      if (!recognitionRef.current) startRecognitionRef.current();
    }, 1200);
    return () => clearTimeout(watchdog);
  }, [isMyTurn, isListening, isMuted, battleEnded, isSwitchingTurn, room?.status]);

  const toggleMute = () => {
    const muting = !isMuted;
    setIsMuted(muting);
    if (muting) stopRecognition();
  };

  // Manually finalise the current utterance (for mobile where auto-final is unreliable)
  const handleManualSend = useCallback(() => {
    const text = myTranscriptRef.current.trim();
    if (!text || battleEndedRef.current) return;
    if (recognitionRef.current) {
      abortedRef.current   = true; // prevent onend from restarting
      finalizedRef.current = true; // prevent onend from auto-submitting
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setMyTranscript('');
    broadcastSpeaking(false);
    handleFinalRef.current(text);
  }, [broadcastSpeaking]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const playerErrors   = player?.error_count  ?? 0;
  const opponentErrors = opponent?.error_count ?? 0;
  const playerAcc      = player?.accuracy      ?? 100;
  const opponentAcc    = opponent?.accuracy    ?? 100;
  const isAtLimit      = playerErrors >= errorLimit;

  return (
    <div className="fixed inset-0 bg-[#080810] flex flex-col overflow-hidden select-none">

      {/* ── Connection lost banner ───────────────────────────────────────────── */}
      {connectionStatus === 'disconnected' && (
        <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-destructive text-white text-xs font-bold py-1.5 px-4">
          <WifiOff className="h-3.5 w-3.5" />
          Connection lost — reconnecting…
        </div>
      )}

      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-2 z-20">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-mono font-bold text-sm tracking-widest">{formatTime(elapsed)}</span>
        </div>

        <div className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest',
          aiMode ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-primary/20 border-primary/40 text-primary'
        )}>
          {aiMode ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {aiMode ? 'AI' : 'Rule'}
        </div>
      </div>

      {/* ── Debate motion banner ────────────────────────────────────────────────── */}
      <div className="shrink-0 mx-4 mb-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/30 text-center mb-1">⚖️ Debate Motion</p>
        <p className="text-[11px] text-white/80 font-semibold text-center leading-snug">"{motion}"</p>
        {myPosition && (
          <div className="flex justify-center mt-1.5">
            <span className={cn(
              'text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full',
              myPosition === 'FOR'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            )}>
              {myPosition === 'FOR' ? '✅ You: FOR' : '❌ You: AGAINST'}
            </span>
          </div>
        )}
      </div>

      {/* ── Turn banner ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col items-center gap-1 py-1.5">
        {tooShortWarning ? (
          <div className="px-5 py-2 rounded-full border bg-yellow-500/20 border-yellow-500/50 text-yellow-400 font-black text-sm uppercase tracking-[0.15em] animate-pulse">
            ⚠️ Too short — say at least {MIN_WORDS} words!
          </div>
        ) : timeExpiredFlash ? (
          <div className="px-5 py-2 rounded-full border bg-destructive/20 border-destructive/60 text-destructive font-black text-sm uppercase tracking-[0.15em] animate-pulse">
            ⏱ Time&apos;s Up — +1 Error
          </div>
        ) : (
          <div className={cn(
            'px-5 py-2 rounded-full border font-black text-sm uppercase tracking-[0.2em] transition-all duration-500',
            isMyTurn
              ? 'bg-primary/20 border-primary/50 text-primary animate-pulse'
              : isSwitchingTurn
              ? 'bg-white/5 border-white/10 text-white/40'
              : 'bg-white/5 border-white/10 text-white/50'
          )}>
            {isMyTurn ? '🎤 Your Turn — Speak Now' : isSwitchingTurn ? 'Switching…' : `🔇 ${opponent?.username ?? 'Opponent'}\'s Turn`}
          </div>
        )}

        {/* Countdown — only shown when my turn and haven't spoken yet */}
        {isMyTurn && turnTimeLeft !== null && !isListening && !timeExpiredFlash && !tooShortWarning && (
          <div className={cn(
            'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
            turnTimeLeft <= 3 ? 'text-destructive animate-pulse' :
            turnTimeLeft <= 6 ? 'text-yellow-500' : 'text-white/30'
          )}>
            <Timer className="h-3 w-3" />
            Speak within {turnTimeLeft}s
          </div>
        )}
      </div>

      {/* ── Opponent section ─────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex-1 flex flex-col items-center justify-center gap-3 px-6 transition-opacity duration-500',
        isOpponentTurn ? 'opacity-100' : 'opacity-40'
      )}>
        <div className="relative flex items-center justify-center">
          {isOpponentTurn && (
            <>
              <div className="absolute h-40 w-40 rounded-full border-2 border-emerald-400/30 animate-ping [animation-duration:1.4s]" />
              <div className="absolute h-32 w-32 rounded-full border-2 border-emerald-400/50 animate-ping [animation-duration:1.8s]" />
            </>
          )}
          <div className={cn(
            'h-28 w-28 rounded-full flex items-center justify-center text-5xl border-4 transition-all duration-300 shadow-2xl',
            isOpponentTurn ? 'border-emerald-400 shadow-emerald-400/40 scale-105' : 'border-white/10 bg-white/5'
          )}>
            {opponent?.avatar ?? '🤖'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-destructive text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-[#080810]">
            {opponentErrors}/{errorLimit}
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-white font-black text-lg">{opponent?.username ?? 'Waiting…'}</p>
          <AccuracyBar value={opponentAcc} />
        </div>

        <div className="w-full max-w-sm min-h-[2.5rem] flex items-center justify-center">
          {isOpponentTurn && opponentTranscript ? (
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-sm text-white/80 italic text-center leading-relaxed">"{opponentTranscript}"</p>
            </div>
          ) : isOpponentTurn ? (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:120ms]" />
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:240ms]" />
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">vs</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* ── My section ───────────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex-1 flex flex-col items-center justify-center gap-3 px-6 transition-opacity duration-500',
        isMyTurn ? 'opacity-100' : 'opacity-40'
      )}>
        <div className="w-full max-w-sm min-h-[2.5rem] flex items-center justify-center">
          {correctFlash ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">Correct!</span>
            </div>
          ) : isMyTurn && myTranscript ? (
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl w-full">
              <p className="text-sm text-white/80 italic text-center leading-relaxed">"{myTranscript}"</p>
              <p className="text-[9px] text-white/30 text-center mt-1">
                {myTranscript.trim().split(/\s+/).filter(Boolean).length} / {MIN_WORDS} words min
              </p>
            </div>
          ) : null}
        </div>

        <div className="relative flex items-center justify-center">
          {isMyTurn && isListening && !isMuted && (
            <>
              <div className="absolute h-28 w-28 rounded-full border-2 border-primary/30 animate-ping [animation-duration:1.5s]" />
              <div className="absolute h-22 w-22 rounded-full border-2 border-primary/50 animate-ping [animation-duration:2s]" />
            </>
          )}
          <div className={cn(
            'h-20 w-20 rounded-full flex items-center justify-center text-4xl border-4 transition-all duration-300 shadow-xl',
            isMyTurn && isListening && !isMuted
              ? 'border-primary shadow-primary/40 scale-105'
              : isMuted ? 'border-white/10 opacity-60 bg-white/5'
              : 'border-white/10 bg-white/5'
          )}>
            {player?.avatar ?? '👤'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-destructive text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-[#080810]">
            {playerErrors}/{errorLimit}
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-white font-black text-base">{player?.username ?? 'You'}</p>
          <AccuracyBar value={playerAcc} />
        </div>
      </div>

      {/* ── Bottom controls ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 pb-8 pt-3 flex flex-col items-center gap-3">
        {!speechSupported ? (
          <p className="text-destructive text-sm font-bold text-center px-6">Use Chrome or Edge for speech recognition.</p>
        ) : isAtLimit ? (
          <p className="text-destructive text-sm font-bold uppercase tracking-widest animate-pulse text-center">Error limit reached</p>
        ) : (
          <div className="flex items-center gap-5">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                isMuted
                  ? 'bg-destructive/20 border-destructive text-destructive'
                  : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
              )}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            {/* Status pill */}
            <div className={cn(
              'flex items-center gap-2.5 px-5 py-3 rounded-full border transition-all duration-300 min-w-[140px] justify-center',
              isMuted ? 'bg-white/5 border-white/10'
                : isMyTurn && isListening ? 'bg-primary/20 border-primary/50'
                : isMyTurn ? 'bg-primary/10 border-primary/30'
                : 'bg-white/5 border-white/10'
            )}>
              {!isMyTurn ? (
                <Lock className="h-4 w-4 text-white/30" />
              ) : (
                <div className={cn('h-2.5 w-2.5 rounded-full', isListening ? 'bg-primary animate-pulse' : 'bg-white/30')} />
              )}
              <span className="text-sm font-bold text-white/80 uppercase tracking-widest">
                {isMuted ? 'Muted' : isMyTurn ? (isListening ? 'Live' : 'Ready') : 'Wait'}
              </span>
            </div>

            {/* Send button — manually submit the current transcript */}
            <button
              onClick={handleManualSend}
              disabled={!isMyTurn || !myTranscript}
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                isMyTurn && myTranscript
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40 scale-105'
                  : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
              )}
            >
              <SendHorizonal className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Error progress */}
        <div className="flex items-center gap-3 w-full max-w-xs px-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30 shrink-0">Errors</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((playerErrors / errorLimit) * 100))}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-white/40 shrink-0">{playerErrors}/{errorLimit}</span>
        </div>
      </div>

      {/* ── Error overlay ─────────────────────────────────────────────────────────── */}
      {errorOverlay && (
        <div className="absolute inset-0 flex items-end justify-center pb-28 px-6 pointer-events-none z-30">
          <div className="w-full max-w-md bg-[#1a0a0a] border-2 border-destructive rounded-3xl p-5 shadow-2xl shadow-destructive/30 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-xs font-black uppercase tracking-widest text-destructive">Grammar Error · +1</span>
              </div>
              {errorOverlay.enhanced && (
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
              )}
            </div>
            <p className="text-sm text-red-400 line-through mb-1 leading-relaxed">"{errorOverlay.originalText}"</p>
            <p className="text-sm text-emerald-400 font-bold mb-2 leading-relaxed">"{errorOverlay.correctedText}"</p>
            <p className="text-xs text-white/50 italic leading-relaxed">{errorOverlay.explanation}</p>
          </div>
        </div>
      )}

      {/* Screen flash effects */}
      {errorOverlay && <div className="absolute inset-0 bg-destructive/8 pointer-events-none z-20" />}
      {correctFlash  && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-20 animate-in fade-in duration-100" />}
    </div>
  );
}

function AccuracyBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Accuracy</span>
      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-yellow-500' : 'bg-destructive')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[9px] font-black text-white/60">{value}%</span>
    </div>
  );
}
