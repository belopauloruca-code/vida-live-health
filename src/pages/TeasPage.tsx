import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, Droplets, Leaf, Heart, Zap, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { SubscriptionContentGate } from '@/components/ui/subscription-content-gate';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useTrial } from '@/hooks/useTrial';
import { getTeaImage } from '@/utils/recipeImages';

interface TeaCategory {
  id: string;
  name: string;
  description: string;
}

interface TeaRecipe {
  id: string;
  title: string;
  ingredients: string;
  preparation: string;
  benefits: string;
  tips: string;
  duration_min: number;
  temperature: string;
  category_id: string;
}

const categoryIcons = {
  'Termogênicos e Emagrecimento': Zap,
  'Digestivos e Pós-refeição': Leaf,
  'Calmantes e Sono': Heart,
  'Detox e Diuréticos': Droplets,
  'Imunidade e Energia': Sparkles,
  'Beleza e Antioxidantes': Sparkles,
};

const categoryColors = {
  'Termogênicos e Emagrecimento': 'bg-orange-500',
  'Digestivos e Pós-refeição': 'bg-green-500',
  'Calmantes e Sono': 'bg-purple-500',
  'Detox e Diuréticos': 'bg-blue-500',
  'Imunidade e Energia': 'bg-yellow-500',
  'Beleza e Antioxidantes': 'bg-pink-500',
};

export const TeasPage: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionTier, hasBasicAccess, hasPremiumAccess_Level, hasEliteAccess } = usePremiumAccess();
  const { isTrialActive } = useTrial();
  const [categories, setCategories] = useState<TeaCategory[]>([]);
  const [recipes, setRecipes] = useState<TeaRecipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<TeaRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResponse, recipesResponse] = await Promise.all([
        supabase.from('tea_categories').select('*').order('name'),
        supabase.from('tea_recipes').select('*').order('title')
      ]);

      if (categoriesResponse.data) setCategories(categoriesResponse.data);
      if (recipesResponse.data) setRecipes(recipesResponse.data);
    } catch (error) {
      console.error('Error loading tea data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = selectedCategory === 'all' 
    ? recipes 
    : recipes.filter(recipe => recipe.category_id === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '';
  };

  // Lógica de acesso por planos
  const getAccessibleCategories = () => {
    // Durante trial ativo, acesso completo
    if (isTrialActive) return categories;
    
    // Elite: Acesso a todas as categorias
    if (hasEliteAccess) return categories;
    
    // Premium: Acesso a 4 categorias
    if (hasPremiumAccess_Level) return categories.slice(0, 4);
    
    // Basic: Acesso a 2 categorias
    if (hasBasicAccess) return categories.slice(0, 2);
    
    // Sem plano: Acesso a 1 categoria
    return categories.slice(0, 1);
  };

  const hasAccessToCategory = (categoryId: string) => {
    if (isTrialActive) return true;
    const accessibleCategories = getAccessibleCategories();
    return accessibleCategories.some(cat => cat.id === categoryId);
  };

  const getRecipesForCategory = (categoryId: string) => {
    if (!hasAccessToCategory(categoryId)) return [];
    return recipes.filter(recipe => recipe.category_id === categoryId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando receitas de chás...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🍵 Receitas de Chás Funcionais
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubra mais de 500 receitas de chás para cada momento do seu dia. 
          Termogênicos, calmantes, digestivos e muito mais!
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-8 bg-card border rounded-lg p-1">
          <TabsTrigger value="all" className="text-xs font-medium">Todos</TabsTrigger>
          {categories.map(category => {
            const shortName = category.name.includes('Beleza') ? 'Beleza' :
                            category.name.includes('Detox') ? 'Detox' :
                            category.name.includes('Imunidade') ? 'Imunidade' :
                            category.name.includes('Termogênicos') ? 'Termogênicos' :
                            category.name.includes('Digestivos') ? 'Digestivos' :
                            category.name.includes('Calmantes') ? 'Calmantes' :
                            category.name.split(' ')[0];
            
            const hasAccess = hasAccessToCategory(category.id);
            
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className={`text-xs font-medium ${!hasAccess ? 'opacity-50' : ''}`}
                disabled={!hasAccess}
              >
                {shortName} {!hasAccess && '🔒'}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => {
              const categoryName = getCategoryName(recipe.category_id);
              const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || Leaf;
              const colorClass = categoryColors[categoryName as keyof typeof categoryColors] || 'bg-green-500';
              
              return (
                <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                      onClick={() => setSelectedRecipe(recipe)}>
                  <div className="w-full h-32 relative">
                    <img 
                      src={getTeaImage(categoryName)} 
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      <IconComponent className="h-3 w-3" />
                      {categoryName}
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.duration_min} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-4 w-4" />
                        {recipe.temperature}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.benefits}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map(category => {
          const hasAccess = hasAccessToCategory(category.id);
          const categoryRecipes = getRecipesForCategory(category.id);
          
          return (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {hasAccess ? (
                <>
                  <div className="mb-6 p-4 bg-card rounded-lg border">
                    <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryRecipes.map(recipe => {
                      const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Leaf;
                      
                      return (
                        <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                              onClick={() => setSelectedRecipe(recipe)}>
                          <div className="w-full h-32 relative">
                            <img 
                              src={getTeaImage(category.name)} 
                              alt={recipe.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                              <IconComponent className="h-3 w-3" />
                              {category.name}
                            </div>
                          </div>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {recipe.duration_min} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="h-4 w-4" />
                                {recipe.temperature}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {recipe.benefits}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              ) : (
                <SubscriptionContentGate
                  requiredTier="premium"
                  title={`Acesso Premium Necessário`}
                  description={`Esta categoria de chás está disponível apenas para assinantes Premium ou superiores. Faça upgrade do seu plano para acessar todas as receitas de ${category.name}.`}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const categoryName = getCategoryName(selectedRecipe.category_id);
                    const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || Leaf;
                    const colorClass = categoryColors[categoryName as keyof typeof categoryColors] || 'bg-green-500';
                    
                    return (
                      <>
                        <div className={`p-2 rounded-full ${colorClass} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary">
                          {categoryName}
                        </Badge>
                      </>
                    );
                  })()}
                </div>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedRecipe.duration_min} minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    <span>{selectedRecipe.temperature}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ingredientes</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedRecipe.ingredients}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Modo de Preparo</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedRecipe.preparation}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Benefícios</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedRecipe.benefits}</p>
                </div>

                {selectedRecipe.tips && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dica Especial</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-muted-foreground leading-relaxed">{selectedRecipe.tips}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="pb-20">
        <BottomNavigation />
      </div>
    </div>
  );
};