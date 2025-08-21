
-- População inicial de RECEITAS e EXERCÍCIOS para habilitar os recursos “reais”
-- Obs.: Usa inserções condicionais para evitar duplicados se executado novamente.

begin;

-- Índice para acelerar buscas por tipo de refeição
create index if not exists idx_recipes_meal_type on public.recipes (meal_type);

-- Receitas - Café
insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Aveia com Frutas', 'Café', 320,
  'Aveia, banana, morangos, mel, leite/água',
  'Misture aveia com leite/água, adicione frutas picadas e finalize com mel.',
  10
where not exists (select 1 from public.recipes where title = 'Aveia com Frutas');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Omelete de Legumes', 'Café', 300,
  'Ovos, espinafre, tomate, cebola, azeite, sal e pimenta',
  'Bata os ovos, refogue os legumes no azeite, junte os ovos e cozinhe até firmar.',
  12
where not exists (select 1 from public.recipes where title = 'Omelete de Legumes');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Smoothie Verde', 'Café', 280,
  'Espinafre, banana, maçã, água de coco, gelo',
  'Bata todos os ingredientes no liquidificador até ficar homogêneo.',
  8
where not exists (select 1 from public.recipes where title = 'Smoothie Verde');

-- Receitas - Almoço
insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Frango Grelhado com Arroz Integral', 'Almoço', 450,
  'Peito de frango, arroz integral, brócolis, azeite, sal, pimenta, alho',
  'Tempere e grelhe o frango. Cozinhe o arroz integral. Cozinhe o brócolis no vapor e sirva.',
  25
where not exists (select 1 from public.recipes where title = 'Frango Grelhado com Arroz Integral');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Quinoa com Vegetais', 'Almoço', 420,
  'Quinoa, abobrinha, cenoura, grão-de-bico, cebola, azeite, sal',
  'Cozinhe a quinoa. Refogue os vegetais e o grão-de-bico e misture com a quinoa.',
  30
where not exists (select 1 from public.recipes where title = 'Quinoa com Vegetais');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Peixe Assado com Batata Doce', 'Almoço', 480,
  'Filé de peixe, batata doce, limão, alho, azeite, sal, pimenta',
  'Tempere peixe e batatas, leve ao forno até dourar.',
  28
where not exists (select 1 from public.recipes where title = 'Peixe Assado com Batata Doce');

-- Receitas - Jantar
insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Salmão com Legumes', 'Jantar', 380,
  'Salmão, aspargos/brócolis, batata doce, sal, pimenta, azeite, limão',
  'Asse o salmão com legumes temperados e sirva com batata doce.',
  20
where not exists (select 1 from public.recipes where title = 'Salmão com Legumes');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Peito de Peru com Vagem', 'Jantar', 350,
  'Peito de peru, vagem, batata inglesa, alho, azeite, sal, pimenta',
  'Grelhe o peru e salteie a vagem. Cozinhe a batata e sirva.',
  15
where not exists (select 1 from public.recipes where title = 'Peito de Peru com Vagem');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Tofu com Brócolis e Arroz', 'Jantar', 400,
  'Tofu, brócolis, arroz, shoyu light, alho, gengibre, azeite',
  'Doure o tofu, salteie brócolis com alho e gengibre e sirva com arroz.',
  18
where not exists (select 1 from public.recipes where title = 'Tofu com Brócolis e Arroz');

-- Receitas - Lanche
insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Iogurte com Granola', 'Lanche', 180,
  'Iogurte grego, granola, mel, frutas (opcional)',
  'Monte em camadas: iogurte, granola e finalize com mel/frutas.',
  5
where not exists (select 1 from public.recipes where title = 'Iogurte com Granola');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Mix de Frutas Secas', 'Lanche', 150,
  'Amêndoas, castanhas, damascos, uvas-passas',
  'Porcione um mix de frutas secas e castanhas.',
  2
where not exists (select 1 from public.recipes where title = 'Mix de Frutas Secas');

insert into public.recipes (title, meal_type, kcal, ingredients, instructions, duration_min)
select 'Torrada com Abacate', 'Lanche', 220,
  'Pão integral, abacate, limão, sal, pimenta, azeite',
  'Amasse o abacate com limão, tempere e passe sobre a torrada.',
  7
where not exists (select 1 from public.recipes where title = 'Torrada com Abacate');

-- EXERCÍCIOS
-- Índices úteis
create index if not exists idx_exercises_category on public.exercises (category);
create index if not exists idx_exercises_level on public.exercises (level);

-- Recomendados
insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Caminhada Rápida', 'Recomendados', 20, 120, 'Iniciante', 'Pernas, Glúteos, Core'
where not exists (select 1 from public.exercises where title = 'Caminhada Rápida');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Circuito Corpo Livre', 'Recomendados', 25, 220, 'Intermediário', 'Corpo inteiro'
where not exists (select 1 from public.exercises where title = 'Circuito Corpo Livre');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Bike Indoor Leve', 'Recomendados', 20, 160, 'Iniciante', 'Pernas, Cardio'
where not exists (select 1 from public.exercises where title = 'Bike Indoor Leve');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'HIIT Básico 15''', 'Recomendados', 15, 220, 'Intermediário', 'Cardio, Core, Pernas'
where not exists (select 1 from public.exercises where title = 'HIIT Básico 15''');

-- Cardio
insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Corrida Leve', 'Cardio', 20, 200, 'Iniciante', 'Cardio, Pernas'
where not exists (select 1 from public.exercises where title = 'Corrida Leve');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Pular Corda', 'Cardio', 10, 150, 'Intermediário', 'Cardio, Pernas, Ombros'
where not exists (select 1 from public.exercises where title = 'Pular Corda');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Bike Outdoor Moderada', 'Cardio', 30, 280, 'Intermediário', 'Pernas, Cardio'
where not exists (select 1 from public.exercises where title = 'Bike Outdoor Moderada');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Remo (Ergométrica)', 'Cardio', 20, 220, 'Intermediário', 'Costas, Pernas, Cardio'
where not exists (select 1 from public.exercises where title = 'Remo (Ergométrica)');

-- Força
insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Agachamentos + Afundos', 'Força', 20, 180, 'Iniciante', 'Pernas, Glúteos'
where not exists (select 1 from public.exercises where title = 'Agachamentos + Afundos');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Flexões + Prancha', 'Força', 15, 160, 'Intermediário', 'Peito, Tríceps, Core'
where not exists (select 1 from public.exercises where title = 'Flexões + Prancha');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Levantamento Terra (halteres)', 'Força', 20, 220, 'Intermediário', 'Posterior, Glúteos, Lombar'
where not exists (select 1 from public.exercises where title = 'Levantamento Terra (halteres)');

insert into public.exercises (title, category, duration_min, kcal_est, level, muscles)
select 'Supino com Halteres', 'Força', 20, 200, 'Intermediário', 'Peito, Ombros, Tríceps'
where not exists (select 1 from public.exercises where title = 'Supino com Halteres');

commit;
