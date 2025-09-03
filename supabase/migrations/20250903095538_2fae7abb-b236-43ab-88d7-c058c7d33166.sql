-- Add admin access for the new email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'aemail.cotigobuata@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;