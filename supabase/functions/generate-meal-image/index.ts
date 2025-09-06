import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generateImageWithRunware(recipeName: string, ingredients: string): Promise<string | null> {
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')
  
  if (!RUNWARE_API_KEY) {
    console.log('RUNWARE_API_KEY not configured, skipping Runware')
    return null
  }

  try {
    const prompt = `Professional food photography of ${recipeName}, made with ${ingredients}. High quality, appetizing, restaurant-style presentation, natural lighting, beautiful plating, vibrant colors, ultra high resolution`

    console.log('Trying Runware API for:', recipeName)

    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: 'authentication',
          apiKey: RUNWARE_API_KEY
        },
        {
          taskType: 'imageInference',
          taskUUID: crypto.randomUUID(),
          positivePrompt: prompt,
          width: 512,
          height: 512,
          model: 'runware:100@1',
          numberResults: 1,
          CFGScale: 1,
          steps: 4
        }
      ])
    })

    const result = await response.json()
    console.log('Runware API response status:', response.status)
    
    if (result.data && result.data.length > 0) {
      const imageData = result.data.find((item: any) => item.taskType === 'imageInference')
      
      if (imageData && imageData.imageURL) {
        console.log('Runware image generated successfully:', imageData.imageURL)
        return imageData.imageURL
      }
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('Runware errors:', result.errors)
    }
    
    return null
  } catch (error) {
    console.error('Runware API error:', error)
    return null
  }
}

async function generateImageWithOpenAI(recipeName: string, ingredients: string): Promise<string | null> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  
  if (!OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY not configured, skipping OpenAI')
    return null
  }

  try {
    const prompt = `Professional food photography of ${recipeName}, made with ${ingredients}. High quality, appetizing, restaurant-style presentation, natural lighting, beautiful plating, vibrant colors`

    console.log('Trying OpenAI API for:', recipeName)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp'
      }),
    })

    const result = await response.json()
    console.log('OpenAI API response status:', response.status)
    
    if (result.data && result.data.length > 0 && result.data[0].b64_json) {
      const base64Image = result.data[0].b64_json
      const imageUrl = `data:image/webp;base64,${base64Image}`
      console.log('OpenAI image generated successfully')
      return imageUrl
    }
    
    if (result.error) {
      console.log('OpenAI error:', result.error)
    }
    
    return null
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recipeName, ingredients, recipeId } = await req.json()

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    console.log('Generating image for:', recipeName)

    // Try Runware first, then fallback to OpenAI
    let imageUrl = await generateImageWithRunware(recipeName, ingredients)
    
    if (!imageUrl) {
      console.log('Runware failed, trying OpenAI fallback...')
      imageUrl = await generateImageWithOpenAI(recipeName, ingredients)
    }

    if (imageUrl) {
      console.log('Image generated successfully with URL length:', imageUrl.length)
      
      // Update the recipe with the generated image URL if recipeId is provided
      if (recipeId) {
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ image_url: imageUrl })
          .eq('id', recipeId)
          
        if (updateError) {
          console.error('Error updating recipe with image URL:', updateError)
          // Don't fail the request if database update fails
        } else {
          console.log('Recipe updated with image URL:', recipeId)
        }
      }
      
      return new Response(
        JSON.stringify({ 
          imageUrl: imageUrl,
          recipeId: recipeId,
          success: true,
          provider: imageUrl.startsWith('data:') ? 'openai' : 'runware'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('Both Runware and OpenAI failed to generate image')
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image with both providers', 
          details: 'Both Runware and OpenAI APIs failed. Please check API keys.',
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

  } catch (error) {
    console.error('Error generating meal image:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})