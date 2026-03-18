'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BattleMenu, Matchmaking, BattleRoom, BattleResult } from '@/components/battle';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type BattleStatus = 'menu' | 'matchmaking' | 'battle' | 'result';

interface BattleResultData {
  playerErrors: number;
  opponentErrors: number;
  playerAccuracy: number;
  fluencyScore: number;
  pointsEarned: number;
  winner: 'player' | 'opponent' | 'draw';
}

interface UserBattleStats {
  totalPoints: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalBattles: number;
}

export default function BattlePage() {
  const [battleStatus, setBattleStatus] = useState<BattleStatus>('menu');
  const [errorLimit, setErrorLimit] = useState<number>(10);
  const [battleMode, setBattleMode] = useState<string>('standard');
  const [result, setResult] = useState<BattleResultData | null>(null);
  const [userStats, setUserStats] = useState<UserBattleStats>({
    totalPoints: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    totalBattles: 0
  });
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'pro'>('basic');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if battle is in progress (locked state)
  const isBattleInProgress = battleStatus === 'battle' || battleStatus === 'matchmaking';

  useEffect(() => {
    // Load user's battle stats from localStorage
    const savedStats = localStorage.getItem('BATTLE_STATS');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    // Load subscription plan
    const savedPlan = localStorage.getItem('SUBSCRIPTION_PLAN');
    if (savedPlan === 'pro') {
      setSubscriptionPlan('pro');
    }
    
    setIsLoading(false);
  }, []);

  // Request fullscreen when battle starts
  useEffect(() => {
    if (battleStatus === 'battle' && !isFullscreen) {
      enterFullscreen();
    }

    // Cleanup on unmount
    return () => {
      if (isFullscreen) {
        exitFullscreen();
      }
    };
  }, [battleStatus]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prevent back button during battle
  useEffect(() => {
    if (isBattleInProgress) {
      const preventBack = () => {
        history.pushState(null, '', window.location.href);
      };

      history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', preventBack);

      return () => {
        window.removeEventListener('popstate', preventBack);
      };
    }
  }, [isBattleInProgress]);

  // Prevent page close/refresh during battle
  useEffect(() => {
    if (isBattleInProgress) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isBattleInProgress]);

  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
        setFullscreenError(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      setFullscreenError(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  };

  const handleStartMatchmaking = (limit: number, mode: string) => {
    setErrorLimit(limit);
    setBattleMode(mode);
    setBattleStatus('matchmaking');
  };

  const handleMatchFound = () => {
    setBattleStatus('battle');
  };

  const handleBattleEnd = (battleResult: BattleResultData) => {
    setResult(battleResult);
    setBattleStatus('result');
    
    // Update user stats
    const newStats = {
      totalPoints: userStats.totalPoints + battleResult.pointsEarned,
      totalWins: userStats.totalWins + (battleResult.winner === 'player' ? 1 : 0),
      totalLosses: userStats.totalLosses + (battleResult.winner === 'opponent' ? 1 : 0),
      totalDraws: userStats.totalDraws + (battleResult.winner === 'draw' ? 1 : 0),
      totalBattles: userStats.totalBattles + 1
    };
    
    setUserStats(newStats);
    localStorage.setItem('BATTLE_STATS', JSON.stringify(newStats));
  };

  const handlePlayAgain = () => {
    setResult(null);
    setBattleStatus('menu');
  };

  const handleReturnToMenu = () => {
    exitFullscreen();
    setResult(null);
    setBattleStatus('menu');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hide navigation during battle */}
      {!isBattleInProgress && <Navigation />}

      <main className={cn(
        "min-h-screen",
        !isBattleInProgress && "md:pl-64"
      )}>
        {/* Fullscreen Warning Banner */}
        {isBattleInProgress && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold text-sm uppercase tracking-widest">
              Battle in Progress - Cannot Exit Until Session Ends
            </span>
          </div>
        )}

        {/* Fullscreen Error Notice */}
        {fullscreenError && isBattleInProgress && (
          <div className="fixed top-12 left-0 right-0 z-50 bg-destructive text-white px-4 py-2 text-center text-sm font-bold">
            Fullscreen failed. Please enable fullscreen manually for the best experience.
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium">Loading Battle Mode...</p>
            </div>
          </div>
        ) : subscriptionPlan === 'basic' ? (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl shadow-yellow-500/30">
                  <Crown className="h-10 w-10 text-white fill-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  Unlock Battle Mode
                </h1>
                <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
                  Upgrade to Pro to compete with other players, climb the leaderboard, and prove your language skills!
                </p>
              </div>

              {/* Pro Features */}
              <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-xl font-black text-foreground text-center">
                    Pro Features Include:
                  </h2>
                  <div className="space-y-3">
                    {[
                      'Battle Mode - Compete with players worldwide',
                      'Matchmaking - Find opponents at your skill level',
                      'Voice Battles - Real-time grammar combat',
                      'Custom Error Limits - Choose your difficulty',
                      'Leaderboard & Stats - Track your ranking'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <Zap className="h-4 w-4 text-yellow-500" />
                        </div>
                        <span className="font-medium text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Button */}
              <Button
                asChild
                className="w-full h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-orange-500/30 transition-all hover:scale-[1.02]"
              >
                <Link href="/pricing">
                  <Crown className="h-6 w-6 mr-3" />
                  Upgrade to Pro
                </Link>
              </Button>

              {/* Already Pro */}
              <p className="text-center text-sm text-muted-foreground font-medium">
                Already have Pro? Contact support to activate your subscription.
              </p>
            </div>
          </div>
        ) : (
          <>
            {battleStatus === 'menu' && (
              <BattleMenu onStart={handleStartMatchmaking} />
            )}

            {battleStatus === 'matchmaking' && (
              <Matchmaking onMatchFound={handleMatchFound} />
            )}

            {battleStatus === 'battle' && (
              <BattleRoom
                errorLimit={errorLimit}
                onBattleEnd={handleBattleEnd}
              />
            )}

            {battleStatus === 'result' && result && (
              <BattleResult
                winner={result.winner}
                playerErrors={result.playerErrors}
                opponentErrors={result.opponentErrors}
                playerAccuracy={result.playerAccuracy}
                fluencyScore={result.fluencyScore}
                pointsEarned={result.pointsEarned}
                onPlayAgain={handlePlayAgain}
                onReturnToMenu={handleReturnToMenu}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
