import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Utensils, Activity, Video } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  // Recipe form state
  const [recipeForm, setRecipeForm] = useState({
    title: '',
    meal_type: 'Café',
    kcal: '',
    duration_min: '',
    ingredients: '',
    instructions: '',
  });

  // Exercise form state
  const [exerciseForm, setExerciseForm] = useState({
    title: '',
    category: 'Recomendados',
    duration_min: '',
    kcal_est: '',
    level: 'Iniciante',
    muscles: '',
    video_url: '',
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [recipesResponse, exercisesResponse] = await Promise.all([
        supabase.from('recipes').select('*').order('created_at', { ascending: false }),
        supabase.from('exercises').select('*').order('category', { ascending: true })
      ]);

      setRecipes(recipesResponse.data || []);
      setExercises(exercisesResponse.data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    try {
      const data = {
        ...recipeForm,
        kcal: parseInt(recipeForm.kcal),
        duration_min: parseInt(recipeForm.duration_min),
      };

      if (editingRecipe) {
        await supabase
          .from('recipes')
          .update(data)
          .eq('id', editingRecipe.id);
        toast({ title: "Receita atualizada!" });
      } else {
        await supabase
          .from('recipes')
          .insert(data);
        toast({ title: "Receita criada!" });
      }

      resetRecipeForm();
      loadContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const saveExercise = async () => {
    try {
      const data = {
        ...exerciseForm,
        duration_min: parseInt(exerciseForm.duration_min),
        kcal_est: parseInt(exerciseForm.kcal_est),
        video_url: exerciseForm.video_url || null,
      };

      if (editingExercise) {
        await supabase
          .from('exercises')
          .update(data)
          .eq('id', editingExercise.id);
        toast({ title: "Exercício atualizado!" });
      } else {
        await supabase
          .from('exercises')
          .insert(data);
        toast({ title: "Exercício criado!" });
      }

      resetExerciseForm();
      loadContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    try {
      await supabase.from('recipes').delete().eq('id', id);
      toast({ title: "Receita excluída!" });
      loadContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const deleteExercise = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;
    
    try {
      await supabase.from('exercises').delete().eq('id', id);
      toast({ title: "Exercício excluído!" });
      loadContent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const editRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
    setRecipeForm({
      title: recipe.title,
      meal_type: recipe.meal_type,
      kcal: recipe.kcal.toString(),
      duration_min: recipe.duration_min.toString(),
      ingredients: recipe.ingredients,
      instructions: recipe.instructions || '',
    });
  };

  const editExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setExerciseForm({
      title: exercise.title,
      category: exercise.category,
      duration_min: exercise.duration_min.toString(),
      kcal_est: exercise.kcal_est.toString(),
      level: exercise.level,
      muscles: exercise.muscles || '',
      video_url: exercise.video_url || '',
    });
  };

  const resetRecipeForm = () => {
    setEditingRecipe(null);
    setRecipeForm({
      title: '',
      meal_type: 'Café',
      kcal: '',
      duration_min: '',
      ingredients: '',
      instructions: '',
    });
  };

  const resetExerciseForm = () => {
    setEditingExercise(null);
    setExerciseForm({
      title: '',
      category: 'Recomendados',
      duration_min: '',
      kcal_est: '',
      level: 'Iniciante',
      muscles: '',
      video_url: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Conteúdo</h1>
        <p className="text-gray-600">Administre receitas, exercícios e outros conteúdos</p>
      </div>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes">Receitas</TabsTrigger>
          <TabsTrigger value="exercises">Exercícios</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipe Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2" />
                  {editingRecipe ? 'Editar Receita' : 'Nova Receita'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipe-title">Título</Label>
                  <Input
                    id="recipe-title"
                    value={recipeForm.title}
                    onChange={(e) => setRecipeForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome da receita"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meal-type">Tipo de Refeição</Label>
                    <Select value={recipeForm.meal_type} onValueChange={(value) => setRecipeForm(prev => ({ ...prev, meal_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Café">Café</SelectItem>
                        <SelectItem value="Almoço">Almoço</SelectItem>
                        <SelectItem value="Jantar">Jantar</SelectItem>
                        <SelectItem value="Lanche">Lanche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="recipe-kcal">Calorias</Label>
                    <Input
                      id="recipe-kcal"
                      type="number"
                      value={recipeForm.kcal}
                      onChange={(e) => setRecipeForm(prev => ({ ...prev, kcal: e.target.value }))}
                      placeholder="kcal"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipe-duration">Tempo de Preparo (min)</Label>
                  <Input
                    id="recipe-duration"
                    type="number"
                    value={recipeForm.duration_min}
                    onChange={(e) => setRecipeForm(prev => ({ ...prev, duration_min: e.target.value }))}
                    placeholder="minutos"
                  />
                </div>

                <div>
                  <Label htmlFor="recipe-ingredients">Ingredientes</Label>
                  <Textarea
                    id="recipe-ingredients"
                    value={recipeForm.ingredients}
                    onChange={(e) => setRecipeForm(prev => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="Liste os ingredientes..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="recipe-instructions">Modo de Preparo</Label>
                  <Textarea
                    id="recipe-instructions"
                    value={recipeForm.instructions}
                    onChange={(e) => setRecipeForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Instruções de preparo..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={saveRecipe} className="flex-1">
                    {editingRecipe ? 'Atualizar' : 'Criar'} Receita
                  </Button>
                  {editingRecipe && (
                    <Button variant="outline" onClick={resetRecipeForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recipes List */}
            <Card>
              <CardHeader>
                <CardTitle>Receitas Cadastradas ({recipes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">
                            {recipe.meal_type} • {recipe.kcal} kcal • {recipe.duration_min} min
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => editRecipe(recipe)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteRecipe(recipe.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{recipe.ingredients}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exercise Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exercise-title">Título</Label>
                  <Input
                    id="exercise-title"
                    value={exerciseForm.title}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome do exercício"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exercise-category">Categoria</Label>
                    <Select value={exerciseForm.category} onValueChange={(value) => setExerciseForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Recomendados">Recomendados</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="Força">Força</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="exercise-level">Nível</Label>
                    <Select value={exerciseForm.level} onValueChange={(value) => setExerciseForm(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exercise-duration">Duração (min)</Label>
                    <Input
                      id="exercise-duration"
                      type="number"
                      value={exerciseForm.duration_min}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, duration_min: e.target.value }))}
                      placeholder="minutos"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="exercise-kcal">Calorias Estimadas</Label>
                    <Input
                      id="exercise-kcal"
                      type="number"
                      value={exerciseForm.kcal_est}
                      onChange={(e) => setExerciseForm(prev => ({ ...prev, kcal_est: e.target.value }))}
                      placeholder="kcal"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="exercise-muscles">Músculos Trabalhados</Label>
                  <Input
                    id="exercise-muscles"
                    value={exerciseForm.muscles}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, muscles: e.target.value }))}
                    placeholder="Ex: Pernas, Core, Braços"
                  />
                </div>

                <div>
                  <Label htmlFor="exercise-video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    URL do Vídeo (YouTube Embed)
                  </Label>
                  <Input
                    id="exercise-video"
                    value={exerciseForm.video_url}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use o formato de embed do YouTube: https://www.youtube.com/embed/VIDEO_ID
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={saveExercise} className="flex-1">
                    {editingExercise ? 'Atualizar' : 'Criar'} Exercício
                  </Button>
                  {editingExercise && (
                    <Button variant="outline" onClick={resetExerciseForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exercises List */}
            <Card>
              <CardHeader>
                <CardTitle>Exercícios Cadastrados ({exercises.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {exercise.title}
                            {exercise.video_url && (
                              <Video className="h-4 w-4 text-blue-500" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {exercise.category} • {exercise.level} • {exercise.duration_min} min • {exercise.kcal_est} kcal
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => editExercise(exercise)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteExercise(exercise.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {exercise.muscles && (
                        <p className="text-sm text-gray-600">Músculos: {exercise.muscles}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
