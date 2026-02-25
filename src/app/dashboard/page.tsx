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
  Zap
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';

export default function Dashboard() {
  const [userName, setUserName] = useState('Hanz');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [stats, setStats] = useState({
    streak: 0,
    sessions: 0,
    confidence: 65
  });

  useEffect(() => {
    const savedName = localStorage.getItem('USER_NAME');
    if (savedName) setUserName(savedName);

    const savedAvatar = localStorage.getItem('USER_AVATAR');
    if (savedAvatar) setUserAvatar(savedAvatar);

    // Load progress from localStorage
    const streak = parseInt(localStorage.getItem('STREAK_COUNT') || '0');
    const sessions = parseInt(localStorage.getItem('SESSIONS_COUNT') || '0');
    
    // Simple confidence logic: base + 2% per session, capped at 98%
    const calculatedConfidence = Math.min(65 + (sessions * 2), 98);

    setStats({
      streak,
      sessions,
      confidence: calculatedConfidence
    });
  }, []);

  const recommendations = [
    {
      id: 'job-interview',
      title: 'Job Interview Prep',
      meta: '15 mins • 40 points',
      image: PlaceHolderImages.find(img => img.id === 'job-interview')?.imageUrl
    },
    {
      id: 'grammar-books',
      title: 'Grammar Refinement',
      meta: '10 mins • 25 points',
      image: PlaceHolderImages.find(img => img.id === 'grammar-books')?.imageUrl
    },
    {
      id: 'small-talk',
      title: 'Small Talk Mastery',
      meta: '20 mins • 50 points',
      image: PlaceHolderImages.find(img => img.id === 'small-talk')?.imageUrl
    },
    {
      id: 'presentation',
      title: 'Executive Pitch',
      meta: '12 mins • 35 points',
      image: PlaceHolderImages.find(img => img.id === 'presentation')?.imageUrl
    },
  ];

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
              <p className="text-muted-foreground text-sm font-medium">Ready to boost your speaking confidence?</p>
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
                    <span>Advanced Intermediate</span>
                    <span className="text-primary">Goal: 95%</span>
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
                Start AI Session
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
              <h2 className="text-xl font-bold">Recommended for You</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((item) => (
                  <Link key={item.id} href="/practice" className="block">
                    <Card className="bg-[#1A2333] border-none overflow-hidden hover:ring-2 ring-primary/50 transition-all cursor-pointer shadow-lg group">
                      <div className="relative aspect-video w-full overflow-hidden">
                        {item.image && (
                          <Image 
                            src={item.image} 
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
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
