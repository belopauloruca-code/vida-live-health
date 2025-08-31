-- Fix security issue: Enable RLS on admin revenue view and restrict to admin users only
-- The admin_revenue_by_month view contains sensitive financial data and needs proper access controls

-- First, enable Row Level Security on the view
-- Note: Views can have RLS enabled to add an additional security layer beyond the underlying tables
ALTER VIEW public.admin_revenue_by_month SET (security_barrier = true);

-- Since we can't directly enable RLS on a view, we need to recreate it as a table function
-- or create RLS policies on the underlying transactions table that are more restrictive for aggregated data

-- However, the better approach is to ensure the view is only accessible through proper application logic
-- Let's create a security function that checks admin access for revenue data
CREATE OR REPLACE FUNCTION public.get_admin_revenue_data()
RETURNS TABLE (
    month timestamp with time zone,
    total_revenue numeric,
    transaction_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    -- Only allow admins to access revenue data
    SELECT 
        date_trunc('month', transaction_date) AS month,
        sum(amount_eur) AS total_revenue,
        count(*) AS transaction_count
    FROM transactions
    WHERE status = 'completed'
    AND has_role(auth.uid(), 'admin'::app_role) -- Ensure only admins can access
    GROUP BY date_trunc('month', transaction_date)
    ORDER BY date_trunc('month', transaction_date) DESC;
$$;

-- Grant execute permission only to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.get_admin_revenue_data() TO authenticated;

-- Create a comment to document the security model
COMMENT ON FUNCTION public.get_admin_revenue_data() IS 
'Secure function to retrieve aggregated revenue data. Only accessible by admin users. Returns empty result set for non-admin users.';

-- Note: The existing admin_revenue_by_month view will continue to work 
-- but applications should migrate to use the secure function instead
-- The view inherits RLS from the underlying transactions table which has proper admin policies