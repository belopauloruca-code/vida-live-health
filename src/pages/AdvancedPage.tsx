import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Timer, Flame, Activity, Clock, Star, Heart, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { SubscriptionContentGate } from '@/components/ui/subscription-content-gate';
import { getExerciseCardImage } from '@/utils/exerciseImages';
import { ExercisePlayerDialog } from '@/components/exercises/ExercisePlayerDialog';
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

const AdvancedPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [playerExercise, setPlayerExercise] = useState<Exercise | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [userStats, setUserStats] = useState({ completedExercises: 0, totalCalories: 0, totalTime: 0 });

  useEffect(() => {
    loadExercises();
    loadFavorites();
    loadUserStats();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('level', 'Avançado')
        .order('title');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading advanced exercises:', error);
      toast.error('Erro ao carregar exercícios avançados');
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
          return sum + Math.floor((end.getTime() - start.getTime()) / 60000);
        }
        return sum;
      }, 0) || 0;

      setUserStats({ completedExercises, totalCalories, totalTime });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
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

  const startExercise = (exercise: Exercise) => {
    setPlayerExercise(exercise);
    setPlayerOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardio': return 'bg-red-100 text-red-700';
      case 'Força': return 'bg-orange-100 text-orange-700';
      case 'Flexibilidade': return 'bg-blue-100 text-blue-700';
      case 'Yoga': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
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
        <BrandHeader 
          title="Exercícios Avançados"
          subtitle="Desafie-se com exercícios de alta intensidade"
        />
        
        <TrialBanner />

        {/* Warning Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Zona de Alta Performance</h2>
          </div>
          <p className="text-red-700 text-sm mb-3">
            ⚠️ Exercícios avançados requerem experiência prévia e boa condição física. 
            Certifique-se de fazer aquecimento adequado e considere orientação profissional.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 p-3 rounded">
              <div className="text-xl font-bold text-red-800">{userStats.completedExercises}</div>
              <div className="text-xs text-red-600">Exercícios</div>
            </div>
            <div className="bg-white/50 p-3 rounded">
              <div className="text-xl font-bold text-red-800">{userStats.totalCalories}</div>
              <div className="text-xs text-red-600">Calorias</div>
            </div>
            <div className="bg-white/50 p-3 rounded">
              <div className="text-xl font-bold text-red-800">{userStats.totalTime}</div>
              <div className="text-xs text-red-600">Minutos</div>
            </div>
          </div>
        </Card>

        <SubscriptionContentGate 
          requiredTier="premium"
          title="Exercícios Avançados - Premium"
          description="Exercícios avançados estão disponíveis apenas para assinantes premium. Desbloqueie todo o potencial do seu treino!"
        >
          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-200">
                <div className="relative">
                  {/* Exercise Image */}
                  <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden">
                    <img 
                      src={getExerciseCardImage(exercise)} 
                      alt={exercise.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Advanced Badge */}
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    AVANÇADO
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
                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      Avançado
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
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="sm"
                      disabled={playerOpen}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Desafiar-se
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {exercises.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum exercício avançado encontrado</h3>
              <p className="text-muted-foreground">
                Os exercícios avançados estão sendo preparados. Volte em breve para novos desafios!
              </p>
            </Card>
          )}
        </SubscriptionContentGate>

        {/* Exercise Player Dialog */}
        <ExercisePlayerDialog
          exercise={playerExercise}
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          onComplete={() => {
            loadUserStats();
            setPlayerExercise(null);
          }}
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AdvancedPage;