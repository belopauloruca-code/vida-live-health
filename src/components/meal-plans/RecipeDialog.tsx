
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
import { getRecipeImage } from '@/utils/recipeImages';

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
  if (!recipe) return null;

  // Use Lovable-generated images instead of external AI
  const getDisplayImage = () => {
    return recipe.image_url || getRecipeImage(recipe.title);
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
          <div className="w-full h-40 rounded-lg overflow-hidden">
            <img 
              src={getDisplayImage()} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

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
