'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  Send, 
  ArrowLeft, 
  Settings, 
  Volume2, 
  Info,
  ChevronLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'ai';
  text: string;
  translation?: string;
};

export default function PracticePage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '¡Hola! Soy tu tutor de español. ¿Cómo estás hoy?' },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: '¡Qué bien! Me alegra mucho escucharlo. ¿Qué has hecho de interesante hoy?',
        translation: "That's good! I'm glad to hear it. What interesting thing have you done today?"
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold">At the Restaurant</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1 h-4">Spanish</Badge>
              <span className="text-xs text-muted-foreground">Scenario Practice</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full p-4 gap-4">
        {/* Chat Area */}
        <Card className="flex-1 overflow-hidden border-none shadow-lg bg-white flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col gap-2 max-w-[80%]",
                    m.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                  {m.translation && (
                    <div className="text-[10px] text-muted-foreground italic px-1">
                      {m.translation}
                    </div>
                  )}
                  {m.role === 'ai' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Input Area */}
        <div className="flex flex-col gap-3 p-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input 
                placeholder="Type your response..." 
                className="pr-12 h-12 rounded-xl shadow-sm border-2 focus-visible:ring-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              size="icon" 
              className={cn(
                "h-12 w-12 rounded-xl transition-all",
                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary"
              )}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-xl"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-center">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Tip: Press space to start recording, or click the mic.
            </p>
          </div>
        </div>
      </main>

      {/* Helper Panel (Optional/Floating) */}
      <div className="fixed bottom-24 right-8 group">
        <Button variant="secondary" size="lg" className="rounded-full shadow-xl border gap-2 font-bold">
          <RefreshCw className="h-4 w-4" />
          Help me respond
        </Button>
      </div>
    </div>
  );
}