-- Create storage bucket for APK files
INSERT INTO storage.buckets (id, name, public) VALUES ('apps', 'apps', true);

-- Create RLS policies for apps bucket
CREATE POLICY "Apps are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apps');

CREATE POLICY "Admins can upload apps" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'apps' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update apps" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'apps' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete apps" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'apps' AND has_role(auth.uid(), 'admin'));