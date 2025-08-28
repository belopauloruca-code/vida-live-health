
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Target, Calendar, Activity, Plus, LogOut } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [hydrationToday, setHydrationToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3850);

  useEffect(() => {
    loadProfile();
    loadHydrationToday();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
      setWaterGoal(data.water_goal_ml || 3850);
    }
  };

  const loadHydrationToday = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', user.id)
      .gte('ts', `${today}T00:00:00`)
      .lte('ts', `${today}T23:59:59`);
    
    if (data) {
      const total = data.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
      setHydrationToday(total);
    }
  };

  const addWater = async (amount: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: user.id,
        amount_ml: amount,
      });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a água",
      });
    } else {
      setHydrationToday(prev => prev + amount);
      toast({
        title: "Água registrada!",
        description: `${amount}ml adicionados ao seu consumo diário`,
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    }
  };

  const waterProgress = Math.min((hydrationToday / waterGoal) * 100, 100);
  const cupsRemaining = Math.max(0, Math.ceil((waterGoal - hydrationToday) / 250));
  const cupsDrunk = Math.floor(hydrationToday / 250);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Cover Section */}
      <div 
        className="relative h-48 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2)), url('/lovable-uploads/6adff54d-a871-4013-b61d-151fd65d71ca.png')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Vida Live</h1>
            <p className="text-lg opacity-90">Sua jornada de saúde começa aqui</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <BrandHeader 
            title={`Olá, ${profile?.name || 'Usuário'}!`}
            subtitle="Como está sua jornada hoje?"
            showLogo={false}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        
        <TrialBanner />

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                Meta Calórica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1,800</div>
              <p className="text-xs text-gray-500">kcal/dia</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                Refeições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <p className="text-xs text-gray-500">por dia</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                Duração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">7</div>
              <p className="text-xs text-gray-500">dias</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <p className="text-xs text-gray-500">disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Hydration Card */}
        <Card className="mb-6 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Droplets className="h-5 w-5 mr-2" />
              Hidratação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - waterProgress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">{Math.round(waterProgress)}%</span>
                  <span className="text-sm font-bold text-gray-900">{hydrationToday}ml</span>
                  <span className="text-xs text-gray-500">de {waterGoal}ml</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[150, 200, 300, 500].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  onClick={() => addWater(amount)}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  {amount}ml
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{cupsRemaining} copos restantes</span>
              <span>{cupsDrunk} copos bebidos</span>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Card */}
        <Card className="mb-6 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Activity className="h-5 w-5 mr-2" />
              Exercício do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Caminhada Rápida</h3>
                <p className="text-sm text-gray-600">15 min • ~75 kcal</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Polichinelos</h3>
                <p className="text-sm text-gray-600">10 min • ~80 kcal</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Abdominais</h3>
                <p className="text-sm text-gray-600">6 min • ~30 kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-16 border-green-200 hover:bg-green-50"
            onClick={() => window.location.href = '/meal-plans'}
          >
            Ver Planos
          </Button>
          <Button 
            variant="outline" 
            className="h-16 border-green-200 hover:bg-green-50"
            onClick={() => window.location.href = '/exercises'}
          >
            Exercícios
          </Button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
