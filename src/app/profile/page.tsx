'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Flame,
  Trophy,
  Clock,
  Zap,
  LogOut,
  Save,
  CheckCircle2,
  Smile,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AVATARS = ['👤', '🧑‍🚀', '🧛', '🧙', '🦒', '🦊', '🦉', '🎨', '🎭', '🎮', '🎸', '🚀'];
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Fluent'];
const GOALS = ['Career Growth', 'Travel', 'Self-Improvement', 'Exam Prep', 'Socializing'];

interface Profile {
  id: string;
  username: string;
  avatar: string;
  level: string;
  points: number;
  streak: number;
  total_sessions: number;
  total_minutes: number;
  learning_goal: string;
  proficiency_level: string;
  wins: number;
  losses: number;
  draws: number;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Editable fields
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [proficiencyLevel, setProficiencyLevel] = useState('Intermediate');
  const [learningGoal, setLearningGoal] = useState('Career Growth');

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/welcome'); return; }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data as Profile);
      setUsername(data.username ?? '');
      setAvatar(data.avatar ?? '👤');
      setProficiencyLevel(data.proficiency_level ?? 'Intermediate');
      setLearningGoal(data.learning_goal ?? 'Career Growth');
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim() || profile?.username,
        avatar,
        proficiency_level: proficiencyLevel,
        learning_goal: learningGoal,
      })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setIsSaved(true);
    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    setTimeout(() => setIsSaved(false), 3000);
    loadProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/welcome');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalGames = (profile?.wins ?? 0) + (profile?.losses ?? 0) + (profile?.draws ?? 0);
  const winRate = totalGames > 0 ? Math.round(((profile?.wins ?? 0) / totalGames) * 100) : 0;
  const streakProgress = Math.min(((profile?.streak ?? 0) / 7) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body transition-colors duration-300">
      <Navigation />

      <div className="flex-1 flex flex-col md:pl-64">
        <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full shrink-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full md:hidden">
            <Link href="/dashboard"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <h1 className="text-sm font-bold tracking-tight uppercase">User Profile</h1>
          <div className="w-10 md:hidden" />
        </header>

        <main className="flex-1 max-w-xl mx-auto w-full px-6 space-y-8 pb-32 md:pb-12">

          {/* Avatar & name */}
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-20 blur" />
              <Avatar className="h-24 w-24 border-4 border-card bg-card relative">
                <AvatarFallback className="text-4xl">{avatar}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-background">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{profile?.username || 'Player'}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{learningGoal}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sessions', value: profile?.total_sessions ?? 0, icon: <Zap className="h-4 w-4 text-yellow-400" /> },
              { label: 'Minutes', value: profile?.total_minutes ?? 0, icon: <Clock className="h-4 w-4 text-blue-400" /> },
              { label: 'Streak', value: profile?.streak ?? 0, icon: <Flame className="h-4 w-4 text-orange-400" /> },
            ].map(s => (
              <Card key={s.label} className="bg-card border-none shadow-lg">
                <CardContent className="p-4 flex flex-col items-center gap-1">
                  <div className="p-2 bg-muted rounded-xl mb-1">{s.icon}</div>
                  <span className="text-lg font-black">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center">{s.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Battle stats */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <BarChart3 className="h-5 w-5" />
              <h3>Battle Statistics</h3>
            </div>
            <Card className="bg-card border-none shadow-xl">
              <CardContent className="p-5 grid grid-cols-4 divide-x divide-border text-center">
                {[
                  { label: 'Points', value: (profile?.points ?? 0).toLocaleString(), color: 'text-primary' },
                  { label: 'Wins', value: profile?.wins ?? 0, color: 'text-emerald-500' },
                  { label: 'Losses', value: profile?.losses ?? 0, color: 'text-destructive' },
                  { label: 'Win %', value: `${winRate}%`, color: winRate >= 50 ? 'text-emerald-500' : 'text-orange-500' },
                ].map(s => (
                  <div key={s.label} className="px-2">
                    <p className={cn('text-xl font-black', s.color)}>{s.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Weekly goal progress */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Flame className="h-5 w-5" />
              <h3>Weekly Goal Progress</h3>
            </div>
            <Card className="bg-card border-none shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-3xl font-black">{profile?.streak ?? 0}/7</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Days practiced</p>
                  </div>
                  <Badge className={cn(
                    'border-none font-bold',
                    (profile?.streak ?? 0) > 0
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                  )}>
                    {(profile?.streak ?? 0) > 0 ? 'On Track' : 'Start Today'}
                  </Badge>
                </div>
                <Progress value={streakProgress} className="h-2" />
                <p className="text-[11px] text-muted-foreground italic">
                  {(profile?.streak ?? 0) >= 7
                    ? 'Weekly goal achieved! Outstanding work.'
                    : `${7 - (profile?.streak ?? 0)} days left to hit your weekly goal.`}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Personal preferences */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Smile className="h-5 w-5" />
              <h3>Personal Preferences</h3>
            </div>
            <Card className="bg-card border-none shadow-xl">
              <CardContent className="p-6 space-y-6">

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
                  <Input
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); if (isSaved) setIsSaved(false); }}
                    className="bg-background border-border h-11 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Choose Avatar</label>
                  <div className="grid grid-cols-6 gap-2 pt-1">
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => { setAvatar(emoji); if (isSaved) setIsSaved(false); }}
                        className={cn(
                          'h-10 w-10 flex items-center justify-center text-xl rounded-xl transition-all border border-border',
                          avatar === emoji
                            ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-110'
                            : 'bg-background hover:bg-muted'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Level</label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l}
                        onClick={() => { setProficiencyLevel(l); if (isSaved) setIsSaved(false); }}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-border',
                          proficiencyLevel === l
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        onClick={() => { setLearningGoal(g); if (isSaved) setIsSaved(false); }}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-border',
                          learningGoal === g
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  className={cn(
                    'w-full h-12 rounded-xl font-bold gap-2 transition-all',
                    isSaved
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                  )}
                >
                  {isSaved ? (
                    <><CheckCircle2 className="h-5 w-5" /> Saved!</>
                  ) : (
                    <><Save className="h-5 w-5" /> Save Profile</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Sign out */}
          <section className="pt-4">
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl font-bold gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
}
