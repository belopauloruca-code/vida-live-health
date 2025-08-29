-- Create daily_tips table for automatic daily tips
CREATE TABLE public.daily_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  tip_text TEXT NOT NULL,
  tip_category TEXT DEFAULT 'Geral',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active tips" 
ON public.daily_tips 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage all tips" 
ON public.daily_tips 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_daily_tips_updated_at
BEFORE UPDATE ON public.daily_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample daily tips (0=Sunday, 1=Monday, ..., 6=Saturday)
INSERT INTO public.daily_tips (day_of_week, tip_text, tip_category) VALUES
(1, 'Comece a semana com energia! Beba um copo de água assim que acordar para hidratar o corpo.', 'Hidratação'),
(2, 'Terça é dia de movimento! Faça pelo menos 10 minutos de exercício, mesmo que seja uma caminhada.', 'Exercício'),
(3, 'Meio da semana chegou! Prepare uma refeição colorida com vegetais variados.', 'Nutrição'),
(4, 'Quinta-feira de foco! Mantenha uma postura correta ao trabalhar para cuidar da sua coluna.', 'Postura'),
(5, 'Sexta chegou! Celebre os pequenos progressos da semana na sua jornada de saúde.', 'Motivação'),
(6, 'Sábado de autocuidado! Reserve um tempo para relaxar e desestressar.', 'Bem-estar'),
(0, 'Domingo de preparação! Planeje suas refeições da semana que vem.', 'Planejamento');