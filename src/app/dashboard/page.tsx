'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Bell,
  Mic,
  BarChart3,
  Flame,
  Zap,
  LayoutGrid,
  ChevronRight,
  User,
  MessageSquare,
  AlertCircle,
  Settings as SettingsIcon,
  ShieldAlert,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';
import { createClient } from '@/lib/supabase/client';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { LevelProgressCard } from '@/components/dashboard/LevelProgressCard';
import { calculateProgression, type ProgressionResult } from '@/lib/recommendations';

interface Activity {
  id: string;
  title: string;
  meta: string;
  goal: string;
  level: string;
  imageId: string;
}

const ALL_ACTIVITIES: Activity[] = [
  { id: 'job-interview', title: 'Job Interview Prep', meta: '15 mins • 40 pts', goal: 'Career Growth', level: 'Intermediate', imageId: 'job-interview' },
  { id: 'presentation', title: 'Executive Pitch', meta: '12 mins • 35 pts', goal: 'Career Growth', level: 'Advanced', imageId: 'presentation' },
  { id: 'small-talk-beg', title: 'Simple Greetings', meta: '10 mins • 20 pts', goal: 'Socializing', level: 'Beginner', imageId: 'small-talk' },
  { id: 'small-talk', title: 'Small Talk Mastery', meta: '20 mins • 50 pts', goal: 'Socializing', level: 'Intermediate', imageId: 'small-talk' },
  { id: 'grammar-books-beg', title: 'ABC Mastery', meta: '10 mins • 15 pts', goal: 'Self-Improvement', level: 'Beginner', imageId: 'grammar-books' },
  { id: 'grammar-books', title: 'Grammar Refinement', meta: '10 mins • 25 pts', goal: 'Self-Improvement', level: 'Intermediate', imageId: 'grammar-books' },
  { id: 'ai-tutor-session', title: 'Daily Fluency Check', meta: '5 mins • 15 pts', goal: 'Self-Improvement', level: 'Elementary', imageId: 'ai-tutor' },
  { id: 'travel-airport', title: 'Airport Navigation', meta: '15 mins • 30 pts', goal: 'Travel', level: 'Intermediate', imageId: 'small-talk' },
  { id: 'travel-hotel', title: 'Hotel Check-in', meta: '10 mins • 20 pts', goal: 'Travel', level: 'Elementary', imageId: 'hero-learning' },
  { id: 'ielts-prep', title: 'IELTS Speaking Task', meta: '20 mins • 60 pts', goal: 'Exam Prep', level: 'Advanced', imageId: 'grammar-books' },
  { id: 'toefl-prep', title: 'TOEFL Academic Pitch', meta: '18 mins • 55 pts', goal: 'Exam Prep', level: 'Advanced', imageId: 'presentation' },
];

const INTERVIEWERS = [
  { id: 'langor-ai', name: 'Langor AI', role: 'Professional Tutor', avatar: '🤖', description: 'Strict but effective grammar focus.' },
  { id: 'zoe', name: 'Zoe', role: 'Friendly Native', avatar: '👩', description: 'Casual flow and modern slang.' },
  { id: 'max', name: 'Max', role: 'Corporate Lead', avatar: '🧔', description: 'High-stakes business terminology.' },
];

const SCENARIOS = [
  { id: 'casual', name: 'Casual Chat', icon: <MessageSquare className="h-4 w-4" />, description: 'General daily conversation.' },
  { id: 'job-interview', name: 'Job Interview', icon: <User className="h-4 w-4" />, description: 'Formal hiring simulation.' },
  { id: 'reporting', name: 'Reporting', icon: <BarChart3 className="h-4 w-4" />, description: 'Executive presentation mode.' },
];

function getCurrentDayIndex() {
  // 0 = Monday … 6 = Sunday
  const day = new Date().getDay(); // 0 Sun, 1 Mon … 6 Sat
  return day === 0 ? 6 : day - 1;
}

function buildRecommendations(goal: string, level: string): Activity[] {
  let filtered = ALL_ACTIVITIES.filter(a => a.goal === goal && a.level === level);
  if (filtered.length < 4) {
    filtered = [...filtered, ...ALL_ACTIVITIES.filter(a => a.goal === goal && !filtered.find(f => f.id === a.id))];
  }
  if (filtered.length < 4) {
    filtered = [...filtered, ...ALL_ACTIVITIES.filter(a => !filtered.find(f => f.id === a.id)).slice(0, 4 - filtered.length)];
  }
  return filtered.slice(0, 4);
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [userGoal, setUserGoal] = useState('Career Growth');
  const [userLevel, setUserLevel] = useState('Intermediate');
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ streak: 0, sessions: 0, confidence: 0 });
  const [progression, setProgression] = useState<ProgressionResult | null>(null);
  const [winsLosses, setWinsLosses] = useState({ wins: 0, losses: 0 });

  // Dialog state
  const [setupStep, setSetupStep] = useState(1);
  const [selectedInterviewer, setSelectedInterviewer] = useState(INTERVIEWERS[0].id);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      // Check for API key
      const apiKey = localStorage.getItem('GOOGLE_AI_API_KEY');
      setHasApiKey(!!apiKey);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let goal = 'Career Growth';
      let level = 'Intermediate';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.username);
          setUserAvatar(profile.avatar ?? '👤');
          goal = profile.learning_goal || 'Career Growth';
          level = profile.proficiency_level || 'Intermediate';
          setUserGoal(goal);
          setUserLevel(level);

          const sessions = profile.total_sessions ?? 0;
          const wins    = profile.wins    ?? 0;
          const losses  = profile.losses  ?? 0;
          setStats({
            streak: profile.streak ?? 0,
            sessions,
            confidence: Math.min(sessions * 5, 100),
          });
          setWinsLosses({ wins, losses });

          // Fetch recent battle errors for the progression algorithm
          const { data: recentParticipants } = await supabase
            .from('battle_participants')
            .select('error_count')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: false })
            .limit(10);
          const recentErrors = (recentParticipants ?? []).map(r => r.error_count ?? 0);
          setProgression(calculateProgression(level, wins, losses, recentErrors));

          // Keep localStorage in sync
          localStorage.setItem('USER_NAME', profile.username);
          localStorage.setItem('USER_AVATAR', profile.avatar ?? '👤');
          localStorage.setItem('USER_GOAL', goal);
          localStorage.setItem('USER_LEVEL', level);
        }
      } else {
        // Fallback to localStorage while auth loads
        const savedName = localStorage.getItem('USER_NAME');
        if (savedName) setUserName(savedName);
        setUserAvatar(localStorage.getItem('USER_AVATAR') || '👤');
        goal = localStorage.getItem('USER_GOAL') || 'Career Growth';
        level = localStorage.getItem('USER_LEVEL') || 'Intermediate';
        setUserGoal(goal);
        setUserLevel(level);

        const sessions = parseInt(localStorage.getItem('SESSIONS_COUNT') || '0');
        setStats({
          streak: parseInt(localStorage.getItem('STREAK_COUNT') || '0'),
          sessions,
          confidence: Math.min(sessions * 5, 100),
        });
      }

      setRecommendations(buildRecommendations(goal, level));
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const handleStartSession = () => {
    const interviewer = INTERVIEWERS.find(i => i.id === selectedInterviewer);
    const scenario = SCENARIOS.find(s => s.id === selectedScenario);
    setIsDialogOpen(false);
    router.push(
      `/practice?topic=${encodeURIComponent(scenario?.name || 'Casual')}&interviewer=${encodeURIComponent(interviewer?.name || 'Langor AI')}`
    );
  };

  const getLevelLabel = (confidence: number) => {
    if (confidence === 0) return 'New Learner';
    if (confidence < 30) return 'Beginner';
    if (confidence < 60) return 'Intermediate';
    if (confidence < 90) return 'Advanced';
    return 'Fluent';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const todayIdx = getCurrentDayIndex();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body transition-colors duration-300">
      <Navigation />

      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full shrink-0">
          <Link href="/profile" className="md:hidden">
            <Avatar className="h-10 w-10 border-2 border-primary/20 bg-card hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-card text-xl">{userAvatar}</AvatarFallback>
            </Avatar>
          </Link>
          <span className="text-xl font-bold tracking-tight md:hidden text-foreground">Langor AI</span>
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl">
              <Bell className="h-6 w-6" />
            </Button>
            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-primary/20 bg-card hover:border-primary/50 transition-colors">
                <AvatarFallback className="bg-card text-xl">{userAvatar}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl md:hidden">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto pb-32 md:pb-12">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            {/* Welcome */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground text-sm font-medium">
                Goal: <span className="text-primary">{userGoal}</span> • Level: <span className="text-primary">{userLevel}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card border-none shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-bold text-sm text-foreground">Confidence Level</span>
                    </div>
                    <span className="text-2xl font-black text-primary">{stats.confidence}%</span>
                  </div>
                  <Progress value={stats.confidence} className="h-2.5" />
                  <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                    <span>{getLevelLabel(stats.confidence)}</span>
                    <span className="text-primary">Goal: 100%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-none shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-around h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-orange-500/20 p-3 rounded-2xl relative">
                        <Flame className="h-6 w-6 text-orange-500 fill-current" />
                        {stats.streak > 0 && (
                          <div className="absolute -top-1 -right-1 bg-orange-500 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-card">
                            !
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-foreground">{stats.streak}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day Streak</p>
                      </div>
                    </div>

                    <div className="w-px h-12 bg-border" />

                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/20 p-3 rounded-2xl">
                        <Zap className="h-6 w-6 text-primary fill-current" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-foreground">{stats.sessions}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Level Progression */}
            {progression && (
              <LevelProgressCard
                currentLevel={userLevel}
                learningGoal={userGoal}
                result={progression}
              />
            )}

            {/* Start Session Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSetupStep(1); }}>
              <DialogTrigger asChild>
                <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold gap-3 shadow-lg shadow-primary/20 group transition-all">
                  <div className="bg-white/20 p-1.5 rounded-full group-hover:scale-110 transition-transform">
                    <Mic className="h-6 w-6 fill-current" />
                  </div>
                  Start Free Conversation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl overflow-hidden p-0 gap-0">
                {!hasApiKey ? (
                  <div>
                    <div className="bg-destructive/10 p-8 flex flex-col items-center text-center space-y-4 border-b border-border/50">
                      <div className="h-20 w-20 rounded-3xl bg-destructive/20 flex items-center justify-center text-destructive border-2 border-destructive/30 animate-pulse">
                        <ShieldAlert className="h-10 w-10" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Neural Link Failed</h2>
                        <div className="flex items-center justify-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-destructive" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive">Error Code: MISSING_UPLINK_KEY</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Langor AI requires a Google Gemini API Key to establish a real-time neural connection for conversation and grammar analysis.
                      </p>
                      <div className="bg-muted/50 p-4 rounded-2xl border border-border/50 space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Action Required</h4>
                        <p className="text-xs text-muted-foreground italic">"Head to settings to securely input your personal API key from Google AI Studio."</p>
                      </div>
                      <Button asChild className="w-full h-14 rounded-xl bg-foreground text-background font-black uppercase tracking-widest gap-2 shadow-xl hover:bg-foreground/90">
                        <Link href="/settings">
                          <SettingsIcon className="h-5 w-5" /> Go to Settings
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-primary/5 p-6 border-b border-border/50">
                      <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Link Setup</span>
                        </div>
                        <DialogTitle className="text-2xl font-black text-foreground">
                          {setupStep === 1 ? 'Choose Your Tutor' : 'Select Scene'}
                        </DialogTitle>
                      </DialogHeader>
                    </div>

                    <div className="p-6 space-y-4">
                      {setupStep === 1 ? (
                        <div className="space-y-3">
                          {INTERVIEWERS.map((i) => (
                            <button
                              key={i.id}
                              onClick={() => setSelectedInterviewer(i.id)}
                              className={cn(
                                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                                selectedInterviewer === i.id
                                  ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10'
                                  : 'bg-background border-border hover:border-primary/30'
                              )}
                            >
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl border border-border">
                                {i.avatar}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-foreground">{i.name}</h4>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{i.role}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{i.description}</p>
                              </div>
                              {selectedInterviewer === i.id && <Zap className="h-4 w-4 text-primary fill-current" />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {SCENARIOS.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedScenario(s.id)}
                              className={cn(
                                'w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left',
                                selectedScenario === s.id
                                  ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10'
                                  : 'bg-background border-border hover:border-accent/30'
                              )}
                            >
                              <div className={cn(
                                'h-10 w-10 rounded-xl flex items-center justify-center border',
                                selectedScenario === s.id
                                  ? 'bg-accent/20 border-accent/40 text-accent'
                                  : 'bg-muted border-border text-muted-foreground'
                              )}>
                                {s.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-foreground">{s.name}</h4>
                                <p className="text-xs text-muted-foreground">{s.description}</p>
                              </div>
                              {selectedScenario === s.id && <div className="h-2 w-2 rounded-full bg-accent animate-ping" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <DialogFooter className="p-6 pt-0">
                      {setupStep === 1 ? (
                        <Button
                          onClick={() => setSetupStep(2)}
                          className="w-full h-12 rounded-xl bg-foreground text-background font-black uppercase tracking-widest gap-2 group"
                        >
                          Next: Choose Scene <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          <Button
                            onClick={handleStartSession}
                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                          >
                            <Zap className="h-5 w-5 fill-current" /> Initialize Link
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setSetupStep(1)}
                            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-8"
                          >
                            Back to Tutor Selection
                          </Button>
                        </div>
                      )}
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Weekly Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Weekly Activity</h2>
                <Button variant="link" className="text-primary text-xs font-bold p-0">Detailed Insights</Button>
              </div>
              <div className="flex items-end justify-between px-2 h-20 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const isActive = i <= todayIdx && (todayIdx - i) < stats.streak;
                  return (
                    <div key={`${day}-${i}`} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={cn(
                          'w-full rounded-t-lg transition-all duration-500',
                          isActive
                            ? 'bg-primary h-12 shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                            : 'bg-muted h-6 hover:bg-muted/80'
                        )}
                      />
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-widest',
                        i === todayIdx ? 'text-primary' : 'text-muted-foreground'
                      )}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended for You */}
            <div className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
                <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                    {userGoal} • {userLevel} Focused
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.length > 0 ? recommendations.map((item) => {
                  const img = PlaceHolderImages.find(p => p.id === item.imageId);
                  return (
                    <Link key={item.id} href="/practice" className="block h-full">
                      <Card className="bg-card border-none overflow-hidden hover:ring-2 ring-primary/50 transition-all cursor-pointer shadow-lg group h-full">
                        <div className="relative aspect-video w-full overflow-hidden">
                          {img && (
                            <Image
                              src={img.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        </div>
                        <CardContent className="p-3 space-y-1">
                          <h3 className="font-bold text-sm leading-tight text-foreground">{item.title}</h3>
                          <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                          <Badge variant="outline" className="text-[8px] h-4 py-0 border-border text-muted-foreground">{item.level}</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                }) : (
                  <div className="col-span-full py-8 text-center bg-card rounded-3xl border border-dashed border-border">
                    <p className="text-muted-foreground text-sm italic">Finding perfect matches for your profile…</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Analytics ─────────────────────────────────────────────── */}
            <div className="mt-6">
              <AnalyticsSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
