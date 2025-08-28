-- Security Fix 1: Lock down subscribers table
-- Drop the permissive policies that allow any user to insert/update subscriptions
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create admin-only policies for subscribers table
CREATE POLICY "admins_can_update_subscribers" ON public.subscribers
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_can_insert_subscribers" ON public.subscribers
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Security Fix 2: Prevent unlimited trials
-- Add unique constraint to prevent multiple trials per user
ALTER TABLE public.trials ADD CONSTRAINT trials_user_id_unique UNIQUE (user_id);

-- Drop the policy that allows users to update their own trials
DROP POLICY IF EXISTS "Users can update their own trial" ON public.trials;

-- Security Fix 3: Prevent profile role tampering
-- Create a trigger function to block role changes for non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed and user is not admin, block it
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER prevent_role_tampering_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_tampering();

-- Security Fix 4: Enforce storage write scope for avatars bucket
-- Create strict storage policies for avatars bucket
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_write_own_folder" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "avatars_user_update_own_folder" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "avatars_user_delete_own_folder" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND name LIKE auth.uid()::text || '/%'
);