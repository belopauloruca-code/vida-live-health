
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Zap, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  meal_type: string;
  kcal: number;
  duration_min: number;
  ingredients: string;
  instructions: string;
  image_url?: string;
}

interface RecipeDialogProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeDialog: React.FC<RecipeDialogProps> = ({ recipe, isOpen, onClose }) => {
  const [generatingImage, setGeneratingImage] = useState(false);
  
  if (!recipe) return null;

  const generateRecipeImage = async () => {
    if (!recipe || generatingImage) return;
    
    try {
      setGeneratingImage(true);
      
      const { data, error } = await supabase.functions.invoke('generate-meal-image', {
        body: { 
          recipeName: recipe.title,
          ingredients: recipe.ingredients,
          recipeId: recipe.id
        }
      });
      
      if (error) throw error;
      
      if (data && data.imageUrl) {
        // Update the recipe with the generated image
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ image_url: data.imageUrl })
          .eq('id', recipe.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Imagem gerada!",
          description: "A imagem da receita foi gerada com sucesso.",
        });
        
        // Update the local recipe state with the new image URL
        recipe.image_url = data.imageUrl;
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Erro ao gerar imagem",
        description: "Não foi possível gerar a imagem da receita.",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{recipe.title}</DialogTitle>
          <DialogDescription className="text-green-600 font-medium">
            {recipe.meal_type}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Recipe Image */}
          {recipe.image_url ? (
            <div className="w-full h-40 rounded-lg overflow-hidden">
              <img 
                src={recipe.image_url} 
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Error loading recipe image:', recipe.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center">
              <div className="text-gray-400 mb-2">
                <Image className="h-8 w-8" />
              </div>
              <Button
                onClick={generateRecipeImage}
                disabled={generatingImage}
                variant="outline"
                size="sm"
              >
                {generatingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Gerar Imagem
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              {recipe.kcal} kcal
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {recipe.duration_min} min
            </span>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Ingredientes:</h4>
            <p className="text-sm text-gray-700">{recipe.ingredients}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Modo de Preparo:</h4>
            <p className="text-sm text-gray-700">{recipe.instructions}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
