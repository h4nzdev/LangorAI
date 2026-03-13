import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ErrorCounter } from './ErrorCounter';
import { Mic, MicOff, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  name: string;
  errors: number;
  errorLimit: number;
  accuracy: number;
  isSpeaking?: boolean;
  isCurrentUser?: boolean;
  isWinner?: boolean;
  avatar?: string;
}

export function PlayerCard({
  name,
  errors,
  errorLimit,
  accuracy,
  isSpeaking = false,
  isCurrentUser = false,
  isWinner = false,
  avatar = '👤'
}: PlayerCardProps) {
  const isCritical = errors >= errorLimit - 2 && errors < errorLimit;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isCurrentUser 
        ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10" 
        : "border-border bg-card",
      isWinner && "ring-2 ring-yellow-500 shadow-xl shadow-yellow-500/20"
    )}>
      {isWinner && (
        <div className="absolute top-2 right-2">
          <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-bounce" />
        </div>
      )}
      
      <CardContent className="p-6 space-y-4">
        {/* Player Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20 bg-background">
            <AvatarFallback className="text-2xl">
              {avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-foreground truncate">{name}</h3>
              {isCurrentUser && (
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isSpeaking ? (
                <>
                  <Mic className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">
                    {isCurrentUser ? 'Speaking...' : 'Listening...'}
                  </span>
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    Waiting
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <ErrorCounter 
            errors={errors} 
            errorLimit={errorLimit} 
            label="Errors"
            isCritical={isCritical}
          />
          
          <Card className="border-2 border-border bg-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accuracy</span>
                  <span className={cn(
                    "text-sm font-black",
                    accuracy >= 80 ? "text-emerald-500" : accuracy >= 60 ? "text-orange-500" : "text-destructive"
                  )}>
                    {accuracy}%
                  </span>
                </div>
                <Progress 
                  value={accuracy} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
