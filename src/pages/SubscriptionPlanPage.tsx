import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Crown, Calendar, CreditCard, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const SubscriptionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    navigate('/payment');
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open Stripe customer portal in a new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      // Fallback to generic portal if edge function fails
      window.open('https://billing.stripe.com/p/login/test_portal', '_blank');
    }
  };

  const handleRefreshSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      // Reload subscription data
      loadSubscription();
    } catch (error: any) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Plano</h1>
          <p className="text-gray-600">Gerencie sua assinatura do Vida Live</p>
        </div>

        {subscription ? (
          // Active Subscription
          <Card className="border-green-200 mb-6">
            <CardHeader className="bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="h-6 w-6 text-green-500 mr-2" />
                  <div>
                    <CardTitle className="text-xl">Plano Premium Ativo</CardTitle>
                    <CardDescription>Você tem acesso completo ao Vida Live</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Detalhes da Assinatura</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plano:</span>
                        <span className="font-medium">Premium Monthly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">€5.00/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">Ativo</span>
                      </div>
                      {subscription.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Próxima cobrança:</span>
                          <span className="font-medium">
                            {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recursos Inclusos</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>✅ Planos de refeição ilimitados</li>
                      <li>✅ Biblioteca completa de exercícios</li>
                      <li>✅ Assistente IA Dr. de Ajuda</li>
                      <li>✅ Relatórios de progresso</li>
                      <li>✅ Suporte prioritário</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefreshSubscription}
                  className="flex-1"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // No Active Subscription
          <Card className="border-orange-200 mb-6">
            <CardHeader className="bg-orange-50">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-orange-500 mr-2" />
                <div>
                  <CardTitle className="text-xl">Plano Gratuito</CardTitle>
                  <CardDescription>Upgrade para Premium e desbloqueie todos os recursos</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recursos Atuais (Gratuito)</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>✅ Dashboard básico</li>
                    <li>✅ Controle de hidratação</li>
                    <li>❌ Planos de refeição limitados</li>
                    <li>❌ Biblioteca completa de exercícios</li>
                    <li>❌ Assistente IA Dr. de Ajuda</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Upgrade para Premium</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Por apenas €5/mês, tenha acesso completo a todos os recursos do Vida Live
                  </p>
                  <Button 
                    onClick={handleSubscribe}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Assinar Premium - €5/mês
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>Email:</strong> contato@vidalive.app</p>
              <p><strong>Suporte:</strong> Segunda a Sexta, 9h às 18h</p>
              <p><strong>FAQ:</strong> Visite nossa seção de perguntas frequentes</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};