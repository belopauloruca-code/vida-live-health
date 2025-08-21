import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

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

export const useEnhancedMealPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [weekMeals, setWeekMeals] = useState<Record<string, MealPlanItem[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealPlanDates, setMealPlanDates] = useState<Date[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasPremiumAccess } = usePremiumAccess();

  const generateWeeklyMealPlan = async (startDate: Date) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar um plano.",
        variant: "destructive",
      });
      return;
    }

    if (!hasPremiumAccess) {
      toast({
        title: "🔒 Acesso Premium Necessário",
        description: "Assine para gerar planos de refeição personalizados.",
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
      if (!recipes || recipes.length === 0) {
        toast({
          title: "Nenhuma Receita Encontrada",
          description: "É necessário adicionar receitas antes de gerar um plano de refeições",
          variant: "destructive",
        });
        return;
      }

      // Agrupar receitas por tipo
      const mealTypes = ['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'];
      const recipesByType = {
        'Café da Manhã': recipes?.filter(r => r.meal_type === 'Café da Manhã') || [],
        'Almoço': recipes?.filter(r => r.meal_type === 'Almoço') || [],
        'Jantar': recipes?.filter(r => r.meal_type === 'Jantar') || [],
        'Lanche': recipes?.filter(r => r.meal_type === 'Lanche') || [],
      };

      // Verificar se há receitas suficientes para cada tipo de refeição
      const insufficientMealTypes = mealTypes.filter(mealType => 
        recipesByType[mealType as keyof typeof recipesByType].length < 7
      );

      if (insufficientMealTypes.length > 0) {
        toast({
          title: "Receitas Insuficientes",
          description: `Adicione mais receitas para: ${insufficientMealTypes.join(', ')}. São necessárias pelo menos 7 receitas de cada tipo.`,
          variant: "destructive",
        });
        return;
      }

      // Embaralhar as receitas para variedade
      Object.keys(recipesByType).forEach(type => {
        const recipes = recipesByType[type as keyof typeof recipesByType];
        for (let i = recipes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
        }
      });

      const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

      // Criar o plano de refeições
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

      // Gerar itens do plano sem repetições
      const planItems = [];
      const newWeekMeals: Record<string, MealPlanItem[]> = {};
      const usedRecipes = new Set<string>();

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = weekDays[dayIndex];
        newWeekMeals[dayName] = [];

        for (const mealType of mealTypes) {
          const availableRecipes = recipesByType[mealType as keyof typeof recipesByType]
            .filter(recipe => !usedRecipes.has(recipe.id));
          
          if (availableRecipes.length > 0) {
            const selectedRecipe = availableRecipes[0];
            usedRecipes.add(selectedRecipe.id);
            
            planItems.push({
              meal_plan_id: mealPlan.id,
              recipe_id: selectedRecipe.id,
              day_index: dayIndex,
              meal_type: mealType,
            });

            newWeekMeals[dayName].push({
              recipe: selectedRecipe,
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
      await loadMealPlanDates();
      setSelectedDate(startDate);

      toast({
        title: "Plano gerado com sucesso! 🎉",
        description: `Plano semanal criado com ${usedRecipes.size} receitas únicas.`,
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

  const loadMealPlanForWeek = async (date: Date) => {
    if (!user) return;

    // Get start of week (Monday)
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

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
        .gte('start_date', startOfWeek.toISOString().split('T')[0])
        .lte('start_date', endOfWeek.toISOString().split('T')[0])
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
      } else {
        // Clear meals if no plan found
        const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const emptyMeals: Record<string, MealPlanItem[]> = {};
        weekDays.forEach(day => {
          emptyMeals[day] = [];
        });
        setWeekMeals(emptyMeals);
      }
    } catch (error) {
      console.error('Error loading meal plan for week:', error);
    }
  };

  const loadMealPlanDates = async () => {
    if (!user) return;

    try {
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('start_date, end_date')
        .eq('user_id', user.id);

      if (mealPlans) {
        const dates: Date[] = [];
        mealPlans.forEach(plan => {
          const start = new Date(plan.start_date);
          const end = new Date(plan.end_date);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
          }
        });
        setMealPlanDates(dates);
      }
    } catch (error) {
      console.error('Error loading meal plan dates:', error);
    }
  };

  const getWeekStartDate = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return startOfWeek;
  };

  const getDayOfWeek = (date: Date) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return weekDays[date.getDay()];
  };

  return {
    weekMeals,
    isGenerating,
    selectedDate,
    mealPlanDates,
    generateWeeklyMealPlan,
    loadMealPlanForWeek,
    loadMealPlanDates,
    setSelectedDate,
    getWeekStartDate,
    getDayOfWeek,
  };
};