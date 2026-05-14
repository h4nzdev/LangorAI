'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Mic, Sparkles, Bot, ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  loading: boolean;
  username: string | null;
}

export default function Home() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ loading: true, username: null });
  const [ctaClicked, setCtaClicked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        setAuth({ loading: false, username: profile?.username ?? null });
      } else {
        setAuth({ loading: false, username: null });
      }
    });
  }, []);

  const handleStartNow = useCallback(() => {
    if (auth.loading) return;
    if (auth.username) {
      // Already logged in — show the welcome-back panel
      setCtaClicked(true);
    } else {
      router.push('/welcome');
    }
  }, [auth, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body selection:bg-primary/30 transition-colors duration-300">

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <header className="px-6 h-20 flex items-center justify-between bg-background/80 backdrop-blur-lg sticky top-0 z-50 border-b border-border">
        <Link className="flex items-center" href="/">
          <div className="bg-primary/20 p-2 rounded-xl mr-3">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">Langor AI</span>
        </Link>
        <nav className="flex gap-3 items-center">
          <Link
            className="hidden sm:block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            href="#features"
          >
            Features
          </Link>
          {auth.username ? (
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold shadow-lg shadow-primary/20 gap-2"
            >
              <Link href="/dashboard">
                <ArrowRight className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 font-bold shadow-lg shadow-primary/20"
            >
              <Link href="/welcome">Get Started</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero Section ──────────────────────────────────────────────────── */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                AI-Powered Fluency
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                Master any language through <span className="text-primary italic">natural</span> conversation
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto font-medium">
                Stop memorising. Start speaking with Langor AI — the voice-first tutor that understands your pace and goals.
              </p>

              {/* ── CTA block ─────────────────────────────────────────────── */}
              {ctaClicked && auth.username ? (
                /* Welcome-back panel */
                <div className="flex flex-col items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="px-6 py-4 bg-card border border-border rounded-3xl text-center space-y-3 w-full max-w-sm shadow-xl">
                    <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
                    <p className="text-2xl font-black text-foreground">👋 {auth.username}</p>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button
                        size="lg"
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold gap-2"
                        onClick={() => router.push('/dashboard')}
                      >
                        <ArrowRight className="h-5 w-5" />
                        Continue to Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setCtaClicked(false)}
                      >
                        Not you? Sign in differently
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default CTA buttons */
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    size="lg"
                    onClick={handleStartNow}
                    disabled={auth.loading}
                    className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-primary/25"
                  >
                    {auth.loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Mic className="h-6 w-6 fill-current" />
                    )}
                    {auth.loading ? 'Loading…' : auth.username ? `Continue, ${auth.username}` : 'Start Speaking Now'}
                  </Button>
                  {!auth.username && !auth.loading && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="h-14 px-10 border-border bg-card hover:bg-muted text-foreground rounded-2xl text-lg font-bold transition-all gap-2"
                    >
                      <Link href="/welcome">
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Auth hint below CTA */}
              {!auth.username && !auth.loading && !ctaClicked && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5" />
                  No account needed to start — anonymous play supported
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section id="features" className="w-full py-24 border-t border-border">
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
                description="Instant grammar corrections as you speak — no API key required."
                color="emerald"
              />
              <FeatureCard
                icon={<Bot className="h-6 w-6" />}
                title="Battle Mode"
                description="1v1 live call battles where AI scores your grammar in real time."
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section className="w-full py-24">
          <div className="container px-6 mx-auto">
            <Card className="bg-gradient-to-br from-card to-background border border-border rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                  Ready to reach <span className="text-primary">fluency?</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                  Join learners speaking confidently with Langor AI every day.
                </p>
                {auth.username ? (
                  <Button
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/10 gap-3"
                  >
                    <ArrowRight className="h-6 w-6" />
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    asChild
                    className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/10"
                  >
                    <Link href="/welcome">Get Started Free</Link>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-muted p-1.5 rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase text-muted-foreground">Langor AI</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">© 2025 Langor AI. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground" href="#">Terms</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'purple';
}) {
  const colorMap = {
    blue:    'text-primary bg-primary/20',
    emerald: 'text-emerald-500 bg-emerald-500/20',
    purple:  'text-purple-500 bg-purple-500/20',
  };
  return (
    <Card className="bg-card border-none shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-8 space-y-4">
        <div className={`p-3 w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
