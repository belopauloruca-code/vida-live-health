-- Enable Realtime for tables
ALTER TABLE public.hydration_logs REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.meal_plans REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.hydration_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plans;

-- Update video URL for "Agachamentos + Afundos" exercise
UPDATE public.exercises 
SET video_url = 'https://drive.google.com/file/d/1tRsF5or7N62KOoGz9oTFIUmRoT4rFHY4/view?usp=sharing'
WHERE title = 'Agachamentos + Afundos';