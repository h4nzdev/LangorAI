'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Mic, 
  BarChart3, 
  Flame,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';

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

export default function Dashboard() {
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [userGoal, setUserGoal] = useState('Career Growth');
  const [userLevel, setUserLevel] = useState('Intermediate');
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    streak: 0,
    sessions: 0,
    confidence: 0
  });

  useEffect(() => {
    // Basic user info
    const savedName = localStorage.getItem('USER_NAME');
    if (savedName) setUserName(savedName);

    const savedAvatar = localStorage.getItem('USER_AVATAR');
    if (savedAvatar) setUserAvatar(savedAvatar);

    const savedGoal = localStorage.getItem('USER_GOAL') || 'Career Growth';
    setUserGoal(savedGoal);

    const savedLevel = localStorage.getItem('USER_LEVEL') || 'Intermediate';
    setUserLevel(savedLevel);

    // Progress stats
    const streak = parseInt(localStorage.getItem('STREAK_COUNT') || '0');
    const sessions = parseInt(localStorage.getItem('SESSIONS_COUNT') || '0');
    
    // Confidence grows by 5% per session, capped at 100%
    const calculatedConfidence = Math.min(sessions * 5, 100);

    setStats({
      streak,
      sessions,
      confidence: calculatedConfidence
    });

    // Enhanced recommendation engine (matching goal and level)
    try {
      // 1. Try to find exact goal and level matches
      let filtered = ALL_ACTIVITIES.filter(a => a.goal === savedGoal && a.level === savedLevel);
      
      // 2. If not enough, find goal matches at any level
      if (filtered.length < 4) {
        const goalMatches = ALL_ACTIVITIES.filter(a => a.goal === savedGoal && !filtered.find(f => f.id === a.id));
        filtered = [...filtered, ...goalMatches];
      }

      // 3. If still not enough, add fillers from other goals
      if (filtered.length < 4) {
        const fillers = ALL_ACTIVITIES.filter(a => !filtered.find(f => f.id === a.id)).slice(0, 4 - filtered.length);
        filtered = [...filtered, ...fillers];
      }
      
      setRecommendations(filtered.slice(0, 4));
    } catch (e) {
      console.error("Failed to generate recommendations:", e);
      setRecommendations(ALL_ACTIVITIES.slice(0, 4));
    }
  }, []);

  const getLevelLabel = (confidence: number) => {
    if (confidence === 0) return "New Learner";
    if (confidence < 30) return "Beginner";
    if (confidence < 60) return "Intermediate";
    if (confidence < 90) return "Advanced";
    return "Fluent";
  };

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col md:flex-row font-body">
      <Navigation />
      
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full shrink-0">
          <Link href="/profile" className="md:hidden">
            <Avatar className="h-10 w-10 border-2 border-primary/20 bg-[#1A2333] hover:border-primary/50 transition-colors">
              <AvatarFallback className="bg-[#1A2333] text-xl">
                {userAvatar}
              </AvatarFallback>
            </Avatar>
          </Link>
          <span className="text-xl font-bold tracking-tight md:hidden">Langor AI</span>
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
              <Bell className="h-6 w-6" />
            </Button>
            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-primary/20 bg-[#1A2333] hover:border-primary/50 transition-colors">
                <AvatarFallback className="bg-[#1A2333] text-xl">
                  {userAvatar}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl md:hidden">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto pb-24 md:pb-12">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Welcome back, {userName}! {userAvatar}</h1>
              <p className="text-muted-foreground text-sm font-medium">Goal: <span className="text-primary">{userGoal}</span> • Level: <span className="text-primary">{userLevel}</span></p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Confidence Level Card */}
              <Card className="bg-[#1A2333] border-none text-white shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-bold text-sm">Confidence Level</span>
                    </div>
                    <span className="text-2xl font-black text-primary">{stats.confidence}%</span>
                  </div>
                  <Progress value={stats.confidence} className="h-2.5 bg-white/5" />
                  <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                    <span>{getLevelLabel(stats.confidence)}</span>
                    <span className="text-primary">Goal: 100%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Streak & Sessions Card */}
              <Card className="bg-[#1A2333] border-none text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-around h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-orange-500/20 p-3 rounded-2xl relative">
                        <Flame className="h-6 w-6 text-orange-500 fill-current" />
                        {stats.streak > 0 && (
                          <div className="absolute -top-1 -right-1 bg-orange-500 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#1A2333]">
                            !
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black">{stats.streak}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day Streak</p>
                      </div>
                    </div>
                    
                    <div className="w-px h-12 bg-white/5" />

                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/20 p-3 rounded-2xl">
                        <Zap className="h-6 w-6 text-primary fill-current" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black">{stats.sessions}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Start AI Session CTA */}
            <Button asChild className="w-full h-16 rounded-2xl bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white text-lg font-bold gap-3 shadow-lg shadow-blue-500/20 group">
              <Link href="/practice">
                <div className="bg-white/20 p-1.5 rounded-full group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6 fill-current" />
                </div>
                Start Free Conversation
              </Link>
            </Button>

            {/* Daily Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Weekly Activity</h2>
                <Button variant="link" className="text-primary text-xs font-bold p-0">Detailed Insights</Button>
              </div>
              <div className="flex items-end justify-between px-2 h-20 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const isActive = (i === 6) || (stats.streak > 1 && i === 5);
                  return (
                    <div key={`${day}-${i}`} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500",
                          isActive 
                            ? "bg-primary h-12 shadow-[0_0_15px_rgba(29,122,252,0.4)]" 
                            : "bg-white/5 h-6 hover:bg-white/10"
                        )} 
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended for You */}
            <div className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recommended for You</h2>
                <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary tracking-wider">{userGoal} • {userLevel} Focused</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.length > 0 ? recommendations.map((item) => {
                  const img = PlaceHolderImages.find(p => p.id === item.imageId);
                  return (
                    <Link key={item.id} href="/practice" className="block">
                      <Card className="bg-[#1A2333] border-none overflow-hidden hover:ring-2 ring-primary/50 transition-all cursor-pointer shadow-lg group h-full">
                        <div className="relative aspect-video w-full overflow-hidden">
                          {img && (
                            <Image 
                              src={img.imageUrl} 
                              alt={item.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2333] to-transparent opacity-60" />
                        </div>
                        <CardContent className="p-3 space-y-1">
                          <h3 className="font-bold text-sm leading-tight text-white">{item.title}</h3>
                          <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                          <Badge variant="outline" className="text-[8px] h-4 py-0 border-white/10 text-muted-foreground">{item.level}</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                }) : (
                  <div className="col-span-full py-8 text-center bg-[#1A2333] rounded-3xl border border-dashed border-white/10">
                    <p className="text-muted-foreground text-sm italic">Finding perfect matches for your profile...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
