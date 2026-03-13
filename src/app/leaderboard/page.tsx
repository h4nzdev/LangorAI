'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
  accuracy: number;
  trend: 'up' | 'down' | 'same';
  trendValue: number;
}

const MOCK_LEADERBOARD_WEEKLY: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Chen', avatar: '🦁', points: 2450, wins: 45, losses: 12, winRate: 79, accuracy: 94, trend: 'up', trendValue: 3 },
  { rank: 2, name: 'Sarah Miller', avatar: '🐯', points: 2380, wins: 42, losses: 15, winRate: 74, accuracy: 92, trend: 'up', trendValue: 1 },
  { rank: 3, name: 'Jordan Kim', avatar: '🦅', points: 2210, wins: 38, losses: 18, winRate: 68, accuracy: 89, trend: 'down', trendValue: 2 },
  { rank: 4, name: 'Emma Wilson', avatar: '🐺', points: 2150, wins: 36, losses: 20, winRate: 64, accuracy: 87, trend: 'same', trendValue: 0 },
  { rank: 5, name: 'Michael Brown', avatar: '🦊', points: 2080, wins: 34, losses: 22, winRate: 61, accuracy: 85, trend: 'up', trendValue: 5 },
  { rank: 6, name: 'Lisa Garcia', avatar: '🐱', points: 1950, wins: 30, losses: 25, winRate: 55, accuracy: 82, trend: 'down', trendValue: 1 },
  { rank: 7, name: 'David Lee', avatar: '🐶', points: 1890, wins: 28, losses: 27, winRate: 51, accuracy: 80, trend: 'up', trendValue: 2 },
  { rank: 8, name: 'Anna Martinez', avatar: '🐰', points: 1820, wins: 26, losses: 29, winRate: 47, accuracy: 78, trend: 'same', trendValue: 0 },
  { rank: 9, name: 'James Taylor', avatar: '🦉', points: 1750, wins: 24, losses: 31, winRate: 44, accuracy: 75, trend: 'down', trendValue: 3 },
  { rank: 10, name: 'Sophie Anderson', avatar: '🐼', points: 1680, wins: 22, losses: 33, winRate: 40, accuracy: 73, trend: 'up', trendValue: 1 },
];

const MOCK_LEADERBOARD_MONTHLY: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah Miller', avatar: '🐯', points: 8920, wins: 156, losses: 48, winRate: 76, accuracy: 93, trend: 'up', trendValue: 2 },
  { rank: 2, name: 'Alex Chen', avatar: '🦁', points: 8750, wins: 150, losses: 52, winRate: 74, accuracy: 91, trend: 'down', trendValue: 1 },
  { rank: 3, name: 'Emma Wilson', avatar: '🐺', points: 8210, wins: 142, losses: 58, winRate: 71, accuracy: 88, trend: 'up', trendValue: 4 },
  { rank: 4, name: 'Jordan Kim', avatar: '🦅', points: 7980, wins: 135, losses: 62, winRate: 69, accuracy: 86, trend: 'same', trendValue: 0 },
  { rank: 5, name: 'Michael Brown', avatar: '🦊', points: 7650, wins: 128, losses: 68, winRate: 65, accuracy: 84, trend: 'up', trendValue: 3 },
  { rank: 6, name: 'Lisa Garcia', avatar: '🐱', points: 7320, wins: 120, losses: 75, winRate: 62, accuracy: 81, trend: 'down', trendValue: 2 },
  { rank: 7, name: 'David Lee', avatar: '🐶', points: 6980, wins: 112, losses: 82, winRate: 58, accuracy: 79, trend: 'up', trendValue: 1 },
  { rank: 8, name: 'Anna Martinez', avatar: '🐰', points: 6650, wins: 105, losses: 88, winRate: 54, accuracy: 76, trend: 'same', trendValue: 0 },
  { rank: 9, name: 'James Taylor', avatar: '🦉', points: 6320, wins: 98, losses: 95, winRate: 51, accuracy: 74, trend: 'down', trendValue: 4 },
  { rank: 10, name: 'Sophie Anderson', avatar: '🐼', points: 5980, wins: 92, losses: 100, winRate: 48, accuracy: 71, trend: 'up', trendValue: 2 },
];

const MOCK_LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Chen', avatar: '🦁', points: 45280, wins: 892, losses: 245, winRate: 78, accuracy: 95, trend: 'same', trendValue: 0 },
  { rank: 2, name: 'Sarah Miller', avatar: '🐯', points: 43150, wins: 856, losses: 268, winRate: 76, accuracy: 93, trend: 'up', trendValue: 1 },
  { rank: 3, name: 'Emma Wilson', avatar: '🐺', points: 39820, wins: 784, losses: 312, winRate: 72, accuracy: 90, trend: 'up', trendValue: 2 },
  { rank: 4, name: 'Jordan Kim', avatar: '🦅', points: 37560, wins: 742, losses: 348, winRate: 68, accuracy: 88, trend: 'down', trendValue: 1 },
  { rank: 5, name: 'Michael Brown', avatar: '🦊', points: 35240, wins: 698, losses: 385, winRate: 64, accuracy: 85, trend: 'up', trendValue: 3 },
  { rank: 6, name: 'Lisa Garcia', avatar: '🐱', points: 32180, wins: 642, losses: 428, winRate: 60, accuracy: 82, trend: 'same', trendValue: 0 },
  { rank: 7, name: 'David Lee', avatar: '🐶', points: 29650, wins: 595, losses: 468, winRate: 56, accuracy: 79, trend: 'down', trendValue: 2 },
  { rank: 8, name: 'Anna Martinez', avatar: '🐰', points: 27320, wins: 548, losses: 512, winRate: 52, accuracy: 76, trend: 'up', trendValue: 1 },
  { rank: 9, name: 'James Taylor', avatar: '🦉', points: 24890, wins: 502, losses: 558, winRate: 47, accuracy: 73, trend: 'down', trendValue: 3 },
  { rank: 10, name: 'Sophie Anderson', avatar: '🐼', points: 22450, wins: 456, losses: 598, winRate: 43, accuracy: 70, trend: 'same', trendValue: 0 },
];

export default function LeaderboardPage() {
  const [currentTab, setCurrentTab] = useState('weekly');
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    // Load user's battle stats from localStorage
    const savedStats = localStorage.getItem('BATTLE_STATS');
    const stats = savedStats ? JSON.parse(savedStats) : null;
    
    // Calculate user's rank based on points (mock calculation)
    const allPoints = [
      ...MOCK_LEADERBOARD_WEEKLY.map(e => e.points),
      stats ? stats.totalPoints : 0
    ].sort((a, b) => b - a);
    
    const userPoints = stats ? stats.totalPoints : 0;
    const rank = allPoints.findIndex(p => p <= userPoints) + 1 || allPoints.length + 1;
    
    // Calculate win rate
    const totalGames = (stats?.totalWins || 0) + (stats?.totalLosses || 0) + (stats?.totalDraws || 0);
    const winRate = totalGames > 0 ? Math.round(((stats?.totalWins || 0) / totalGames) * 100) : 0;
    
    setUserRank({
      rank: rank > 10 ? rank : 10,
      name: 'You',
      avatar: '👤',
      points: userPoints,
      wins: stats?.totalWins || 0,
      losses: stats?.totalLosses || 0,
      winRate,
      accuracy: 68,
      trend: stats && stats.totalWins > stats.totalLosses ? 'up' : 'down',
      trendValue: stats && stats.totalWins > 0 ? 1 : 0
    });
  }, []);

  const getLeaderboardData = () => {
    switch (currentTab) {
      case 'weekly':
        return MOCK_LEADERBOARD_WEEKLY;
      case 'monthly':
        return MOCK_LEADERBOARD_MONTHLY;
      case 'alltime':
        return MOCK_LEADERBOARD_ALL_TIME;
      default:
        return MOCK_LEADERBOARD_WEEKLY;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600 fill-amber-600" />;
    return <span className="text-sm font-black text-muted-foreground">#{rank}</span>;
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (value === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="md:pl-64">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl shadow-yellow-500/30">
              <Trophy className="h-10 w-10 text-white fill-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
              Compete with players worldwide and climb the ranks!
            </p>
          </div>

          {/* Time Period Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="weekly" className="font-bold">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="font-bold">Monthly</TabsTrigger>
                <TabsTrigger value="alltime" className="font-bold">All Time</TabsTrigger>
              </TabsList>
            </div>

            {/* Weekly Leaderboard */}
            <TabsContent value="weekly" className="space-y-4">
              <LeaderboardTable 
                data={leaderboardData} 
                userRank={userRank} 
                getRankIcon={getRankIcon}
                getTrendIcon={getTrendIcon}
              />
            </TabsContent>

            {/* Monthly Leaderboard */}
            <TabsContent value="monthly" className="space-y-4">
              <LeaderboardTable 
                data={leaderboardData} 
                userRank={userRank} 
                getRankIcon={getRankIcon}
                getTrendIcon={getTrendIcon}
              />
            </TabsContent>

            {/* All Time Leaderboard */}
            <TabsContent value="alltime" className="space-y-4">
              <LeaderboardTable 
                data={leaderboardData} 
                userRank={userRank} 
                getRankIcon={getRankIcon}
                getTrendIcon={getTrendIcon}
              />
            </TabsContent>
          </Tabs>

          {/* Your Stats Card */}
          {userRank && (
            <Card className="border-2 border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-foreground">Your Statistics</h2>
                  <Badge variant="outline" className="border-primary text-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    Rank #{userRank.rank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Total Points" value={userRank.points.toLocaleString()} icon={<Zap className="h-4 w-4 text-yellow-500" />} />
                  <StatBox label="Wins" value={userRank.wins} icon={<Trophy className="h-4 w-4 text-emerald-500" />} />
                  <StatBox label="Losses" value={userRank.losses} icon={<Award className="h-4 w-4 text-destructive" />} />
                  <StatBox label="Win Rate" value={`${userRank.winRate}%`} icon={<TrendingUp className="h-4 w-4 text-blue-500" />} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  getRankIcon: (rank: number) => React.ReactNode;
  getTrendIcon: (trend: string, value: number) => React.ReactNode;
}

function LeaderboardTable({ data, userRank, getRankIcon, getTrendIcon }: LeaderboardTableProps) {
  return (
    <div className="space-y-3">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd Place */}
        <div className="order-2">
          <PodiumCard 
            entry={data[1]} 
            place={2} 
            getRankIcon={getRankIcon}
            getTrendIcon={getTrendIcon}
          />
        </div>
        
        {/* 1st Place */}
        <div className="order-1">
          <PodiumCard 
            entry={data[0]} 
            place={1} 
            getRankIcon={getRankIcon}
            getTrendIcon={getTrendIcon}
            isWinner
          />
        </div>
        
        {/* 3rd Place */}
        <div className="order-3">
          <PodiumCard 
            entry={data[2]} 
            place={3} 
            getRankIcon={getRankIcon}
            getTrendIcon={getTrendIcon}
          />
        </div>
      </div>

      {/* Full Leaderboard */}
      <Card className="border-2 border-border bg-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {data.map((entry, index) => (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors",
                  index < 3 ? "bg-muted/50" : "hover:bg-accent/50"
                )}
              >
                {/* Rank */}
                <div className="w-12 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 border-2 border-border bg-background">
                    <AvatarFallback className="text-xl">
                      {entry.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{entry.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {entry.wins}W - {entry.losses}L
                      </span>
                      {getTrendIcon(entry.trend, entry.trendValue)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Win Rate</p>
                    <p className={cn(
                      "text-sm font-black",
                      entry.winRate >= 70 ? "text-emerald-500" : entry.winRate >= 50 ? "text-orange-500" : "text-destructive"
                    )}>
                      {entry.winRate}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accuracy</p>
                    <p className={cn(
                      "text-sm font-black",
                      entry.accuracy >= 90 ? "text-emerald-500" : entry.accuracy >= 80 ? "text-blue-500" : "text-orange-500"
                    )}>
                      {entry.accuracy}%
                    </p>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right min-w-[80px]">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Points</p>
                  <p className="text-lg font-black text-primary">
                    {entry.points.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  place: number;
  getRankIcon: (rank: number) => React.ReactNode;
  getTrendIcon: (trend: string, value: number) => React.ReactNode;
  isWinner?: boolean;
}

function PodiumCard({ entry, place, getRankIcon, getTrendIcon, isWinner = false }: PodiumCardProps) {
  const placeColors = {
    1: 'from-yellow-400 to-orange-500 shadow-yellow-500/30',
    2: 'from-gray-300 to-gray-400 shadow-gray-400/30',
    3: 'from-amber-500 to-amber-600 shadow-amber-500/30'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isWinner ? "border-2 border-yellow-500 shadow-xl" : "border-2 border-border"
    )}>
      <CardContent className="p-4 text-center space-y-3">
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg",
          placeColors[place as keyof typeof placeColors]
        )}>
          {getRankIcon(place)}
        </div>
        
        <Avatar className="h-12 w-12 mx-auto border-2 border-border bg-background">
          <AvatarFallback className="text-2xl">
            {entry.avatar}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <p className="font-black text-foreground truncate">{entry.name}</p>
          <p className="text-sm font-bold text-primary">
            {entry.points.toLocaleString()} pts
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-1">
          {getTrendIcon(entry.trend, entry.trendValue)}
          <span className="text-xs text-muted-foreground font-medium">
            {entry.trendValue > 0 ? `+${entry.trendValue}` : entry.trendValue < 0 ? entry.trendValue : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="p-4 rounded-xl bg-card border-2 border-border text-center space-y-2">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
