
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap, Calendar as CalendarIcon, Crown } from 'lucide-react';
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
    generateMealPlan,
    loadCurrentPlan
  } = useEnhancedMealPlan();
  const { hasPremiumAccess } = usePremiumAccess();
  
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const mealTypes = ['Café', 'Almoço', 'Lanche', 'Jantar'];

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsRecipeDialogOpen(true);
  };

  const getMealsForDay = (dayIndex: number) => {
    return planItems.filter(item => item.day_index === dayIndex);
  };

  const handleGeneratePlan = () => {
    generateMealPlan(1800, 7); // 1800 kcal por 7 dias
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
    <div className="min-h-screen bg-background pb-20">
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

        {/* Calendar Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle>Plano Atual</CardTitle>
            </div>
            <CardDescription>
              {currentPlan ? `Plano ativo: ${formatDateRange()}` : 'Nenhum plano ativo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={{
                hasPlan: (date) => currentPlan && 
                  date >= new Date(currentPlan.start_date) && 
                  date <= new Date(currentPlan.end_date)
              }}
              modifiersStyles={{
                hasPlan: { 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '6px'
                }
              }}
              className="rounded-md border w-fit mx-auto"
            />
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span>Com plano</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded border border-border"></div>
                  <span>Sem plano</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              {weekDays.map((day, index) => (
                <TabsTrigger key={index} value={index.toString()} className="text-xs">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>

            {weekDays.map((day, dayIndex) => (
              <TabsContent key={dayIndex} value={dayIndex.toString()}>
                <div className="space-y-4">
                  {getMealsForDay(dayIndex).length > 0 ? (
                    getMealsForDay(dayIndex).map((mealItem, index) => (
                      <Card key={index} className="border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{mealItem.recipe?.title || 'Receita não encontrada'}</CardTitle>
                              <CardDescription className="text-sm font-medium text-green-600">
                                {mealItem.meal_type}
                              </CardDescription>
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
