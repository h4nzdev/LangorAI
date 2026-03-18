import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, TrendingUp, Zap, RotateCcw, Home, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleResultProps {
  winner: 'player' | 'opponent' | 'draw';
  playerErrors: number;
  opponentErrors: number;
  playerAccuracy: number;
  fluencyScore: number;
  pointsEarned: number;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export function BattleResult({
  winner,
  playerErrors,
  opponentErrors,
  playerAccuracy,
  fluencyScore,
  pointsEarned,
  onPlayAgain,
  onReturnToMenu
}: BattleResultProps) {
  const isWin = winner === 'player';
  const isDraw = winner === 'draw';

  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      {/* Session Lock Indicator - Still locked until action taken */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <Lock className="h-5 w-5 fill-white" />
          <span className="font-bold text-sm uppercase tracking-widest">
            Session Locked
          </span>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-6 pt-20 pb-32">
        <div className="w-full max-w-lg space-y-6">
        {/* Result Header */}
        <div className="text-center space-y-4">
          <div className={cn(
            "inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-2xl transition-all",
            isWin 
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/30 animate" 
              : isDraw
                ? "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/30"
                : "bg-gradient-to-br from-red-400 to-red-500 shadow-red-500/30"
          )}>
            {isWin ? (
              <Trophy className="h-12 w-12 text-white fill-white" />
            ) : isDraw ? (
              <Award className="h-12 w-12 text-white" />
            ) : (
              <Trophy className="h-12 w-12 text-white opacity-50" />
            )}
          </div>
          
          <h1 className={cn(
            "text-4xl md:text-5xl font-black tracking-tight",
            isWin ? "text-yellow-500" : isDraw ? "text-foreground" : "text-destructive"
          )}>
            {isWin ? "🏆 You Win!" : isDraw ? "🤝 It's a Draw!" : "❌ You Lost"}
          </h1>
          
          {!isWin && (
            <p className="text-muted-foreground font-medium">
              {isDraw 
                ? "Great match! Both players performed equally." 
                : "Don't give up! Practice makes perfect."}
            </p>
          )}
        </div>

        {/* Match Statistics */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Match Statistics
              </h2>
              
              {/* Error Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={cn(
                  "p-4 rounded-2xl text-center",
                  isWin ? "bg-primary/10 border-2 border-primary" : "bg-muted"
                )}>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Your Errors
                  </p>
                  <p className={cn(
                    "text-3xl font-black",
                    isWin ? "text-primary" : "text-foreground"
                  )}>
                    {playerErrors}
                  </p>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-center",
                  !isWin && !isDraw ? "bg-primary/10 border-2 border-primary" : "bg-muted"
                )}>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    Opponent Errors
                  </p>
                  <p className={cn(
                    "text-3xl font-black",
                    !isWin && !isDraw ? "text-primary" : "text-foreground"
                  )}>
                    {opponentErrors}
                  </p>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-muted text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                    <Award className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Accuracy
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {playerAccuracy}%
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-muted text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Fluency
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {fluencyScore}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-muted text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Points
                  </p>
                  <p className="text-lg font-black text-emerald-500">
                    +{pointsEarned}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onPlayAgain}
            className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Play Again
          </Button>
          
          <Button
            onClick={onReturnToMenu}
            variant="outline"
            className="h-14 border-border bg-card hover:bg-muted text-foreground rounded-2xl text-base font-black uppercase tracking-widest"
          >
            <Home className="h-5 w-5 mr-2" />
            Menu
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
