import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, Zap, Globe, Bot, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'ai-tutor');

  return (
    <div className="flex flex-col min-h-screen bg-[#0B121F] text-white font-body selection:bg-primary/30">
      {/* Navigation */}
      <header className="px-6 h-20 flex items-center justify-between bg-[#0B121F]/80 backdrop-blur-lg sticky top-0 z-50 border-b border-white/5">
        <Link className="flex items-center" href="/">
          <div className="bg-primary/20 p-2 rounded-xl mr-3">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter">Langor AI</span>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link className="hidden sm:block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors" href="#features">
            Features
          </Link>
          <Button asChild className="bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-500/20">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                AI-Powered Fluency
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                Master any language through <span className="text-primary italic">natural</span> conversation
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto font-medium">
                Stop memorizing. Start speaking with Langor AI, the voice-first tutor that understands your pace and goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-blue-500/25" asChild>
                  <Link href="/dashboard">
                    <Mic className="h-6 w-6 fill-current" />
                    Start Speaking Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-lg font-bold transition-all">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Core Value Props */}
        <section id="features" className="w-full py-24 border-t border-white/5 bg-[#0B121F]">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Mic className="h-6 w-6" />}
                title="Voice-First"
                description="Real-time speech recognition for truly hands-free language practice."
                color="blue"
              />
              <FeatureCard 
                icon={<Sparkles className="h-6 w-6" />}
                title="Live Feedback"
                description="Instant corrections on your grammar and pronunciation as you speak."
                color="emerald"
              />
              <FeatureCard 
                icon={<Bot className="h-6 w-6" />}
                title="Contextual AI"
                description="Simulate real-world scenarios from coffee shop chats to job interviews."
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24">
          <div className="container px-6 mx-auto">
            <Card className="bg-gradient-to-br from-[#1A2333] to-[#0B121F] border border-white/5 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  Ready to reach <span className="text-primary">fluency?</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                  Join thousands of learners speaking confidently with Langor AI.
                </p>
                <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-white/90 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-white/10" asChild>
                  <Link href="/dashboard">Get Started Free</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/5 p-1.5 rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase text-muted-foreground">Langor AI</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">© 2024 Langor AI. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white" href="#">Terms</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'blue' | 'emerald' | 'purple' }) {
  const colorMap = {
    blue: 'text-primary bg-primary/20',
    emerald: 'text-emerald-400 bg-emerald-400/20',
    purple: 'text-purple-400 bg-purple-400/20',
  };

  return (
    <Card className="bg-[#1A2333] border-none shadow-xl hover:translate-y-[-4px] transition-all duration-300">
      <CardContent className="p-8 space-y-4">
        <div className={`p-3 w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
