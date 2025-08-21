
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap, Play, Target, Activity, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface Exercise {
  id: string;
  title: string;
  category: string;
  duration_min: number;
  kcal_est: number;
  level: string;
  muscles: string;
  video_url?: string;
}

export const ExercisesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timeRemaining]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Erro ao carregar exercícios",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startExercise = (exercise: Exercise) => {
    setActiveTimer(exercise.id);
    setTimeRemaining(exercise.duration_min * 60);
    toast({
      title: "Exercício iniciado!",
      description: `${exercise.title} - ${exercise.duration_min} minutos`,
    });
  };

  const completeExercise = async () => {
    if (!user || !activeTimer) return;

    const exercise = exercises.find(e => e.id === activeTimer);
    if (!exercise) return;

    try {
      await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          ended_at: new Date().toISOString(),
          kcal_burned: exercise.kcal_est,
        });

      toast({
        title: "Parabéns! 🎉",
        description: `Exercício concluído! Você queimou ${exercise.kcal_est} kcal`,
      });
    } catch (error) {
      console.error('Error saving exercise session:', error);
    }

    setActiveTimer(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getExercisesByCategory = (category: string) => {
    return exercises.filter(ex => ex.category === category);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'text-green-600 bg-green-50';
      case 'Intermediário': return 'text-yellow-600 bg-yellow-50';
      case 'Avançado': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const openVideoDialog = (exercise: Exercise) => {
    if (exercise.video_url) {
      setSelectedVideoExercise(exercise);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <BrandHeader 
            title="Exercícios"
            subtitle="Encontre o treino perfeito para você"
          />
        </div>
        
        <TrialBanner />

        {/* Active Timer */}
        {activeTimer && (
          <Card className="mb-6 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {exercises.find(e => e.id === activeTimer)?.title}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTimer(null);
                    setTimeRemaining(0);
                  }}
                >
                  Parar Exercício
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Categories */}
        <Tabs defaultValue="Recomendados" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="Recomendados">Recomendados</TabsTrigger>
            <TabsTrigger value="Cardio">Cardio</TabsTrigger>
            <TabsTrigger value="Força">Força</TabsTrigger>
          </TabsList>

          {['Recomendados', 'Cardio', 'Força'].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="space-y-4">
                {getExercisesByCategory(category).map((exercise) => (
                  <Card key={exercise.id} className="border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {exercise.title}
                            {exercise.video_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openVideoDialog(exercise)}
                                className="h-6 w-6 p-0"
                              >
                                <Video className="h-4 w-4 text-blue-500" />
                              </Button>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {exercise.muscles && (
                              <span className="flex items-center text-sm text-gray-600">
                                <Target className="h-4 w-4 mr-1" />
                                {exercise.muscles}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(exercise.level)}`}>
                          {exercise.level}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {exercise.duration_min} min
                          </span>
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-1" />
                            {exercise.kcal_est} kcal
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startExercise(exercise)}
                          disabled={!!activeTimer}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Exercício
                        </Button>
                        {exercise.video_url && (
                          <Button
                            variant="outline"
                            onClick={() => openVideoDialog(exercise)}
                            className="px-3"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getExercisesByCategory(category).length === 0 && (
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum exercício encontrado nesta categoria.</p>
                        <p className="text-sm mt-2">Novos exercícios serão adicionados em breve!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Video Dialog */}
        <Dialog open={!!selectedVideoExercise} onOpenChange={() => setSelectedVideoExercise(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideoExercise?.title}</DialogTitle>
              <DialogDescription>
                Vídeo demonstrativo do exercício
              </DialogDescription>
            </DialogHeader>
            {selectedVideoExercise?.video_url && (
              <div className="aspect-video">
                <iframe
                  src={selectedVideoExercise.video_url}
                  title={`Vídeo: ${selectedVideoExercise.title}`}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
