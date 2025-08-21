import { useState, useEffect } from 'react';
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

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('meal-plans-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meal_plans',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('Meal plan updated, reloading...');
        loadMealPlanForWeek(selectedDate);
        loadMealPlanDates();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meal_plan_items'
      }, () => {
        console.log('Meal plan items updated, reloading...');
        loadMealPlanForWeek(selectedDate);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate]);

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

      // Para tipos sem receitas, usar todas as receitas como fallback
      const finalRecipesByType = { ...recipesByType };
      Object.keys(finalRecipesByType).forEach(mealType => {
        if (finalRecipesByType[mealType as keyof typeof finalRecipesByType].length === 0) {
          finalRecipesByType[mealType as keyof typeof finalRecipesByType] = [...recipes];
        }
      });

      // Embaralhar as receitas para variedade
      Object.keys(finalRecipesByType).forEach(type => {
        const recipes = finalRecipesByType[type as keyof typeof finalRecipesByType];
        for (let i = recipes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
        }
      });

      const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

      // Remover plano existente da semana se houver
      const weekStart = startDate.toISOString().split('T')[0];
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const weekEnd = endDate.toISOString().split('T')[0];

      const { data: existingPlans } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', user.id)
        .gte('start_date', weekStart)
        .lte('start_date', weekEnd);

      if (existingPlans && existingPlans.length > 0) {
        // Deletar itens dos planos existentes
        await supabase
          .from('meal_plan_items')
          .delete()
          .in('meal_plan_id', existingPlans.map(p => p.id));
        
        // Deletar os planos
        await supabase
          .from('meal_plans')
          .delete()
          .in('id', existingPlans.map(p => p.id));
      }

      // Criar novo plano de refeições
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          start_date: weekStart,
          end_date: weekEnd,
          daily_kcal: 1800,
          meals_per_day: 4,
        })
        .select()
        .single();

      if (mealPlanError) throw mealPlanError;

      // Gerar itens do plano com repetição quando necessário
      const planItems = [];
      const newWeekMeals: Record<string, MealPlanItem[]> = {};
      let hasRepeatedRecipes = false;

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayName = weekDays[dayIndex];
        newWeekMeals[dayName] = [];

        for (const mealType of mealTypes) {
          const availableRecipes = finalRecipesByType[mealType as keyof typeof finalRecipesByType];
          
          if (availableRecipes.length > 0) {
            // Usar índice cíclico para permitir repetição
            const recipeIndex = dayIndex % availableRecipes.length;
            const selectedRecipe = availableRecipes[recipeIndex];
            
            // Verificar se há repetição (mais de 7 dias e menos receitas que dias)
            if (availableRecipes.length < 7) {
              hasRepeatedRecipes = true;
            }
            
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

      const successMessage = hasRepeatedRecipes 
        ? "Plano gerado! Algumas receitas foram repetidas para completar a semana."
        : `Plano semanal criado com ${planItems.length} receitas.`;

      toast({
        title: "Plano gerado com sucesso! 🎉",
        description: successMessage,
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
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

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