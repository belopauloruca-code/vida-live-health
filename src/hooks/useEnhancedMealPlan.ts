
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
      checkAndGenerateWeeklyPlan();
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
         (payload) => {
           console.log('Meal plan items changed, reloading...', payload);
           if (currentPlan && payload.new && (payload.new as any).meal_plan_id === currentPlan.id) {
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
        .order('start_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase error loading meal plan:', error);
        throw error;
      }

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
      // Only show error toast if it's not just "no plans found"
      if (error instanceof Error && !error.message.includes('No rows')) {
        const errorMessage = error.message || "Tente recarregar a página.";
        toast({
          title: "Erro ao carregar plano",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

      if (error) {
        console.error('Supabase error loading plan items:', error);
        throw error;
      }

      console.log('Loaded plan items:', items);
      setPlanItems(items || []);
    } catch (error) {
      console.error('Error loading plan items:', error);
      const errorMessage = error instanceof Error ? error.message : "Tente recarregar a página.";
      toast({
        title: "Erro ao carregar itens do plano",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Helper functions for week calculation
  const getWeekStart = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  const getWeekEnd = (date: Date): Date => {
    const start = getWeekStart(new Date(date));
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const checkAndGenerateWeeklyPlan = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const today = new Date();
      const currentWeekStart = getWeekStart(new Date(today));
      const currentWeekEnd = getWeekEnd(new Date(today));
      
      // Check if there's a valid meal plan for current week
      const { data: plans, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .lte('start_date', today.toISOString().split('T')[0])
        .gte('end_date', today.toISOString().split('T')[0])
        .order('start_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking meal plan:', error);
        return;
      }

      if (plans && plans.length > 0) {
        // Valid plan exists
        setCurrentPlan(plans[0]);
        await loadPlanItems(plans[0].id);
      } else {
        // No valid plan, generate one automatically
        console.log('No valid meal plan found, generating weekly plan...');
        await generateWeeklyMealPlan();
      }
    } catch (error) {
      console.error('Error in checkAndGenerateWeeklyPlan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyMealPlan = async (dailyKcal: number = 2000) => {
    if (!user) return;
    
    try {
      setGenerating(true);
      
      // Delete existing meal plans for this user
      await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', user.id);

      // Create new weekly meal plan (Monday to Sunday)
      const today = new Date();
      const startDate = getWeekStart(new Date(today));
      const endDate = getWeekEnd(new Date(today));

      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          daily_kcal: dailyKcal,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          meals_per_day: 4
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating meal plan:', planError);
        return;
      }

      // Generate meal plan items for 7 days
      const mealTypes = ['Café', 'Almoço', 'Lanche', 'Jantar'];
      const targetKcalPerMeal = Math.floor(dailyKcal / 4);
      const tolerance = 100; // ±100 kcal tolerance

      const planItems = [];

      for (let day = 0; day < 7; day++) {
        for (const mealType of mealTypes) {
          // Get recipes for this meal type within calorie range
          const { data: availableRecipes } = await supabase
            .from('recipes')
            .select('*')
            .eq('meal_type', normalizeMealType(mealType))
            .gte('kcal', targetKcalPerMeal - tolerance)
            .lte('kcal', targetKcalPerMeal + tolerance);

          if (availableRecipes && availableRecipes.length > 0) {
            // Pick a random recipe
            const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            
            planItems.push({
              meal_plan_id: newPlan.id,
              day_index: day,
              meal_type: mealType,
              recipe_id: randomRecipe.id
            });
          }
        }
      }

      // Insert all plan items
      if (planItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(planItems);

        if (itemsError) {
          console.error('Error creating meal plan items:', itemsError);
          return;
        }
      }

      // Set the new plan and load its items
      setCurrentPlan(newPlan);
      await loadPlanItems(newPlan.id);
      
    } catch (error) {
      console.error('Error generating weekly meal plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateMealPlan = async (dailyKcal: number, days: number = 7) => {
    await generateWeeklyMealPlan(dailyKcal);
  };

  return {
    recipes,
    currentPlan,
    planItems,
    loading,
    generating,
    generateMealPlan,
    generateWeeklyMealPlan,
    loadCurrentPlan,
    checkAndGenerateWeeklyPlan
  };
};
