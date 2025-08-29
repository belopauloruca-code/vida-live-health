-- Create storage bucket for branding images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true);

-- Create policies for branding bucket
CREATE POLICY "Anyone can view branding images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'branding');

CREATE POLICY "Authenticated users can upload branding images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'branding' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update branding images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'branding' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete branding images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'branding' AND auth.role() = 'authenticated');