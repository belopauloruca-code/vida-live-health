import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Timer, Flame, Activity, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
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

const FavoritesPage: React.FC = () => {
  const [favoriteExercises, setFavoriteExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerExercise, setPlayerExercise] = useState<Exercise | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    loadFavoriteExercises();
  }, []);

  const loadFavoriteExercises = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setLoading(false);
        return;
      }

      // First get favorite exercise IDs
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('exercise_favorites')
        .select('exercise_id')
        .eq('user_id', user.user.id);

      if (favoriteError) throw favoriteError;

      if (!favoriteData || favoriteData.length === 0) {
        setFavoriteExercises([]);
        setLoading(false);
        return;
      }

      // Then get the exercises details
      const exerciseIds = favoriteData.map(fav => fav.exercise_id);
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

      if (exerciseError) throw exerciseError;
      
      setFavoriteExercises(exerciseData || []);
    } catch (error) {
      console.error('Error loading favorite exercises:', error);
      toast.error('Erro ao carregar exercícios favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (exerciseId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Faça login para gerenciar favoritos');
        return;
      }

      const { error } = await supabase
        .from('exercise_favorites')
        .delete()
        .eq('user_id', user.user.id)
        .eq('exercise_id', exerciseId);

      if (error) throw error;
      
      setFavoriteExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      toast.success('Exercício removido dos favoritos');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const startExercise = (exercise: Exercise) => {
    setPlayerExercise(exercise);
    setPlayerOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'default';
      case 'Intermediário': return 'secondary';
      case 'Avançado': return 'destructive';
      default: return 'outline';
    }
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
          title="Exercícios Favoritos"
          subtitle="Seus exercícios favoritos em um só lugar"
        />
        
        <TrialBanner />

        {/* Stats Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800">Seus Favoritos</h2>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            Você tem {favoriteExercises.length} exercício{favoriteExercises.length !== 1 ? 's' : ''} favoritado{favoriteExercises.length !== 1 ? 's' : ''}.
          </p>
          {favoriteExercises.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {['Cardio', 'Força', 'Flexibilidade', 'Yoga'].map(category => {
                const count = favoriteExercises.filter(ex => ex.category === category).length;
                if (count === 0) return null;
                return (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}: {count}
                  </Badge>
                );
              })}
            </div>
          )}
        </Card>

        {/* Exercise Grid */}
        {favoriteExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {/* Exercise Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
                    <img 
                      src={getExerciseCardImage(exercise)} 
                      alt={exercise.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Remove Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={() => removeFavorite(exercise.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(exercise.category)}`}>
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
                      disabled={playerOpen}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício favorito</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não possui exercícios favoritos. Navegue pela biblioteca de exercícios e adicione seus favoritos!
            </p>
            <Button onClick={() => window.location.href = '/exercises'}>
              Explorar Exercícios
            </Button>
          </Card>
        )}

        {/* Exercise Player Dialog */}
        <ExercisePlayerDialog
          exercise={playerExercise}
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          onComplete={() => {
            setPlayerExercise(null);
          }}
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default FavoritesPage;