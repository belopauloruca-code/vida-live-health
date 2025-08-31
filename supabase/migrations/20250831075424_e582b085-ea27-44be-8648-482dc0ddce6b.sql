-- Fix Security Definer View issue by explicitly setting SECURITY INVOKER
-- Drop existing views first
DROP VIEW IF EXISTS public.admin_user_overview CASCADE;
DROP VIEW IF EXISTS public.admin_revenue_by_month CASCADE;

-- Recreate admin_user_overview view with SECURITY INVOKER
CREATE VIEW public.admin_user_overview 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.name,
    CASE
        WHEN (t.is_active = true) THEN 'trial'::text
        WHEN ((s.status = 'active'::text) AND (s.expires_at > now())) THEN 'active'::text
        ELSE 'inactive'::text
    END AS status,
    CASE
        WHEN (s.status = 'active'::text) THEN 'premium'::text
        ELSE 'free'::text
    END AS plan,
    p.created_at AS registration_date,
    s.expires_at AS subscription_expires,
    t.ends_at AS trial_ends
FROM profiles p
LEFT JOIN trials t ON (p.id = t.user_id)
LEFT JOIN subscriptions s ON (p.id = s.user_id AND s.status = 'active');

-- Recreate admin_revenue_by_month view with SECURITY INVOKER
CREATE VIEW public.admin_revenue_by_month 
WITH (security_invoker = true) AS
SELECT 
    date_trunc('month', transaction_date) AS month,
    sum(amount_eur) AS total_revenue,
    count(*) AS transaction_count
FROM transactions
WHERE status = 'completed'
GROUP BY date_trunc('month', transaction_date)
ORDER BY date_trunc('month', transaction_date) DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.admin_user_overview TO authenticated;
GRANT SELECT ON public.admin_revenue_by_month TO authenticated;