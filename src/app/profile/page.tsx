'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Target,
  Flame,
  Trophy,
  Clock,
  Zap,
  Globe,
  LogOut,
  Save,
  CheckCircle2,
  Smile,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';

const AVATARS = ['👤', '🧑‍🚀', '🧛', '🧙', '🦒', '🦊', '🦉', '🎨', '🎭', '🎮', '🎸', '🚀'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean'];
const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Fluent'];
const GOALS = ['Career Growth', 'Travel', 'Self-Improvement', 'Exam Prep', 'Socializing'];

export default function ProfilePage() {
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [language, setLanguage] = useState('English');
  const [level, setLevel] = useState('Intermediate');
  const [goal, setGoal] = useState('Career Growth');
  const [isSaved, setIsSaved] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'pro'>('basic');
  const [userStats, setUserStats] = useState({
    sessions: '0',
    minutes: '0',
    streak: '0'
  });

  useEffect(() => {
    const savedName = localStorage.getItem('USER_NAME');
    if (savedName) setUserName(savedName);

    const savedAvatar = localStorage.getItem('USER_AVATAR');
    if (savedAvatar) setUserAvatar(savedAvatar);

    const savedLevel = localStorage.getItem('USER_LEVEL');
    if (savedLevel) setLevel(savedLevel);

    const savedGoal = localStorage.getItem('USER_GOAL');
    if (savedGoal) setGoal(savedGoal);

    const savedPlan = localStorage.getItem('SUBSCRIPTION_PLAN');
    if (savedPlan === 'pro') setSubscriptionPlan('pro');

    // Load actual stats
    setUserStats({
      sessions: localStorage.getItem('SESSIONS_COUNT') || '0',
      minutes: localStorage.getItem('TOTAL_MINUTES') || '0',
      streak: localStorage.getItem('STREAK_COUNT') || '0'
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem('USER_NAME', userName);
    localStorage.setItem('USER_AVATAR', userAvatar);
    localStorage.setItem('USER_LEVEL', level);
    localStorage.setItem('USER_GOAL', goal);
    setIsSaved(true);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const statsList = [
    { label: 'Sessions', value: userStats.sessions, icon: <Zap className="h-4 w-4 text-yellow-400" /> },
    { label: 'Minutes', value: userStats.minutes, icon: <Clock className="h-4 w-4 text-blue-400" /> },
    { label: 'Day Streak', value: userStats.streak, icon: <Flame className="h-4 w-4 text-orange-400" /> },
  ];

  const streakProgress = Math.min((parseInt(userStats.streak) / 7) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body transition-colors duration-300">
      <Navigation />

      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full shrink-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full md:hidden">
            <Link href="/dashboard">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-sm font-bold tracking-tight uppercase">User Profile</h1>
          <div className="w-10 md:hidden" /> 
        </header>

        <main className="flex-1 max-w-xl mx-auto w-full px-6 space-y-8 pb-32 md:pb-12">
          {/* Profile Card */}
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-20 blur" />
              <Avatar className="h-24 w-24 border-4 border-card bg-card relative">
                <AvatarFallback className="text-4xl">
                  {userAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-background">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{userName || 'User'}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{goal}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {statsList.map((stat) => (
              <Card key={stat.label} className="bg-card border-none text-card-foreground overflow-hidden shadow-lg">
                <CardContent className="p-4 flex flex-col items-center gap-1">
                  <div className="p-2 bg-muted rounded-xl mb-1">
                    {stat.icon}
                  </div>
                  <span className="text-lg font-black">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscription Card */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Crown className="h-5 w-5" />
              <h3>Subscription Plan</h3>
            </div>
            <Card className={cn(
              "border-2 transition-all duration-300",
              subscriptionPlan === 'pro' 
                ? "border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" 
                : "border-border bg-card"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      subscriptionPlan === 'pro' 
                        ? "bg-yellow-500/20" 
                        : "bg-muted"
                    )}>
                      {subscriptionPlan === 'pro' ? (
                        <Crown className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <Globe className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-foreground">
                          {subscriptionPlan === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                        </p>
                        {subscriptionPlan === 'pro' && (
                          <Badge className="bg-yellow-500 text-white border-none font-bold text-xs">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionPlan === 'pro' 
                          ? 'Access to all premium features' 
                          : 'Upgrade to unlock Battle Mode'}
                      </p>
                    </div>
                  </div>
                  {subscriptionPlan === 'basic' && (
                    <Button
                      asChild
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl px-6 shadow-lg shadow-orange-500/30"
                    >
                      <Link href="/pricing">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Learning Goals */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Flame className="h-5 w-5" />
              <h3>Weekly Goal Progress</h3>
            </div>
            <Card className="bg-card border-none text-card-foreground shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-3xl font-black">{userStats.streak}/7</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Days practiced</p>
                  </div>
                  <Badge className={cn(
                    "border-none font-bold",
                    parseInt(userStats.streak) > 0 
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                  )}>
                    {parseInt(userStats.streak) > 0 ? "On Track" : "Start Today"}
                  </Badge>
                </div>
                <Progress value={streakProgress} className="h-2" />
                <p className="text-[11px] text-muted-foreground italic">
                  {parseInt(userStats.streak) >= 7 
                    ? "Weekly goal achieved! Outstanding work."
                    : `You're ${7 - parseInt(userStats.streak)} days away from your weekly goal!`}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Personal Details & Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Smile className="h-5 w-5" />
              <h3>Personal Preferences</h3>
            </div>
            <Card className="bg-card border-none text-card-foreground shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Name</label>
                  <Input 
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (isSaved) setIsSaved(false);
                    }}
                    className="bg-background border-border h-11 focus:ring-primary"
                    placeholder="Hanz"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Choose Avatar</label>
                  <div className="grid grid-cols-6 gap-2 pt-1">
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setUserAvatar(emoji);
                          if (isSaved) setIsSaved(false);
                        }}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center text-xl rounded-xl transition-all border border-border",
                          userAvatar === emoji 
                            ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white" 
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Practicing</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-border",
                          language === lang 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {lang}
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
                        onClick={() => {
                          setLevel(l);
                          if (isSaved) setIsSaved(false);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-border",
                          level === l 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
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
                        onClick={() => {
                          setGoal(g);
                          if (isSaved) setIsSaved(false);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-border",
                          goal === g 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    "w-full h-12 rounded-xl font-bold gap-2 transition-all",
                    isSaved 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  )}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Saved Successfully
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" /> Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="pt-4">
            <Button 
              variant="ghost" 
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl font-bold gap-2"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
            >
              <LogOut className="h-4 w-4" /> Reset All Data
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
}