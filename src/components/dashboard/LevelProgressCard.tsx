'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Trophy, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressionResult } from '@/lib/recommendations';
import Link from 'next/link';

interface LevelProgressCardProps {
  currentLevel: string;
  learningGoal: string;
  result: ProgressionResult;
}

export function LevelProgressCard({ currentLevel, learningGoal, result }: LevelProgressCardProps) {
  const barColor =
    result.progressPercent >= 80 ? 'bg-emerald-500' :
    result.progressPercent >= 50 ? 'bg-primary' : 'bg-yellow-500';

  return (
    <Card className="bg-card border-none shadow-xl">
      <CardContent className="p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/20 p-2 rounded-xl">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Battle Progress</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{learningGoal}</p>
            </div>
          </div>
          <div className={cn(
            'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border',
            result.shouldLevelUp
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-primary/10 text-primary border-primary/20'
          )}>
            {currentLevel}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>
              {result.shouldLevelUp
                ? `Advance to ${result.suggestedLevel}`
                : result.suggestedLevel !== currentLevel
                ? `Toward ${result.suggestedLevel}`
                : 'Max Level'}
            </span>
            <span className="text-primary">{result.progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', barColor)}
              style={{ width: `${result.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Battles', value: result.totalBattles },
            { label: 'Win Rate', value: `${Math.round(result.winRate * 100)}%` },
            { label: 'Avg Errors', value: result.avgErrors.toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/50 rounded-xl p-2.5 text-center">
              <p className="text-sm font-black text-foreground">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className={cn(
          'flex items-start gap-2 p-3 rounded-xl text-xs font-medium leading-relaxed',
          result.shouldLevelUp
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-muted/50 text-muted-foreground'
        )}>
          {result.shouldLevelUp
            ? <Trophy className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            : <Target className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
          <span>{result.message}</span>
        </div>

        {/* CTA */}
        <Link
          href="/battle"
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group"
        >
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            {result.shouldLevelUp ? 'Claim Your Rank' : 'Keep Battling'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
        </Link>

      </CardContent>
    </Card>
  );
}
