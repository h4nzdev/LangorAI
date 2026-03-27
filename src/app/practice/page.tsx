'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Loader2,
  AlertCircle,
  Settings,
  Bot,
  Activity,
  History,
  User,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startPracticeSession, summarizeSession, type PracticeOutput } from '@/ai/flows/practice-flow';
import avatarImage from '@/assets/avatar1.png';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

export default function PracticeSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Dynamic Configuration from URL
  const topicParam = searchParams.get('topic') || 'Hobbies and Interests';
  const interviewerParam = searchParams.get('interviewer') || 'Langor AI';
  
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [transcript, setTranscript] = useState("Tap mic to initiate link...");
  const [feedback, setFeedback] = useState<PracticeOutput['feedback'] | null>(null);
  const [aiResponseText, setAiResponseText] = useState(`Greetings. I am ${interviewerParam}. I am ready to begin our ${topicParam} session.`);
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [errorStatus, setErrorStatus] = useState<'none' | 'generic' | 'api-key' | 'quota'>('none');
  const [startTime] = useState(Date.now());
  const [chatMessages, setChatMessages] = useState<{id: number; role: 'user' | 'ai'; text: string; timestamp: Date}[]>([]);
  const [displayedAiText, setDisplayedAiText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMutedRef = useRef(isMuted);
  const isEndingRef = useRef(isEnding);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isEndingRef.current = isEnding; }, [isEnding]);

  // Typing effect for AI responses
  useEffect(() => {
    if (aiResponseText && !isTyping) {
      setIsTyping(true);
      setDisplayedAiText("");
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < aiResponseText.length) {
          setDisplayedAiText(aiResponseText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [aiResponseText]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const userText = event.results[0][0].transcript;
        setTranscript(userText);
        handleUserSpeech(userText);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setTranscript("Signal lost. Re-attempting...");
        } else {
          if (!isMutedRef.current && !isThinking && !isSpeaking && !isEndingRef.current) {
            setTimeout(() => {
              startListeningSafely();
            }, 1000);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const startListeningSafely = () => {
    if (recognitionRef.current && !isListening && !isThinking && !isSpeaking && !isEndingRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListeningSafely();
      setTranscript("Listening for input...");
    }
  };

  const handleUserSpeech = async (text: string) => {
    setIsThinking(true);
    setErrorStatus('none');
    setDisplayedAiText("");

    const userMsgId = Date.now();
    setChatMessages(prev => [...prev, { id: userMsgId, role: 'user', text, timestamp: new Date() }]);

    // Conversational delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const savedApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
    const currentHistory = [...history, { role: 'user' as const, text }];

    try {
      const result = await startPracticeSession({
        userInput: text,
        topic: topicParam,
        interviewer: interviewerParam,
        history: currentHistory,
        apiKey: savedApiKey
      });

      setAiResponseText(result.aiResponse);
      setFeedback(result.feedback);
      setHistory([...currentHistory, { role: 'model' as const, text: result.aiResponse }]);

      const aiMsgId = Date.now() + 1;
      setChatMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: result.aiResponse, timestamp: new Date() }]);

      speakText(result.aiResponse);
    } catch (error: any) {
      console.error("AI Error:", error);
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes('quota') || msg.includes('exhausted') || msg.includes('429')) {
        setErrorStatus('quota');
      } else if (msg.includes('api_key') || msg.includes('401') || msg.includes('key')) {
        setErrorStatus('api-key');
      } else {
        setErrorStatus('generic');
      }
      setTranscript("Core logic interrupted. Standing by.");
      setIsThinking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsThinking(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (!isMutedRef.current && !isEndingRef.current) {
          setTimeout(() => {
            startListeningSafely();
          }, 600);
        }
      };

      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      setIsThinking(false);
    }
  };

  const updateProgressStats = () => {
    const sessions = parseInt(localStorage.getItem('SESSIONS_COUNT') || '0');
    localStorage.setItem('SESSIONS_COUNT', (sessions + 1).toString());
    const durationMinutes = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
    const totalMinutes = parseInt(localStorage.getItem('TOTAL_MINUTES') || '0');
    localStorage.setItem('TOTAL_MINUTES', (totalMinutes + durationMinutes).toString());
  };

  const handleEndSession = async () => {
    if (history.length === 0) {
      router.push('/dashboard');
      return;
    }
    setIsEnding(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    const savedApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
    try {
      const analysis = await summarizeSession({ history, apiKey: savedApiKey });
      updateProgressStats();
      localStorage.setItem('LAST_SESSION_ANALYSIS', JSON.stringify(analysis));
      router.push('/practice/analysis');
    } catch (error: any) {
      router.push('/dashboard');
    } finally {
      setIsEnding(false);
    }
  };

  const isMicDisabled = isThinking || isEnding || isSpeaking;

  const interviewerAvatar = useMemo(() => {
    if (interviewerParam.includes('Sarah') || interviewerParam.includes('Zoe')) return '👩';
    if (interviewerParam.includes('Max')) return '🧔';
    return '🤖';
  }, [interviewerParam]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body selection:bg-primary/30 transition-colors duration-300">
      <header className="flex items-center justify-between px-6 py-4 max-w-xl mx-auto w-full shrink-0">
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-10 w-10 border border-border">
          <Link href="/dashboard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-[10px] font-black tracking-[0.2em] text-center uppercase text-foreground/80">{topicParam} Session</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1 w-1 bg-accent rounded-full animate-pulse shadow-[0_0_5px_rgba(var(--accent),0.8)]" />
            <span className="text-[8px] text-accent font-black tracking-widest uppercase">Link Active</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-10 w-10 border border-border">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      {(errorStatus === 'api-key' || errorStatus === 'quota') && (
        <div className="px-6 max-w-xl mx-auto w-full pt-1">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
            <AlertCircle className="h-3 w-3" />
            <AlertTitle className="text-[9px] font-black uppercase tracking-wider">Protocol Interrupted</AlertTitle>
            <AlertDescription className="text-[8px] opacity-80 mt-0.5">
              {errorStatus === 'quota' 
                ? 'Free API quota exceeded. Add your own API key in settings to continue.' 
                : 'Neural Link failed. Please check your Gemini API key in settings.'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-4 md:px-6 gap-4 overflow-hidden relative">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 mt-4">
          <div className="relative w-full flex flex-col items-center">
            <div className={cn(
              "relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500",
              (isThinking || isSpeaking) 
                ? "border-accent shadow-[0_0_30px_rgba(var(--accent),0.4)]" 
                : "border-border/50"
            )}>
              <Image
                src={avatarImage}
                alt="Interviewer"
                fill
                className="object-cover object-center bg-black"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                <div className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  isThinking ? "bg-primary" : isSpeaking ? "bg-emerald-500" : "bg-muted-foreground"
                )} />
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white">
                  {isThinking ? 'THINKING' : isSpeaking ? 'SPEAKING' : 'LISTENING'}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                    <span className="text-sm">{interviewerAvatar}</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-[0.15em] uppercase text-white">{interviewerParam}</p>
                    <p className="text-[7px] text-white/60 uppercase tracking-wider">Interviewer</p>
                  </div>
                </div>
                {isSpeaking && (
                  <div className="flex items-center gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1 bg-accent rounded-full animate-[music-wave_0.5s_ease-in-out_infinite]" style={{ height: '16px', animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-md mt-4">
              <div className={cn(
                "bg-card/60 backdrop-blur-xl border border-accent/20 rounded-2xl p-4 shadow-xl transition-all duration-300",
                chatMessages.length === 0 && "opacity-40"
              )}>
                {chatMessages.length > 0 ? (
                  <div className="space-y-2">
                    {displayedAiText ? (
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {displayedAiText}
                        {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse align-middle" />}
                      </p>
                    ) : (
                      chatMessages.filter(m => m.role === 'ai').slice(-1).map((msg) => (
                        <p key={msg.id} className="text-sm font-medium text-foreground leading-relaxed">{msg.text}</p>
                      ))
                    )}
                    {isThinking && !displayedAiText && (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center">AI Uplink established. Waiting for input...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center w-full h-40 mt-2">
          <div className={cn("absolute h-40 w-40 border border-accent/10 rounded-full transition-transform duration-1000", isListening && "scale-110 border-accent/20")} />
          <div className={cn("absolute h-32 w-32 border border-accent/20 rounded-full transition-transform duration-700", isListening && "scale-110 border-accent/40")} />
          {isListening && (
            <>
              <div className="absolute w-32 h-32 border border-accent/30 rounded-full animate-ping [animation-duration:2s]" />
              <div className="absolute w-40 h-40 border border-accent/10 rounded-full animate-ping [animation-duration:3s]" />
            </>
          )}
          <Button size="icon" onClick={toggleListening} disabled={isMicDisabled} className={cn("h-16 w-16 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(var(--accent),0.2)] z-10 border-2", isListening ? "bg-destructive/10 border-destructive text-destructive scale-105" : "bg-accent/10 border-accent text-accent hover:bg-accent/20", isMicDisabled && "opacity-20 grayscale border-border")}>
            {isThinking || isEnding ? <Loader2 className="h-6 w-6 animate-spin" /> : isSpeaking ? <Activity className="h-6 w-6 animate-pulse" /> : <Mic className={cn("h-6 w-6", isListening && "fill-current")} />}
          </Button>
        </div>

        <div className="max-w-xs text-center min-h-[2rem] px-4">
          <p className="text-xs font-medium text-foreground/70 leading-relaxed italic tracking-wide">"{transcript}"</p>
        </div>
      </main>

      <footer className="p-6 max-w-xl mx-auto w-full grid grid-cols-3 gap-3 pb-10">
        <ControlBtn icon={isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />} label="Silence" onClick={() => { setIsMuted(!isMuted); if (!isMuted && isListening) recognitionRef.current?.stop(); }} />
        <ControlBtn icon={<History className="h-4 w-4" />} label="Data Log" />
        <Button variant="destructive" onClick={handleEndSession} disabled={isEnding} className="h-16 rounded-2xl flex flex-col gap-1 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive group transition-all duration-300">
          {isEnding ? <Loader2 className="h-5 w-5 animate-spin" /> : <PhoneOff className="h-5 w-5 group-hover:scale-110 transition-transform" />}
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">{isEnding ? "Computing..." : "Terminate"}</span>
        </Button>
      </footer>
    </div>
  );
}

function ControlBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Button variant="secondary" className="h-16 rounded-2xl flex flex-col gap-1 bg-card/50 border border-border hover:bg-accent/10 hover:border-accent/40 text-foreground/80 hover:text-foreground transition-all duration-300" onClick={onClick}>
      <div className="h-5 w-5 opacity-80">{icon}</div>
      <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-60">{label}</span>
    </Button>
  );
}
