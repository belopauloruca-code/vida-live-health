import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Clock, Droplets, Leaf, Heart, Zap, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => {
              const categoryName = getCategoryName(recipe.category_id);
              const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || Leaf;
              const colorClass = categoryColors[categoryName as keyof typeof categoryColors] || 'bg-green-500';
              
              return (
                <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedRecipe(recipe)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded-full ${colorClass} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {categoryName}
                      </Badge>
                    </div>
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

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            <div className="mb-6 p-4 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => {
                const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Leaf;
                const colorClass = categoryColors[category.name as keyof typeof categoryColors] || 'bg-green-500';
                
                return (
                  <Card key={recipe.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedRecipe(recipe)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded-full ${colorClass} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>
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
        ))}
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
    </div>
  );
};