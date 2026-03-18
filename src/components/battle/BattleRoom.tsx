import React, { useState, useEffect, useCallback } from 'react';
import { PlayerCard } from './PlayerCard';
import { ErrorCounter } from './ErrorCounter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, MessageSquare, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleRoomProps {
  errorLimit: number;
  onBattleEnd: (result: {
    playerErrors: number;
    opponentErrors: number;
    playerAccuracy: number;
    fluencyScore: number;
    pointsEarned: number;
    winner: 'player' | 'opponent' | 'draw';
  }) => void;
}

// Mock grammar corrections
const MOCK_CORRECTIONS = [
  { incorrect: 'I go to school yesterday', correct: 'I went to school yesterday' },
  { incorrect: 'She don\'t like apples', correct: 'She doesn\'t like apples' },
  { incorrect: 'He have a car', correct: 'He has a car' },
  { incorrect: 'They is playing', correct: 'They are playing' },
  { incorrect: 'I seen that movie', correct: 'I saw that movie' },
  { incorrect: 'We was at home', correct: 'We were at home' },
  { incorrect: 'She runned fast', correct: 'She ran fast' },
  { incorrect: 'He don\'t know', correct: 'He doesn\'t know' },
];

export function BattleRoom({ errorLimit, onBattleEnd }: BattleRoomProps) {
  const [playerErrors, setPlayerErrors] = useState(0);
  const [opponentErrors, setOpponentErrors] = useState(0);
  const [playerAccuracy, setPlayerAccuracy] = useState(100);
  const [opponentAccuracy, setOpponentAccuracy] = useState(100);
  const [isPlayerSpeaking, setIsPlayerSpeaking] = useState(false);
  const [isOpponentSpeaking, setIsOpponentSpeaking] = useState(false);
  const [recentCorrection, setRecentCorrection] = useState<{ incorrect: string; correct: string } | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Simulate opponent behavior
  useEffect(() => {
    const opponentInterval = setInterval(() => {
      setOpponentErrors(prev => {
        const newErrors = prev + (Math.random() > 0.6 ? 1 : 0);
        setOpponentAccuracy(Math.max(0, 100 - (newErrors / errorLimit) * 100));
        return Math.min(newErrors, errorLimit);
      });
      
      // Random opponent speaking animation
      setIsOpponentSpeaking(Math.random() > 0.5);
    }, 2000);

    return () => clearInterval(opponentInterval);
  }, [errorLimit]);

  // Check for battle end
  useEffect(() => {
    if (playerErrors >= errorLimit || opponentErrors >= errorLimit) {
      const playerWon = playerErrors < opponentErrors;
      const opponentWon = opponentErrors < playerErrors;
      const isDraw = playerErrors === opponentErrors;

      const fluencyScore = Math.round(100 - (playerErrors / errorLimit) * 50);
      const pointsEarned = playerWon ? 20 : isDraw ? 10 : 5;

      setTimeout(() => {
        onBattleEnd({
          playerErrors,
          opponentErrors,
          playerAccuracy: Math.round(playerAccuracy),
          fluencyScore,
          pointsEarned,
          winner: playerWon ? 'player' : opponentWon ? 'opponent' : 'draw'
        });
      }, 1000);
    }
  }, [playerErrors, opponentErrors, errorLimit, playerAccuracy, onBattleEnd]);

  const handleMicClick = useCallback(() => {
    if (playerErrors >= errorLimit) return;

    setIsPlayerSpeaking(true);
    
    // Simulate speech processing
    setTimeout(() => {
      const shouldMakeError = Math.random() > 0.6;
      
      if (shouldMakeError) {
        const correction = MOCK_CORRECTIONS[Math.floor(Math.random() * MOCK_CORRECTIONS.length)];
        setRecentCorrection(correction);
        setPlayerErrors(prev => {
          const newErrors = prev + 1;
          setPlayerAccuracy(Math.max(0, 100 - (newErrors / errorLimit) * 100));
          return newErrors;
        });
        setBattleLog(prev => [`❌ Grammar mistake detected!`, ...prev.slice(0, 4)]);
      } else {
        setBattleLog(prev => [`✅ Perfect grammar!`, ...prev.slice(0, 4)]);
      }
      
      setIsPlayerSpeaking(false);
      
      setTimeout(() => {
        setRecentCorrection(null);
      }, 3000);
    }, 1500);
  }, [errorLimit, playerErrors]);

  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      {/* Locked Session Indicator */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse">
          <Lock className="h-5 w-5 fill-white" />
          <span className="font-bold text-sm uppercase tracking-widest">
            Session Locked
          </span>
        </div>
      </div>

      <div className="min-h-screen p-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Battle in Progress
          </h1>
          <p className="text-muted-foreground font-medium">
            First to {errorLimit} errors loses!
          </p>
        </div>

        {/* Error Limit Display */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Error Limit
              </span>
              <div className="flex items-center gap-2">
                {[...Array(errorLimit)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      i < playerErrors 
                        ? "bg-destructive scale-125" 
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-black text-foreground">
                {playerErrors}/{errorLimit}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Player Cards */}
        <div className="grid gap-4">
          <PlayerCard
            name="You"
            errors={playerErrors}
            errorLimit={errorLimit}
            accuracy={Math.round(playerAccuracy)}
            isSpeaking={isPlayerSpeaking}
            isCurrentUser={true}
            avatar="👤"
          />
          
          <PlayerCard
            name="Opponent"
            errors={opponentErrors}
            errorLimit={errorLimit}
            accuracy={Math.round(opponentAccuracy)}
            isSpeaking={isOpponentSpeaking}
            isCurrentUser={false}
            avatar="🤖"
          />
        </div>

        {/* Recent Correction Display */}
        {recentCorrection && (
          <Card className="border-2 border-orange-500 bg-orange-500/10 animate-in fade-in slide-in-from-top-4">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Correction
                </span>
              </div>
              <p className="text-sm text-destructive font-medium line-through">
                "{recentCorrection.incorrect}"
              </p>
              <p className="text-sm text-emerald-500 font-bold">
                "{recentCorrection.correct}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Battle Log */}
        <Card className="border-2 border-border bg-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Battle Log
              </span>
              <div className="space-y-1">
                {battleLog.map((log, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-sm font-medium",
                      i === 0 ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Input Section - Centered */}
        <div className="flex items-center justify-center py-8">
          <Card className="border-2 border-border bg-card shadow-2xl max-w-2xl w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    isPlayerSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                  )} />
                  <span className="text-sm font-bold text-foreground">
                    {isPlayerSpeaking ? 'Listening...' : 'Ready to speak'}
                  </span>
                </div>

                <Button
                  onClick={handleMicClick}
                  disabled={playerErrors >= errorLimit}
                  className={cn(
                    "h-14 px-10 rounded-2xl font-black uppercase tracking-widest transition-all",
                    isPlayerSpeaking
                      ? "bg-primary text-primary-foreground scale-105"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground",
                    playerErrors >= errorLimit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isPlayerSpeaking ? (
                    <>
                      <Mic className="h-5 w-5 mr-2 animate-pulse" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Mic className="h-6 w-6 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border-border"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
