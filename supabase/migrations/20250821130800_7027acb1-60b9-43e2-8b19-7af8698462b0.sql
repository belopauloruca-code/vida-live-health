
-- Extensões necessárias
create extension if not exists pgcrypto;

-- 1) Papéis de usuário (admin/user) e função utilitária
create type public.app_role as enum ('admin','user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Políticas para user_roles
do $$ begin
  -- select para o próprio usuário ver seus papéis
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_roles' and policyname='select_own_roles'
  ) then
    create policy "select_own_roles"
      on public.user_roles
      for select
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  -- insert/update/delete só por admin (em geral será via painel admin)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_roles' and policyname='mutate_roles_admin_only'
  ) then
    create policy "mutate_roles_admin_only"
      on public.user_roles
      for all
      to authenticated
      using (public.has_role(auth.uid(),'admin'))
      with check (public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 2) Perfis
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  name text,
  age int,
  sex text check (sex in ('Masculino','Feminino','Outro')) default 'Masculino',
  height_cm int,
  weight_kg numeric(5,2),
  activity_level text check (activity_level in ('Sedentário','Leve','Moderado','Alto')) default 'Sedentário',
  goal text default 'Emagrecer',
  wake_time time,
  sleep_time time,
  work_hours text,
  water_goal_ml int default 2500,
  avatar_url text,
  -- Mantemos uma coluna de role para exibição rápida no app (opcional),
  -- porém as políticas se baseiam em user_roles/has_role()
  role text check (role in ('user','admin')) default 'user'
);

alter table public.profiles enable row level security;

-- Políticas de profiles
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='select_own_or_admin'
  ) then
    create policy "select_own_or_admin"
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='update_own_or_admin'
  ) then
    create policy "update_own_or_admin"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid() or public.has_role(auth.uid(),'admin'))
      with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  -- Inserção via trigger; em geral usuários não inserem diretamente
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='insert_self_only'
  ) then
    create policy "insert_self_only"
      on public.profiles
      for insert
      to authenticated
      with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- Trigger para criar perfil e papel 'user' ao registrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), 'user')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Receitas
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  meal_type text check (meal_type in ('Café','Almoço','Jantar','Lanche')) not null,
  kcal int not null,
  duration_min int default 10,
  ingredients text not null,
  instructions text,
  image_url text
);

alter table public.recipes enable row level security;

do $$ begin
  -- qualquer autenticado pode ler receitas (use público se quiser abrir na landing)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='recipes' and policyname='recipes_select_auth'
  ) then
    create policy "recipes_select_auth"
      on public.recipes
      for select
      to authenticated
      using (true);
  end if;

  -- admin pode inserir/alterar/excluir
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='recipes' and policyname='recipes_admin_crud'
  ) then
    create policy "recipes_admin_crud"
      on public.recipes
      for all
      to authenticated
      using (public.has_role(auth.uid(),'admin'))
      with check (public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 4) Planos de Refeições (7 dias) e Itens
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  daily_kcal int not null,
  meals_per_day int default 4
);

alter table public.meal_plans enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='meal_plans' and policyname='mp_select_own_or_admin'
  ) then
    create policy "mp_select_own_or_admin"
      on public.meal_plans
      for select
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='meal_plans' and policyname='mp_crud_own_or_admin'
  ) then
    create policy "mp_crud_own_or_admin"
      on public.meal_plans
      for all
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
      with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;
end $$;

create table if not exists public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_index int check (day_index between 0 and 6),
  meal_type text check (meal_type in ('Café','Almoço','Jantar','Lanche')),
  recipe_id uuid references public.recipes(id) on delete restrict
);

alter table public.meal_plan_items enable row level security;

-- Políticas baseadas na posse do meal_plan
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='meal_plan_items' and policyname='mpi_select_own_or_admin'
  ) then
    create policy "mpi_select_own_or_admin"
      on public.meal_plan_items
      for select
      to authenticated
      using (
        exists (
          select 1 from public.meal_plans mp
          where mp.id = meal_plan_id
            and (mp.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='meal_plan_items' and policyname='mpi_crud_own_or_admin'
  ) then
    create policy "mpi_crud_own_or_admin"
      on public.meal_plan_items
      for all
      to authenticated
      using (
        exists (
          select 1 from public.meal_plans mp
          where mp.id = meal_plan_id
            and (mp.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
        )
      )
      with check (
        exists (
          select 1 from public.meal_plans mp
          where mp.id = meal_plan_id
            and (mp.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
        )
      );
  end if;
end $$;

-- 5) Hidratação
create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ts timestamptz default now(),
  amount_ml int check (amount_ml in (150,200,300,500))
);

alter table public.hydration_logs enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hydration_logs' and policyname='hydr_select_own_or_admin'
  ) then
    create policy "hydr_select_own_or_admin"
      on public.hydration_logs
      for select
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hydration_logs' and policyname='hydr_crud_own_or_admin'
  ) then
    create policy "hydr_crud_own_or_admin"
      on public.hydration_logs
      for all
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
      with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 6) Biblioteca de Exercícios
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('Recomendados','Cardio','Força')) default 'Recomendados',
  duration_min int not null,
  kcal_est int not null,
  level text check (level in ('Iniciante','Intermediário','Avançado')) default 'Iniciante',
  muscles text
);

alter table public.exercises enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercises' and policyname='exercises_select_auth'
  ) then
    create policy "exercises_select_auth"
      on public.exercises
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercises' and policyname='exercises_admin_crud'
  ) then
    create policy "exercises_admin_crud"
      on public.exercises
      for all
      to authenticated
      using (public.has_role(auth.uid(),'admin'))
      with check (public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 7) Sessões de Exercício (concluídos)
create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  kcal_burned int
);

alter table public.exercise_sessions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercise_sessions' and policyname='sess_select_own_or_admin'
  ) then
    create policy "sess_select_own_or_admin"
      on public.exercise_sessions
      for select
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='exercise_sessions' and policyname='sess_crud_own_or_admin'
  ) then
    create policy "sess_crud_own_or_admin"
      on public.exercise_sessions
      for all
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'))
      with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 8) Assinaturas (espelho RevenueCat)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  status text check (status in ('active','expired','canceled','trialing')) not null,
  started_at timestamptz,
  renewed_at timestamptz,
  expires_at timestamptz
);

alter table public.subscriptions enable row level security;

do $$ begin
  -- dono e admin podem ver
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='subscriptions' and policyname='subs_select_own_or_admin'
  ) then
    create policy "subs_select_own_or_admin"
      on public.subscriptions
      for select
      to authenticated
      using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
  end if;

  -- atualizações normalmente por função/serviço admin (ex.: Edge Function com service role) ou admin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='subscriptions' and policyname='subs_admin_crud'
  ) then
    create policy "subs_admin_crud"
      on public.subscriptions
      for all
      to authenticated
      using (public.has_role(auth.uid(),'admin'))
      with check (public.has_role(auth.uid(),'admin'));
  end if;
end $$;

-- 9) Storage buckets e políticas
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('exports','exports', false)
on conflict (id) do nothing;

-- Políticas de objects (válidas por bucket)
-- Avatars: leitura pública; escrita somente pelo dono (prefixo user_id/) ou admin
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='avatars_public_read'
  ) then
    create policy "avatars_public_read"
      on storage.objects
      for select
      using (bucket_id = 'avatars');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='avatars_write_own_or_admin'
  ) then
    create policy "avatars_write_own_or_admin"
      on storage.objects
      for all
      to authenticated
      using (
        bucket_id = 'avatars'
        and (
          split_part(name, '/', 1) = auth.uid()::text
          or public.has_role(auth.uid(),'admin')
        )
      )
      with check (
        bucket_id = 'avatars'
        and (
          split_part(name, '/', 1) = auth.uid()::text
          or public.has_role(auth.uid(),'admin')
        )
      );
  end if;

  -- Exports: acesso somente do dono (prefixo user_id/) ou admin
  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='exports_read_own_or_admin'
  ) then
    create policy "exports_read_own_or_admin"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'exports'
        and (
          split_part(name, '/', 1) = auth.uid()::text
          or public.has_role(auth.uid(),'admin')
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='exports_write_own_or_admin'
  ) then
    create policy "exports_write_own_or_admin"
      on storage.objects
      for all
      to authenticated
      using (
        bucket_id = 'exports'
        and (
          split_part(name, '/', 1) = auth.uid()::text
          or public.has_role(auth.uid(),'admin')
        )
      )
      with check (
        bucket_id = 'exports'
        and (
          split_part(name, '/', 1) = auth.uid()::text
          or public.has_role(auth.uid(),'admin')
        )
      );
  end if;
end $$;
