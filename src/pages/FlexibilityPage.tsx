import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Timer, Flame, Activity, Clock, Star, Heart } from 'lucide-react';
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

const FlexibilityPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [playerExercise, setPlayerExercise] = useState<Exercise | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    loadExercises();
    loadFavorites();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', 'Flexibilidade')
        .order('title');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading flexibility exercises:', error);
      toast.error('Erro ao carregar exercícios de flexibilidade');
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'default';
      case 'Intermediário': return 'secondary';
      case 'Avançado': return 'destructive';
      default: return 'outline';
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
          title="Exercícios de Flexibilidade"
          subtitle="Melhore sua mobilidade e flexibilidade com exercícios específicos"
        />
        
        <TrialBanner />

        {/* Info Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-800">Flexibilidade & Mobilidade</h2>
          </div>
          <p className="text-blue-700 text-sm">
            A flexibilidade é fundamental para a saúde das articulações, prevenção de lesões e melhora da qualidade de vida. 
            Pratique estes exercícios regularmente para manter seu corpo flexível e móvel.
          </p>
        </Card>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Exercise Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                  <img 
                    src={getExerciseCardImage(exercise)} 
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
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Flexibilidade
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

        {exercises.length === 0 && !loading && (
          <Card className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground">
              Os exercícios de flexibilidade estão sendo preparados. Volte em breve!
            </p>
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

export default FlexibilityPage;