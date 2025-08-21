
-- 1) Add column for exercise demo videos
alter table public.exercises
  add column if not exists video_url text;

-- 2) Seed example videos (adjust titles if different in your data)
-- Push-ups (Flexões)
update public.exercises
set video_url = 'https://www.youtube.com/embed/_l3ySVKYVJ8'
where title ilike 'flex%' and (video_url is null or video_url = '');

-- Plank (Prancha)
update public.exercises
set video_url = 'https://www.youtube.com/embed/pSHjTRCQxIw'
where title ilike 'prancha%' and (video_url is null or video_url = '');
