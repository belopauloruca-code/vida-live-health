
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { DailyTip } from '@/components/ui/daily-tip';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap, Crown, Coffee, UtensilsCrossed, Cookie, Utensils } from 'lucide-react';
import { useEnhancedMealPlan } from '@/hooks/useEnhancedMealPlan';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useNavigate } from 'react-router-dom';
import { RecipeDialog } from '@/components/meal-plans/RecipeDialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export const MealPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    recipes,
    currentPlan,
    planItems,
    loading,
    generating,
    generateWeeklyMealPlan
  } = useEnhancedMealPlan();
  const { hasPremiumAccess } = usePremiumAccess();
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const mealTypes = ['Café', 'Almoço', 'Lanche', 'Jantar'];
  
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'Café':
        return <Coffee className="h-5 w-5 text-amber-600" />;
      case 'Almoço':
        return <UtensilsCrossed className="h-5 w-5 text-green-600" />;
      case 'Lanche':
        return <Cookie className="h-5 w-5 text-orange-600" />;
      case 'Jantar':
        return <Utensils className="h-5 w-5 text-blue-600" />;
      default:
        return <Utensils className="h-5 w-5 text-gray-600" />;
    }
  };

  // Set active tab based on current day
  useEffect(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date().getDay();
    setActiveTab(dayNames[today]);
  }, []);

  // Set up automatic day switching at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const newDay = new Date().getDay();
      setActiveTab(dayNames[newDay]);
      
      // Set up daily timer for subsequent days
      const dailyTimer = setInterval(() => {
        const currentDay = new Date().getDay();
        setActiveTab(dayNames[currentDay]);
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsRecipeDialogOpen(true);
  };

  const getMealsForDay = (dayIndex: number) => {
    const mealsForDay = planItems.filter(item => item.day_index === dayIndex);
    
    // Ordenar as refeições na ordem correta do dia
    const mealOrder = ['Café', 'Lanche', 'Almoço', 'Jantar'];
    
    return mealsForDay.sort((a, b) => {
      const orderA = mealOrder.indexOf(a.meal_type);
      const orderB = mealOrder.indexOf(b.meal_type);
      return orderA - orderB;
    });
  };

  const handleGeneratePlan = () => {
    generateWeeklyMealPlan(1800); // 1800 kcal for the week
  };

  const getWeekStartDate = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(start.setDate(diff));
  };

  const formatDateRange = () => {
    if (!currentPlan) return 'Nenhum plano selecionado';
    
    const startDate = new Date(currentPlan.start_date);
    const endDate = new Date(currentPlan.end_date);
    
    return `${format(startDate, 'dd/MM', { locale: pt })} - ${format(endDate, 'dd/MM/yyyy', { locale: pt })}`;
  };

  return (
    <div className="min-h-screen bg-background pb-safe-bottom-nav">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <BrandHeader 
            title="Meus Planos"
            subtitle="Plano semanal personalizado para você"
          />
        </div>

        {/* Trial Banner */}
        <TrialBanner />
        
        {/* Daily Tip */}
        <div className="mb-6">
          <DailyTip />
        </div>


        {/* Plan Summary */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-primary">Plano Semanal</CardTitle>
            </div>
            <CardDescription>
              Meta: {currentPlan?.daily_kcal || 1800} kcal/dia • {currentPlan?.meals_per_day || 4} refeições • 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full"
                onClick={handleGeneratePlan}
                disabled={generating || !hasPremiumAccess}
                variant={!hasPremiumAccess ? "outline" : "default"}
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Gerando plano...
                  </>
                ) : (
                  <>
                    {!hasPremiumAccess && <Crown className="w-4 h-4 mr-2" />}
                    {!hasPremiumAccess ? 'Premium Necessário' : 'Gerar Novo Plano Semanal'}
                  </>
                )}
              </Button>
              
              {!hasPremiumAccess && (
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Acesso premium necessário para gerar planos de refeição
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/subscription')}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Ativar Premium
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tabs */}
        {currentPlan && planItems.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              {weekDays.map((day, index) => (
                <TabsTrigger key={index} value={day} className="text-xs">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>

            {weekDays.map((day, dayIndex) => (
              <TabsContent key={dayIndex} value={day}>
                <div className="space-y-4">
                  {getMealsForDay(dayIndex).length > 0 ? (
                    getMealsForDay(dayIndex).map((mealItem, index) => (
                        <Card key={index} className="border-gray-200 overflow-hidden">
                        {/* Recipe Image */}
                        {mealItem.recipe?.image_url && (
                          <div className="w-full h-32 relative">
                            <img 
                              src={mealItem.recipe.image_url} 
                              alt={mealItem.recipe.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                              {getMealIcon(mealItem.meal_type)}
                              {mealItem.meal_type}
                            </div>
                          </div>
                        )}
                        
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{mealItem.recipe?.title || 'Receita não encontrada'}</CardTitle>
                              {!mealItem.recipe?.image_url && (
                                <div className="flex items-center gap-2 mt-1">
                                  {getMealIcon(mealItem.meal_type)}
                                  <CardDescription className="text-sm font-medium">
                                    {mealItem.meal_type}
                                  </CardDescription>
                                </div>
                              )}
                            </div>
                            {mealItem.recipe && (
                              <div className="text-right">
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                  <Zap className="h-4 w-4 mr-1" />
                                  {mealItem.recipe.kcal} kcal
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {mealItem.recipe.duration_min} min
                                </div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        {mealItem.recipe && (
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-3">
                              <strong>Ingredientes:</strong> {mealItem.recipe.ingredients}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRecipe(mealItem.recipe)}
                            >
                              Ver Receita
                            </Button>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card className="border-border">
                      <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                          <p>Nenhuma refeição planejada para {day}.</p>
                          <p className="text-sm mt-2">Gere um novo plano para ver as refeições!</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Nenhum plano de refeições ativo</p>
                <p className="text-sm">Gere um plano semanal para começar a planejar suas refeições!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <RecipeDialog
        recipe={selectedRecipe}
        isOpen={isRecipeDialogOpen}
        onClose={() => setIsRecipeDialogOpen(false)}
      />
      
      <BottomNavigation />
    </div>
  );
};
