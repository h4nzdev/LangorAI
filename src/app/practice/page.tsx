'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startPracticeSession, summarizeSession, type PracticeOutput } from '@/ai/flows/practice-flow';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [transcript, setTranscript] = useState("Tap mic to initiate link...");
  const [feedback, setFeedback] = useState<PracticeOutput['feedback'] | null>(null);
  const [aiResponseText, setAiResponseText] = useState("Greetings. I am Langor AI. What hobbies occupy your time?");
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [errorStatus, setErrorStatus] = useState<'none' | 'generic' | 'api-key' | 'quota'>('none');
  const [startTime] = useState(Date.now());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMutedRef = useRef(isMuted);
  const isEndingRef = useRef(isEnding);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isEndingRef.current = isEnding; }, [isEnding]);

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
    
    // 3 second conversational delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const savedApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
    const currentHistory = [...history, { role: 'user' as const, text }];

    try {
      const result = await startPracticeSession({ 
        userInput: text,
        history: currentHistory,
        apiKey: savedApiKey
      });
      
      setAiResponseText(result.aiResponse);
      setFeedback(result.feedback);
      setHistory([...currentHistory, { role: 'model' as const, text: result.aiResponse }]);
      
      speakText(result.aiResponse);
    } catch (error: any) {
      console.error("AI Error:", error);
      const msg = error.message?.toLowerCase() || "";
      
      if (msg.includes('api_key') || msg.includes('401') || msg.includes('key')) {
        setErrorStatus('api-key');
      } else if (msg.includes('quota') || msg.includes('exhausted') || msg.includes('429')) {
        setErrorStatus('quota');
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

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsThinking(false);
      };

      utterance.rate = 1;
      utterance.pitch = 1;
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

    const lastDate = localStorage.getItem('LAST_SESSION_DATE');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('STREAK_COUNT') || '0');

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
      localStorage.setItem('STREAK_COUNT', streak.toString());
      localStorage.setItem('LAST_SESSION_DATE', today);
    }
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
      const analysis = await summarizeSession({
        history,
        apiKey: savedApiKey
      });
      
      updateProgressStats();
      localStorage.setItem('LAST_SESSION_ANALYSIS', JSON.stringify(analysis));
      router.push('/practice/analysis');
    } catch (error: any) {
      console.error("Analysis Error:", error);
      router.push('/dashboard');
    } finally {
      setIsEnding(false);
    }
  };

  const isMicDisabled = isThinking || isEnding || isSpeaking;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body selection:bg-primary/30 transition-colors duration-300">
      {/* Header - Tightened */}
      <header className="flex items-center justify-between px-6 py-4 max-w-xl mx-auto w-full shrink-0">
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-10 w-10 border border-border">
          <Link href="/dashboard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-[10px] font-black tracking-[0.2em] text-center uppercase text-foreground/80">Discussing Hobbies</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1 w-1 bg-accent rounded-full animate-pulse shadow-[0_0_5px_rgba(var(--accent),0.8)]" />
            <span className="text-[8px] text-accent font-black tracking-widest uppercase">System Active</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full h-10 w-10 border border-border">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      {/* Quota Alerts */}
      {(errorStatus === 'api-key' || errorStatus === 'quota') && (
        <div className="px-6 max-w-xl mx-auto w-full pt-1">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-xl p-3">
            <AlertCircle className="h-3 w-3" />
            <AlertTitle className="text-[9px] font-black uppercase tracking-wider">Protocol Interrupted</AlertTitle>
            <AlertDescription className="text-[8px] opacity-80 mt-0.5">
              API limits reached. Provide a personal key in settings to bypass.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6 md:gap-8">
        {/* Avatar Section - Animated Pulsing Glow */}
        <div className="relative group scale-90 md:scale-100">
          <div className={cn(
            "absolute -inset-6 bg-accent/20 rounded-full blur-3xl transition-opacity duration-1000",
            (isThinking || isSpeaking) ? "opacity-100 animate-pulse" : "opacity-0"
          )} />
          <div className="relative flex items-center justify-center h-28 w-28 rounded-full border border-accent/30 bg-card/50 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(var(--accent),0.1)]">
             <div className="absolute inset-0 rounded-full border border-accent/10 scale-125" />
             <div className="absolute inset-0 rounded-full border border-accent/5 scale-150" />
             <Bot className={cn(
               "h-14 w-14 text-accent transition-all duration-500",
               (isThinking || isSpeaking) && "scale-110 drop-shadow-[0_0_10px_rgba(var(--accent),0.5)]"
             )} />
          </div>
        </div>

        {/* AI Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black tracking-[0.15em] uppercase text-foreground">Langor-4 AI</h2>
          {isListening ? (
            <p className="text-accent text-[9px] font-black tracking-[0.25em] uppercase animate-pulse">Processing Voice...</p>
          ) : isThinking ? (
            <p className="text-primary text-[9px] font-black tracking-[0.25em] uppercase animate-pulse">Neural Computing...</p>
          ) : isSpeaking ? (
            <p className="text-emerald-500 text-[9px] font-black tracking-[0.25em] uppercase">Synthesizing Audio...</p>
          ) : (
            <p className="text-muted-foreground text-[9px] font-black tracking-[0.25em] uppercase">Standby Mode</p>
          )}
        </div>

        {/* Visualizer & Mic - Sonar/Radar Animation */}
        <div className="relative flex items-center justify-center w-full h-48">
          <div className={cn(
            "absolute h-48 w-48 border border-accent/10 rounded-full transition-transform duration-1000",
            isListening && "scale-110 border-accent/20"
          )} />
          <div className={cn(
            "absolute h-36 w-36 border border-accent/20 rounded-full transition-transform duration-700",
            isListening && "scale-110 border-accent/40"
          )} />
          
          {isListening && (
            <>
              <div className="absolute w-36 h-36 border border-accent/30 rounded-full animate-ping [animation-duration:2s]" />
              <div className="absolute w-48 h-48 border border-accent/10 rounded-full animate-ping [animation-duration:3s]" />
            </>
          )}
          
          <Button 
            size="icon" 
            onClick={toggleListening}
            disabled={isMicDisabled}
            className={cn(
              "h-20 w-20 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(var(--accent),0.2)] z-10 border-2",
              isListening 
                ? "bg-destructive/10 border-destructive text-destructive scale-105" 
                : "bg-accent/10 border-accent text-accent hover:bg-accent/20",
              isMicDisabled && "opacity-20 grayscale border-border"
            )}
          >
            {isThinking || isEnding ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isSpeaking ? (
              <Activity className="h-8 w-8 animate-pulse" />
            ) : (
              <Mic className={cn("h-8 w-8", isListening && "fill-current")} />
            )}
          </Button>
        </div>

        {/* User Transcript View - Tightened */}
        <div className="max-w-xs text-center min-h-[2.5rem] px-4">
          <p className="text-xs font-medium text-foreground/70 leading-relaxed italic tracking-wide">
            "{transcript}"
          </p>
        </div>

        {/* AI Output Card - Animated Slide-In */}
        <div className="w-full max-w-sm px-4">
          {feedback && feedback.hasCorrection ? (
             <div className="bg-card/40 backdrop-blur-xl border border-accent/20 rounded-2xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-accent/20 rounded-lg">
                      <Sparkles className="h-3 w-3 text-accent" />
                    </div>
                    <h3 className="font-black text-[9px] uppercase tracking-widest text-accent">Neural Correction</h3>
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground uppercase opacity-50">ID: {Math.floor(Math.random()*900+100)}-FX</span>
               </div>
               
               <div className="space-y-2 pt-1">
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                   Syntax variance detected in <span className="text-destructive font-bold">"{feedback.originalText}"</span>.
                 </p>
                 <p className="text-[10px] text-foreground font-bold leading-relaxed">
                   Optimization suggested: <span className="text-accent">"{feedback.correctedText}"</span>.
                 </p>
                 <div className="flex items-center justify-between pt-1">
                    <p className="text-[8px] text-muted-foreground italic opacity-70">
                      {feedback.explanation}
                    </p>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-accent/60 flex items-center gap-1 cursor-pointer hover:text-accent transition-colors">
                      View Logs <ChevronLeft className="h-2 w-2 rotate-180" />
                    </span>
                 </div>
               </div>
             </div>
          ) : (
            <div className="text-center px-4 animate-in fade-in duration-500">
              <p className="text-base font-bold text-foreground leading-tight tracking-tight">
                "{aiResponseText}"
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Futuristic Bottom Controls - Tighter Spacing */}
      <footer className="p-6 max-w-xl mx-auto w-full grid grid-cols-3 gap-3 pb-10">
        <ControlBtn 
          icon={isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />} 
          label="Silence" 
          onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            if (newMuted && isListening) {
              recognitionRef.current?.stop();
              setIsListening(false);
            }
          }} 
        />
        <ControlBtn 
          icon={<History className="h-4 w-4" />} 
          label="Data Log" 
        />
        <Button 
          variant="destructive" 
          onClick={handleEndSession}
          disabled={isEnding}
          className="h-16 rounded-2xl flex flex-col gap-1 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive group transition-all duration-300"
        >
          {isEnding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PhoneOff className="h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">
            {isEnding ? "Computing..." : "Terminate"}
          </span>
        </Button>
      </footer>
    </div>
  );
}

function ControlBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Button 
      variant="secondary" 
      className="h-16 rounded-2xl flex flex-col gap-1 bg-card/50 border border-border hover:bg-accent/10 hover:border-accent/40 text-foreground/80 hover:text-foreground transition-all duration-300"
      onClick={onClick}
    >
      <div className="h-5 w-5 opacity-80">{icon}</div>
      <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-60">{label}</span>
    </Button>
  );
}
