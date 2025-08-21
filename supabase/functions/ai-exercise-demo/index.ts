import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunwareService {
  generateImages(prompt: string): Promise<string[]>;
}

class RunwareAPI implements RunwareService {
  private apiKey: string;
  private wsUrl = "wss://ws-api.runware.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImages(prompt: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      const taskUUID = crypto.randomUUID();
      let authenticated = false;

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Timeout: geração demorou mais que 30 segundos'));
      }, 30000);

      ws.onopen = () => {
        // Authenticate first
        const authMessage = [{
          taskType: "authentication",
          apiKey: this.apiKey,
        }];
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          reject(new Error(response.errorMessage || 'Erro na API'));
          return;
        }

        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              authenticated = true;
              // Send image generation request
              const imageMessage = [{
                taskType: "imageInference",
                taskUUID,
                model: "runware:100@1",
                positivePrompt: prompt,
                width: 512,
                height: 512,
                numberResults: 4,
                outputFormat: "WEBP",
                CFGScale: 1,
                scheduler: "FlowMatchEulerDiscreteScheduler",
                strength: 0.8,
                steps: 4
              }];
              ws.send(JSON.stringify(imageMessage));
            } else if (item.taskType === "imageInference" && item.taskUUID === taskUUID) {
              clearTimeout(timeout);
              ws.close();
              // Collect all images from the batch
              const imageUrl = item.imageURL;
              resolve([imageUrl]); // Return single image for now
            }
          });
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro de conexão com o serviço de IA'));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        if (!authenticated) {
          reject(new Error('Falha na autenticação'));
        }
      };
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName } = await req.json();
    
    if (!exerciseName) {
      return new Response(
        JSON.stringify({ error: 'Nome do exercício é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const runware = new RunwareAPI(apiKey);
    
    // Generate 4 progressive frames for exercise demonstration
    const prompts = [
      `${exerciseName} exercise starting position, fitness demonstration, clean white background, professional lighting`,
      `${exerciseName} exercise mid-movement, fitness demonstration, clean white background, professional lighting`,
      `${exerciseName} exercise peak position, fitness demonstration, clean white background, professional lighting`,
      `${exerciseName} exercise return movement, fitness demonstration, clean white background, professional lighting`
    ];

    const imagePromises = prompts.map(prompt => runware.generateImages(prompt));
    const results = await Promise.all(imagePromises);
    const images = results.flat();

    console.log(`Generated ${images.length} demo images for: ${exerciseName}`);

    return new Response(
      JSON.stringify({ images }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-exercise-demo:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});