'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Mic, 
  Home, 
  MessageSquare, 
  BarChart3, 
  Settings as SettingsIcon,
  TrendingUp,
  User
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function Dashboard() {
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
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Avatar className="h-10 w-10 border-2 border-primary/20 bg-[#1A2333]">
          <AvatarFallback className="bg-[#1A2333]">
            <User className="h-5 w-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <span className="text-xl font-bold tracking-tight">Langor AI</span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
          <Bell className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 overflow-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Welcome back, Hanz!</h1>
            <p className="text-muted-foreground text-sm">Ready to boost your speaking confidence?</p>
          </div>

          {/* Confidence Level Card */}
          <Card className="bg-[#1A2333] border-none text-white shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold">Confidence Level</span>
                </div>
                <span className="text-2xl font-bold text-primary">75%</span>
              </div>
              <Progress value={75} className="h-2.5 bg-white/5" />
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                <span>Advanced Intermediate</span>
                <span className="text-primary">+5% this week</span>
              </div>
            </CardContent>
          </Card>

          {/* Start AI Session CTA */}
          <Button asChild className="w-full h-16 rounded-2xl bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white text-lg font-bold gap-3 shadow-lg shadow-blue-500/20">
            <Link href="/practice">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Mic className="h-6 w-6 fill-current" />
              </div>
              Start AI Session
            </Link>
          </Button>

          {/* Daily Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Daily Progress</h2>
              <Button variant="link" className="text-primary text-xs font-bold p-0">Weekly View</Button>
            </div>
            <div className="flex items-end justify-between px-2 h-20 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className={cn(
                      "w-full rounded-t-sm transition-all",
                      i < 5 ? "bg-primary/40 h-8" : "bg-primary h-12 shadow-[0_0_15px_rgba(29,122,252,0.3)]",
                      i === 4 && "h-10"
                    )} 
                  />
                  <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          <div className="space-y-4 pb-4">
            <h2 className="text-xl font-bold">Recommended for You</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B121F]/80 backdrop-blur-lg border-t border-white/5 px-6 py-3 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 transition-colors text-primary font-bold">
            <Home className="h-6 w-6" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link href="/practice" className="flex flex-col items-center gap-1 transition-colors text-muted-foreground hover:text-white">
            <MessageSquare className="h-6 w-6" />
            <span className="text-[10px]">Practice</span>
          </Link>
          <button className="flex flex-col items-center gap-1 transition-colors text-muted-foreground hover:text-white">
            <TrendingUp className="h-6 w-6" />
            <span className="text-[10px]">Insights</span>
          </button>
          <Link href="/settings" className="flex flex-col items-center gap-1 transition-colors text-muted-foreground hover:text-white">
            <SettingsIcon className="h-6 w-6" />
            <span className="text-[10px]">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
