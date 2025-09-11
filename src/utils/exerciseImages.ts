// Utility for generating exercise images with Lovable AI
import { supabase } from '@/integrations/supabase/client';
import { UniqueImageSystem } from './uniqueImageSystem';

export interface ExerciseImageData {
  exerciseId: string;
  exerciseName: string;
  category: string;
  level: string;
}

// Generate exercise demonstration images using Lovable AI
export const generateExerciseImages = async (exerciseData: ExerciseImageData): Promise<string[]> => {
  try {
    console.log('Generating images for exercise:', exerciseData.exerciseName);
    
    // Create dynamic prompts based on exercise data
    const basePrompt = `Exercise demonstration: ${exerciseData.exerciseName}`;
    const categoryContext = getCategoryContext(exerciseData.category);
    const levelContext = getLevelContext(exerciseData.level);
    
    const prompts = [
      `${basePrompt} - starting position, ${categoryContext}, ${levelContext}, clean white background, professional fitness photography style`,
      `${basePrompt} - mid-movement, ${categoryContext}, ${levelContext}, clean white background, professional fitness photography style`,
      `${basePrompt} - peak position, ${categoryContext}, ${levelContext}, clean white background, professional fitness photography style`,
      `${basePrompt} - return movement, ${categoryContext}, ${levelContext}, clean white background, professional fitness photography style`
    ];

    // Use Supabase edge function to generate images
    const { data, error } = await supabase.functions.invoke('ai-exercise-demo', {
      body: { 
        exerciseName: exerciseData.exerciseName,
        category: exerciseData.category,
        level: exerciseData.level,
        prompts 
      }
    });

    if (error) {
      console.error('Error generating exercise images:', error);
      return [];
    }

    return data?.images || [];
  } catch (error) {
    console.error('Failed to generate exercise images:', error);
    return [];
  }
};

// Get category-specific context for better image generation
const getCategoryContext = (category: string): string => {
  const contexts = {
    'Cardio': 'cardiovascular exercise, dynamic movement, athletic pose',
    'Força': 'strength training, muscle building, weight lifting form',
    'Flexibilidade': 'flexibility training, stretching pose, yoga-style movement',
    'Yoga': 'yoga asana, meditation pose, serene expression',
    'Recomendados': 'general fitness, beginner-friendly, safe form'
  };
  return contexts[category as keyof typeof contexts] || contexts['Recomendados'];
};

// Get level-specific context for image generation
const getLevelContext = (level: string): string => {
  const contexts = {
    'Iniciante': 'beginner level, simple form, basic technique',
    'Intermediário': 'intermediate level, proper form, moderate intensity',
    'Avançado': 'advanced level, perfect form, high intensity'
  };
  return contexts[level as keyof typeof contexts] || contexts['Iniciante'];
};

// Fallback images for different exercise categories with real exercise images
export const getFallbackExerciseImage = (category: string): string => {
  const fallbackImages = {
    'Cardio': '/images/exercises/cardio.jpg',
    'Força': '/images/exercises/strength.jpg', 
    'Flexibilidade': '/images/exercises/flexibility.jpg',
    'Yoga': '/images/exercises/yoga.jpg',
    'Recomendados': '/images/exercises/general.jpg'
  };
  return fallbackImages[category as keyof typeof fallbackImages] || '/placeholder.svg';
};

// Get exercise card image with YouTube thumbnail support and unique image system
export const getExerciseCardImage = (exercise: { video_url?: string; category: string; title: string; id?: string }): string => {
  // If YouTube video exists, extract thumbnail
  if (exercise.video_url) {
    const ytMatch = exercise.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
    if (ytMatch?.[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    }
  }
  
  // Use unique image system to avoid repetition
  const identifier = exercise.id || exercise.title;
  return UniqueImageSystem.getUniqueImage('exercise_cards', exercise.category, identifier);
};