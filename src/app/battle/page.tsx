'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BattleMenu, Matchmaking, BattleRoom, BattleResult } from '@/components/battle';
import { Navigation } from '@/components/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

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
  const [roomId, setRoomId] = useState<string | null>(null);
  const [result, setResult] = useState<BattleResultData | null>(null);
  const [userStats, setUserStats] = useState<UserBattleStats>({
    totalPoints: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    totalBattles: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isBattleInProgress = battleStatus === 'battle' || battleStatus === 'matchmaking';

  const loadStats = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wins, losses, draws, points')
        .eq('id', user.id)
        .single();
      if (profile) {
        const wins = profile.wins ?? 0;
        const losses = profile.losses ?? 0;
        const draws = profile.draws ?? 0;
        setUserStats({
          totalPoints: profile.points ?? 0,
          totalWins: wins,
          totalLosses: losses,
          totalDraws: draws,
          totalBattles: wins + losses + draws,
        });
      }
    }
  }, []);

  useEffect(() => {
    loadStats().finally(() => setIsLoading(false));
  }, [loadStats]);

  // Fullscreen during battle
  useEffect(() => {
    if (battleStatus === 'battle' && !isFullscreen) {
      enterFullscreen();
    }
    return () => {
      if (isFullscreen) exitFullscreen();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleStatus]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prevent back button during battle
  useEffect(() => {
    if (!isBattleInProgress) return;
    const preventBack = () => history.pushState(null, '', window.location.href);
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);
    return () => window.removeEventListener('popstate', preventBack);
  }, [isBattleInProgress]);

  // Prevent page close during battle
  useEffect(() => {
    if (!isBattleInProgress) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBattleInProgress]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
  };

  const handleStartMatchmaking = (limit: number, mode: string) => {
    setErrorLimit(limit);
    setBattleMode(mode);
    setBattleStatus('matchmaking');
  };

  const handleMatchFound = (id: string) => {
    setRoomId(id);
    setBattleStatus('battle');
  };

  const handleCancelMatchmaking = () => {
    setBattleStatus('menu');
  };

  const handleBattleEnd = async (battleResult: BattleResultData) => {
    setResult(battleResult);
    setBattleStatus('result');
    // Refresh stats from Supabase — API already updated them
    await loadStats();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading Battle Mode…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isBattleInProgress && <Navigation />}

      <main className={cn('min-h-screen', !isBattleInProgress && 'md:pl-64')}>
        {isBattleInProgress && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold text-sm uppercase tracking-widest">
              Battle in Progress — Cannot Exit Until Session Ends
            </span>
          </div>
        )}

        {fullscreenError && isBattleInProgress && (
          <div className="fixed top-12 left-0 right-0 z-50 bg-destructive text-white px-4 py-2 text-center text-sm font-bold">
            Fullscreen blocked. Please allow fullscreen for the best experience.
          </div>
        )}

        {battleStatus === 'menu' && (
          <BattleMenu onStart={handleStartMatchmaking} />
        )}

        {battleStatus === 'matchmaking' && (
          <Matchmaking
            errorLimit={errorLimit}
            onMatchFound={handleMatchFound}
            onCancel={handleCancelMatchmaking}
          />
        )}

        {battleStatus === 'battle' && roomId && (
          <BattleRoom
            roomId={roomId}
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
      </main>
    </div>
  );
}
