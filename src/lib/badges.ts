export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: BadgeTier;
  unlocked: boolean;
}

interface BadgeInputs {
  totalBattles: number;
  totalWins: number;
  streak: number;
  totalPoints: number;
  battleHistory: Array<{
    outcome: 'win' | 'loss' | 'draw';
    errorCount: number;
    accuracy: number;
    errorLimit: number;
  }>;
}

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze:   'from-orange-700 to-orange-500',
  silver:   'from-slate-400 to-slate-300',
  gold:     'from-yellow-500 to-amber-400',
  platinum: 'from-violet-500 to-purple-400',
};

const BADGE_DEFS: Array<{
  id: string; name: string; description: string; emoji: string; tier: BadgeTier;
  check: (d: BadgeInputs) => boolean;
}> = [
  {
    id:          'first-step',
    name:        'First Step',
    description: 'Complete your first battle',
    emoji:       '🎯',
    tier:        'bronze',
    check:       d => d.totalBattles >= 1,
  },
  {
    id:          'first-victory',
    name:        'First Victory',
    description: 'Win your first battle',
    emoji:       '⚔️',
    tier:        'bronze',
    check:       d => d.totalWins >= 1,
  },
  {
    id:          'on-fire',
    name:        'On Fire',
    description: 'Win 3 battles in a row',
    emoji:       '🔥',
    tier:        'silver',
    check:       d => d.streak >= 3,
  },
  {
    id:          'unstoppable',
    name:        'Unstoppable',
    description: 'Win 5 battles in a row',
    emoji:       '🌪️',
    tier:        'gold',
    check:       d => d.streak >= 5,
  },
  {
    id:          'warrior',
    name:        'Warrior',
    description: 'Win 10 battles total',
    emoji:       '🏆',
    tier:        'silver',
    check:       d => d.totalWins >= 10,
  },
  {
    id:          'champion',
    name:        'Champion',
    description: 'Win 25 battles total',
    emoji:       '👑',
    tier:        'gold',
    check:       d => d.totalWins >= 25,
  },
  {
    id:          'legend',
    name:        'Legend',
    description: 'Win 50 battles total',
    emoji:       '💎',
    tier:        'platinum',
    check:       d => d.totalWins >= 50,
  },
  {
    id:          'veteran',
    name:        'Battle Veteran',
    description: 'Complete 10 battles',
    emoji:       '🎖️',
    tier:        'silver',
    check:       d => d.totalBattles >= 10,
  },
  {
    id:          'perfectionist',
    name:        'Perfectionist',
    description: 'Win a battle with zero errors',
    emoji:       '✨',
    tier:        'gold',
    check:       d => d.battleHistory.some(b => b.outcome === 'win' && b.errorCount === 0),
  },
  {
    id:          'sharpshooter',
    name:        'Sharpshooter',
    description: 'Finish a battle with 95%+ accuracy',
    emoji:       '🎯',
    tier:        'silver',
    check:       d => d.battleHistory.some(b => b.accuracy >= 95),
  },
  {
    id:          'hard-mode',
    name:        'Hard Mode',
    description: 'Win a Hard Mode battle (5 error limit)',
    emoji:       '⚡',
    tier:        'gold',
    check:       d => d.battleHistory.some(b => b.outcome === 'win' && b.errorLimit === 5),
  },
  {
    id:          'point-hunter',
    name:        'Point Hunter',
    description: 'Accumulate 200 battle points',
    emoji:       '⭐',
    tier:        'silver',
    check:       d => d.totalPoints >= 200,
  },
  {
    id:          'elite',
    name:        'Elite',
    description: 'Accumulate 500 battle points',
    emoji:       '💫',
    tier:        'gold',
    check:       d => d.totalPoints >= 500,
  },
];

export function computeBadges(inputs: BadgeInputs): Badge[] {
  return BADGE_DEFS.map(def => ({
    id:          def.id,
    name:        def.name,
    description: def.description,
    emoji:       def.emoji,
    tier:        def.tier,
    unlocked:    def.check(inputs),
  }));
}

export { TIER_COLORS };
