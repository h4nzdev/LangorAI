'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  AlertCircle,
  Settings,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startPracticeSession, summarizeSession, type PracticeOutput } from '@/ai/flows/practice-flow';
import { MoleculeVisualizer } from '@/components/practice/MoleculeVisualizer';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  correction?: {
    hasCorrection: boolean;
    originalText: string;
    correctedText?: string;
    explanation?: string;
  };
}

// ── ElevenLabs voice IDs (free tier voices) ────────────────────────────────────
const ELEVENLABS_VOICE = '21m00Tcm4TlvDq8ikWAM'; // Rachel — clear, natural English

// ── Main component ─────────────────────────────────────────────────────────────

function PracticeSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicParam = searchParams.get('topic') || 'Hobbies and Interests';
  const interviewerParam = searchParams.get('interviewer') || 'Langor AI';

  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [transcript, setTranscript] = useState('Tap mic to begin…');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [errorStatus, setErrorStatus] = useState<'none' | 'generic' | 'api-key' | 'quota' | 'tts'>('none');
  const [usingElevenLabs, setUsingElevenLabs] = useState(false);
  const [startTime] = useState(Date.now());

  // Refs that always reflect latest values (avoid stale closures in callbacks)
  const isMutedRef = useRef(isMuted);
  const isEndingRef = useRef(isEnding);
  const historyRef = useRef<{ role: 'user' | 'model'; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isEndingRef.current = isEnding; }, [isEnding]);

  // Auto-scroll log to bottom on new messages
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking]);

  // ── Speech Recognition setup ─────────────────────────────────────────────────

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const userText = event.results[0][0].transcript;
      setTranscript(userText);
      handleUserSpeech(userText);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        if (!isMutedRef.current && !isEndingRef.current) {
          setTimeout(() => startListeningSafely(), 800);
        }
      } else {
        setTranscript('Signal lost — tap mic to retry');
      }
    };

    recognitionRef.current = recognition;

    // Check if ElevenLabs key is saved
    const elKey = localStorage.getItem('ELEVENLABS_API_KEY');
    setUsingElevenLabs(!!elKey);

    return () => {
      recognition.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listening helpers ────────────────────────────────────────────────────────

  const startListeningSafely = useCallback(() => {
    if (!recognitionRef.current || isEndingRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // already started — ignore
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('Listening…');
      startListeningSafely();
    }
  }, [isListening, startListeningSafely]);

  // ── TTS: ElevenLabs ──────────────────────────────────────────────────────────

  const speakElevenLabs = useCallback(async (text: string, apiKey: string) => {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}/stream`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
        }),
      }
    );

    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => { setIsSpeaking(true); setIsThinking(false); };
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        if (!isMutedRef.current && !isEndingRef.current) {
          setTimeout(() => startListeningSafely(), 500);
        }
        resolve();
      };
      audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; reject(new Error('Audio error')); };
      audio.play().catch(reject);
    });
  }, [startListeningSafely]);

  // ── TTS: Browser Web Speech fallback ────────────────────────────────────────

  const speakBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) { setIsThinking(false); return; }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Pick the best available English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.rate = 1.05;

    utterance.onstart = () => { setIsSpeaking(true); setIsThinking(false); };
    utterance.onend = () => {
      setIsSpeaking(false);
      if (!isMutedRef.current && !isEndingRef.current) {
        setTimeout(() => startListeningSafely(), 500);
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [startListeningSafely]);

  // ── Unified speak: ElevenLabs → browser fallback ────────────────────────────

  const speakText = useCallback(async (text: string) => {
    const elKey = localStorage.getItem('ELEVENLABS_API_KEY');
    if (elKey) {
      try {
        await speakElevenLabs(text, elKey);
        return;
      } catch (err) {
        console.warn('[TTS] ElevenLabs failed, using browser fallback:', err);
        setErrorStatus('tts');
        setTimeout(() => setErrorStatus('none'), 4000);
      }
    }
    speakBrowser(text);
  }, [speakElevenLabs, speakBrowser]);

  // ── Core conversation handler ────────────────────────────────────────────────

  const handleUserSpeech = useCallback(async (text: string) => {
    setIsThinking(true);
    setErrorStatus('none');

    const userMsgId = Date.now();
    setChatMessages(prev => [...prev, { id: userMsgId, role: 'user', text, timestamp: new Date() }]);

    const currentHistory = [...historyRef.current, { role: 'user' as const, text }];

    const savedApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;

    try {
      const result = await startPracticeSession({
        userInput: text,
        topic: topicParam,
        interviewer: interviewerParam,
        history: currentHistory,
        apiKey: savedApiKey,
      });

      const newHistory = [...currentHistory, { role: 'model' as const, text: result.aiResponse }];
      historyRef.current = newHistory;

      // Attach grammar correction to the user message, then add AI reply
      setChatMessages(prev => {
        const updated = [...prev];
        const lastUserIdx = updated.map((m, i) => m.role === 'user' ? i : -1).filter(i => i >= 0).pop();
        if (lastUserIdx !== undefined && result.feedback) {
          updated[lastUserIdx] = { ...updated[lastUserIdx], correction: result.feedback };
        }
        return [
          ...updated,
          { id: Date.now() + 1, role: 'ai', text: result.aiResponse, timestamp: new Date() },
        ];
      });

      await speakText(result.aiResponse);
    } catch (error: any) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('quota') || msg.includes('429') || msg.includes('exhausted')) {
        setErrorStatus('quota');
      } else if (msg.includes('api_key') || msg.includes('401') || msg.includes('key')) {
        setErrorStatus('api-key');
      } else {
        setErrorStatus('generic');
      }
      setIsThinking(false);
    }
  }, [topicParam, speakText]);

  // ── Session end ───────────────────────────────────────────────────────────────

  const handleEndSession = useCallback(async () => {
    if (historyRef.current.length === 0) { router.push('/dashboard'); return; }
    setIsEnding(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (recognitionRef.current) recognitionRef.current.stop();

    const sessions = parseInt(localStorage.getItem('SESSIONS_COUNT') || '0');
    localStorage.setItem('SESSIONS_COUNT', (sessions + 1).toString());
    const mins = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
    localStorage.setItem('TOTAL_MINUTES', (parseInt(localStorage.getItem('TOTAL_MINUTES') || '0') + mins).toString());

    const savedApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
    try {
      const analysis = await summarizeSession({ history: historyRef.current, apiKey: savedApiKey });
      localStorage.setItem('LAST_SESSION_ANALYSIS', JSON.stringify(analysis));
      router.push('/practice/analysis');
    } catch {
      router.push('/dashboard');
    }
  }, [router, startTime]);

  const isMicDisabled = isThinking || isEnding || isSpeaking;

  const interviewerAvatar = useMemo(() => {
    if (interviewerParam.includes('Zoe') || interviewerParam.includes('Sarah')) return '👩';
    if (interviewerParam.includes('Max')) return '🧔';
    return '🤖';
  }, [interviewerParam]);

  const statusLabel = isThinking ? 'PROCESSING' : isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'STANDBY';
  const statusColor = isThinking ? 'bg-violet-500' : isSpeaking ? 'bg-emerald-500' : isListening ? 'bg-primary' : 'bg-muted-foreground';

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-body overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border/30">
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-9 w-9">
          <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-[0.25em] uppercase text-foreground/70">{topicParam}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn('h-1.5 w-1.5 rounded-full animate-pulse', statusColor)} />
            <span className="text-[7px] font-black tracking-widest uppercase text-muted-foreground">{statusLabel}</span>
            {usingElevenLabs && (
              <span className="text-[6px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                EL
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-9 w-9">
          <Link href="/settings"><Settings className="h-4 w-4" /></Link>
        </Button>
      </header>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {errorStatus !== 'none' && (
        <div className="px-4 pt-2 shrink-0">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl py-2 px-3">
            <AlertCircle className="h-3 w-3" />
            <AlertTitle className="text-[9px] font-black uppercase tracking-wider">
              {errorStatus === 'tts' ? 'Voice Fallback' : 'Protocol Interrupted'}
            </AlertTitle>
            <AlertDescription className="text-[8px] opacity-80">
              {errorStatus === 'quota' && 'API quota exceeded. Add your own key in Settings.'}
              {errorStatus === 'api-key' && 'Invalid Gemini API key. Check Settings.'}
              {errorStatus === 'tts' && 'ElevenLabs TTS failed — using browser voice.'}
              {errorStatus === 'generic' && 'Unexpected error. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ── Main scroll area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Molecule — borderless, no shadow frame */}
        <div className="relative shrink-0 h-52 mx-auto w-full max-w-sm overflow-hidden">
          <MoleculeVisualizer
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            isListening={isListening}
          />

          {/* Status chip */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
            <div className={cn('h-1.5 w-1.5 rounded-full animate-pulse', statusColor)} />
            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white">{statusLabel}</span>
          </div>

          {/* Interviewer badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 pointer-events-none">
            <span className="text-base leading-none">{interviewerAvatar}</span>
            <div>
              <p className="text-[8px] font-black tracking-[0.15em] uppercase text-white">{interviewerParam}</p>
              <p className="text-[6px] text-white/50 uppercase tracking-wider">AI Tutor</p>
            </div>
          </div>

          {/* Speaking waveform */}
          {isSpeaking && (
            <div className="absolute bottom-3 right-3 flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
                  style={{
                    height: `${8 + Math.sin(i * 1.2) * 8}px`,
                    animation: `pulse 0.${4 + i}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Real-time Neural Log ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden mx-4 mb-2">
          {/* Log header */}
          <div className="flex items-center gap-2 py-2 shrink-0">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
              Neural Log
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {chatMessages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-[10px] text-muted-foreground/50 italic text-center">
                  Session initialised. Tap the mic and start speaking.
                </p>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} className={cn('space-y-1', msg.role === 'ai' ? 'pl-2 border-l-2 border-emerald-500/30' : '')}>
                {/* Timestamp + role */}
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-mono text-muted-foreground/50">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={cn(
                    'text-[7px] font-black uppercase tracking-widest',
                    msg.role === 'user' ? 'text-primary' : 'text-emerald-400'
                  )}>
                    {msg.role === 'user' ? '● YOU' : '◆ AI'}
                  </span>
                </div>

                {/* Message text */}
                <p className={cn(
                  'text-xs leading-relaxed',
                  msg.role === 'user' ? 'text-foreground/90' : 'text-foreground/80'
                )}>
                  {msg.text}
                </p>

                {/* Grammar correction (on user messages) */}
                {msg.role === 'user' && msg.correction && (
                  msg.correction.hasCorrection ? (
                    <div className="flex items-start gap-2 mt-1.5 p-2 bg-orange-500/8 border border-orange-500/20 rounded-lg">
                      <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[7px] font-black uppercase tracking-widest text-orange-500">Grammar</p>
                        <p className="text-[9px] text-destructive/80 line-through break-words">"{msg.correction.originalText}"</p>
                        {msg.correction.correctedText && (
                          <p className="text-[9px] text-emerald-500 font-bold break-words">"{msg.correction.correctedText}"</p>
                        )}
                        {msg.correction.explanation && (
                          <p className="text-[8px] text-muted-foreground italic">{msg.correction.explanation}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Correct</span>
                    </div>
                  )
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="pl-2 border-l-2 border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-mono text-muted-foreground/50">
                    {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400">◆ AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      {/* ── Mic + Controls (pinned bottom) ─────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/20 bg-background/80 backdrop-blur-xl">
        {/* Transcript */}
        <div className="px-4 pt-2 min-h-[1.75rem] text-center">
          <p className="text-[10px] font-medium text-foreground/50 italic truncate">"{transcript}"</p>
        </div>

        {/* Mic button */}
        <div className="flex items-center justify-center py-3">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute h-20 w-20 border border-primary/20 rounded-full animate-ping [animation-duration:1.5s]" />
                <div className="absolute h-16 w-16 border border-primary/30 rounded-full animate-ping [animation-duration:2s]" />
              </>
            )}
            <Button
              size="icon"
              onClick={toggleListening}
              disabled={isMicDisabled}
              className={cn(
                'h-14 w-14 rounded-full z-10 border-2 transition-all duration-300',
                isListening
                  ? 'bg-destructive/10 border-destructive text-destructive scale-110'
                  : 'bg-primary/10 border-primary text-primary hover:bg-primary/20',
                isMicDisabled && 'opacity-30 grayscale border-border'
              )}
            >
              {isThinking || isEnding
                ? <Loader2 className="h-6 w-6 animate-spin" />
                : isSpeaking
                ? <Activity className="h-6 w-6 animate-pulse" />
                : <Mic className={cn('h-6 w-6', isListening && 'fill-current')} />
              }
            </Button>
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-3 gap-3 px-4 pb-6">
          <ControlBtn
            icon={isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            label={isMuted ? 'Unmute' : 'Silence'}
            onClick={() => {
              setIsMuted(m => {
                if (!m && isListening) recognitionRef.current?.stop();
                return !m;
              });
            }}
          />
          <ControlBtn
            icon={<span className="text-xs font-black">{chatMessages.length}</span>}
            label="Turns"
          />
          <Button
            onClick={handleEndSession}
            disabled={isEnding}
            className="h-14 rounded-2xl flex flex-col gap-1 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive group transition-all duration-300"
          >
            {isEnding
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <PhoneOff className="h-5 w-5 group-hover:scale-110 transition-transform" />
            }
            <span className="text-[7px] font-black tracking-[0.2em] uppercase">
              {isEnding ? 'Saving…' : 'End'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Supporting components ──────────────────────────────────────────────────────

function ControlBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className="h-14 rounded-2xl flex flex-col gap-1 bg-card/50 border border-border hover:bg-accent/10 hover:border-accent/40 text-foreground/80 transition-all duration-300"
    >
      <div className="h-5 w-5 flex items-center justify-center opacity-80">{icon}</div>
      <span className="text-[7px] font-black tracking-[0.2em] uppercase opacity-60">{label}</span>
    </Button>
  );
}

function PracticeLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Initialising session…</p>
      </div>
    </div>
  );
}

export default function PracticeSession() {
  return (
    <Suspense fallback={<PracticeLoading />}>
      <PracticeSessionContent />
    </Suspense>
  );
}
