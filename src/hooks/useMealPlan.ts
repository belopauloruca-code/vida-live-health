
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface Recipe {
  id: string;
  title: string;
  meal_type: string;
  kcal: number;
  duration_min: number;
  ingredients: string;
  instructions?: string;
}

interface MealPlanItem {
  recipe: Recipe;
  day_index: number;
  meal_type: string;
}

export const useMealPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [weekMeals, setWeekMeals] = useState<Record<string, MealPlanItem[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const generateMealPlan = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar um plano.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Buscar todas as receitas
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*');

      if (recipesError) throw recipesError;

      // Agrupar receitas por tipo
      const recipesByType = {
        'Café': recipes?.filter(r => r.meal_type === 'Café') || [],
        'Almoço': recipes?.filter(r => r.meal_type === 'Almoço') || [],
        'Jantar': recipes?.filter(r => r.meal_type === 'Jantar') || [],
        'Lanche': recipes?.filter(r => r.meal_type === 'Lanche') || [],
      };

      const mealTypes = ['Café', 'Almoço', 'Jantar', 'Lanche'];
      const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

      // Criar o plano de refeições
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          daily_kcal: 1800,
          meals_per_day: 4,
        })
        .select()
        .single();

      if (mealPlanError) throw mealPlanError;

      // Gerar itens do plano
      const planItems = [];
      const newWeekMeals: Record<string, MealPlanItem[]> = {};

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = weekDays[dayIndex];
        newWeekMeals[dayName] = [];

        for (const mealType of mealTypes) {
          const availableRecipes = recipesByType[mealType as keyof typeof recipesByType];
          if (availableRecipes.length > 0) {
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            
            planItems.push({
              meal_plan_id: mealPlan.id,
              recipe_id: randomRecipe.id,
              day_index: dayIndex,
              meal_type: mealType,
            });

            newWeekMeals[dayName].push({
              recipe: randomRecipe,
              day_index: dayIndex,
              meal_type: mealType,
            });
          }
        }
      }

      // Inserir itens no banco
      const { error: itemsError } = await supabase
        .from('meal_plan_items')
        .insert(planItems);

      if (itemsError) throw itemsError;

      setWeekMeals(newWeekMeals);

      toast({
        title: "Plano gerado com sucesso! 🎉",
        description: "Seu novo plano semanal está pronto.",
      });

    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExistingPlan = async () => {
    if (!user) return;

    try {
      const { data: mealPlan } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            day_index,
            meal_type,
            recipes (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (mealPlan?.meal_plan_items) {
        const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const newWeekMeals: Record<string, MealPlanItem[]> = {};

        weekDays.forEach(day => {
          newWeekMeals[day] = [];
        });

        mealPlan.meal_plan_items.forEach((item: any) => {
          const dayName = weekDays[item.day_index];
          if (item.recipes) {
            newWeekMeals[dayName].push({
              recipe: item.recipes,
              day_index: item.day_index,
              meal_type: item.meal_type,
            });
          }
        });

        setWeekMeals(newWeekMeals);
      }
    } catch (error) {
      console.error('Error loading existing plan:', error);
    }
  };

  return {
    weekMeals,
    isGenerating,
    generateMealPlan,
    loadExistingPlan,
  };
};
