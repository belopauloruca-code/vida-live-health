
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Clock, Zap } from 'lucide-react';

export const MealPlansPage: React.FC = () => {
  const [currentWeek] = useState(0);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  // Sample meal data
  const sampleMeals = {
    'Seg': [
      { type: 'Café', name: 'Aveia com Frutas', kcal: 320, time: 10, ingredients: 'Aveia, banana, morangos, mel' },
      { type: 'Almoço', name: 'Frango Grelhado', kcal: 450, time: 25, ingredients: 'Frango, arroz integral, brócolis' },
      { type: 'Jantar', name: 'Salmão com Legumes', kcal: 380, time: 20, ingredients: 'Salmão, batata doce, aspargos' },
      { type: 'Lanche', name: 'Iogurte com Granola', kcal: 180, time: 5, ingredients: 'Iogurte grego, granola, mel' },
    ],
    'Ter': [
      { type: 'Café', name: 'Smoothie Verde', kcal: 280, time: 8, ingredients: 'Espinafre, banana, maçã, água de coco' },
      { type: 'Almoço', name: 'Quinoa com Vegetais', kcal: 420, time: 30, ingredients: 'Quinoa, abobrinha, cenoura, grão-de-bico' },
      { type: 'Jantar', name: 'Peito de Peru', kcal: 350, time: 15, ingredients: 'Peru, batata inglesa, vagem' },
      { type: 'Lanche', name: 'Frutas Secas', kcal: 150, time: 2, ingredients: 'Amêndoas, castanhas, damascos' },
    ],
    // Add more days...
  };

  const getMealsForDay = (day: string) => {
    return sampleMeals[day as keyof typeof sampleMeals] || [];
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
            <Button className="bg-green-500 hover:bg-green-600 w-full">
              Gerar Novo Plano
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
                {getMealsForDay(day).map((meal, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{meal.name}</CardTitle>
                          <CardDescription className="text-sm font-medium text-green-600">
                            {meal.type}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Zap className="h-4 w-4 mr-1" />
                            {meal.kcal} kcal
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {meal.time} min
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Ingredientes:</strong> {meal.ingredients}
                      </p>
                      <Button variant="outline" size="sm">
                        Ver Receita
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
      
      <BottomNavigation />
    </div>
  );
};
