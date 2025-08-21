-- Fix critical security vulnerability in subscribers table RLS policies
-- Current UPDATE policy allows any authenticated user to update any subscription record

-- Drop the vulnerable UPDATE policy
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create a secure UPDATE policy that only allows users to update their own records
-- or allows admin users to update any record
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE 
USING (
  (user_id = auth.uid()) OR 
  (email = auth.email()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);