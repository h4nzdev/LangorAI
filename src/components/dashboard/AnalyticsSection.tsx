'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, BookOpen, Target, Zap, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  created_at: string;
  grammar_score: number;
  fluency_score: number;
  confidence_score: number;
  duration_minutes: number;
  error_count: number;
  topic: string;
}

interface AnalyticsData {
  sessions: Session[];
  weeklyActivity: { day: string; sessions: number; minutes: number }[];
  avgGrammar: number;
  avgFluency: number;
  avgConfidence: number;
  totalErrors: number;
  totalMinutes: number;
  streak: number;
  wins: number;
  losses: number;
  points: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeeklyActivity(sessions: Session[]) {
  const counts: Record<string, { sessions: number; minutes: number }> = {};
  DAYS.forEach(d => { counts[d] = { sessions: 0, minutes: 0 }; });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  sessions.forEach(s => {
    const d = new Date(s.created_at);
    if (d >= weekAgo) {
      const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      counts[dayName].sessions += 1;
      counts[dayName].minutes  += s.duration_minutes ?? 0;
    }
  });

  return DAYS.map(d => ({ day: d, ...counts[d] }));
}

function avg(arr: number[]) {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}

export function AnalyticsSection() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: sessions }, { data: profile }] = await Promise.all([
        supabase
          .from('practice_sessions')
          .select('created_at, grammar_score, fluency_score, confidence_score, duration_minutes, error_count, topic')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('profiles')
          .select('streak, wins, losses, points, total_minutes')
          .eq('id', user.id)
          .single(),
      ]);

      const s = (sessions ?? []) as Session[];
      setData({
        sessions: s,
        weeklyActivity: buildWeeklyActivity(s),
        avgGrammar:    avg(s.map(x => x.grammar_score    ?? 0)),
        avgFluency:    avg(s.map(x => x.fluency_score    ?? 0)),
        avgConfidence: avg(s.map(x => x.confidence_score ?? 0)),
        totalErrors:   s.reduce((a, x) => a + (x.error_count ?? 0), 0),
        totalMinutes:  profile?.total_minutes ?? 0,
        streak:        profile?.streak        ?? 0,
        wins:          profile?.wins          ?? 0,
        losses:        profile?.losses        ?? 0,
        points:        profile?.points        ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-card/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalBattles = data.wins + data.losses;
  const winRate      = totalBattles > 0 ? Math.round((data.wins / totalBattles) * 100) : 0;

  // Last 7 sessions for grammar trend
  const grammarTrend = [...data.sessions]
    .reverse()
    .slice(-7)
    .map((s, i) => ({ i: i + 1, score: s.grammar_score ?? 0 }));

  return (
    <div className="space-y-5">
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Your Analytics</h2>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Streak" value={`${data.streak}🔥`} sub="days" color="orange" icon={<Flame className="h-4 w-4" />} />
        <KpiCard label="Points" value={data.points.toLocaleString()} sub="total" color="primary" icon={<Zap className="h-4 w-4" />} />
        <KpiCard label="Win Rate" value={`${winRate}%`} sub={`${data.wins}W ${data.losses}L`} color="emerald" icon={<Trophy className="h-4 w-4" />} />
      </div>

      {/* ── Weekly sessions bar chart ────────────────────────────────────────── */}
      <Card className="bg-card border-none shadow-xl">
        <CardContent className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Sessions This Week</p>
          {data.weeklyActivity.some(d => d.sessions > 0) ? (
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={data.weeklyActivity} barSize={20} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: 'none', borderRadius: 12, fontSize: 11, fontWeight: 700 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(v: number) => [`${v} session${v !== 1 ? 's' : ''}`, '']}
                />
                <Bar dataKey="sessions" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="No sessions recorded this week. Start practising!" />
          )}
        </CardContent>
      </Card>

      {/* ── Grammar score trend ──────────────────────────────────────────────── */}
      <Card className="bg-card border-none shadow-xl">
        <CardContent className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Grammar Score Trend</p>
          {grammarTrend.length >= 2 ? (
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={grammarTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="i" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: 'none', borderRadius: 12, fontSize: 11, fontWeight: 700 }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  formatter={(v: number) => [`${v}%`, 'Grammar']}
                />
                <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Complete at least 2 sessions to see your grammar trend." />
          )}
        </CardContent>
      </Card>

      {/* ── Skill averages ───────────────────────────────────────────────────── */}
      {data.sessions.length > 0 && (
        <Card className="bg-card border-none shadow-xl">
          <CardContent className="p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Average Skill Scores</p>
            <ScoreRow label="Grammar"     value={data.avgGrammar}    icon={<Target   className="h-3.5 w-3.5 text-primary"      />} color="bg-primary" />
            <ScoreRow label="Fluency"     value={data.avgFluency}    icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} color="bg-emerald-500" />
            <ScoreRow label="Confidence"  value={data.avgConfidence} icon={<BookOpen  className="h-3.5 w-3.5 text-violet-500"   />} color="bg-violet-500" />
          </CardContent>
        </Card>
      )}

      {/* ── Recent sessions ──────────────────────────────────────────────────── */}
      {data.sessions.length > 0 && (
        <Card className="bg-card border-none shadow-xl">
          <CardContent className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Recent Sessions</p>
            <div className="space-y-2">
              {data.sessions.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{s.topic || 'General'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' · '}
                      {s.duration_minutes}min
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ScorePill value={s.grammar_score} label="G" />
                    <ScorePill value={s.fluency_score}  label="F" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    orange:  'text-orange-500 bg-orange-500/10',
    primary: 'text-primary bg-primary/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
  };
  return (
    <Card className="bg-card border-none shadow-lg">
      <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
        <div className={cn('p-2 rounded-xl', colorMap[color] ?? 'text-primary bg-primary/10')}>{icon}</div>
        <p className="text-lg font-black text-foreground leading-none">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-[8px] text-muted-foreground/60">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold text-foreground">{label}</span>
        </div>
        <span className="text-xs font-black text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScorePill({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? 'text-emerald-500 bg-emerald-500/10' : value >= 60 ? 'text-yellow-500 bg-yellow-500/10' : 'text-destructive bg-destructive/10';
  return (
    <div className={cn('px-2 py-0.5 rounded-lg text-[9px] font-black', color)}>
      {label} {value}%
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-[10px] text-muted-foreground/60 italic text-center py-4">{text}</p>;
}
