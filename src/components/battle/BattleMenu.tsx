import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trophy, Target, Zap, Flame, TrendingUp, Swords, CheckCircle, XCircle, MinusCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Badge as EarnedBadge } from '@/lib/badges';
import { TIER_COLORS } from '@/lib/badges';

interface BattleMode {
  value: 'easy' | 'standard' | 'hard';
  label: string;
  errors: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const BATTLE_MODES: BattleMode[] = [
  {
    value: 'easy',
    label: 'Easy',
    errors: 20,
    description: 'Perfect for practice',
    icon: <Trophy className="h-5 w-5" />,
    color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30',
  },
  {
    value: 'standard',
    label: 'Standard',
    errors: 10,
    description: 'Balanced challenge',
    icon: <Target className="h-5 w-5" />,
    color: 'text-blue-500 bg-blue-500/20 border-blue-500/30',
  },
  {
    value: 'hard',
    label: 'Hard',
    errors: 5,
    description: 'Expert only',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-500 bg-orange-500/20 border-orange-500/30',
  },
];

export interface BattleHistoryItem {
  id: string;
  outcome: 'win' | 'loss' | 'draw';
  opponentName: string;
  errorCount: number;
  accuracy: number;
  errorLimit: number;
  createdAt: string;
}

export interface BattleStats {
  wins: number;
  losses: number;
  streak: number;
  points: number;
  winRate: number;
}

interface BattleMenuProps {
  onStart: (errorLimit: number, mode: string) => void;
  stats?: BattleStats;
  battleHistory?: BattleHistoryItem[];
  recommendedMode?: 'easy' | 'standard' | 'hard';
  badges?: EarnedBadge[];
}

export function BattleMenu({ onStart, stats, battleHistory, recommendedMode, badges }: BattleMenuProps) {
  const [selectedMode, setSelectedMode] = useState<string>(recommendedMode ?? 'standard');

  const handleStart = () => {
    const mode = BATTLE_MODES.find(m => m.value === selectedMode);
    if (mode) onStart(mode.errors, selectedMode);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6 pb-32">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/30">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Battle Mode</h1>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            Compete live and see who makes fewer grammar mistakes.
          </p>
        </div>

        {/* ── KPI row ──────────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            <StatCard
              label="Streak"
              value={`${stats.streak}🔥`}
              color="text-orange-500 bg-orange-500/10"
              icon={<Flame className="h-3.5 w-3.5" />}
            />
            <StatCard
              label="Wins"
              value={stats.wins}
              color="text-emerald-500 bg-emerald-500/10"
              icon={<CheckCircle className="h-3.5 w-3.5" />}
            />
            <StatCard
              label="Losses"
              value={stats.losses}
              color="text-destructive bg-destructive/10"
              icon={<XCircle className="h-3.5 w-3.5" />}
            />
            <StatCard
              label="Win Rate"
              value={`${stats.winRate}%`}
              color="text-primary bg-primary/10"
              icon={<TrendingUp className="h-3.5 w-3.5" />}
            />
          </div>
        )}

        {/* ── Mode Selection ───────────────────────────────────────────────── */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-5 space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Select Battle Mode
            </Label>
            <RadioGroup value={selectedMode} onValueChange={setSelectedMode} className="space-y-2">
              {BATTLE_MODES.map((mode) => (
                <div key={mode.value} className="relative">
                  <RadioGroupItem value={mode.value} id={mode.value} className="peer sr-only" />
                  <Label
                    htmlFor={mode.value}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                      'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10',
                      'hover:bg-accent hover:border-accent-foreground/30',
                      mode.color,
                    )}
                  >
                    <div className={cn('p-2 rounded-xl', mode.color)}>{mode.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-foreground">{mode.label}</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          ({mode.errors} Errors)
                        </span>
                        {recommendedMode === mode.value && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                            For You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{mode.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* ── Start Button ─────────────────────────────────────────────────── */}
        <Button
          size="lg"
          onClick={handleStart}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/25 transition-all hover:scale-[1.02]"
        >
          <Zap className="h-5 w-5 mr-2 fill-current" />
          Find Opponent
        </Button>

        {/* ── Badges ───────────────────────────────────────────────────────── */}
        {badges && badges.length > 0 && (
          <Card className="bg-card border-none shadow-xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Battle Badges
                  </p>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground">
                  {badges.filter(b => b.unlocked).length} / {badges.length} earned
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {badges.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Battle History ───────────────────────────────────────────────── */}
        {battleHistory && battleHistory.length > 0 && (
          <Card className="bg-card border-none shadow-xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Recent Battles
                </p>
              </div>
              <div className="space-y-2">
                {battleHistory.map((b) => (
                  <HistoryRow key={b.id} battle={b} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {battleHistory && battleHistory.length === 0 && (
          <Card className="bg-card border-none shadow-xl">
            <CardContent className="p-5 text-center">
              <Swords className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No battles yet — find an opponent!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-card border-none shadow-lg">
      <CardContent className="p-3 flex flex-col items-center gap-1 text-center">
        <div className={cn('p-1.5 rounded-lg', color)}>{icon}</div>
        <p className="text-base font-black text-foreground leading-none">{value}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function HistoryRow({ battle }: { battle: BattleHistoryItem }) {
  const outcomeConfig = {
    win:  { label: 'WIN',  icon: <CheckCircle className="h-3.5 w-3.5" />,  color: 'text-emerald-500 bg-emerald-500/10' },
    loss: { label: 'LOSS', icon: <XCircle className="h-3.5 w-3.5" />,      color: 'text-destructive bg-destructive/10'  },
    draw: { label: 'DRAW', icon: <MinusCircle className="h-3.5 w-3.5" />,  color: 'text-yellow-500 bg-yellow-500/10'    },
  }[battle.outcome];

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black', outcomeConfig.color)}>
          {outcomeConfig.icon}
          {outcomeConfig.label}
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">vs {battle.opponentName}</p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(battle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' · '}
            {battle.errorLimit}-error limit
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
          {battle.errorCount} err · {battle.accuracy}%
        </Badge>
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: EarnedBadge }) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all duration-300',
        badge.unlocked
          ? 'bg-card border-border shadow-md'
          : 'bg-muted/30 border-border/30 opacity-40 grayscale'
      )}
      title={badge.description}
    >
      {/* Tier gradient ring for unlocked badges */}
      {badge.unlocked && (
        <div className={cn(
          'absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-br pointer-events-none',
          TIER_COLORS[badge.tier]
        )} />
      )}

      {/* Emoji */}
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center text-xl relative z-10',
        badge.unlocked ? 'bg-gradient-to-br ' + TIER_COLORS[badge.tier] + ' shadow-sm' : 'bg-muted'
      )}>
        {badge.unlocked ? badge.emoji : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>

      {/* Name */}
      <p className={cn(
        'text-[8px] font-black uppercase tracking-widest text-center leading-tight relative z-10',
        badge.unlocked ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {badge.name}
      </p>

      {/* Tier dot */}
      {badge.unlocked && (
        <div className={cn(
          'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br',
          TIER_COLORS[badge.tier]
        )} />
      )}
    </div>
  );
}
