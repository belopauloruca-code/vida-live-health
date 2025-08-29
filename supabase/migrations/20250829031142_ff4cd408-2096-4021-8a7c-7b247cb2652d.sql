-- Add video_url_2 column to exercises table
ALTER TABLE public.exercises 
ADD COLUMN video_url_2 text;

-- Update Flexões + Prancha with second video
UPDATE public.exercises 
SET video_url_2 = 'https://drive.google.com/file/d/1sucDOoj4QJEbgH3NNOcDIbz3V5z4MrGE/view?usp=sharing'
WHERE title = 'Flexões + Prancha';

-- Update Levantamento Terra (halteres) with video
UPDATE public.exercises 
SET video_url = 'https://drive.google.com/file/d/1bMxRn7BiOwq1BFdl2yD2vBLsVCD7GTYF/view?usp=sharing'
WHERE title = 'Levantamento Terra (halteres)';