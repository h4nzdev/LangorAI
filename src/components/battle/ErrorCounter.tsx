import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ErrorCounterProps {
  errors: number;
  errorLimit: number;
  label?: string;
  isCritical?: boolean;
}

export function ErrorCounter({ errors, errorLimit, label = 'Errors', isCritical = false }: ErrorCounterProps) {
  const percentage = (errors / errorLimit) * 100;
  const isMaxedOut = errors >= errorLimit;

  return (
    <Card className={cn(
      "border-2 transition-all duration-300",
      isMaxedOut 
        ? "border-destructive bg-destructive/10" 
        : isCritical 
          ? "border-orange-500 bg-orange-500/10" 
          : "border-border bg-card"
    )}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className={cn(
              "text-sm font-black",
              isMaxedOut ? "text-destructive" : isCritical ? "text-orange-500" : "text-foreground"
            )}>
              {errors} / {errorLimit}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={cn(
              "h-3",
              isMaxedOut ? "bg-destructive/20" : isCritical ? "bg-orange-500/20" : ""
            )}
          />
          {isMaxedOut && (
            <p className="text-xs text-destructive font-bold text-center animate-pulse">
              LIMIT REACHED
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
