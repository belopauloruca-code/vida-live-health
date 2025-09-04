import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { recipeName, ingredients } = await req.json()

    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY')
    
    if (!RUNWARE_API_KEY) {
      throw new Error('RUNWARE_API_KEY not configured')
    }

    const prompt = `Professional food photography of ${recipeName}, made with ${ingredients}. High quality, appetizing, restaurant-style presentation, natural lighting, ultra high resolution`

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
          numberResults: 1
        }
      ])
    })

    const result = await response.json()
    console.log('Runware API response:', JSON.stringify(result, null, 2))
    
    if (result.data && result.data.length > 0) {
      const imageData = result.data.find((item: any) => item.taskType === 'imageInference')
      
      if (imageData && imageData.imageURL) {
        console.log('Image generated successfully:', imageData.imageURL)
        return new Response(
          JSON.stringify({ imageUrl: imageData.imageURL }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    console.error('No image data found in response:', result)

    return new Response(
      JSON.stringify({ error: 'Failed to generate image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )

  } catch (error) {
    console.error('Error generating meal image:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})