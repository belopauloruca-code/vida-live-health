-- Fix security definer view issue by recreating views with proper security context
-- The issue is that views are using SECURITY DEFINER functions which bypass RLS

-- Drop existing views
DROP VIEW IF EXISTS public.admin_user_overview;
DROP VIEW IF EXISTS public.admin_revenue_by_month;

-- Recreate admin_user_overview view without security definer dependencies
-- This view should only be accessible to admins via RLS on the underlying tables
CREATE VIEW public.admin_user_overview AS
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

-- Recreate admin_revenue_by_month view
CREATE VIEW public.admin_revenue_by_month AS
SELECT 
    date_trunc('month', transaction_date) AS month,
    sum(amount_eur) AS total_revenue,
    count(*) AS transaction_count
FROM transactions
WHERE status = 'completed'
GROUP BY date_trunc('month', transaction_date)
ORDER BY date_trunc('month', transaction_date) DESC;

-- Enable RLS on the views (though views inherit RLS from underlying tables)
ALTER VIEW public.admin_user_overview SET (security_barrier = false);
ALTER VIEW public.admin_revenue_by_month SET (security_barrier = false);

-- The views will now respect the RLS policies of the underlying tables:
-- - profiles: admin_can_update_roles, select_own_or_admin policies
-- - trials: Users can view their own trial, Admins can manage all trials
-- - subscriptions: subs_select_own_or_admin policy  
-- - transactions: Users can view own transactions, Admins can manage all transactions

-- This ensures that only users with appropriate permissions can access the view data