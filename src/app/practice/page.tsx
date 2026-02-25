'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  Info, 
  Mic, 
  MicOff, 
  FileText, 
  PhoneOff, 
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { startPracticeSession, type PracticeOutput } from '@/ai/flows/practice-flow';

// Mock Web Speech API types for TypeScript
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
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("Click the mic to start speaking...");
  const [feedback, setFeedback] = useState<PracticeOutput['feedback'] | null>(null);
  const [aiResponseText, setAiResponseText] = useState("Hi! I'm Langor AI. What hobbies do you enjoy?");
  const [errorStatus, setErrorStatus] = useState<'none' | 'generic' | 'api-key'>('none');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const aiAvatar = PlaceHolderImages.find(img => img.id === 'langor-ai')?.imageUrl;

  // Initialize Speech Recognition
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

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript("Error: Try again.");
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      setTranscript("Listening...");
      recognitionRef.current?.start();
    }
  };

  const handleUserSpeech = async (text: string) => {
    setIsThinking(true);
    setErrorStatus('none');
    try {
      const result = await startPracticeSession({ userInput: text });
      setAiResponseText(result.aiResponse);
      setFeedback(result.feedback);
      
      // AI speaks the response
      speakText(result.aiResponse);
    } catch (error: any) {
      console.error("AI Error:", error);
      
      // Check if it's likely an API key issue (common in this environment)
      if (error.message?.includes('API_KEY') || error.message?.includes('401') || error.message?.includes('key')) {
        setErrorStatus('api-key');
      } else {
        setErrorStatus('generic');
      }
      
      setTranscript("Sorry, I had trouble thinking. Try again?");
    } finally {
      setIsThinking(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body selection:bg-primary/30">
      {/* Header */}
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
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
          <Info className="h-5 w-5" />
        </Button>
      </header>

      {/* API Key Warning Overlay */}
      {errorStatus === 'api-key' && (
        <div className="px-6 max-w-xl mx-auto w-full pt-4 animate-in fade-in slide-in-from-top-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Gemini API Key Missing</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              To enable AI conversations, please add your <code className="bg-black/20 px-1 rounded">GEMINI_API_KEY</code> to the <code className="bg-black/20 px-1 rounded">.env</code> file in your project root.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Session Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* AI Avatar */}
        <div className="relative group">
          <div className={cn(
            "absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-25 blur transition duration-1000",
            (isListening || isThinking) && "opacity-60 blur-md animate-pulse"
          )} />
          <Avatar className="h-28 w-28 border-4 border-[#1A2333] shadow-2xl relative">
            <AvatarImage src={aiAvatar} alt="Langor AI" className="object-cover" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute bottom-1 right-2 h-5 w-5 bg-emerald-500 border-4 border-[#0B121F] rounded-full",
            isThinking && "bg-blue-400 animate-bounce"
          )} />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Langor AI</h2>
          {isListening ? (
            <p className="text-[#1D7AFC] text-xs font-black tracking-[0.2em] uppercase animate-pulse">Listening...</p>
          ) : isThinking ? (
            <p className="text-primary text-xs font-black tracking-[0.2em] uppercase">Thinking...</p>
          ) : (
            <p className="text-muted-foreground text-xs font-black tracking-[0.2em] uppercase">Ready</p>
          )}
        </div>

        {/* Voice Interface / Pulse */}
        <div className="relative flex items-center justify-center w-full h-48">
          {/* Concentric Pulse Rings - Only show when active */}
          {isListening && (
            <>
              <div className="absolute w-48 h-48 border border-primary/10 rounded-full animate-ping [animation-duration:2s]" />
              <div className="absolute w-64 h-64 border border-primary/5 rounded-full animate-ping [animation-duration:3s]" />
            </>
          )}
          
          <Button 
            size="icon" 
            onClick={toggleListening}
            disabled={isThinking}
            className={cn(
              "h-24 w-24 rounded-full transition-all duration-300 shadow-2xl z-10",
              isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-[#1D7AFC] hover:bg-[#1D7AFC]/90",
              isThinking && "opacity-50 cursor-not-allowed"
            )}
          >
            {isThinking ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="h-10 w-10 text-white fill-current" />
            ) : (
              <Mic className="h-10 w-10 text-white fill-current" />
            )}
          </Button>
        </div>

        {/* AI Response Display */}
        <div className="max-w-xs text-center min-h-[4rem]">
          {errorStatus === 'api-key' ? (
            <p className="text-red-400 font-bold text-sm">
              Setup Required: Please add your Gemini API Key to start the conversation.
            </p>
          ) : (
            <p className="text-lg font-medium text-white/90 leading-tight">
              "{aiResponseText}"
            </p>
          )}
        </div>

        {/* User Transcript */}
        <div className="max-w-xs text-center border-t border-white/5 pt-4">
          <p className="text-sm text-primary/80 leading-relaxed italic font-medium">
            "{transcript}"
          </p>
        </div>

        {/* Live Feedback Card */}
        {feedback && feedback.hasCorrection && (
          <div className="w-full max-w-sm bg-[#1A2333]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-500">
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
            <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
              Grammar Tip <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="p-6 max-w-xl mx-auto w-full grid grid-cols-3 gap-4 pb-10">
        <ControlBtn 
          icon={isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />} 
          label={isMuted ? "UNMUTE" : "MUTE"} 
          onClick={() => setIsMuted(!isMuted)} 
        />
        <ControlBtn 
          icon={<FileText className="h-5 w-5" />} 
          label="TRANSCRIPT" 
        />
        <Button 
          variant="destructive" 
          className="h-14 rounded-2xl flex flex-col gap-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 group"
          asChild
        >
          <Link href="/practice/analysis">
            <PhoneOff className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black tracking-widest uppercase">End Session</span>
          </Link>
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
