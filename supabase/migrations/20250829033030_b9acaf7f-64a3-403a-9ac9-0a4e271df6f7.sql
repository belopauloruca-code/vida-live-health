-- Update exercise video links for specific exercises
UPDATE public.exercises 
SET video_url = 'https://drive.google.com/file/d/136jPfXq8hOZ25rvMHwqFHexmLzQg66tP/view?usp=sharing',
    video_url_2 = 'https://drive.google.com/file/d/1sucDOoj4QJEbgH3NNOcDIbz3V5z4MrGE/view?usp=sharing'
WHERE title = 'Supino com Halteres';

UPDATE public.exercises 
SET video_url_2 = 'https://drive.google.com/file/d/1OgdpNRYahQa6BarFrgZ1lFkwaYA8E5ZH/view?usp=sharing'
WHERE title = 'Agachamentos + Afundos';

-- Create function to promote user to admin (optional - for manual admin creation)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from auth.users table
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = _email;
  
  IF _user_id IS NULL THEN
    RETURN 'User not found with email: ' || _email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN 'User ' || _email || ' promoted to admin successfully';
END;
$$;