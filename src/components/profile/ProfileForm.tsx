
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProfileData {
  name: string;
  age: string;
  sex: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  goal: string;
  wake_time: string;
  sleep_time: string;
  work_hours: string;
  water_goal_ml: string;
}

interface ProfileFormProps {
  profile: ProfileData;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profileData = {
        id: user.id,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        activity_level: formData.activity_level,
        goal: formData.goal,
        wake_time: formData.wake_time || null,
        sleep_time: formData.sleep_time || null,
        work_hours: formData.work_hours || null,
        water_goal_ml: formData.water_goal_ml ? parseInt(formData.water_goal_ml) : 3850,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(formData);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Informações Básicas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Anos"
              />
            </div>
            <div>
              <Label htmlFor="sex">Sexo</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal">Objetivo</Label>
              <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emagrecer">Emagrecer</SelectItem>
                  <SelectItem value="Manter peso">Manter peso</SelectItem>
                  <SelectItem value="Ganhar massa">Ganhar massa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Físicos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dados Físicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height_cm}
                onChange={(e) => handleInputChange('height_cm', e.target.value)}
                placeholder="180"
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                placeholder="70.5"
              />
            </div>
            <div>
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select value={formData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentário">Sedentário</SelectItem>
                  <SelectItem value="Leve">Leve</SelectItem>
                  <SelectItem value="Moderado">Moderado</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta de Hidratação */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Meta de Hidratação</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="water_goal">Meta diária de água (ml)</Label>
            <Input
              id="water_goal"
              type="number"
              value={formData.water_goal_ml}
              onChange={(e) => handleInputChange('water_goal_ml', e.target.value)}
              placeholder="3850"
            />
          </div>
        </CardContent>
      </Card>

      {/* Horários */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Horários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wake_time">Horário de acordar</Label>
              <Input
                id="wake_time"
                type="time"
                value={formData.wake_time}
                onChange={(e) => handleInputChange('wake_time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sleep_time">Horário de dormir</Label>
              <Input
                id="sleep_time"
                type="time"
                value={formData.sleep_time}
                onChange={(e) => handleInputChange('sleep_time', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="work_hours">Horário de trabalho</Label>
            <Input
              id="work_hours"
              value={formData.work_hours}
              onChange={(e) => handleInputChange('work_hours', e.target.value)}
              placeholder="Ex: 9h às 18h"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Button 
        onClick={saveProfile}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 mb-6"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </>
  );
};
