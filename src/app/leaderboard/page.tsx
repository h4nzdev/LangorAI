'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Crown, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  isCurrentUser?: boolean;
}

async function fetchLeaderboard(supabase: ReturnType<typeof createClient>, daysBack: number | null): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from('profiles')
    .select('id, username, avatar, points, wins, losses, streak, last_active_date')
    .order('points', { ascending: false })
    .limit(20);

  if (daysBack !== null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    query = query.gte('last_active_date', cutoff.toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row, i) => {
    const total = (row.wins ?? 0) + (row.losses ?? 0);
    return {
      id: row.id,
      username: row.username ?? 'Player',
      avatar: row.avatar ?? '👤',
      points: row.points ?? 0,
      wins: row.wins ?? 0,
      losses: row.losses ?? 0,
      winRate: total > 0 ? Math.round(((row.wins ?? 0) / total) * 100) : 0,
      streak: row.streak ?? 0,
    };
  });
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    const daysBack = tab === 'weekly' ? 7 : tab === 'monthly' ? 30 : null;
    fetchLeaderboard(supabase, daysBack).then((rows) => {
      setEntries(rows.map(r => ({ ...r, isCurrentUser: r.id === currentUserId })));
      setLoading(false);
    });
  }, [tab, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUser = entries.find(e => e.isCurrentUser);
  const currentUserRank = currentUser ? entries.indexOf(currentUser) + 1 : null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600 fill-amber-600" />;
    return <span className="text-sm font-black text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="md:pl-64 pb-32 md:pb-0">
        <div className="container mx-auto p-6 space-y-8 max-w-3xl">
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

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="weekly" className="font-bold">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="font-bold">Monthly</TabsTrigger>
                <TabsTrigger value="alltime" className="font-bold">All Time</TabsTrigger>
              </TabsList>
            </div>

            {['weekly', 'monthly', 'alltime'].map(t => (
              <TabsContent key={t} value={t} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No players yet</p>
                    <p className="text-sm">Be the first to battle and earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Podium — top 3 */}
                    {entries.length >= 3 && (
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <PodiumCard entry={entries[1]} rank={2} isCurrentUser={entries[1].isCurrentUser} />
                        <PodiumCard entry={entries[0]} rank={1} isCurrentUser={entries[0].isCurrentUser} winner />
                        <PodiumCard entry={entries[2]} rank={3} isCurrentUser={entries[2].isCurrentUser} />
                      </div>
                    )}

                    {/* Full table */}
                    <Card className="border-2 border-border bg-card">
                      <CardContent className="p-0">
                        <div className="divide-y divide-border">
                          {entries.map((entry, idx) => (
                            <div
                              key={entry.id}
                              className={cn(
                                'flex items-center gap-4 p-4 transition-colors',
                                entry.isCurrentUser ? 'bg-primary/5 border-l-4 border-primary' : idx < 3 ? 'bg-muted/30' : 'hover:bg-accent/30'
                              )}
                            >
                              <div className="w-10 flex justify-center shrink-0">
                                {getRankIcon(idx + 1)}
                              </div>

                              <Avatar className="h-10 w-10 border-2 border-border bg-background shrink-0">
                                <AvatarFallback className="text-xl">{entry.avatar}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-foreground truncate">{entry.username}</p>
                                  {entry.isCurrentUser && (
                                    <Badge variant="outline" className="border-primary text-primary text-[9px] font-black px-1.5 py-0">YOU</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{entry.wins}W · {entry.losses}L · {entry.winRate}% wr</p>
                              </div>

                              <div className="hidden md:flex items-center gap-6 text-center">
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Streak</p>
                                  <p className="text-sm font-black text-orange-500">🔥 {entry.streak}</p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Points</p>
                                <p className="text-lg font-black text-primary">{entry.points.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Your rank card */}
          {currentUser && currentUserRank && (
            <Card className="border-2 border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-foreground">Your Standing</h2>
                  <Badge variant="outline" className="border-primary text-primary">
                    <Zap className="h-3 w-3 mr-1" />
                    Rank #{currentUserRank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Points" value={currentUser.points.toLocaleString()} icon={<Zap className="h-4 w-4 text-yellow-500" />} />
                  <StatBox label="Wins" value={currentUser.wins} icon={<Trophy className="h-4 w-4 text-emerald-500" />} />
                  <StatBox label="Losses" value={currentUser.losses} icon={<Award className="h-4 w-4 text-destructive" />} />
                  <StatBox label="Win Rate" value={`${currentUser.winRate}%`} icon={<TrendingUp className="h-4 w-4 text-blue-500" />} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function PodiumCard({ entry, rank, isCurrentUser, winner = false }: { entry: LeaderboardEntry; rank: number; isCurrentUser?: boolean; winner?: boolean }) {
  const gradients: Record<number, string> = {
    1: 'from-yellow-400 to-orange-500 shadow-yellow-500/30',
    2: 'from-gray-300 to-gray-400 shadow-gray-400/30',
    3: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  };
  const icons: Record<number, React.ReactNode> = {
    1: <Crown className="h-6 w-6 text-white fill-white" />,
    2: <Medal className="h-5 w-5 text-white fill-white" />,
    3: <Award className="h-5 w-5 text-white fill-white" />,
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300',
      winner ? 'border-2 border-yellow-500 shadow-xl -mt-2' : 'border-2 border-border',
      isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
    )}>
      <CardContent className="p-3 text-center space-y-2">
        <div className={cn(
          'inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br shadow-lg',
          gradients[rank]
        )}>
          {icons[rank]}
        </div>
        <Avatar className="h-10 w-10 mx-auto border-2 border-border bg-background">
          <AvatarFallback className="text-xl">{entry.avatar}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-black text-foreground text-xs truncate">{entry.username}</p>
          <p className="text-sm font-bold text-primary">{entry.points.toLocaleString()} pts</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-card border-2 border-border text-center space-y-2">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
