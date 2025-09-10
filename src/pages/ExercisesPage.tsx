import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Timer, Flame, Activity, Clock, Zap, Heart, Filter, Star, TrendingUp, Award, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { toast } from 'sonner';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { SubscriptionContentGate } from '@/components/ui/subscription-content-gate';
import { getEmbedSource } from '@/utils/videoUtils';
import { generateExerciseImages, getFallbackExerciseImage } from '@/utils/exerciseImages';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

interface Exercise {
  id: string;
  title: string;
  category: string;
  duration_min: number;
  kcal_est: number;
  level: string;
  muscles: string;
  video_url?: string;
  video_url_2?: string;
}

const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);
  const [aiDemoImages, setAiDemoImages] = useState<string[]>([]);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [aiVideoScript, setAiVideoScript] = useState<string>('');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [userStats, setUserStats] = useState({ completedExercises: 0, totalCalories: 0, totalTime: 0 });
  const { hasBasicAccess, hasPremiumAccess } = usePremiumAccess();

  useEffect(() => {
    loadExercises();
    loadFavorites();
    loadUserStats();
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
        .order('title');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('exercise_favorites')
        .select('exercise_id')
        .eq('user_id', user.user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(fav => fav.exercise_id) || []));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('exercise_sessions')
        .select('kcal_burned, started_at, ended_at')
        .eq('user_id', user.user.id)
        .not('ended_at', 'is', null);

      if (error) throw error;

      const completedExercises = data?.length || 0;
      const totalCalories = data?.reduce((sum, session) => sum + (session.kcal_burned || 0), 0) || 0;
      const totalTime = data?.reduce((sum, session) => {
        if (session.started_at && session.ended_at) {
          const start = new Date(session.started_at);
          const end = new Date(session.ended_at);
          return sum + Math.floor((end.getTime() - start.getTime()) / 60000); // minutes
        }
        return sum;
      }, 0) || 0;

      setUserStats({ completedExercises, totalCalories, totalTime });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const startExercise = (exercise: Exercise) => {
    setActiveTimer(exercise.id);
    setTimeRemaining(exercise.duration_min * 60);
    toast.success(`Exercício iniciado: ${exercise.title} - ${exercise.duration_min} minutos`);
  };

  const completeExercise = async () => {
    if (!activeTimer) return;

    const exercise = exercises.find(e => e.id === activeTimer);
    if (!exercise) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('exercise_sessions')
          .insert({
            user_id: user.user.id,
            exercise_id: exercise.id,
            ended_at: new Date().toISOString(),
            kcal_burned: exercise.kcal_est,
          });

        // Reload stats
        loadUserStats();
      }

      toast.success(`Parabéns! 🎉 Exercício concluído! Você queimou ${exercise.kcal_est} kcal`);
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

  const toggleFavorite = async (exerciseId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Faça login para favoritar exercícios');
        return;
      }

      const isFavorite = favorites.has(exerciseId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from('exercise_favorites')
          .delete()
          .eq('user_id', user.user.id)
          .eq('exercise_id', exerciseId);

        if (error) throw error;
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(exerciseId);
          return newFavorites;
        });
        toast.success('Exercício removido dos favoritos');
      } else {
        const { error } = await supabase
          .from('exercise_favorites')
          .insert({
            user_id: user.user.id,
            exercise_id: exerciseId
          });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, exerciseId]));
        toast.success('Exercício adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao favoritar exercício');
    }
  };

  const getFilteredExercises = () => {
    let filtered = exercises;

    if (selectedCategory !== 'Todos') {
      if (selectedCategory === 'Favoritos') {
        filtered = exercises.filter(ex => favorites.has(ex.id));
      } else {
        filtered = exercises.filter(ex => ex.category === selectedCategory);
      }
    }

    if (selectedLevel !== 'Todos') {
      filtered = filtered.filter(ex => ex.level === selectedLevel);
    }

    // Apply subscription limits
    if (!hasBasicAccess) {
      return filtered.slice(0, 6); // Free users get 6 exercises total
    }
    
    if (!hasPremiumAccess && hasBasicAccess) {
      return filtered.slice(0, 15); // Basic users get 15 exercises total
    }
    
    return filtered; // Premium users get all exercises
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'default';
      case 'Intermediário': return 'secondary';
      case 'Avançado': return 'destructive';
      default: return 'outline';
    }
  };

  const openVideoDialog = (exercise: Exercise) => {
    setSelectedVideoExercise(exercise);
    setAiDemoImages([]);
    setAiVideoScript('');
  };

  const generateAIDemo = async (exercise: Exercise | null) => {
    if (!exercise) return;
    
    setGeneratingDemo(true);
    try {
      const images = await generateExerciseImages({
        exerciseId: exercise.id,
        exerciseName: exercise.title,
        category: exercise.category,
        level: exercise.level
      });
      
      setAiDemoImages(images);
      toast.success('Demonstração IA gerada com sucesso!');
    } catch (error) {
      console.error('Error generating AI demo:', error);
      toast.error('Erro ao gerar demonstração IA');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const generateAIVideo = async (exercise: Exercise | null) => {
    if (!exercise) return;
    
    setGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-exercise-video', {
        body: { 
          exerciseName: exercise.title,
          category: exercise.category,
          level: exercise.level,
          muscles: exercise.muscles
        }
      });

      if (error) throw error;
      
      setAiVideoScript(data?.script || 'Roteiro não pôde ser gerado no momento.');
      toast.success('Roteiro IA gerado com sucesso!');
    } catch (error) {
      console.error('Error generating AI video:', error);
      toast.error('Erro ao gerar roteiro IA');
    } finally {
      setGeneratingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-safe-bottom-nav">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <BrandHeader 
          title="Biblioteca de Exercícios"
          subtitle="Exercícios categorizados com vídeos e IA Lovable"
        />
        
        <TrialBanner />

        {/* User Statistics */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Suas Estatísticas
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats.completedExercises}</div>
              <div className="text-sm text-muted-foreground">Exercícios</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats.totalCalories}</div>
              <div className="text-sm text-muted-foreground">Calorias</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats.totalTime}</div>
              <div className="text-sm text-muted-foreground">Minutos</div>
            </div>
          </div>
        </Card>

        {/* Active Timer */}
        {activeTimer && (
          <Card className="p-4 bg-green-50 border-green-200 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Exercício em Andamento
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-green-700">
                {exercises.find(ex => ex.id === activeTimer)?.title}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTimer(null);
                  setTimeRemaining(0);
                }}
                className="mt-4"
              >
                Parar Exercício
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              {['Todos', 'Cardio', 'Força', 'Flexibilidade', 'Yoga', 'Favoritos'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'Favoritos' && <Star className="h-3 w-3 mr-1" />}
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Level Filter */}
            <div className="flex gap-1 flex-wrap">
              {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                  className="text-xs"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredExercises().map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Exercise Image */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <img 
                    src={getFallbackExerciseImage(exercise.category)} 
                    alt={exercise.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(exercise.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.has(exercise.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                    }`} 
                  />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {exercise.category}
                  </Badge>
                  <Badge 
                    variant={getLevelColor(exercise.level)}
                    className="text-xs"
                  >
                    {exercise.level}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{exercise.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    {exercise.duration_min}min
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    {exercise.kcal_est} kcal
                  </div>
                </div>
                
                {exercise.muscles && (
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Músculos:</strong> {exercise.muscles}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => startExercise(exercise)}
                    className="flex-1"
                    size="sm"
                    disabled={!!activeTimer}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                  
                  {(exercise.video_url || exercise.video_url_2) && (
                    <Button 
                      variant="outline"
                      onClick={() => openVideoDialog(exercise)}
                      size="sm"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No exercises message */}
        {getFilteredExercises().length === 0 && (
          <Card className="p-8 text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou explore outras categorias.
            </p>
          </Card>
        )}

        {/* Subscription Gate */}
        {!hasPremiumAccess && (
          <SubscriptionContentGate 
            requiredTier="premium"
          >
            <div className="text-center p-6">
              <p className="text-muted-foreground">
                Acesso completo a todos os exercícios disponível com plano Premium
              </p>
            </div>
          </SubscriptionContentGate>
        )}

        {/* Video Dialog */}
        <Dialog open={!!selectedVideoExercise} onOpenChange={() => setSelectedVideoExercise(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVideoExercise?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedVideoExercise && (
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="video">Vídeos</TabsTrigger>
                  <TabsTrigger value="demo">AI Demo</TabsTrigger>
                  <TabsTrigger value="script">AI Roteiro</TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="space-y-4">
                  {selectedVideoExercise?.video_url && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Vídeo Principal:</h4>
                      <div className="aspect-video">
                        {(() => {
                          const videoSource = getEmbedSource(selectedVideoExercise.video_url);
                          if (videoSource.type === 'youtube' || videoSource.type === 'vimeo' || videoSource.type === 'gdrive') {
                            return (
                              <iframe
                                src={videoSource.src}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            );
                          } else if (videoSource.type === 'file') {
                            return (
                              <video 
                                src={videoSource.src} 
                                controls 
                                className="w-full h-full rounded-lg"
                              />
                            );
                          }
                          return <p className="text-muted-foreground">Formato de vídeo não suportado</p>;
                        })()}
                      </div>
                    </div>
                  )}

                  {selectedVideoExercise?.video_url_2 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Vídeo Alternativo:</h4>
                      <div className="aspect-video">
                        {(() => {
                          const videoSource = getEmbedSource(selectedVideoExercise.video_url_2);
                          if (videoSource.type === 'youtube' || videoSource.type === 'vimeo' || videoSource.type === 'gdrive') {
                            return (
                              <iframe
                                src={videoSource.src}
                                className="w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            );
                          } else if (videoSource.type === 'file') {
                            return (
                              <video 
                                src={videoSource.src} 
                                controls 
                                className="w-full h-full rounded-lg"
                              />
                            );
                          }
                          return <p className="text-muted-foreground">Formato de vídeo não suportado</p>;
                        })()}
                      </div>
                    </div>
                  )}

                  {!selectedVideoExercise?.video_url && !selectedVideoExercise?.video_url_2 && (
                    <p className="text-muted-foreground text-center">Nenhum vídeo disponível para este exercício</p>
                  )}
                </TabsContent>

                <TabsContent value="demo" className="space-y-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => generateAIDemo(selectedVideoExercise)}
                      disabled={generatingDemo || !selectedVideoExercise}
                      className="w-full"
                    >
                      {generatingDemo ? 'Gerando Demonstração...' : 'Gerar Demonstração com IA Lovable'}
                    </Button>
                    
                    {aiDemoImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {aiDemoImages.map((imageUrl, index) => (
                          <div key={index} className="space-y-2">
                            <img 
                              src={imageUrl}
                              alt={`Demonstração ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <p className="text-sm text-center text-muted-foreground">
                              Passo {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="script" className="space-y-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => generateAIVideo(selectedVideoExercise)}
                      disabled={generatingVideo || !selectedVideoExercise}
                      className="w-full"
                    >
                      {generatingVideo ? 'Gerando Roteiro...' : 'Gerar Roteiro com IA Lovable'}
                    </Button>
                    
                    {aiVideoScript && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Roteiro do Exercício:</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">{aiVideoScript}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ExercisesPage;