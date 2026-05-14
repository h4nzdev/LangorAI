'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Sparkles, 
  Mic,
  Star,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navigation } from '@/components/navigation';

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'milestone' | 'final';
  isLocked: boolean;
  isCompleted: boolean;
  estimatedTime: string;
}

interface RoadmapData {
  title: string;
  description: string;
  steps: RoadmapStep[];
}

const ROADMAP_TEMPLATES: Record<string, RoadmapData> = {
  'job-interview': {
    title: 'Job Interview Mastery',
    description: 'A step-by-step path to landing your dream role through conversational excellence.',
    steps: [
      { id: 'ji-1', title: 'Self-Introduction', description: 'Master your "elevator pitch" and first impressions.', type: 'daily', isLocked: false, isCompleted: true, estimatedTime: '5m' },
      { id: 'ji-2', title: 'Experience Deep Dive', description: 'Describe your past roles using powerful action verbs.', type: 'daily', isLocked: false, isCompleted: false, estimatedTime: '10m' },
      { id: 'ji-3', title: 'Situational Star Method', description: 'Answer "Tell me about a time..." questions with logic.', type: 'milestone', isLocked: true, isCompleted: false, estimatedTime: '15m' },
      { id: 'ji-4', title: 'Salary & Closing', description: 'Learn to negotiate and ask insightful questions.', type: 'daily', isLocked: true, isCompleted: false, estimatedTime: '8m' },
      { id: 'ji-5', title: 'The Final Mock', description: 'A 20-minute simulated interview with live scoring.', type: 'final', isLocked: true, isCompleted: false, estimatedTime: '20m' },
    ]
  },
  'presentation': {
    title: 'Executive Pitch Roadmap',
    description: 'Transform your technical data into a compelling executive narrative.',
    steps: [
      { id: 'ep-1', title: 'The Hook', description: 'Capture attention in the first 30 seconds.', type: 'daily', isLocked: false, isCompleted: true, estimatedTime: '5m' },
      { id: 'ep-2', title: 'Data Storytelling', description: 'Explain complex metrics using simple metaphors.', type: 'daily', isLocked: false, isCompleted: false, estimatedTime: '12m' },
      { id: 'ep-3', title: 'Visual Sync', description: 'Practice speaking in time with slide transitions.', type: 'daily', isLocked: true, isCompleted: false, estimatedTime: '10m' },
      { id: 'ep-4', title: 'Q&A Defense', description: 'Handle tough questions with confidence and poise.', type: 'milestone', isLocked: true, isCompleted: false, estimatedTime: '15m' },
      { id: 'ep-5', title: 'Live Performance', description: 'Full pitch delivery with fluency analysis.', type: 'final', isLocked: true, isCompleted: false, estimatedTime: '18m' },
    ]
  },
  'small-talk': {
    title: 'Socializing Excellence',
    description: 'Build confidence in any social setting, from networking events to casual coffee.',
    steps: [
      { id: 'st-1', title: 'Icebreakers', description: 'Learn 5 natural ways to start a conversation.', type: 'daily', isLocked: false, isCompleted: true, estimatedTime: '5m' },
      { id: 'st-2', title: 'Active Listening', description: 'Practice verbal nods and asking follow-up questions.', type: 'daily', isLocked: false, isCompleted: false, estimatedTime: '8m' },
      { id: 'st-3', title: 'Shared Interests', description: 'Find common ground using "Me too" bridge phrases.', type: 'daily', isLocked: true, isCompleted: false, estimatedTime: '10m' },
      { id: 'st-4', title: 'Graceful Exits', description: 'End conversations without being awkward.', type: 'daily', isLocked: true, isCompleted: false, estimatedTime: '5m' },
      { id: 'st-5', title: 'Social Mixer Simulation', description: 'Talk to multiple AI personas in a party setting.', type: 'final', isLocked: true, isCompleted: false, estimatedTime: '15m' },
    ]
  },
  'grammar-books': {
    title: 'Grammar Refinement Path',
    description: 'Systematically eliminate common mistakes from your spoken English.',
    steps: [
      { id: 'gr-1', title: 'Tense Mastery', description: 'Focus on Past Simple vs Present Perfect.', type: 'daily', isLocked: false, isCompleted: true, estimatedTime: '10m' },
      { id: 'gr-2', title: 'Conditional Logic', description: 'Express possibilities using If-sentences.', type: 'daily', isLocked: false, isCompleted: false, estimatedTime: '10m' },
      { id: 'gr-3', title: 'Preposition Sprint', description: 'Master "in", "on", and "at" in conversation.', type: 'milestone', isLocked: true, isCompleted: false, estimatedTime: '15m' },
      { id: 'gr-4', title: 'Sentence Variety', description: 'Mix simple and complex structures.', type: 'daily', isLocked: true, isCompleted: false, estimatedTime: '10m' },
      { id: 'gr-5', title: 'Zero-Error Challenge', description: 'Speak for 5 minutes without any grammar flags.', type: 'final', isLocked: true, isCompleted: false, estimatedTime: '20m' },
    ]
  }
};

export default function ActivityRoadmap({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const normalizedId = id.split('-beg')[0].split('-airport')[0].split('-hotel')[0];
  const roadmap = ROADMAP_TEMPLATES[normalizedId] || ROADMAP_TEMPLATES['small-talk'];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body transition-colors duration-300">
      <Navigation />
      
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full shrink-0">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent rounded-full">
            <Link href="/dashboard">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-widest uppercase text-primary">Neural Path Map</span>
            <h1 className="text-sm font-bold uppercase tracking-tight">Activity Roadmap</h1>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto pb-24 md:pb-12">
          <div className="max-w-3xl mx-auto px-6 space-y-12 py-8">
            {/* Intro Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 shadow-2xl relative">
                <Target className="h-10 w-10 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">{roadmap.title}</h2>
                <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto italic">
                  "{roadmap.description}"
                </p>
              </div>
            </div>

            {/* Visual Roadmap Path */}
            <div className="relative space-y-12">
              {/* Vertical Path Line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-muted -translate-x-1/2 opacity-20" />

              {roadmap.steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div 
                    key={step.id} 
                    className={cn(
                      "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16",
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                  >
                    {/* Node Circle */}
                    <div className={cn(
                      "absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center z-10 border-2 transition-all duration-500",
                      step.isCompleted ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" :
                      step.isLocked ? "bg-card border-border text-muted-foreground" :
                      "bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary),0.4)] text-primary-foreground scale-110"
                    )}>
                      {step.isCompleted ? <CheckCircle2 className="h-6 w-6" /> :
                       step.isLocked ? <Lock className="h-5 w-5" /> :
                       <Mic className="h-6 w-6 animate-pulse" />}
                    </div>

                    {/* Step Card */}
                    <div className={cn(
                      "ml-16 md:ml-0 md:w-1/2 group",
                      !isEven && "md:text-right"
                    )}>
                      <Card className={cn(
                        "bg-card border-2 transition-all duration-300 hover:ring-2 ring-primary/20",
                        step.isLocked ? "opacity-60 border-transparent bg-muted/30" : 
                        step.isCompleted ? "border-emerald-500/20" : "border-primary/30 shadow-xl"
                      )}>
                        <CardContent className="p-5 space-y-3">
                          <div className={cn(
                            "flex items-center gap-2",
                            !isEven && "md:flex-row-reverse"
                          )}>
                            <Badge variant={step.type === 'daily' ? 'secondary' : 'default'} className="text-[8px] font-black tracking-widest uppercase">
                              {step.type}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground">{step.estimatedTime}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-black text-base">{step.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {!step.isLocked && !step.isCompleted && (
                            <Button asChild className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
                              <Link href="/practice">
                                <Play className="h-3 w-3 fill-current" /> Begin Entry
                              </Link>
                            </Button>
                          )}

                          {step.isCompleted && (
                            <div className={cn(
                              "flex items-center gap-1 text-[10px] font-bold text-emerald-500",
                              !isEven && "md:justify-end"
                            )}>
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <Star className="h-3 w-3 fill-current" />
                              <span className="ml-1 uppercase tracking-widest">Mastered</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Motivational Footer */}
            <div className="pt-8 text-center space-y-6">
              <div className="p-6 rounded-[2rem] bg-card border border-border shadow-xl space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-2">
                  <Star className="h-4 w-4" /> Next Milestone
                </h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                  "You're currently in the top 15% of learners on this path. Master the next 2 entries to unlock your Career Badge."
                </p>
              </div>

              <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-[0.2em]">
                <Link href="/dashboard">Return to Mission Control</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
