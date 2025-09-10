import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Target, Activity } from 'lucide-react';

interface OnboardingData {
  name: string;
  age: string;
  sex: string;
  weight_kg: string;
  height_cm: string;
  goal: string;
  activity_level: string;
}

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    age: '',
    sex: 'Masculino',
    weight_kg: '',
    height_cm: '',
    goal: 'Emagrecer',
    activity_level: 'Sedentário'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.name.trim()) {
      toast.error('Por favor, insira seu nome');
      return;
    }
    
    const age = parseInt(data.age);
    const weight = parseFloat(data.weight_kg);
    const height = parseInt(data.height_cm);
    
    if (!age || age < 13 || age > 120) {
      toast.error('Por favor, insira uma idade válida (13-120 anos)');
      return;
    }
    
    if (!weight || weight < 30 || weight > 300) {
      toast.error('Por favor, insira um peso válido (30-300 kg)');
      return;
    }
    
    if (!height || height < 100 || height > 250) {
      toast.error('Por favor, insira uma altura válida (100-250 cm)');
      return;
    }

    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Usuário não encontrado');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.user.id,
          name: data.name.trim(),
          age: age,
          sex: data.sex,
          weight_kg: weight,
          height_cm: height,
          goal: data.goal,
          activity_level: data.activity_level,
        });

      if (error) throw error;

      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true');
      
      toast.success('Perfil configurado com sucesso! Bem-vindo ao Vida Leve! 🎉');
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Configurar Perfil</h1>
          <p className="text-muted-foreground">
            Vamos personalizar sua experiência no Vida Leve
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={data.name}
              onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Idade */}
          <div className="space-y-2">
            <Label htmlFor="age">Idade *</Label>
            <Input
              id="age"
              type="number"
              placeholder="Sua idade"
              min="13"
              max="120"
              value={data.age}
              onChange={(e) => setData(prev => ({ ...prev, age: e.target.value }))}
              required
            />
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <Label>Sexo *</Label>
            <Select value={data.sex} onValueChange={(value) => setData(prev => ({ ...prev, sex: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Ex: 70.5"
              min="30"
              max="300"
              value={data.weight_kg}
              onChange={(e) => setData(prev => ({ ...prev, weight_kg: e.target.value }))}
              required
            />
          </div>

          {/* Altura */}
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="Ex: 175"
              min="100"
              max="250"
              value={data.height_cm}
              onChange={(e) => setData(prev => ({ ...prev, height_cm: e.target.value }))}
              required
            />
          </div>

          {/* Objetivo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objetivo
            </Label>
            <Select value={data.goal} onValueChange={(value) => setData(prev => ({ ...prev, goal: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Emagrecer">Emagrecer</SelectItem>
                <SelectItem value="Manter peso">Manter peso</SelectItem>
                <SelectItem value="Ganhar massa muscular">Ganhar massa muscular</SelectItem>
                <SelectItem value="Melhorar condicionamento">Melhorar condicionamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nível de Atividade */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Nível de Atividade
            </Label>
            <Select value={data.activity_level} onValueChange={(value) => setData(prev => ({ ...prev, activity_level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedentário">Sedentário (pouco ou nenhum exercício)</SelectItem>
                <SelectItem value="Leve">Leve (exercício leve 1-3 dias/semana)</SelectItem>
                <SelectItem value="Moderado">Moderado (exercício moderado 3-5 dias/semana)</SelectItem>
                <SelectItem value="Alto">Alto (exercício intenso 6-7 dias/semana)</SelectItem>
                <SelectItem value="Muito Alto">Muito Alto (exercício muito intenso ou trabalho físico)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={loading}
            >
              Pular
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Começar'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};