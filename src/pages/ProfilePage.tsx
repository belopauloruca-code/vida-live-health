
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Calculator, Droplets, Settings } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    sex: 'Masculino',
    height_cm: '',
    weight_kg: '',
    activity_level: 'Sedentário',
    goal: 'Emagrecer',
    wake_time: '',
    sleep_time: '',
    work_hours: '',
    water_goal_ml: '3850',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile({
        name: data.name || '',
        age: data.age?.toString() || '',
        sex: data.sex || 'Masculino',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || '',
        activity_level: data.activity_level || 'Sedentário',
        goal: data.goal || 'Emagrecer',
        wake_time: data.wake_time || '',
        sleep_time: data.sleep_time || '',
        work_hours: data.work_hours || '',
        water_goal_ml: data.water_goal_ml?.toString() || '3850',
        avatar_url: data.avatar_url || '',
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          age: profile.age ? parseInt(profile.age) : null,
          sex: profile.sex,
          height_cm: profile.height_cm ? parseInt(profile.height_cm) : null,
          weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
          activity_level: profile.activity_level,
          goal: profile.goal,
          wake_time: profile.wake_time,
          sleep_time: profile.sleep_time,
          work_hours: profile.work_hours,
          water_goal_ml: profile.water_goal_ml ? parseInt(profile.water_goal_ml) : 3850,
        })
        .eq('id', user.id);

      if (error) throw error;

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

  const calculateBMI = () => {
    const weight = parseFloat(profile.weight_kg);
    const height = parseFloat(profile.height_cm) / 100;
    
    if (weight && height) {
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    if (bmi < 35) return { text: 'Obesidade grau I', color: 'text-orange-600' };
    if (bmi < 40) return { text: 'Obesidade grau II', color: 'text-red-600' };
    return { text: 'Obesidade grau III', color: 'text-red-700' };
  };

  const calculateWaterGoal = () => {
    const weight = parseFloat(profile.weight_kg);
    if (weight) {
      return Math.round(weight * 35);
    }
    return 3850;
  };

  const bmi = calculateBMI();
  const bmiData = bmi ? getBMIClassification(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="h-6 w-6 mr-2 text-green-500" />
            Meu Perfil
          </h1>
          <p className="text-gray-600">Mantenha suas informações atualizadas</p>
        </div>

        {/* Avatar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{profile.name || 'Usuário'}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Alterar Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Display */}
        {bmi && (
          <Card className="mb-6 border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Calculator className="h-5 w-5 mr-2" />
                Índice de Massa Corporal (IMC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bmi}</div>
                  <div className={`text-sm font-medium ${bmiData?.color}`}>
                    {bmiData?.text}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{profile.weight_kg} kg</div>
                  <div>{profile.height_cm} cm</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
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
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Anos"
                />
              </div>
              <div>
                <Label htmlFor="sex">Sexo</Label>
                <Select value={profile.sex} onValueChange={(value) => setProfile(prev => ({ ...prev, sex: value }))}>
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
                <Select value={profile.goal} onValueChange={(value) => setProfile(prev => ({ ...prev, goal: value }))}>
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

        {/* Physical Data */}
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
                  value={profile.height_cm}
                  onChange={(e) => setProfile(prev => ({ ...prev, height_cm: e.target.value }))}
                  placeholder="180"
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight_kg: e.target.value }))}
                  placeholder="70.5"
                />
              </div>
              <div>
                <Label htmlFor="activity">Nível de Atividade</Label>
                <Select value={profile.activity_level} onValueChange={(value) => setProfile(prev => ({ ...prev, activity_level: value }))}>
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

        {/* Hydration Goal */}
        <Card className="mb-6 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Droplets className="h-5 w-5 mr-2" />
              Meta de Hidratação
            </CardTitle>
            <CardDescription>
              Recomendado: {calculateWaterGoal()}ml baseado no seu peso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="water_goal">Meta diária de água (ml)</Label>
              <Input
                id="water_goal"
                type="number"
                value={profile.water_goal_ml}
                onChange={(e) => setProfile(prev => ({ ...prev, water_goal_ml: e.target.value }))}
                placeholder="3850"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Horários</CardTitle>
            <CardDescription>
              Ajude-nos a personalizar seus lembretes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wake_time">Horário de acordar</Label>
                <Input
                  id="wake_time"
                  type="time"
                  value={profile.wake_time}
                  onChange={(e) => setProfile(prev => ({ ...prev, wake_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sleep_time">Horário de dormir</Label>
                <Input
                  id="sleep_time"
                  type="time"
                  value={profile.sleep_time}
                  onChange={(e) => setProfile(prev => ({ ...prev, sleep_time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="work_hours">Horário de trabalho</Label>
              <Input
                id="work_hours"
                value={profile.work_hours}
                onChange={(e) => setProfile(prev => ({ ...prev, work_hours: e.target.value }))}
                placeholder="Ex: 9h às 18h"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          onClick={saveProfile}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 mb-6"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
