'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerCard } from './PlayerCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mic, MicOff, MessageSquare, Lock, AlertCircle, CheckCircle2, Sparkles, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBattleRealtime } from '@/hooks/use-battle-realtime';
import { useToast } from '@/hooks/use-toast';
import { checkGrammar } from '@/lib/grammar-checker';

interface BattleRoomProps {
  roomId: string;
  errorLimit: number;
  onBattleEnd: (result: {
    playerErrors: number;
    opponentErrors: number;
    playerAccuracy: number;
    fluencyScore: number;
    pointsEarned: number;
    winner: 'player' | 'opponent' | 'draw';
  }) => void;
}

interface CorrectionCard {
  originalText: string;
  correctedText: string;
  explanation: string;
  enhanced?: boolean; // true when the explanation came from Gemini
}

interface LogEntry {
  id: number;
  text: string;
  isError: boolean;
}

export function BattleRoom({ roomId, errorLimit, onBattleEnd }: BattleRoomProps) {
  const { room, player, opponent, currentUserId, reportError } = useBattleRealtime(roomId);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [correction, setCorrection] = useState<CorrectionCard | null>(null);
  const [battleLog, setBattleLog] = useState<LogEntry[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [aiMode, setAiMode] = useState(false); // true = Gemini key found
  const [logCounter, setLogCounter] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);

    const key = localStorage.getItem('GEMINI_API_KEY');
    setAiMode(!!key);
  }, []);

  // Detect battle end
  useEffect(() => {
    if (room?.status !== 'completed' || battleEnded) return;
    setBattleEnded(true);

    const playerErrors = player?.error_count ?? 0;
    const opponentErrors = opponent?.error_count ?? 0;
    const playerWon = room.winner_id === currentUserId;
    const isDraw = !room.winner_id;
    const fluencyScore = Math.round(100 - (playerErrors / errorLimit) * 50);
    const pointsEarned = playerWon ? 20 : isDraw ? 10 : 5;

    stopListening();

    setTimeout(() => {
      onBattleEnd({
        playerErrors,
        opponentErrors,
        playerAccuracy: player?.accuracy ?? 100,
        fluencyScore,
        pointsEarned,
        winner: playerWon ? 'player' : isDraw ? 'draw' : 'opponent',
      });
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, room?.winner_id, battleEnded]);

  const addLog = useCallback((text: string, isError: boolean) => {
    setLogCounter(c => {
      const id = c + 1;
      setBattleLog(prev => [{ id, text, isError }, ...prev.slice(0, 4)]);
      return id;
    });
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleTranscript = useCallback(async (text: string) => {
    // ── Step 1: instant local check ───────────────────────────────────────────
    const local = checkGrammar(text);

    if (local.hasError && local.correctedText) {
      setCorrection({
        originalText: local.originalText,
        correctedText: local.correctedText,
        explanation: local.explanation ?? '',
        enhanced: false,
      });
      addLog(`❌ "${local.originalText.slice(0, 40)}…" → error`, true);
      await reportError();
      setTimeout(() => setCorrection(null), 6000);

      // ── Step 2 (optional): enhance explanation with Gemini in background ──
      const apiKey = typeof window !== 'undefined'
        ? (localStorage.getItem('GEMINI_API_KEY') || undefined)
        : undefined;

      if (apiKey) {
        fetch('/api/battle/grammar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: text, apiKey }),
        })
          .then(r => r.ok ? r.json() : null)
          .then((data: { hasError: boolean; corrections: { incorrect: string; correct: string; explanation: string }[] } | null) => {
            if (data?.hasError && data.corrections?.[0]) {
              const c = data.corrections[0];
              setCorrection(prev =>
                prev ? {
                  ...prev,
                  correctedText: c.correct || prev.correctedText,
                  explanation: c.explanation || prev.explanation,
                  enhanced: true,
                } : null
              );
            }
          })
          .catch(() => null); // silent — local result already shown
      }

      return;
    }

    // ── No local error found ──────────────────────────────────────────────────
    const preview = text.length > 48 ? text.slice(0, 48) + '…' : text;

    // If Gemini key exists, also double-check for errors local rules missed
    const apiKey = typeof window !== 'undefined'
      ? (localStorage.getItem('GEMINI_API_KEY') || undefined)
      : undefined;

    if (apiKey) {
      fetch('/api/battle/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, apiKey }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(async (data: { hasError: boolean; corrections: { incorrect: string; correct: string; explanation: string }[] } | null) => {
          if (data?.hasError && data.corrections?.[0]) {
            const c = data.corrections[0];
            setCorrection({
              originalText: c.incorrect,
              correctedText: c.correct,
              explanation: c.explanation,
              enhanced: true,
            });
            addLog(`❌ "${c.incorrect.slice(0, 40)}" → AI flagged`, true);
            await reportError();
            setTimeout(() => setCorrection(null), 6000);
          } else {
            addLog(`✅ "${preview}" — Correct!`, false);
          }
        })
        .catch(() => {
          addLog(`✅ "${preview}" — Correct!`, false);
        });
    } else {
      addLog(`✅ "${preview}" — Correct!`, false);
    }
  }, [reportError, addLog]);

  const startListening = useCallback(() => {
    if (isListening) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ variant: 'destructive', title: 'Not supported', description: 'Use Chrome or Edge for voice recognition.' });
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (e: { error: string }) => {
      setIsListening(false);
      recognitionRef.current = null;
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        toast({ variant: 'destructive', title: 'Microphone error', description: e.error });
      }
    };
    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleTranscript(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, handleTranscript, toast]);

  const playerErrors = player?.error_count ?? 0;
  const opponentErrors = opponent?.error_count ?? 0;
  const playerAccuracy = player?.accuracy ?? 100;
  const opponentAccuracy = opponent?.accuracy ?? 100;
  const isAtLimit = playerErrors >= errorLimit;

  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      {/* Session locked badge */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Grammar mode badge */}
        <div className={cn(
          'text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest',
          aiMode
            ? 'bg-violet-600'
            : 'bg-primary/90'
        )}>
          {aiMode ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {aiMode ? 'AI Enhanced' : 'Rule-Based'}
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse">
          <Lock className="h-5 w-5 fill-white" />
          <span className="font-bold text-sm uppercase tracking-widest">Session Locked</span>
        </div>
      </div>

      <div className="min-h-screen p-6 pt-20 pb-36">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Battle in Progress
            </h1>
            <p className="text-muted-foreground font-medium">
              First to {errorLimit} errors loses — speak in English, grammar is being checked!
            </p>
          </div>

          {/* Error progress bar */}
          <Card className="border-2 border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your errors</span>
                <div className="flex items-center gap-1.5">
                  {[...Array(errorLimit)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-3 rounded-full transition-all duration-300',
                        errorLimit <= 10 ? 'w-6' : 'w-3',
                        i < playerErrors ? 'bg-destructive scale-y-110' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <span className={cn(
                  'text-sm font-black',
                  playerErrors >= errorLimit * 0.8 ? 'text-destructive' : 'text-foreground'
                )}>
                  {playerErrors} / {errorLimit}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Player cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <PlayerCard
              name={player?.username ?? 'You'}
              errors={playerErrors}
              errorLimit={errorLimit}
              accuracy={playerAccuracy}
              isSpeaking={isListening}
              isCurrentUser={true}
              avatar={player?.avatar ?? '👤'}
            />
            <PlayerCard
              name={opponent?.username ?? 'Opponent'}
              errors={opponentErrors}
              errorLimit={errorLimit}
              accuracy={opponentAccuracy}
              isSpeaking={false}
              isCurrentUser={false}
              avatar={opponent?.avatar ?? '🤖'}
            />
          </div>

          {/* Live transcript */}
          {(transcript || isListening) && (
            <Card className={cn(
              'border-2 transition-all duration-300',
              isListening ? 'border-primary bg-primary/10' : 'border-border bg-card'
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('w-2 h-2 rounded-full', isListening ? 'bg-primary animate-pulse' : 'bg-muted')} />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {isListening ? 'Listening…' : 'Last utterance'}
                  </span>
                </div>
                {transcript && (
                  <p className="text-sm font-medium text-foreground italic">"{transcript}"</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grammar correction card */}
          {correction && (
            <Card className="border-2 border-destructive bg-destructive/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                      Grammar Error — +1 counted
                    </span>
                  </div>
                  {correction.enhanced && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> AI
                    </span>
                  )}
                </div>
                <p className="text-sm text-destructive font-medium line-through">
                  "{correction.originalText}"
                </p>
                <p className="text-sm text-emerald-500 font-bold">
                  "{correction.correctedText}"
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {correction.explanation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Battle log */}
          {battleLog.length > 0 && (
            <Card className="border-2 border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Battle Log</span>
                </div>
                <div className="space-y-1.5">
                  {battleLog.map((entry, i) => (
                    <p
                      key={entry.id}
                      className={cn(
                        'text-sm font-medium transition-opacity',
                        i === 0 ? 'opacity-100' : 'opacity-50',
                        entry.isError ? 'text-destructive' : 'text-foreground'
                      )}
                    >
                      {entry.text}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voice controls */}
          <div className="flex items-center justify-center py-6">
            <Card className="border-2 border-border bg-card shadow-2xl max-w-lg w-full">
              <CardContent className="p-6">
                {!speechSupported ? (
                  <div className="text-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                    <p className="text-sm font-bold text-destructive">Speech recognition not supported</p>
                    <p className="text-xs text-muted-foreground">Please use Chrome or Edge.</p>
                  </div>
                ) : isAtLimit ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-destructive uppercase tracking-widest">
                      You've reached the error limit
                    </p>
                    <p className="text-xs text-muted-foreground">Waiting for battle to end…</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-3 h-3 rounded-full transition-all',
                        isListening ? 'bg-primary animate-pulse scale-125' : 'bg-muted'
                      )} />
                      <span className="text-xs font-bold text-muted-foreground">
                        {isListening ? 'Listening' : 'Ready'}
                      </span>
                    </div>

                    {isListening ? (
                      <Button
                        onClick={stopListening}
                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white gap-2"
                      >
                        <MicOff className="h-5 w-5" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        onClick={startListening}
                        className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        <Mic className="h-6 w-6" />
                        Speak
                      </Button>
                    )}

                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle2 className={cn(
                        'h-5 w-5 transition-colors',
                        playerAccuracy >= 80 ? 'text-emerald-500' : 'text-muted-foreground'
                      )} />
                      <span className="text-xs font-bold text-muted-foreground">{playerAccuracy}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
