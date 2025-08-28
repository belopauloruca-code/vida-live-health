-- Enable real-time functionality for meal_plans and meal_plan_items tables
ALTER TABLE public.meal_plans REPLICA IDENTITY FULL;
ALTER TABLE public.meal_plan_items REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_plan_items;