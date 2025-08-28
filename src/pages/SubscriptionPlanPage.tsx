import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Crown, Zap, Star, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user?.id)
        .eq('subscribed', true)
        .single();

      if (!error && data) {
        setSubscription(data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (stripeUrl: string) => {
    // Open Stripe checkout in a new tab
    window.open(stripeUrl, '_blank');
  };

  const handleRefreshSubscription = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      // Reload subscription data
      await loadSubscription();
      
      toast({
        title: "Status atualizado",
        description: "Informações da assinatura atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: '€6.99',
      period: '/mês',
      popular: false,
      features: [
        'Plano alimentar personalizado',
        'Receitas saudáveis',
        'Acompanhamento de peso',
        'Suporte por e-mail'
      ],
      stripeUrl: 'https://buy.stripe.com/3cI00kfoedRE3QugTB2sM0a',
      icon: CheckCircle
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '€12.99',
      period: '/mês',
      popular: true,
      features: [
        'Tudo do Básico',
        'Exercícios personalizados',
        'Planos semanais adaptados',
        'Acompanhamento nutricional',
        'Relatórios de progresso',
        'Suporte prioritário'
      ],
      stripeUrl: 'https://buy.stripe.com/eVq14ob7YfZM0EieLt2sM09',
      icon: Crown
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '€36.99',
      period: '/mês',
      popular: false,
      features: [
        'Tudo do Premium',
        'Consultoria nutricional individual',
        'Planos adaptados a condições médicas',
        'Videochamadas com nutricionistas',
        'Lista de compras automática',
        'Acesso antecipado a novidades'
      ],
      stripeUrl: 'https://buy.stripe.com/fZufZi6RI8xk72G32L2sM0b',
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Planos de Assinatura</h1>
          <p className="text-muted-foreground">Escolha o plano ideal para seus objetivos de saúde</p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Crown className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <CardTitle className="text-lg">Assinatura Ativa</CardTitle>
                    <CardDescription>
                      Plano {subscription.subscription_tier || 'Premium'} • 
                      {subscription.subscription_end ? 
                        ` Renova em ${new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}` : 
                        ' Assinatura ativa'
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription && subscription.subscription_tier === plan.name;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border'} ${isCurrentPlan ? 'bg-primary/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    {plan.id === 'basic' && <span className="text-2xl">✨</span>}
                    {plan.id === 'premium' && <span className="text-2xl">👑</span>}
                    {plan.id === 'elite' && <span className="text-2xl">⚡</span>}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.stripeUrl)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Plano Atual
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assinar {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Refresh Button */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Atualizar Status da Assinatura</CardTitle>
            <CardDescription>
              Acabou de fazer uma assinatura? Clique abaixo para atualizar seu status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={handleRefreshSubscription}
              disabled={refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
          </CardContent>
        </Card>

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