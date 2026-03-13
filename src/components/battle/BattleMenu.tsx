import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trophy, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    color: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30'
  },
  {
    value: 'standard',
    label: 'Standard',
    errors: 10,
    description: 'Balanced challenge',
    icon: <Target className="h-5 w-5" />,
    color: 'text-blue-500 bg-blue-500/20 border-blue-500/30'
  },
  {
    value: 'hard',
    label: 'Hard',
    errors: 5,
    description: 'Expert only',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-500 bg-orange-500/20 border-orange-500/30'
  }
];

interface BattleMenuProps {
  onStart: (errorLimit: number, mode: string) => void;
}

export function BattleMenu({ onStart }: BattleMenuProps) {
  const [selectedMode, setSelectedMode] = useState<string>('standard');

  const handleStart = () => {
    const mode = BATTLE_MODES.find(m => m.value === selectedMode);
    if (mode) {
      onStart(mode.errors, selectedMode);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30">
            <Trophy className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Battle Mode
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
            Compete with another player and see who makes fewer grammar mistakes.
          </p>
        </div>

        {/* Difficulty Selection */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Select Battle Mode
            </Label>
            
            <RadioGroup 
              value={selectedMode} 
              onValueChange={setSelectedMode}
              className="space-y-3"
            >
              {BATTLE_MODES.map((mode) => (
                <div key={mode.value} className="relative">
                  <RadioGroupItem 
                    value={mode.value} 
                    id={mode.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={mode.value}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                      "hover:bg-accent hover:border-accent-foreground/30",
                      mode.color
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl",
                      mode.color
                    )}>
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-foreground">
                          {mode.label}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          ({mode.errors} Errors)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {mode.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button 
          size="lg"
          onClick={handleStart}
          className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/25 transition-all hover:scale-[1.02]"
        >
          <Zap className="h-6 w-6 mr-3 fill-current" />
          Find Opponent
        </Button>
      </div>
    </div>
  );
}
