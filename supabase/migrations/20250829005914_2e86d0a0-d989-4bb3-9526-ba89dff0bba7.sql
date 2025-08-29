-- Fix security vulnerabilities in subscribers table RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create secure policies that only use user_id for access control

-- Policy for users to view only their own subscription data
CREATE POLICY "select_own_subscription_secure" ON public.subscribers
FOR SELECT
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for updating subscription data - only user or admin
CREATE POLICY "update_own_subscription_secure" ON public.subscribers
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for inserting subscription data - only authenticated users for their own records or admins
CREATE POLICY "insert_own_subscription_secure" ON public.subscribers
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for deleting subscription data - only admins (for cleanup/management)
CREATE POLICY "delete_subscription_admin_only" ON public.subscribers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));