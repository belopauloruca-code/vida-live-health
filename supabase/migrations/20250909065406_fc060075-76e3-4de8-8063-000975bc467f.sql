-- Create exercise favorites table
CREATE TABLE public.exercise_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable Row Level Security
ALTER TABLE public.exercise_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise favorites
CREATE POLICY "Users can view their own favorites" 
ON public.exercise_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.exercise_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.exercise_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all favorites
CREATE POLICY "Admins can manage all favorites" 
ON public.exercise_favorites 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));