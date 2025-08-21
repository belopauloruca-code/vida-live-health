
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Globe, CreditCard, Download, LogOut, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    water: true,
    meals: true,
    exercises: false,
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo! Volte sempre ao Vida Live.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: error.message,
      });
    }
  };

  const exportData = async () => {
    // In a real app, this would generate a CSV file with user data
    toast({
      title: "Exportação iniciada",
      description: "Seus dados serão enviados por e-mail em breve.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2 text-green-500" />
            Configurações
          </h1>
          <p className="text-gray-600">Personalize sua experiência</p>
        </div>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-green-500" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure quando você quer receber lembretes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="water-notifications" className="font-medium">
                  Lembretes de água
                </Label>
                <p className="text-sm text-gray-500">
                  Receba lembretes para beber água durante o dia
                </p>
              </div>
              <Switch
                id="water-notifications"
                checked={notifications.water}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, water: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="meal-notifications" className="font-medium">
                  Lembretes de refeições
                </Label>
                <p className="text-sm text-gray-500">
                  Receba lembretes para suas refeições planejadas
                </p>
              </div>
              <Switch
                id="meal-notifications"
                checked={notifications.meals}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, meals: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="exercise-notifications" className="font-medium">
                  Lembretes de exercícios
                </Label>
                <p className="text-sm text-gray-500">
                  Receba lembretes para fazer exercícios
                </p>
              </div>
              <Switch
                id="exercise-notifications"
                checked={notifications.exercises}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, exercises: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-500" />
              Idioma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Português (Brasil)</span>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <CreditCard className="h-5 w-5 mr-2" />
              Assinatura Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Desbloqueie todos os recursos premium por apenas €5/mês
              </p>
              <div className="flex space-x-2">
                <Button className="bg-green-500 hover:bg-green-600 flex-1">
                  Assinar Premium
                </Button>
                <Button variant="outline">
                  Gerenciar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-green-500" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Baixe todos os seus dados em formato CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={exportData} className="w-full">
              Exportar Meus Dados
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Privacidade e Termos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Política de Privacidade
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Termos de Uso
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Sobre o Vida Live
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
