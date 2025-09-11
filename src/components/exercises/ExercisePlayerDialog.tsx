import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  title: string;
  category: string;
  duration_min: number;
  kcal_est: number;
  level: string;
  muscles: string;
}

interface ExercisePlayerDialogProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const ExercisePlayerDialog: React.FC<ExercisePlayerDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [estimatedKcal, setEstimatedKcal] = useState(0);

  useEffect(() => {
    if (exercise && open) {
      const durationSeconds = exercise.duration_min * 60;
      setTimeRemaining(durationSeconds);
      setTotalTime(durationSeconds);
      setEstimatedKcal(0);
      setIsPlaying(false);
      setSessionId(null);
    }
  }, [exercise, open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            handleComplete();
            return 0;
          }
          
          // Update estimated kcal in real-time
          const timeElapsed = totalTime - newTime;
          const progress = timeElapsed / totalTime;
          setEstimatedKcal(Math.round(exercise!.kcal_est * progress));
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, totalTime, exercise]);

  const startSession = async () => {
    if (!exercise) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Faça login para iniciar o exercício');
        return;
      }

      const { data, error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.user.id,
          exercise_id: exercise.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setIsPlaying(true);
      toast.success('Exercício iniciado!');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Erro ao iniciar exercício');
    }
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const handleComplete = async () => {
    if (!sessionId || !exercise) return;

    try {
      const { error } = await supabase
        .from('exercise_sessions')
        .update({
          ended_at: new Date().toISOString(),
          kcal_burned: exercise.kcal_est,
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success(`🎉 Parabéns! Exercício concluído! Você queimou ${exercise.kcal_est} kcal`);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Erro ao completar exercício');
    }
  };

  const handleCancel = async () => {
    if (sessionId) {
      try {
        // Update session as incomplete
        await supabase
          .from('exercise_sessions')
          .update({
            ended_at: new Date().toISOString(),
            kcal_burned: estimatedKcal, // Save partial calories burned
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error updating cancelled session:', error);
      }
    }
    
    setIsPlaying(false);
    onOpenChange(false);
    toast.info('Exercício cancelado');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (totalTime === 0) return 0;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getBPM = () => {
    // Simulate BPM based on exercise category and progress
    const baseBPM = {
      'Cardio': 140,
      'Força': 120,
      'Flexibilidade': 80,
      'Yoga': 70,
      'Recomendados': 100
    };
    
    const base = baseBPM[exercise?.category as keyof typeof baseBPM] || 100;
    const variation = Math.sin(Date.now() / 1000) * 10; // Simulate realistic variation
    return Math.round(base + variation);
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <div className="relative h-screen max-h-[90vh] bg-gradient-to-br from-primary/10 to-primary/5">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-sm p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white truncate">
                {exercise.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Exercise Image/Animation Area */}
          <div className="h-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <div className="text-4xl">💪</div>
                </div>
                <p className="text-white/80 text-sm">{exercise.category}</p>
              </div>
            </div>
          </div>

          {/* Stats and Timer */}
          <div className="absolute bottom-0 left-0 right-0 bg-background p-6 rounded-t-3xl shadow-2xl">
            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={getProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Progresso</span>
                <span>{Math.round(getProgress())}%</span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalTime > 0 ? `${Math.round(((totalTime - timeRemaining) / totalTime) * 100)}%` : '0%'} concluído
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-500">{estimatedKcal}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-500">{isPlaying ? getBPM() : '--'}</div>
                <div className="text-xs text-muted-foreground">BPM</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-500">{exercise.duration_min}</div>
                <div className="text-xs text-muted-foreground">min</div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3 justify-center">
              {!sessionId ? (
                <Button
                  onClick={startSession}
                  size="lg"
                  className="flex-1 h-14"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <>
                  {!isPlaying ? (
                    <Button
                      onClick={resumeSession}
                      size="lg"
                      variant="default"
                      className="flex-1 h-14"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseSession}
                      size="lg"
                      variant="secondary"
                      className="flex-1 h-14"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    variant="default"
                    className="h-14 px-6"
                    disabled={timeRemaining === totalTime}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={handleCancel}
                    size="lg"
                    variant="outline"
                    className="h-14 px-6"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};