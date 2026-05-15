'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import {
  ChevronLeft, Clock, Star, CheckCircle2, BookOpen,
  Mic, Play, MessageSquare, Volume2, Headphones, GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCourse, LESSON_TYPE_META, LEVEL_COLOR, type LessonType } from '@/lib/courses';

const LESSON_ICONS: Record<LessonType, React.ReactNode> = {
  conversation:  <MessageSquare className="h-4 w-4" />,
  vocabulary:    <BookOpen className="h-4 w-4" />,
  grammar:       <GraduationCap className="h-4 w-4" />,
  pronunciation: <Volume2 className="h-4 w-4" />,
  listening:     <Headphones className="h-4 w-4" />,
};

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router       = useRouter();
  const course       = getCourse(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <Navigation />
        <div className="flex-1 md:pl-64 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <p className="text-6xl">🔍</p>
            <h1 className="text-2xl font-black text-foreground">Course not found</h1>
            <p className="text-muted-foreground">This course doesn&apos;t exist yet.</p>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStartPractice = () => {
    const topic = course.practiceTopics[0] ?? 'Casual Chat';
    router.push(`/practice?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <Navigation />

      <div className="flex-1 md:pl-64 flex flex-col">
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-32 md:pb-12 space-y-6 pt-4">

          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* ── Hero card ───────────────────────────────────────────────────── */}
          <div className={cn(
            'relative rounded-3xl overflow-hidden bg-gradient-to-br text-white shadow-2xl',
            course.color,
          )}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-24 -translate-y-24" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
            </div>

            <div className="relative p-6 space-y-4">
              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-white/20 border-white/30 text-white',
                )}>
                  {course.goal}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-white/20 border-white/30 text-white">
                  {course.level}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-tight">{course.title}</h1>
                <p className="text-white/70 font-semibold mt-1">{course.subtitle}</p>
              </div>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-white/80 text-sm font-bold">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1.5 text-white/80 text-sm font-bold">
                  <BookOpen className="h-4 w-4" />
                  {course.lessons.length} lessons
                </div>
                <div className="flex items-center gap-1.5 text-white/80 text-sm font-bold">
                  <Star className="h-4 w-4 fill-current text-yellow-300" />
                  {course.points} pts
                </div>
              </div>
            </div>
          </div>

          {/* ── Description ─────────────────────────────────────────────────── */}
          <Card className="bg-card border-none shadow-lg">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* ── What you'll practice ────────────────────────────────────────── */}
          <Card className="bg-card border-none shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/15 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                  What You&apos;ll Practice
                </h2>
              </div>
              <ul className="space-y-2.5">
                {course.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-snug">{obj}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* ── Lessons ─────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Play className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                Course Lessons
              </h2>
            </div>
            <div className="space-y-2">
              {course.lessons.map((lesson) => {
                const meta = LESSON_TYPE_META[lesson.type];
                return (
                  <Card key={lesson.number} className="bg-card border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Lesson number */}
                        <div className={cn(
                          'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-sm bg-gradient-to-br',
                          course.color,
                        )}>
                          {lesson.number}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="text-sm font-black text-foreground">{lesson.title}</h3>
                            <span className={cn(
                              'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1',
                              meta.color,
                            )}>
                              {LESSON_ICONS[lesson.type]}
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">{lesson.description}</p>
                        </div>

                        {/* Duration */}
                        <div className="shrink-0 flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-bold">{lesson.duration}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ── Skills ──────────────────────────────────────────────────────── */}
          <Card className="bg-card border-none shadow-lg">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Skills You&apos;ll Build
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.skills.map(skill => (
                  <span
                    key={skill}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── CTA ─────────────────────────────────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleStartPractice}
              size="lg"
              className={cn(
                'w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest gap-3',
                'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:scale-[1.01]',
              )}
            >
              <Mic className="h-5 w-5" />
              Start Practice Session
            </Button>
            <p className="text-center text-xs text-muted-foreground font-medium">
              AI tutor will guide you through all {course.lessons.length} lessons • {course.points} pts earned on completion
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}
