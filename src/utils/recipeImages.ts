// Static image mapping for recipes and teas
import teaDetox from '@/assets/tea-detox.webp';
import teaCalming from '@/assets/tea-calming.webp';
import teaThermogenic from '@/assets/tea-thermogenic.webp';
import teaDigestive from '@/assets/tea-digestive.webp';
import teaEnergy from '@/assets/tea-energy.webp';
import teaBeauty from '@/assets/tea-beauty.webp';

import recipeChickenRice from '@/assets/recipe-chicken-rice.webp';
import recipeVeggieOmelet from '@/assets/recipe-veggie-omelet.webp';
import recipeGreenSmoothie from '@/assets/recipe-green-smoothie.webp';
import recipeAvocadoToast from '@/assets/recipe-avocado-toast.webp';
import recipeBakedFish from '@/assets/recipe-baked-fish.webp';
import recipeQuinoaSalad from '@/assets/recipe-quinoa-salad.webp';
import recipeYogurtParfait from '@/assets/recipe-yogurt-parfait.webp';
import recipeVegetableSoup from '@/assets/recipe-vegetable-soup.webp';

// Tea category image mapping
export const getTeaImage = (categoryName: string): string => {
  const categoryImages: Record<string, string> = {
    'Termogênicos e Emagrecimento': teaThermogenic,
    'Digestivos e Pós-refeição': teaDigestive,
    'Calmantes e Sono': teaCalming,
    'Detox e Diuréticos': teaDetox,
    'Imunidade e Energia': teaEnergy,
    'Beleza e Antioxidantes': teaBeauty,
  };

  return categoryImages[categoryName] || teaDetox;
};

// Recipe image mapping based on title keywords
export const getRecipeImage = (recipeTitle: string): string => {
  const title = recipeTitle.toLowerCase();
  
  // Map common recipe patterns to images
  if (title.includes('frango') || title.includes('chicken') || title.includes('arroz')) {
    return recipeChickenRice;
  }
  if (title.includes('omelete') || title.includes('omelet') || title.includes('ovos')) {
    return recipeVeggieOmelet;
  }
  if (title.includes('smoothie') || title.includes('verde') || title.includes('green')) {
    return recipeGreenSmoothie;
  }
  if (title.includes('torrada') || title.includes('abacate') || title.includes('toast') || title.includes('avocado')) {
    return recipeAvocadoToast;
  }
  if (title.includes('peixe') || title.includes('fish') || title.includes('salmão') || title.includes('batata doce')) {
    return recipeBakedFish;
  }
  if (title.includes('quinoa') || title.includes('salada') || title.includes('bowl')) {
    return recipeQuinoaSalad;
  }
  if (title.includes('iogurte') || title.includes('yogurt') || title.includes('parfait') || title.includes('granola')) {
    return recipeYogurtParfait;
  }
  if (title.includes('sopa') || title.includes('soup') || title.includes('legumes')) {
    return recipeVegetableSoup;
  }
  
  // Default fallback
  return recipeChickenRice;
};