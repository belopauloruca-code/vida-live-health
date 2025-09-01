import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Crown, Zap, Star, RefreshCw, CheckCircle, ExternalLink, Infinity } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

export const SubscriptionPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isLifetime } = usePremiumAccess();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  // Real-time listener for subscription changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('subscription-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'subscribers',
      filter: `user_id=eq.${user.id}`
    }, payload => {
      console.log('Subscription updated:', payload);
      loadSubscription();
      toast({
        title: "Assinatura atualizada",
        description: "Seu status de assinatura foi atualizado automaticamente."
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  const loadSubscription = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('subscribers').select('*').eq('user_id', user?.id).eq('subscribed', true).single();
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
      const {
        data,
        error
      } = await supabase.functions.invoke('check-subscription');
      if (error) {
        // Handle specific error messages from the function
        const errorMessage = error.message || 'Erro desconhecido';
        console.error('Refresh error:', error);
        if (errorMessage.includes('STRIPE_SECRET_KEY')) {
          toast({
            title: "Erro de configuração",
            description: "Sistema em manutenção. Tente novamente mais tarde.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('Authentication')) {
          toast({
            title: "Erro de autenticação",
            description: "Por favor, faça login novamente.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('not authenticated')) {
          toast({
            title: "Não autenticado",
            description: "Faça login para verificar sua assinatura.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao atualizar",
            description: `${errorMessage}. Tente novamente em alguns instantes.`,
            variant: "destructive"
          });
        }
        return;
      }

      // Check if we received subscription data
      if (data && typeof data.subscribed !== 'undefined') {
        if (data.subscribed) {
          toast({
            title: "Assinatura encontrada! 🎉",
            description: `Plano ${data.subscription_tier || 'Premium'} ativo.`
          });
        } else {
          toast({
            title: "Nenhuma assinatura ativa",
            description: "Nenhuma assinatura foi encontrada. Considere assinar um plano."
          });
        }
      }

      // Reload subscription data
      await loadSubscription();
      toast({
        title: "Status atualizado",
        description: "Informações da assinatura atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Erro de conexão. Verifique sua internet e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>;
  }
  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      monthlyPrice: 6.99,
      yearlyPrice: 67.10,
      popular: false,
      features: [
        'Plano alimentar personalizado',
        'Receitas saudáveis',
        'Acompanhamento de peso',
        'Suporte por e-mail'
      ],
      stripeMonthlyUrl: 'https://buy.stripe.com/3cI00kfoedRE3QugTB2sM0a',
      stripeYearlyUrl: 'https://buy.stripe.com/3cI00kfoedRE3QugTB2sM0a',
      icon: '✨'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 12.99,
      yearlyPrice: 124.70,
      popular: true,
      features: [
        'Tudo do Básico',
        'Exercícios personalizados',
        'Planos semanais',
        'Acompanhamento nutricional',
        'Relatórios de progresso',
        'Suporte prioritário'
      ],
      stripeMonthlyUrl: 'https://buy.stripe.com/eVq14ob7YfZM0EieLt2sM09',
      stripeYearlyUrl: 'https://buy.stripe.com/eVq14ob7YfZM0EieLt2sM09',
      icon: '👑'
    },
    {
      id: 'elite',
      name: 'Elite',
      monthlyPrice: 13.99,
      yearlyPrice: 134.30,
      popular: false,
      features: [
        'Tudo do Premium',
        'Consultoria individual',
        'Planos adaptados a condições médicas',
        'Videochamadas',
        'Lista de compras automática',
        'Acesso antecipado a novidades'
      ],
      stripeMonthlyUrl: 'https://buy.stripe.com/fZufZi6RI8xk72G32L2sM0b',
      stripeYearlyUrl: 'https://buy.stripe.com/fZufZi6RI8xk72G32L2sM0b',
      icon: '⚡'
    }
  ];

  const getCurrentPrice = (plan: any) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getCurrentUrl = (plan: any) => {
    return isYearly ? plan.stripeYearlyUrl : plan.stripeMonthlyUrl;
  };

  const getSavingsPercentage = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    return Math.round((savings / monthlyCost) * 100);
  };
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plano semanal personalizado para você.
          </p>
          
          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                !isYearly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                isYearly
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                20% desconto
              </Badge>
            </button>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="border-primary/20 bg-primary/5 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLifetime ? (
                    <Infinity className="h-5 w-5 text-primary mr-2" />
                  ) : (
                    <Crown className="h-5 w-5 text-primary mr-2" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {isLifetime ? 'Acesso Vitalício' : 'Assinatura Ativa'}
                    </CardTitle>
                    <CardDescription>
                      Plano {subscription.subscription_tier || 'Premium'} • 
                      {isLifetime 
                        ? ' Acesso permanente' 
                        : subscription.subscription_end 
                          ? ` Renova em ${new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}` 
                          : ' Assinatura ativa'
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {isLifetime ? (
                    <>
                      <Infinity className="h-3 w-3 mr-1" />
                      Vitalício
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = subscription && subscription.subscription_tier === plan.name;
            const shouldDisableButton = isCurrentPlan || (isLifetime && subscription?.subscription_tier === 'elite');
            const currentPrice = getCurrentPrice(plan);
            const currentUrl = getCurrentUrl(plan);
            const savingsPercentage = getSavingsPercentage(plan);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105 bg-gradient-to-b from-primary/5 to-primary/10' 
                    : 'border-border hover:border-primary/30'
                } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold shadow-lg">
                      👑 Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <span className="text-4xl">{plan.icon}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  
                  {/* Price Display with Animation */}
                  <div className="mt-6 mb-4">
                    <div className="relative overflow-hidden">
                      <span 
                        className={`text-4xl font-bold text-foreground inline-block transition-all duration-500 transform ${
                          isYearly ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
                        }`}
                        key={`${plan.id}-${isYearly ? 'yearly' : 'monthly'}`}
                      >
                        €{currentPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-lg text-muted-foreground ml-1">
                      {isYearly ? '/ano' : '/mês'}
                    </span>
                  </div>
                  
                  {/* Savings Display */}
                  {isYearly && (
                    <div className="mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Economize {savingsPercentage}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Monthly equivalent for yearly */}
                  {isYearly && (
                    <div className="text-sm text-muted-foreground">
                      Equivale a €{(currentPrice / 12).toFixed(2)}/mês
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'hover:scale-105'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(currentUrl)}
                    disabled={shouldDisableButton}
                  >
                    {isCurrentPlan && isLifetime ? (
                      <>
                        <Infinity className="h-5 w-5 mr-2" />
                        Acesso Vitalício
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Plano Atual
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-5 w-5 mr-2" />
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
            <Button variant="outline" onClick={handleRefreshSubscription} disabled={refreshing} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
          </CardContent>
        </Card>

      </div>
      
      <BottomNavigation />
    </div>
  );
};