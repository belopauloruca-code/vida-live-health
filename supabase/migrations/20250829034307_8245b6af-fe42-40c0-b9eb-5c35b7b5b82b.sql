-- Create daily user reports table
CREATE TABLE public.daily_user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_date DATE NOT NULL,
  water_consumed_ml INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  kcal_burned INTEGER DEFAULT 0,
  planned_meals INTEGER DEFAULT 0,
  weight_kg DECIMAL(5,2),
  sleep_hours DECIMAL(3,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_user_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reports" 
ON public.daily_user_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.daily_user_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.daily_user_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.daily_user_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can manage all reports" 
ON public.daily_user_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_daily_reports_user_date ON public.daily_user_reports(user_id, report_date DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_reports_updated_at
BEFORE UPDATE ON public.daily_user_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();