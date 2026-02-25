'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Share2, 
  Play, 
  Zap, 
  CheckCircle2, 
  Target, 
  BookOpen
} from 'lucide-react';
import { type SummarizeOutput } from '@/ai/flows/practice-flow';

export default function SessionAnalysis() {
  const [data, setData] = useState<SummarizeOutput | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('LAST_SESSION_ANALYSIS');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse analysis data", e);
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0B121F] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Analysis Found</h1>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const skillMetrics = [
    { 
      label: 'Fluency', 
      value: data.metrics.fluency, 
      desc: data.insights.fluency,
      icon: <Zap className="h-4 w-4 text-primary" />
    },
    { 
      label: 'Grammar', 
      value: data.metrics.grammar, 
      desc: data.insights.grammar,
      icon: <CheckCircle2 className="h-4 w-4 text-primary" />
    },
    { 
      label: 'Pronunciation', 
      value: data.metrics.pronunciation, 
      desc: data.insights.pronunciation,
      icon: <Target className="h-4 w-4 text-primary" />
    },
    { 
      label: 'Vocabulary', 
      value: data.metrics.vocabulary, 
      desc: data.insights.vocabulary,
      icon: <BookOpen className="h-4 w-4 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body selection:bg-primary/30">
      <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full shrink-0">
        <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10 rounded-full">
          <Link href="/dashboard">
            <X className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-sm font-bold tracking-tight uppercase">Session Analysis</h1>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-auto pb-32">
        <div className="max-w-xl mx-auto px-6 space-y-10">
          
          {/* Overall Score Circle */}
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/5"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * data.overallScore) / 100}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">{data.overallScore}%</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Overall Score</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-center font-medium text-white/90">
              {data.overallScore > 80 ? "Excellent session! You sounded more natural." : "Good effort! Focus on the grammar tips below."}
            </p>
          </div>

          {/* Skill Metrics */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold">Skill Metrics</h2>
            <div className="space-y-6">
              {skillMetrics.map((skill) => (
                <div key={skill.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {skill.icon}
                      <span className="font-bold text-sm">{skill.label}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="h-2 bg-white/5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{skill.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Improvements */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Key Improvements</h2>
            {data.keyImprovements.length > 0 ? (
              data.keyImprovements.map((item, i) => (
                <div key={i} className="bg-[#1A2333]/40 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2 text-red-400 font-bold text-sm">
                    <span className="text-lg leading-none pt-0.5">⊗</span>
                    <p className="line-through decoration-red-400/50">{item.error}</p>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400 font-bold text-sm">
                    <span className="text-lg leading-none pt-0.5">⊙</span>
                    <p>{item.correction}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 italic">
                    Rule: {item.rule}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No major errors detected. Keep up the good work!</p>
            )}
          </section>

          {/* Recommended Exercise Card */}
          <section>
            <div className="relative group overflow-hidden bg-gradient-to-br from-[#1A2333] to-[#0B121F] border border-primary/20 rounded-3xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Play className="h-24 w-24 text-primary fill-current" />
              </div>
              <div className="relative z-10 space-y-4">
                <Badge className="bg-primary hover:bg-primary text-[9px] font-black uppercase tracking-wider">
                  Recommended for you
                </Badge>
                <div className="space-y-1">
                  <h3 className="text-xl font-black">{data.recommendedExercise.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.recommendedExercise.description}
                  </p>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs gap-2 rounded-xl h-12 shadow-lg shadow-primary/20">
                  <Play className="h-4 w-4 fill-current" /> Start Exercise
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B121F] via-[#0B121F] to-transparent">
        <div className="max-w-xl mx-auto w-full">
          <Button asChild className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest">
            <Link href="/dashboard">Done</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}