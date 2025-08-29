
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap, Play, Target, Activity, Video, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { getEmbedSource } from '@/utils/videoUtils';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { SubscriptionContentGate } from '@/components/ui/subscription-content-gate';

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

export const ExercisesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasBasicAccess, hasPremiumAccess_Level, hasEliteAccess } = usePremiumAccess();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(1);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoImages, setDemoImages] = useState<string[]>([]);
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [aiVideoScript, setAiVideoScript] = useState<any>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

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
    const categoryExercises = exercises.filter(ex => ex.category === category);
    
    // Limit exercises based on subscription tier
    if (!hasEliteAccess) {
      if (category === 'Cardio' && !hasPremiumAccess_Level) {
        return categoryExercises.slice(0, 2); // Basic: only 2 cardio exercises
      }
      if (category === 'Força' && !hasEliteAccess) {
        return categoryExercises.slice(0, hasBasicAccess ? 3 : 0); // Basic: 3, Premium: all, Elite: all
      }
      if (category === 'Recomendados') {
        return categoryExercises.slice(0, hasBasicAccess ? 5 : 0); // Basic: 5, Premium/Elite: all
      }
    }
    
    return categoryExercises;
  };

  const getLockedExercisesCount = (category: string) => {
    const totalExercises = exercises.filter(ex => ex.category === category).length;
    const availableExercises = getExercisesByCategory(category).length;
    return Math.max(0, totalExercises - availableExercises);
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
    setSelectedVideoExercise(exercise);
    setSelectedVideoIndex(1);
    setDemoImages([]);
    setCurrentDemoIndex(0);
    setAiVideoScript(null);
  };

  const generateAIDemo = async () => {
    if (!selectedVideoExercise) return;
    
    setIsGeneratingDemo(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-exercise-demo', {
        body: { exerciseName: selectedVideoExercise.title }
      });

      if (error) throw error;
      
      setDemoImages(data.images || []);
      setCurrentDemoIndex(0);
      
      // Auto-advance slideshow
      const interval = setInterval(() => {
        setCurrentDemoIndex(prev => (prev + 1) % (data.images?.length || 1));
      }, 1500);

      setTimeout(() => clearInterval(interval), 15000); // Stop after 15s
      
      toast({
        title: "Demo IA gerada!",
        description: "Demonstração criada com sucesso"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao gerar demonstração IA"
      });
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  const generateAIVideo = async () => {
    if (!selectedVideoExercise) return;
    
    setIsGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-exercise-video', {
        body: { exerciseName: selectedVideoExercise.title }
      });

      if (error) throw error;
      
      setAiVideoScript(data.script);
      
      toast({
        title: "Vídeo IA gerado!",
        description: "Roteiro de demonstração criado com sucesso"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao gerar vídeo IA"
      });
    } finally {
      setIsGeneratingVideo(false);
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
    <div className="min-h-screen bg-background pb-safe-bottom-nav">
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

                {/* Show locked content message for restricted exercises */}
                {getLockedExercisesCount(category) > 0 && (
                  <SubscriptionContentGate
                    requiredTier={
                      category === 'Cardio' && !hasPremiumAccess_Level ? 'premium' :
                      category === 'Força' && !hasEliteAccess ? 'elite' :
                      category === 'Recomendados' && !hasEliteAccess ? 'elite' : 'basic'
                    }
                    title={`+${getLockedExercisesCount(category)} exercícios bloqueados`}
                    description={`Faça upgrade para acessar todos os exercícios de ${category.toLowerCase()}.`}
                  />
                )}

                {getExercisesByCategory(category).length === 0 && getLockedExercisesCount(category) === 0 && (
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVideoExercise?.title}</DialogTitle>
            </DialogHeader>
            {selectedVideoExercise && (
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="video">Vídeo</TabsTrigger>
                  <TabsTrigger value="ai-demo">Demo IA</TabsTrigger>
                  <TabsTrigger value="ai-video">Vídeo IA</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="space-y-4">
                  {(() => {
                    const hasMultipleVideos = selectedVideoExercise.video_url && selectedVideoExercise.video_url_2;
                    const currentVideoUrl = selectedVideoIndex === 1 ? selectedVideoExercise.video_url : selectedVideoExercise.video_url_2;
                    const source = getEmbedSource(currentVideoUrl || '');
                    
                    return (
                      <div className="space-y-4">
                        {/* Video selector for exercises with multiple videos */}
                        {hasMultipleVideos && (
                          <div className="flex justify-center space-x-2 border-b pb-4">
                            <Button
                              variant={selectedVideoIndex === 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedVideoIndex(1)}
                            >
                              Vídeo 1
                            </Button>
                            <Button
                              variant={selectedVideoIndex === 2 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedVideoIndex(2)}
                            >
                              Vídeo 2
                            </Button>
                          </div>
                        )}
                        
                        {/* Video player */}
                        {currentVideoUrl ? (() => {
                          if (source.type === 'file') {
                            return (
                              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                  controls
                                  className="w-full h-full object-cover"
                                  poster="/api/placeholder/640/360"
                                  preload="metadata"
                                >
                                  <source src={source.src} type="video/mp4" />
                                  Seu navegador não suporta vídeos.
                                </video>
                              </div>
                            );
                          } else if (source.type === 'youtube' || source.type === 'vimeo' || source.type === 'gdrive') {
                            return (
                              <div className="space-y-4">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                  <iframe
                                    src={source.src}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(source.originalUrl, '_blank')}
                                  className="w-full"
                                >
                                  Abrir no {source.type === 'youtube' ? 'YouTube' : source.type === 'vimeo' ? 'Vimeo' : 'Google Drive'}
                                </Button>
                              </div>
                            );
                          } else {
                            return (
                              <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                  <p className="text-gray-500">Este vídeo bloqueia incorporação</p>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(currentVideoUrl, '_blank')}
                                  className="w-full"
                                >
                                  Abrir Vídeo
                                </Button>
                              </div>
                            );
                          }
                        })() : (
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Nenhum vídeo disponível</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </TabsContent>
                
                <TabsContent value="ai-demo" className="space-y-4">
                  <div className="text-center space-y-4">
                    {demoImages.length === 0 ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🤖</div>
                            <h3 className="font-semibold text-gray-800">Demo com IA</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Gere uma demonstração visual do exercício usando inteligência artificial
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={generateAIDemo}
                          disabled={isGeneratingDemo}
                          className="w-full"
                        >
                          {isGeneratingDemo ? "Gerando Demo..." : "Gerar Demo IA"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                          <img
                            src={demoImages[currentDemoIndex]}
                            alt={`Demo ${selectedVideoExercise.title} - Frame ${currentDemoIndex + 1}`}
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {demoImages.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentDemoIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentDemoIndex(prev => (prev - 1 + demoImages.length) % demoImages.length)}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentDemoIndex(prev => (prev + 1) % demoImages.length)}
                          >
                            Próximo
                          </Button>
                        </div>
                        <Button 
                          variant="secondary"
                          onClick={generateAIDemo}
                          disabled={isGeneratingDemo}
                          className="w-full"
                        >
                          {isGeneratingDemo ? "Gerando Nova Demo..." : "Gerar Nova Demo"}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="ai-video" className="space-y-4">
                  <div className="text-center space-y-4">
                    {!aiVideoScript ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎥</div>
                            <h3 className="font-semibold text-gray-800">Vídeo Gerado por IA</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Crie um roteiro detalhado do exercício usando inteligência artificial
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={generateAIVideo}
                          disabled={isGeneratingVideo}
                          className="w-full"
                        >
                          {isGeneratingVideo ? "Gerando Vídeo IA..." : "Gerar Vídeo IA"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white border rounded-lg p-6 text-left space-y-4">
                          <div className="border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-800">{aiVideoScript.title}</h3>
                            <p className="text-sm text-gray-600 mt-2">{aiVideoScript.overview}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(aiVideoScript.total_duration / 60)}:{(aiVideoScript.total_duration % 60).toString().padStart(2, '0')}
                              </span>
                              <span>{aiVideoScript.steps?.length || 0} passos</span>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800">Sequência do Exercício:</h4>
                            {aiVideoScript.steps?.map((step: any, index: number) => (
                              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800">
                                      Passo {step.step}: {step.description}
                                    </h5>
                                    <div className="text-sm text-gray-600 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {step.duration_seconds}s
                                      </span>
                                    </div>
                                    {step.focus_points && step.focus_points.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Pontos de foco:</p>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {step.focus_points.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-primary">•</span>
                                              {point}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {aiVideoScript.safety_tips && aiVideoScript.safety_tips.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Dicas de Segurança:</h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {aiVideoScript.safety_tips.map((tip: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span>•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          variant="secondary"
                          onClick={generateAIVideo}
                          disabled={isGeneratingVideo}
                          className="w-full"
                        >
                          {isGeneratingVideo ? "Gerando Novo Vídeo..." : "Gerar Novo Roteiro"}
                        </Button>
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
