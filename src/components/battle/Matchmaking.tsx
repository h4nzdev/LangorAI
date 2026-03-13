import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wifi, Users, Clock } from 'lucide-react';

interface MatchmakingProps {
  onMatchFound: () => void;
}

export function Matchmaking({ onMatchFound }: MatchmakingProps) {
  const [searchTime, setSearchTime] = useState(0);
  const [status, setStatus] = useState('Searching for an opponent...');

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    // Simulate finding a match after 3 seconds
    const matchTimer = setTimeout(() => {
      setStatus('Match found!');
      setTimeout(onMatchFound, 500);
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [onMatchFound]);

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-8 rounded-3xl shadow-2xl shadow-primary/30">
              <Loader2 className="h-16 w-16 text-primary-foreground animate-spin" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {status}
          </h1>
          <p className="text-muted-foreground font-medium">
            Finding a player with similar skill level...
          </p>
        </div>

        {/* Search Stats */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                  <Wifi className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                  <p className="text-sm font-black text-foreground">Online</p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Players</p>
                  <p className="text-sm font-black text-foreground">1,247</p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20">
                  <Clock className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</p>
                  <p className="text-sm font-black text-foreground">{formatTime(searchTime)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-muted-foreground uppercase tracking-widest">Finding Match</span>
            <span className="font-black text-primary">{Math.min(searchTime * 30, 100)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(searchTime * 30, 100)}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">
            💡 Tip: Warm up your voice while waiting!
          </p>
        </div>
      </div>
    </div>
  );
}
