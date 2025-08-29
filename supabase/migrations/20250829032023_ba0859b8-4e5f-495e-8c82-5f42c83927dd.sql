-- Create admins table for admin authentication
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage their own data
CREATE POLICY "Admins can manage their own data" ON public.admins
FOR ALL USING (id = auth.uid());

-- Insert default admin (password will need to be hashed)
INSERT INTO public.admins (email, password_hash, name) VALUES 
('admin@vidaleve.com', '$2b$10$example_hash_replace_with_real', 'Administrator');

-- Create app_settings table for system configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage settings
CREATE POLICY "Only admins can manage settings" ON public.app_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES 
('trial_duration_days', '7', 'Duration of trial period in days'),
('premium_price_eur', '29.99', 'Premium subscription price in euros'),
('app_name', 'Vida Leve', 'Application name'),
('support_email', 'support@vidaleve.com', 'Support email address');

-- Add amount_eur column to existing subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS amount_eur DECIMAL(10,2) DEFAULT 0;

-- Create transactions table for payment tracking
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount_eur DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all transactions" ON public.transactions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create view for admin user overview
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
  p.id,
  p.name,
  p.id as email, -- We'll use profile data, but need to get email from auth.users via function
  CASE 
    WHEN t.is_active = true THEN 'trial'
    WHEN s.status = 'active' AND s.expires_at > now() THEN 'active'
    ELSE 'inactive'
  END as status,
  CASE 
    WHEN s.status = 'active' THEN 'premium'
    ELSE 'free'
  END as plan,
  p.created_at as registration_date,
  s.expires_at as subscription_expires,
  t.ends_at as trial_ends
FROM public.profiles p
LEFT JOIN public.trials t ON p.id = t.user_id
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status = 'active';

-- Create view for revenue tracking
CREATE OR REPLACE VIEW public.admin_revenue_by_month AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(amount_eur) as total_revenue,
  COUNT(*) as transaction_count
FROM public.transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Grant access to views for admins
CREATE POLICY "Admins can view user overview" ON public.admin_user_overview
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger to tables
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();