import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recipeName, ingredients, recipeId, batch = false } = await req.json()

    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!RUNWARE_API_KEY) {
      throw new Error('RUNWARE_API_KEY not configured')
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const prompt = `Professional food photography of ${recipeName}, made with ${ingredients}. High quality, appetizing, restaurant-style presentation, natural lighting, beautiful plating, vibrant colors, ultra high resolution`

    console.log('Generating image for:', recipeName)

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
    console.log('Runware API response:', JSON.stringify(result, null, 2))
    
    if (result.data && result.data.length > 0) {
      const imageData = result.data.find((item: any) => item.taskType === 'imageInference')
      
      if (imageData && imageData.imageURL) {
        console.log('Image generated successfully:', imageData.imageURL)
        
        // Update the recipe with the generated image URL if recipeId is provided
        if (recipeId) {
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ image_url: imageData.imageURL })
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
            imageUrl: imageData.imageURL,
            recipeId: recipeId,
            success: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    console.error('No image data found in response:', result)

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: result.errors || result.error || 'Unknown error',
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )

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