// Recommendation algorithm — maps user profile (level + goal) to battle settings,
// debate topic weights, and level-advancement suggestions.

export type ProficiencyLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Fluent';
export type LearningGoal = 'Career Growth' | 'Travel' | 'Self-Improvement' | 'Exam Prep' | 'Socializing';
export type BattleMode = 'easy' | 'standard' | 'hard';

// ── Battle mode recommendation ────────────────────────────────────────────────

export interface ModeRecommendation {
  mode: BattleMode;
  errors: number;
  label: string;
}

export function recommendedBattleMode(proficiencyLevel: string): ModeRecommendation {
  switch (proficiencyLevel) {
    case 'Beginner':
    case 'Elementary':
      return { mode: 'easy', errors: 20, label: 'Easy' };
    case 'Advanced':
    case 'Fluent':
      return { mode: 'hard', errors: 5, label: 'Hard' };
    default:
      return { mode: 'standard', errors: 10, label: 'Standard' };
  }
}

// ── Career-weighted debate topic selection ────────────────────────────────────

const GOAL_KEYWORDS: Record<string, string[]> = {
  'Career Growth':    ['work', 'office', 'remote', 'university', 'job'],
  'Exam Prep':        ['language', 'school', 'mandatory', 'climate', 'university', 'priority'],
  'Self-Improvement': ['social media', 'technology', 'creative', 'video games', 'space'],
  'Socializing':      ['celebrities', 'esports', 'sports', 'fast food', 'influence'],
  'Travel':           ['car', 'city', 'social skills', 'space exploration', 'money'],
};

/**
 * Pick a debate topic weighted by the user's learning goal.
 * The same roomId always returns the same topic (deterministic), but preferred
 * topics for the user's goal appear 3× more often in the pool.
 */
export function pickTopicForGoal(roomId: string, learningGoal: string, topics: string[]): string {
  const keywords = GOAL_KEYWORDS[learningGoal] ?? [];
  const hash = roomId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  if (!keywords.length) return topics[hash % topics.length];

  const preferred = topics.filter(t => keywords.some(k => t.toLowerCase().includes(k)));
  const others    = topics.filter(t => !keywords.some(k => t.toLowerCase().includes(k)));

  // 3:1 weighting — preferred topics are 3× more likely
  const pool = [...preferred, ...preferred, ...preferred, ...others];
  return pool[hash % pool.length];
}

// ── Level progression algorithm ───────────────────────────────────────────────

const LEVEL_ORDER: ProficiencyLevel[] = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Fluent'];

interface Threshold { minWinRate: number; maxAvgErrors: number }

const ADVANCE_THRESHOLDS: Record<string, Threshold> = {
  Beginner:     { minWinRate: 0.45, maxAvgErrors: 15 },
  Elementary:   { minWinRate: 0.50, maxAvgErrors: 11 },
  Intermediate: { minWinRate: 0.58, maxAvgErrors: 7  },
  Advanced:     { minWinRate: 0.65, maxAvgErrors: 3  },
  Fluent:       { minWinRate: 1.0,  maxAvgErrors: 0  },
};

export interface ProgressionResult {
  progressPercent: number;
  shouldLevelUp: boolean;
  suggestedLevel: string;
  message: string;
  winRate: number;
  avgErrors: number;
  totalBattles: number;
}

/**
 * Returns how close the user is to advancing.
 * recentErrors = error_count from their last 5–10 completed battles.
 */
export function calculateProgression(
  currentLevel: string,
  wins: number,
  losses: number,
  recentErrors: number[],
): ProgressionResult {
  const totalBattles = wins + losses;
  const winRate = totalBattles > 0 ? wins / totalBattles : 0;
  const avgErrors = recentErrors.length > 0
    ? recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length
    : 10;

  const currentIdx  = LEVEL_ORDER.indexOf(currentLevel as ProficiencyLevel);
  const isMaxLevel  = currentIdx >= LEVEL_ORDER.length - 1 || currentIdx === -1;

  if (totalBattles < 3) {
    const need = 3 - totalBattles;
    return {
      progressPercent: Math.round((totalBattles / 3) * 25),
      shouldLevelUp: false,
      suggestedLevel: currentLevel,
      message: `Play ${need} more battle${need !== 1 ? 's' : ''} to unlock level insights`,
      winRate, avgErrors, totalBattles,
    };
  }

  if (isMaxLevel) {
    return {
      progressPercent: 100,
      shouldLevelUp: false,
      suggestedLevel: currentLevel,
      message: 'Maximum level — keep your streak alive! 🏆',
      winRate, avgErrors, totalBattles,
    };
  }

  const threshold = ADVANCE_THRESHOLDS[currentLevel] ?? ADVANCE_THRESHOLDS.Intermediate;
  const nextLevel  = LEVEL_ORDER[currentIdx + 1];

  const winProgress   = Math.min(1, winRate / threshold.minWinRate);
  const errorProgress = Math.min(1, Math.max(0, 1 - avgErrors / (threshold.maxAvgErrors * 2)));
  const progressPercent = Math.round(((winProgress + errorProgress) / 2) * 100);

  const meetsWinRate = winRate >= threshold.minWinRate;
  const meetsErrors  = avgErrors <= threshold.maxAvgErrors;
  const shouldLevelUp = meetsWinRate && meetsErrors;

  let message: string;
  if (shouldLevelUp) {
    message = `Ready to advance to ${nextLevel}! 🎉`;
  } else if (!meetsWinRate && !meetsErrors) {
    message = `Win ${Math.round(threshold.minWinRate * 100)}%+ of battles & keep errors ≤ ${threshold.maxAvgErrors}`;
  } else if (!meetsWinRate) {
    message = `Win ${Math.round(threshold.minWinRate * 100)}%+ of battles to reach ${nextLevel}`;
  } else {
    message = `Keep errors ≤ ${threshold.maxAvgErrors} per battle to reach ${nextLevel}`;
  }

  return { progressPercent, shouldLevelUp, suggestedLevel: shouldLevelUp ? nextLevel : currentLevel, message, winRate, avgErrors, totalBattles };
}
