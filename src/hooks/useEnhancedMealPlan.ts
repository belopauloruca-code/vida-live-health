
import { useState, useEffect } from 'react';
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
  instructions: string;
}

interface MealPlan {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  daily_kcal: number;
  meals_per_day: number;
  created_at?: string;
}

interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  day_index: number;
  meal_type: string;
  recipe_id: string;
  recipe?: Recipe;
}

export const useEnhancedMealPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [planItems, setPlanItems] = useState<MealPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Normalizar meal_type para compatibilidade com o banco
  const normalizeMealType = (mealType: string): string => {
    const normalizations: { [key: string]: string } = {
      'Café da Manhã': 'Café',
      'cafe da manha': 'Café',
      'breakfast': 'Café'
    };
    
    return normalizations[mealType] || mealType;
  };

  useEffect(() => {
    if (user) {
      loadRecipes();
      loadCurrentPlan();
      subscribeToRealTimeUpdates();
    }
  }, [user]);

  const subscribeToRealTimeUpdates = () => {
    if (!user) return;

    // Subscribe to meal_plans changes
    const planSubscription = supabase
      .channel('meal_plans_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meal_plans',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          console.log('Meal plan changed, reloading...');
          loadCurrentPlan();
        }
      )
      .subscribe();

    // Subscribe to meal_plan_items changes
    const itemsSubscription = supabase
      .channel('meal_plan_items_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meal_plan_items'
        }, 
        () => {
          console.log('Meal plan items changed, reloading...');
          if (currentPlan) {
            loadPlanItems(currentPlan.id);
          }
        }
      )
      .subscribe();

    return () => {
      planSubscription.unsubscribe();
      itemsSubscription.unsubscribe();
    };
  };

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('meal_type', { ascending: true });

      if (error) throw error;

      console.log('Loaded recipes:', data);
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Erro ao carregar receitas",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    }
  };

  const loadCurrentPlan = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: plans, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (plans && plans.length > 0) {
        const plan = plans[0];
        setCurrentPlan(plan);
        await loadPlanItems(plan.id);
      } else {
        setCurrentPlan(null);
        setPlanItems([]);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      toast({
        title: "Erro ao carregar plano",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPlanItems = async (planId: string) => {
    try {
      const { data: items, error } = await supabase
        .from('meal_plan_items')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('meal_plan_id', planId)
        .order('day_index', { ascending: true });

      if (error) throw error;

      console.log('Loaded plan items:', items);
      setPlanItems(items || []);
    } catch (error) {
      console.error('Error loading plan items:', error);
      toast({
        title: "Erro ao carregar itens do plano",
        description: "Tente recarregar a página.",
        variant: "destructive",
      });
    }
  };

  const generateMealPlan = async (dailyKcal: number, days: number = 7) => {
    if (!user) return;

    try {
      setGenerating(true);
      
      console.log('Starting meal plan generation...', { dailyKcal, days, recipesCount: recipes.length });
      
      if (recipes.length === 0) {
        toast({
          title: "Nenhuma receita disponível",
          description: "Adicione algumas receitas antes de gerar um plano.",
          variant: "destructive",
        });
        return;
      }

      // Delete existing plan if any
      if (currentPlan) {
        await supabase.from('meal_plans').delete().eq('id', currentPlan.id);
      }

      // Create new meal plan
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
          daily_kcal: dailyKcal,
          meals_per_day: 4
        })
        .select()
        .single();

      if (planError) throw planError;

      console.log('Created meal plan:', newPlan);

      // Generate meal plan items
      const mealTypes = ['Café', 'Almoço', 'Lanche', 'Jantar'];
      const kcalPerMeal = Math.floor(dailyKcal / 4);
      
      const planItems: Omit<MealPlanItem, 'id'>[] = [];
      let repeatedRecipeCount = 0;

      for (let dayIndex = 0; dayIndex < days; dayIndex++) {
        for (const mealType of mealTypes) {
          // Try to find a recipe for this meal type
          let availableRecipes = recipes.filter(r => normalizeMealType(r.meal_type) === mealType);
          
          // If no recipes for this meal type, use any available recipe
          if (availableRecipes.length === 0) {
            availableRecipes = recipes;
            repeatedRecipeCount++;
          }
          
          // Select a recipe (random or based on calories)
          const targetKcal = kcalPerMeal;
          let selectedRecipe = availableRecipes.find(r => Math.abs(r.kcal - targetKcal) < 100);
          
          if (!selectedRecipe) {
            // If no recipe close to target calories, pick any available
            selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            repeatedRecipeCount++;
          }

          if (selectedRecipe) {
            planItems.push({
              meal_plan_id: newPlan.id,
              day_index: dayIndex,
              meal_type: normalizeMealType(mealType),
              recipe_id: selectedRecipe.id
            });
          }
        }
      }

      console.log('Generated plan items:', planItems);

      // Insert all plan items
      if (planItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(planItems);

        if (itemsError) {
          console.error('Error inserting plan items:', itemsError);
          throw itemsError;
        }
      }

      // Show success message
      let successMessage = "Plano de refeições gerado com sucesso!";
      if (repeatedRecipeCount > 0) {
        successMessage += ` (${repeatedRecipeCount} receitas foram repetidas devido à disponibilidade limitada)`;
      }

      toast({
        title: "Sucesso!",
        description: successMessage,
      });

      // Reload the current plan
      await loadCurrentPlan();
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return {
    recipes,
    currentPlan,
    planItems,
    loading,
    generating,
    generateMealPlan,
    loadCurrentPlan
  };
};
