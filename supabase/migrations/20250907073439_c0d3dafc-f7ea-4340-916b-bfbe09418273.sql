-- Create tea categories table
CREATE TABLE public.tea_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tea recipes table  
CREATE TABLE public.tea_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  preparation TEXT NOT NULL,
  benefits TEXT,
  tips TEXT,
  category_id UUID REFERENCES public.tea_categories(id),
  duration_min INTEGER DEFAULT 10,
  temperature TEXT DEFAULT 'Água quente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tea_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tea_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for tea_categories (public read, admin write)
CREATE POLICY "Anyone can view tea categories"
ON public.tea_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tea categories"
ON public.tea_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for tea_recipes (public read, admin write)
CREATE POLICY "Anyone can view tea recipes"
ON public.tea_recipes  
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage tea recipes"
ON public.tea_recipes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_tea_categories_updated_at
BEFORE UPDATE ON public.tea_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tea_recipes_updated_at
BEFORE UPDATE ON public.tea_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert tea categories
INSERT INTO public.tea_categories (name, description) VALUES
('Termogênicos e Emagrecimento', 'Acelera metabolismo, queima gordura, aumenta energia'),
('Digestivos e Pós-refeição', 'Alivia gases, melhora digestão, reduz inchaço'),
('Calmantes e Sono', 'Relaxamento, melhora sono, reduz ansiedade'),
('Detox e Diuréticos', 'Elimina toxinas, reduz retenção de líquidos, desincha'),
('Imunidade e Energia', 'Fortalece imunidade, aumenta disposição, antioxidante'),
('Beleza e Antioxidantes', 'Melhora pele, cabelo, unhas, combate radicais livres');

-- Insert first 40 tea recipes
WITH category_ids AS (
  SELECT id, name FROM public.tea_categories
)
INSERT INTO public.tea_recipes (title, ingredients, preparation, benefits, tips, category_id) VALUES
-- Termogênicos (category 1)
((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá Verde com Gengibre', '1 sachê de chá verde, 1 fatia de gengibre fresco, 200 ml de água quente, gotas de limão', 'Infundir o chá e gengibre por 5 min, adicionar limão.', 'Termogênico, acelera metabolismo, ajuda a queimar gordura.', 'Evite à noite por conter cafeína.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Hibisco com Canela', '1 colher de hibisco seco, 1 pau de canela, 200 ml de água quente', 'Infundir 7 min e coar.', 'Reduz inchaço, ajuda no emagrecimento, regula glicemia.', 'Consumir gelado para refrescar.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Cavalinha', '1 colher de cavalinha seca, 200 ml de água quente', 'Infundir 10 min.', 'Diurético, combate retenção de líquidos.', 'Excelente para tomar de manhã.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Hortelã com Limão', '5 folhas de hortelã fresca, suco de ½ limão, 200 ml de água quente', 'Infundir a hortelã, coar e adicionar o limão.', 'Digestivo, refrescante, ajuda na saciedade.', 'Ideal após refeições pesadas.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Gengibre com Cúrcuma', '3 rodelas de gengibre, ½ colher de cúrcuma em pó, 200 ml de água', 'Ferver 5 min, coar.', 'Anti-inflamatório, acelera metabolismo.', 'Adoçar com mel se preferir.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Alecrim', '1 colher de alecrim fresco ou seco, 200 ml de água quente', 'Infundir 8 min, coar.', 'Melhora digestão, dá energia, antioxidante.', 'Ótimo no meio da manhã.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Camomila com Erva-Doce', '1 sachê de camomila, 1 colher de erva-doce, 200 ml de água quente', 'Infundir 10 min.', 'Calmante, auxilia no sono e na digestão.', 'Tomar antes de dormir.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Maçã com Canela', '½ maçã picada, 1 pau de canela, 200 ml de água', 'Ferver por 10 min e coar.', 'Acelera metabolismo, antioxidante.', 'Servir morno em dias frios.'),

((SELECT id FROM category_ids WHERE name = 'Imunidade e Energia'), 'Chá de Limão com Gengibre', '2 fatias de limão, 2 rodelas de gengibre, 200 ml de água', 'Ferver 5 min e coar.', 'Termogênico, fortalece imunidade.', 'Perfeito em jejum.'),

((SELECT id FROM category_ids WHERE name = 'Beleza e Antioxidantes'), 'Chá de Hibisco com Cravo', '1 colher de hibisco, 3 cravos, 200 ml de água quente', 'Infundir 7 min.', 'Reduz retenção de líquidos, antioxidante.', 'Pode tomar gelado como "suco detox".'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Capim-Limão', '1 colher de capim-limão fresco, 200 ml de água quente', 'Infundir 10 min.', 'Calmante, ajuda a relaxar e melhorar o sono.', 'Ótimo à noite.'),

((SELECT id FROM category_ids WHERE name = 'Imunidade e Energia'), 'Chá Preto com Limão', '1 sachê de chá preto, suco de ½ limão, 200 ml de água quente', 'Infundir 5 min, adicionar limão.', 'Energizante, acelera metabolismo.', 'Ideal no café da manhã.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Erva-Cidreira', '1 colher de erva-cidreira seca, 200 ml de água quente', 'Infundir 8 min.', 'Calmante, auxilia na digestão.', 'Bom após o jantar.'),

((SELECT id FROM category_ids WHERE name = 'Imunidade e Energia'), 'Chá de Gengibre com Laranja', '3 rodelas de gengibre, casca de ½ laranja, 200 ml de água', 'Ferver por 7 min.', 'Termogênico, rico em vitamina C.', 'Fortalece imunidade.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Hortelã com Gengibre', '5 folhas de hortelã, 2 rodelas de gengibre, 200 ml de água', 'Infundir 7 min.', 'Digestivo, termogênico.', 'Ótimo após o almoço.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Canela com Limão', '1 pau de canela, suco de ½ limão, 200 ml de água', 'Ferver canela por 5 min, adicionar limão.', 'Acelera metabolismo, antioxidante.', 'Tomar em jejum.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Funcho', '1 colher de sementes de funcho, 200 ml de água quente', 'Infundir 10 min.', 'Digestivo, alivia gases.', 'Excelente após refeições.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Gengibre com Hortelã e Limão', '2 rodelas de gengibre, 5 folhas de hortelã, 2 fatias de limão, 200 ml de água', 'Infundir 7 min.', 'Detox, melhora digestão.', 'Pode tomar gelado no verão.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Canela com Maçã Verde', '½ maçã verde picada, 1 pau de canela, 200 ml de água', 'Ferver 8 min.', 'Termogênico, controla ansiedade.', 'Excelente lanche da tarde.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Hibisco com Limão', '1 colher de hibisco, suco de ½ limão, 200 ml de água quente', 'Infundir 7 min, coar e adicionar limão.', 'Detox, combate retenção de líquidos.', 'Tomar gelado antes dos treinos.');

-- Insert more recipes (21-40)
INSERT INTO public.tea_recipes (title, ingredients, preparation, benefits, tips, category_id) VALUES
((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Camomila com Maçã', '1 sachê de camomila, ½ maçã picada, 200 ml de água', 'Ferver a maçã 5 min, adicionar a camomila e infundir 7 min.', 'Calmante, ajuda no sono, levemente doce.', 'Excelente antes de dormir.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Gengibre com Cravo e Canela', '3 rodelas de gengibre, 2 cravos, 1 pau de canela, 200 ml de água', 'Ferver 8 min e coar.', 'Termogênico, antioxidante, fortalece imunidade.', 'Ideal no inverno.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Erva-Doce com Limão', '1 colher de erva-doce, suco de ½ limão, 200 ml de água quente', 'Infundir 10 min e adicionar limão.', 'Digestivo, refrescante, alivia gases.', 'Bom após refeições.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá Verde com Canela', '1 sachê de chá verde, 1 pau de canela, 200 ml de água quente', 'Infundir 5 min.', 'Termogênico, ajuda no emagrecimento.', 'Tomar pela manhã.'),

((SELECT id FROM category_ids WHERE name = 'Beleza e Antioxidantes'), 'Chá de Hibisco com Laranja', '1 colher de hibisco, casca de ½ laranja, 200 ml de água', 'Ferver casca de laranja, adicionar hibisco e infundir 5 min.', 'Detox, rico em antioxidantes e vitamina C.', 'Excelente gelado.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Melissa com Hortelã', '1 colher de melissa, 5 folhas de hortelã, 200 ml de água quente', 'Infundir 10 min.', 'Calmante, ajuda na ansiedade e digestão.', 'Perfeito no fim da tarde.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Gengibre com Abacaxi', 'Casca de 2 fatias de abacaxi, 2 rodelas de gengibre, 200 ml de água', 'Ferver 10 min.', 'Detox, melhora digestão, acelera metabolismo.', 'Tomar gelado.'),

((SELECT id FROM category_ids WHERE name = 'Imunidade e Energia'), 'Chá Preto com Hortelã', '1 sachê de chá preto, 5 folhas de hortelã, 200 ml de água quente', 'Infundir 5 min.', 'Energizante, refrescante.', 'Bom pela manhã.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Canela com Cravo', '1 pau de canela, 3 cravos, 200 ml de água', 'Ferver 8 min.', 'Termogênico, antioxidante.', 'Ideal para dias frios.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Limão-Siciliano com Alecrim', 'Casca de ½ limão-siciliano, 1 ramo de alecrim, 200 ml de água', 'Ferver casca, adicionar alecrim e infundir 5 min.', 'Digestivo, antioxidante.', 'Perfeito no pós-refeição.'),

((SELECT id FROM category_ids WHERE name = 'Beleza e Antioxidantes'), 'Chá de Hibisco com Maçã', '1 colher de hibisco, ½ maçã picada, 200 ml de água', 'Ferver maçã, adicionar hibisco e infundir 5 min.', 'Reduz retenção de líquidos, antioxidante.', 'Tomar gelado no verão.'),

((SELECT id FROM category_ids WHERE name = 'Digestivos e Pós-refeição'), 'Chá de Hortelã com Erva-Doce', '5 folhas de hortelã, 1 colher de erva-doce, 200 ml de água quente', 'Infundir 8 min.', 'Digestivo, alivia gases, refrescante.', 'Bom após refeições pesadas.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Camomila com Lavanda', '1 sachê de camomila, ½ colher de lavanda seca, 200 ml de água quente', 'Infundir 10 min.', 'Calmante, auxilia no relaxamento.', 'Tomar antes de dormir.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá Verde com Hortelã', '1 sachê de chá verde, 5 folhas de hortelã, 200 ml de água quente', 'Infundir 5 min.', 'Termogênico, refrescante.', 'Bom para beber gelado.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Canela com Hibisco', '1 pau de canela, 1 colher de hibisco, 200 ml de água', 'Infundir 7 min.', 'Termogênico, antioxidante, combate inchaço.', 'Excelente antes de treinar.'),

((SELECT id FROM category_ids WHERE name = 'Imunidade e Energia'), 'Chá de Gengibre com Limão e Mel', '3 rodelas de gengibre, suco de ½ limão, 1 colher de mel, 200 ml de água', 'Ferver gengibre, coar, adicionar limão e mel.', 'Fortalece imunidade, termogênico.', 'Ótimo em dias frios.'),

((SELECT id FROM category_ids WHERE name = 'Detox e Diuréticos'), 'Chá de Hortelã com Casca de Abacaxi', 'Casca de 2 fatias de abacaxi, 5 folhas de hortelã, 200 ml de água', 'Ferver cascas, adicionar hortelã e infundir 5 min.', 'Detox, digestivo, refrescante.', 'Servir gelado.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Capim-Santo com Gengibre', '1 colher de capim-santo, 2 rodelas de gengibre, 200 ml de água', 'Infundir 10 min.', 'Calmante, termogênico.', 'Bom à noite, mas em pouca quantidade.'),

((SELECT id FROM category_ids WHERE name = 'Calmantes e Sono'), 'Chá de Erva-Cidreira com Maçã', '1 colher de erva-cidreira, ½ maçã picada, 200 ml de água', 'Ferver maçã, adicionar erva-cidreira e infundir 5 min.', 'Calmante, digestivo.', 'Bom após o jantar.'),

((SELECT id FROM category_ids WHERE name = 'Termogênicos e Emagrecimento'), 'Chá de Hibisco com Gengibre', '1 colher de hibisco, 2 rodelas de gengibre, 200 ml de água quente', 'Infundir 7 min.', 'Acelera metabolismo, combate retenção.', 'Ideal antes de treinar.');