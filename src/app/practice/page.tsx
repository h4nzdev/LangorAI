'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  Info, 
  Mic, 
  MicOff, 
  FileText, 
  PhoneOff, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function PracticeSession() {
  const [isMuted, setIsMuted] = useState(false);
  const aiAvatar = PlaceHolderImages.find(img => img.id === 'langor-ai')?.imageUrl;

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
          <h1 className="text-sm font-bold tracking-tight">Discussing Hobbies</h1>
          <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Session Level: Intermediate</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
          <Info className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Session Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-12">
        {/* AI Avatar */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full opacity-25 blur transition duration-1000 group-hover:duration-200" />
          <Avatar className="h-28 w-28 border-4 border-[#1A2333] shadow-2xl relative">
            <AvatarImage src={aiAvatar} alt="Langor AI" className="object-cover" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-2 h-5 w-5 bg-emerald-500 border-4 border-[#0B121F] rounded-full" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Langor AI</h2>
          <p className="text-[#1D7AFC] text-xs font-black tracking-[0.2em] uppercase animate-pulse">Listening...</p>
        </div>

        {/* Voice Interface / Pulse */}
        <div className="relative flex items-center justify-center w-full h-64">
          {/* Concentric Pulse Rings */}
          <div className="absolute w-48 h-48 border border-primary/10 rounded-full animate-ping [animation-duration:3s]" />
          <div className="absolute w-64 h-64 border border-primary/5 rounded-full animate-ping [animation-duration:4s]" />
          <div className="absolute w-80 h-80 border border-primary/5 rounded-full animate-ping [animation-duration:5s]" />
          
          <Button 
            size="icon" 
            className="h-20 w-20 rounded-full bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 shadow-[0_0_30px_rgba(29,122,252,0.4)] z-10"
          >
            <Mic className="h-8 w-8 text-white fill-current" />
          </Button>
        </div>

        {/* Live Transcription */}
        <div className="max-w-xs text-center">
          <p className="text-sm text-primary/80 leading-relaxed italic font-medium">
            "I really like play soccer every weekend with my friends at the park."
          </p>
        </div>

        {/* Live Feedback Card */}
        <div className="w-full max-w-sm bg-[#1A2333]/80 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm">Live Feedback</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instead of <span className="text-red-400 font-bold">"I like play"</span>, try <span className="text-emerald-400 font-bold">"I enjoy playing"</span> for better fluency and natural flow.
          </p>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
            Grammar Tip <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-6 max-w-xl mx-auto w-full grid grid-cols-3 gap-4 pb-10">
        <ControlBtn 
          icon={isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />} 
          label="MUTE" 
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
          <Link href="/dashboard">
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