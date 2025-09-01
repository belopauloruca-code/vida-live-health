-- Fix the function search path security warning
-- Set the search_path to prevent potential security issues

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS public.get_admin_revenue_data();

CREATE OR REPLACE FUNCTION public.get_admin_revenue_data()
RETURNS TABLE (
    month timestamp with time zone,
    total_revenue numeric,
    transaction_count bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
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

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_revenue_data() TO authenticated;

-- Update the comment
COMMENT ON FUNCTION public.get_admin_revenue_data() IS 
'Secure function to retrieve aggregated revenue data. Only accessible by admin users with proper search_path set for security.';