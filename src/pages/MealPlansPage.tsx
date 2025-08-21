
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap } from 'lucide-react';
import { useMealPlan } from '@/hooks/useMealPlan';
import { RecipeDialog } from '@/components/meal-plans/RecipeDialog';

export const MealPlansPage: React.FC = () => {
  const { weekMeals, isGenerating, generateMealPlan, loadExistingPlan } = useMealPlan();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  useEffect(() => {
    loadExistingPlan();
  }, []);

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsRecipeDialogOpen(true);
  };

  const getMealsForDay = (day: string) => {
    return weekMeals[day] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meus Planos</h1>
          <p className="text-gray-600">Plano semanal personalizado para você</p>
        </div>

        {/* Plan Summary */}
        <Card className="mb-6 border-green-100">
          <CardHeader>
            <CardTitle className="text-green-600">Plano Semanal Ativo</CardTitle>
            <CardDescription>
              Meta: 1.800 kcal/dia • 4 refeições • 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-green-500 hover:bg-green-600 w-full"
              onClick={generateMealPlan}
              disabled={isGenerating}
            >
              {isGenerating ? 'Gerando...' : 'Gerar Novo Plano'}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Tabs */}
        <Tabs defaultValue="Seg" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            {weekDays.map((day) => (
              <TabsTrigger key={day} value={day} className="text-xs">
                {day}
              </TabsTrigger>
            ))}
          </TabsList>

          {weekDays.map((day) => (
            <TabsContent key={day} value={day}>
              <div className="space-y-4">
                {getMealsForDay(day).length > 0 ? (
                  getMealsForDay(day).map((mealItem, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{mealItem.recipe.title}</CardTitle>
                            <CardDescription className="text-sm font-medium text-green-600">
                              {mealItem.meal_type}
                            </CardDescription>
                          </div>
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
                        </div>
                      </CardHeader>
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
                    </Card>
                  ))
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <div className="text-center text-gray-500">
                        <p>Nenhum plano gerado ainda.</p>
                        <p className="text-sm mt-2">Clique em "Gerar Novo Plano" para começar!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Subscription Notice */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">
                🔒 Planos personalizados disponíveis para assinantes Premium
              </p>
              <Button className="bg-green-500 hover:bg-green-600">
                Assinar Premium - €5/mês
              </Button>
            </div>
          </CardContent>
        </Card>
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
