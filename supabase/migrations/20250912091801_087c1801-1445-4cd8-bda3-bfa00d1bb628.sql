-- Fix security issue: Restrict admin table access to own records only
-- Current policy allows ANY admin to see ALL admin records, which is a security risk

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Admins can manage their own data" ON public.admins;

-- Create more restrictive policies that only allow access to own records
CREATE POLICY "Admins can view only their own record" 
ON public.admins 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND id = auth.uid()
);

CREATE POLICY "Admins can update only their own record" 
ON public.admins 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND id = auth.uid()
);

-- Prevent any INSERT operations as admin accounts should be created through proper channels
CREATE POLICY "Prevent direct admin insertions" 
ON public.admins 
FOR INSERT 
WITH CHECK (false);

-- Prevent any DELETE operations to protect admin accounts
CREATE POLICY "Prevent admin deletions" 
ON public.admins 
FOR DELETE 
USING (false);