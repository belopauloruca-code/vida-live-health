-- Create trials table for 1-day trial system
CREATE TABLE public.trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 day'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;

-- Create policies for trials
CREATE POLICY "Users can view their own trial" 
ON public.trials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trial" 
ON public.trials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trial" 
ON public.trials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trials" 
ON public.trials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create index for performance
CREATE INDEX idx_trials_user_id ON public.trials(user_id);
CREATE INDEX idx_trials_ends_at ON public.trials(ends_at);