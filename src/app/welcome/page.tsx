'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  CheckCircle2,
  UserCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Langor AI',
    description: 'The world\'s most natural way to master a new language through real-time voice conversation.',
    icon: <Globe className="h-12 w-12 text-primary" />,
    color: 'from-blue-500/20 to-transparent'
  },
  {
    id: 'voice',
    title: 'Speak Naturally',
    description: 'Forget typing. Just tap the mic and start talking. Our AI understands context, slang, and your unique pace.',
    icon: <Mic className="h-12 w-12 text-primary" />,
    color: 'from-primary/20 to-transparent'
  },
  {
    id: 'feedback',
    title: 'Live Corrections',
    description: 'Get instant feedback on your grammar and pronunciation while you speak, without interrupting your flow.',
    icon: <Sparkles className="h-12 w-12 text-emerald-400" />,
    color: 'from-emerald-500/20 to-transparent'
  },
  {
    id: 'privacy',
    title: 'Privacy First',
    description: 'Your conversations and API keys are stored locally in your browser. No accounts, no tracking, total control.',
    icon: <ShieldCheck className="h-12 w-12 text-purple-400" />,
    color: 'from-purple-500/20 to-transparent'
  },
  {
    id: 'onboarding',
    title: 'One last thing...',
    description: 'What should we call you? We love to be on a first-name basis!',
    icon: <UserCircle2 className="h-12 w-12 text-primary" />,
    color: 'from-blue-500/20 to-transparent'
  }
];

export default function WelcomeTour() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const finalName = userName.trim() || 'Hanz';
    localStorage.setItem('USER_NAME', finalName);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B121F] text-white flex flex-col font-body selection:bg-primary/30">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <span className="text-sm font-black tracking-tighter uppercase">Langor AI</span>
        </div>
        <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-widest">
          Skip
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        <div className="max-w-md w-full space-y-12">
          
          {/* Step Content */}
          <div className="relative">
            {TOUR_STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  "transition-all duration-500 absolute inset-0 flex flex-col items-center text-center space-y-8",
                  currentStep === index ? "opacity-100 translate-y-0 relative z-10" : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                <div className={cn(
                  "p-8 rounded-[3rem] bg-gradient-to-b relative group overflow-hidden",
                  step.color
                )}>
                  <div className="absolute inset-0 bg-white/5 opacity-50" />
                  <div className="relative z-10 animate-in zoom-in-75 duration-500">
                    {step.icon}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-3xl font-black tracking-tight">{step.title}</h1>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {step.id === 'onboarding' && (
                  <div className="w-full max-w-xs pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Input 
                      placeholder="Enter your name..." 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-[#1A2333] border-white/10 h-14 rounded-2xl text-center text-lg focus:ring-primary focus:border-primary"
                      onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0B121F] via-[#0B121F] to-transparent">
        <div className="max-w-md mx-auto space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            <Progress value={progress} className="h-1 bg-white/5" />
            <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap uppercase tracking-widest">
              Step {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          {/* Action Button */}
          <Button 
            onClick={nextStep}
            className={cn(
              "w-full h-16 rounded-2xl text-lg font-bold gap-3 group transition-all",
              isLastStep 
                ? "bg-[#1D7AFC] hover:bg-[#1D7AFC]/90 text-white shadow-xl shadow-blue-500/25" 
                : "bg-white text-black hover:bg-white/90"
            )}
          >
            {isLastStep ? (
              <>
                Let's Start Speaking
                <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
