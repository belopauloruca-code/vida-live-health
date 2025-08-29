import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const settingsSchema = z.object({
  trial_duration_days: z.string().min(1, 'Duração do trial é obrigatória'),
  premium_price_eur: z.string().min(1, 'Preço premium é obrigatório'),
  app_name: z.string().min(1, 'Nome do app é obrigatório'),
  support_email: z.string().email('Email de suporte inválido'),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      trial_duration_days: '7',
      premium_price_eur: '29.99',
      app_name: 'Vida Leve',
      support_email: 'support@vidaleve.com',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (data) {
        const settingsObj: Record<string, string> = {};
        data.forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value;
        });

        form.reset({
          trial_duration_days: settingsObj.trial_duration_days || '7',
          premium_price_eur: settingsObj.premium_price_eur || '29.99',
          app_name: settingsObj.app_name || 'Vida Leve',
          support_email: settingsObj.support_email || 'support@vidaleve.com',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Usando valores padrão',
        variant: 'destructive',
      });
    }
    setLoadingSettings(false);
  };

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true);
    try {
      // Update each setting
      const updates = Object.entries(data).map(([key, value]) =>
        supabase
          .from('app_settings')
          .upsert({ 
            setting_key: key, 
            setting_value: value,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'setting_key' 
          })
      );

      await Promise.all(updates);

      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram atualizadas com sucesso',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie parâmetros gerais da aplicação</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Configure as opções básicas da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="app_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Aplicação</FormLabel>
                      <FormControl>
                        <Input placeholder="Vida Leve" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome exibido na aplicação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="support_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Suporte</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="support@vidaleve.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email para contato de suporte
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Assinatura</CardTitle>
            <CardDescription>
              Configure preços e períodos de trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="trial_duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração do Trial (dias)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="7" {...field} />
                      </FormControl>
                      <FormDescription>
                        Quantos dias de trial gratuito
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="premium_price_eur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Premium (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="29.99" {...field} />
                      </FormControl>
                      <FormDescription>
                        Preço mensal da assinatura premium em euros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          className="bg-green-500 hover:bg-green-600"
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};