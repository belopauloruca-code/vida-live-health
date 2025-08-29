import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExerciseStep {
  step: number;
  description: string;
  duration_seconds: number;
  focus_points: string[];
}

interface VideoScript {
  title: string;
  total_duration: number;
  overview: string;
  steps: ExerciseStep[];
  safety_tips: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName } = await req.json();

    if (!exerciseName) {
      return new Response(
        JSON.stringify({ error: 'Exercise name is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate exercise video script using GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um instrutor de educação física especializado em criar roteiros detalhados para vídeos de exercícios. 
            Crie um roteiro completo e estruturado para o exercício solicitado, incluindo:
            - Passos detalhados com duração
            - Pontos de foco importantes
            - Dicas de segurança
            - Duração total realista
            
            Responda APENAS com um JSON válido no formato especificado.`
          },
          {
            role: 'user',
            content: `Crie um roteiro detalhado para um vídeo demonstrativo do exercício: "${exerciseName}".
            
            O JSON deve ter esta estrutura:
            {
              "title": "Título do exercício",
              "total_duration": 120,
              "overview": "Breve descrição do exercício e seus benefícios",
              "steps": [
                {
                  "step": 1,
                  "description": "Descrição detalhada do passo",
                  "duration_seconds": 15,
                  "focus_points": ["Ponto de atenção 1", "Ponto de atenção 2"]
                }
              ],
              "safety_tips": ["Dica de segurança 1", "Dica de segurança 2"]
            }`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const scriptContent = data.choices[0].message.content;
    
    let videoScript: VideoScript;
    try {
      videoScript = JSON.parse(scriptContent);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      videoScript = {
        title: exerciseName,
        total_duration: 90,
        overview: `Demonstração completa do exercício ${exerciseName} com orientações detalhadas.`,
        steps: [
          {
            step: 1,
            description: "Posição inicial: posicione-se corretamente",
            duration_seconds: 15,
            focus_points: ["Postura ereta", "Pés afastados"]
          },
          {
            step: 2,
            description: "Execução do movimento principal",
            duration_seconds: 45,
            focus_points: ["Movimento controlado", "Respiração adequada"]
          },
          {
            step: 3,
            description: "Finalização e alongamento",
            duration_seconds: 30,
            focus_points: ["Retorno controlado", "Relaxamento"]
          }
        ],
        safety_tips: [
          "Mantenha sempre uma postura correta",
          "Pare se sentir dor ou desconforto",
          "Hidrate-se adequadamente"
        ]
      };
    }

    // Generate video metadata for AI-powered demonstration
    const videoData = {
      script: videoScript,
      exerciseName,
      generated_at: new Date().toISOString(),
      video_url: `/videos/ai-generated/${exerciseName.toLowerCase().replace(/\s+/g, '-')}.mp4`,
      thumbnail_url: `/images/exercises/${exerciseName.toLowerCase().replace(/\s+/g, '-')}-thumb.jpg`,
      has_ai_demo: true
    };

    return new Response(
      JSON.stringify(videoData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-exercise-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate exercise video',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});