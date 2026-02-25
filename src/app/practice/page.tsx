
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  Mic, 
  MicOff, 
  FileText, 
  PhoneOff, 
  Sparkles,
  Loader2,
  AlertCircle,
  Settings,
  Bot
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
  const [transcript, setTranscript] = useState("Click the mic to start speaking...");
  const [feedback, setFeedback] = useState<PracticeOutput['feedback'] | null>(null);
  const [aiResponseText, setAiResponseText] = useState("Hi! I'm Langor AI. What hobbies do you enjoy?");
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [errorStatus, setErrorStatus] = useState<'none' | 'generic' | 'api-key'>('none');
  const [startTime] = useState(Date.now());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMutedRef = useRef(isMuted);
  const isEndingRef = useRef(isEnding);

  // Keep refs in sync for callbacks
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
        // Don't show error if it's just a "no-speech" timeout during auto-loop
        if (event.error !== 'no-speech') {
          setTranscript("Error: Try again.");
        } else {
          // If no speech was detected, and we aren't muted/thinking, restart listening for a better experience
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
      setTranscript("Listening...");
    }
  };

  const handleUserSpeech = async (text: string) => {
    setIsThinking(true);
    setErrorStatus('none');
    
    // 3 Second natural delay requested for "conversation feel"
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
      if (error.message?.includes('API_KEY') || error.message?.includes('401') || error.message?.includes('key')) {
        setErrorStatus('api-key');
      } else {
        setErrorStatus('generic');
      }
      setTranscript("Sorry, I had trouble thinking. Try again?");
      setIsThinking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsThinking(false); // Done thinking once we start speaking
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // AUTOMATIC LOOP: Start listening again automatically after AI finishes its turn
        if (!isMutedRef.current && !isEndingRef.current) {
          setTimeout(() => {
            startListeningSafely();
          }, 600); // Slight delay for natural flow
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
    } catch (error) {
      console.error("Analysis Error:", error);
      router.push('/dashboard');
    } finally {
      setIsEnding(false);
    }
  };

  const isMicDisabled = isThinking || isEnding || isSpeaking;

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body selection:bg-primary/30">
      <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full shrink-0">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-full">
          <Link href="/dashboard">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-tight text-center">Discussing Hobbies</h1>
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Session Level: Intermediate</span>
        </div>
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-full">
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </header>

      {errorStatus === 'api-key' && (
        <div className="px-6 max-w-xl mx-auto w-full pt-4 animate-in fade-in slide-in-from-top-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Gemini API Key Missing</AlertTitle>
            <AlertDescription className="text-xs opacity-90 space-y-2">
              <p>AI conversations require an API key. Please add it to your settings or project configuration.</p>
              <Button size="sm" variant="outline" asChild className="bg-red-500/20 border-red-500/30 hover:bg-red-500/40 text-white h-7 text-[10px]">
                <Link href="/settings">Go to Settings</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="relative group">
          <div className={cn(
            "absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-25 blur transition duration-1000",
            (isListening || isThinking || isSpeaking) && "opacity-60 blur-md animate-pulse"
          )} />
          <Avatar className="h-28 w-28 border-4 border-[#1A2333] shadow-2xl relative bg-[#1A2333]">
            <AvatarFallback className="bg-[#1A2333]">
              <Bot className="h-14 w-14 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-1 right-2 h-5 w-5 bg-emerald-500 border-4 border-[#0B121F] rounded-full",
            (isThinking || isSpeaking) && "bg-blue-400 animate-bounce"
          )} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Langor AI</h2>
          {isListening ? (
            <p className="text-[#1D7AFC] text-xs font-black tracking-[0.2em] uppercase animate-pulse">Listening...</p>
          ) : isThinking ? (
            <p className="text-primary text-xs font-black tracking-[0.2em] uppercase">Thinking...</p>
          ) : isSpeaking ? (
            <p className="text-emerald-400 text-xs font-black tracking-[0.2em] uppercase">Speaking...</p>
          ) : (
            <p className="text-muted-foreground text-xs font-black tracking-[0.2em] uppercase">Ready</p>
          )}
        </div>

        <div className="relative flex items-center justify-center w-full h-48">
          {isListening && (
            <>
              <div className="absolute w-48 h-48 border border-primary/10 rounded-full animate-ping [animation-duration:2s]" />
              <div className="absolute w-64 h-64 border border-primary/5 rounded-full animate-ping [animation-duration:3s]" />
            </>
          )}
          
          <Button 
            size="icon" 
            onClick={toggleListening}
            disabled={isMicDisabled}
            className={cn(
              "h-24 w-24 rounded-full transition-all duration-300 shadow-2xl z-10",
              isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-[#1D7AFC] hover:bg-[#1D7AFC]/90",
              isMicDisabled && "opacity-50 cursor-not-allowed grayscale"
            )}
          >
            {isThinking || isEnding ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : isSpeaking ? (
              <Bot className="h-10 w-10 text-white animate-pulse" />
            ) : isListening ? (
              <MicOff className="h-10 w-10 text-white fill-current" />
            ) : (
              <Mic className="h-10 w-10 text-white fill-current" />
            )}
          </Button>
        </div>

        <div className="max-w-xs text-center min-h-[4rem]">
          <p className="text-lg font-medium text-white/90 leading-tight">
            "{aiResponseText}"
          </p>
        </div>

        <div className="max-w-xs text-center border-t border-white/5 pt-4">
          <p className="text-sm text-primary/80 leading-relaxed italic font-medium">
            "{transcript}"
          </p>
        </div>

        {feedback && feedback.hasCorrection && (
          <div className="w-full max-sm bg-[#1A2333]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-bold text-sm">Live Feedback</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instead of <span className="text-red-400 font-bold">"{feedback.originalText}"</span>, try <span className="text-emerald-400 font-bold">"{feedback.correctedText}"</span>.
            </p>
            {feedback.explanation && (
              <p className="text-[10px] text-muted-foreground italic">
                {feedback.explanation}
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="p-6 max-w-xl mx-auto w-full grid grid-cols-3 gap-4 pb-10">
        <ControlBtn 
          icon={isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />} 
          label={isMuted ? "UNMUTE" : "MUTE"} 
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
          icon={<FileText className="h-5 w-5" />} 
          label="TRANSCRIPT" 
        />
        <Button 
          variant="destructive" 
          onClick={handleEndSession}
          disabled={isEnding}
          className="h-14 rounded-2xl flex flex-col gap-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 group"
        >
          {isEnding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PhoneOff className="h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[9px] font-black tracking-widest uppercase">
            {isEnding ? "Analyzing..." : "End Session"}
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
      className="h-14 rounded-2xl flex flex-col gap-1 bg-[#1A2333] border border-white/5 hover:bg-[#252D3D] text-white"
      onClick={onClick}
    >
      {icon}
      <span className="text-[9px] font-black tracking-widest uppercase opacity-70">{label}</span>
    </Button>
  );
}
