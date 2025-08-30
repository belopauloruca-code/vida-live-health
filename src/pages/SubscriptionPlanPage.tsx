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
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    isLifetime
  } = usePremiumAccess();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const plans = [{
    id: 'basic',
    name: 'Básico',
    price: '€6,99',
    period: '/mês',
    popular: false,
    features: ['Plano alimentar personalizado', 'Receitas saudáveis', 'Acompanhamento de peso', 'Suporte por e-mail'],
    stripeUrl: 'https://buy.stripe.com/3cI00kfoedRE3QugTB2sM0a',
    icon: CheckCircle,
    category: 'traditional'
  }, {
    id: 'premium',
    name: 'Premium',
    price: '€12,99',
    period: '/mês',
    popular: false,
    features: ['Tudo do Básico', 'Exercícios personalizados', 'Planos semanais adaptados', 'Acompanhamento nutricional', 'Relatórios de progresso', 'Suporte prioritário'],
    stripeUrl: 'https://buy.stripe.com/eVq14ob7YfZM0EieLt2sM09',
    icon: Crown,
    category: 'traditional'
  }, {
    id: 'elite',
    name: 'Elite',
    price: '€36,99',
    period: '/anual',
    popular: false,
    features: ['Tudo do Premium', 'Consultoria nutricional individual', 'Planos adaptados a condições médicas', 'Videochamadas com nutricionistas', 'Lista de compras automática', 'Acesso antecipado a novidades'],
    stripeUrl: 'https://buy.stripe.com/fZufZi6RI8xk72G32L2sM0b',
    icon: Star,
    category: 'traditional'
  }, {
    id: 'monthly',
    name: 'Vida Live Mensal',
    price: '€19,99',
    period: '/mês',
    popular: false,
    yearlyEquivalent: '€239,88/ano',
    savings: null,
    features: ['Planos de refeição personalizados', 'Biblioteca completa de exercícios', 'Acompanhamento de hidratação', 'Assistente IA Dr. de Ajuda', 'Relatórios de progresso', 'Suporte prioritário'],
    stripeUrl: 'https://buy.stripe.com/3cI00kfoedRE3QugTB2sM0a',
    icon: Crown,
    category: 'featured'
  }, {
    id: 'yearly',
    name: 'Vida Live Anual',
    price: '€167,99',
    period: '/ano',
    popular: true,
    monthlyEquivalent: '€13,99/mês',
    savings: 'Economize €71,89',
    features: ['Tudo do plano mensal', 'Economize 30% no valor total', 'Pagamento único anual', 'Acesso garantido por 12 meses', 'Suporte prioritário premium', 'Atualizações gratuitas'],
    stripeUrl: 'https://buy.stripe.com/eVq14ob7YfZM0EieLt2sM09',
    icon: Star,
    category: 'featured'
  }];
  return <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        

        {/* Current Subscription Status */}
        {subscription && <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isLifetime ? <Infinity className="h-5 w-5 text-primary mr-2" /> : <Crown className="h-5 w-5 text-primary mr-2" />}
                  <div>
                    <CardTitle className="text-lg">
                      {isLifetime ? 'Acesso Vitalício' : 'Assinatura Ativa'}
                    </CardTitle>
                    <CardDescription>
                      Plano {subscription.subscription_tier || 'Premium'} • 
                      {isLifetime ? ' Acesso permanente' : subscription.subscription_end ? ` Renova em ${new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}` : ' Assinatura ativa'}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {isLifetime ? <><Infinity className="h-3 w-3 mr-1" />Vitalício</> : <><CheckCircle className="h-3 w-3 mr-1" />Ativo</>}
                </Badge>
              </div>
            </CardHeader>
          </Card>}

        {/* Featured Plans Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Planos Recomendados</h2>
            <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-6">
              <div className="px-4 py-2 rounded-md bg-background text-foreground font-medium shadow-sm">
                Mensal vs Anual
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Escolha entre pagamento mensal ou anual com desconto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {plans.filter(plan => plan.category === 'featured').map(plan => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription && subscription.subscription_tier === plan.name;
            const shouldDisableButton = isCurrentPlan || isLifetime && subscription?.subscription_tier === 'elite';
            return <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'} ${isCurrentPlan ? 'bg-primary/5' : ''}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
                        🔥 MELHOR VALOR
                      </Badge>
                    </div>}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      {plan.id === 'monthly' && <span className="text-3xl">💳</span>}
                      {plan.id === 'yearly' && <span className="text-3xl">💎</span>}
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    
                    {/* Main Price Display */}
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-lg text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    
                    {/* Monthly Equivalent or Yearly Total */}
                    {plan.monthlyEquivalent && <div className="text-sm text-muted-foreground">
                        Equivale a {plan.monthlyEquivalent}
                      </div>}
                    {plan.yearlyEquivalent && <div className="text-sm text-muted-foreground">
                        Total anual: {plan.yearlyEquivalent}
                      </div>}
                    
                    {/* Savings Badge */}
                    {plan.savings && <div className="mt-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          {plan.savings}
                        </Badge>
                      </div>}
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                        </li>)}
                    </ul>
                    
                    <Button className={`w-full py-6 text-lg font-semibold ${plan.popular ? 'bg-primary hover:bg-primary/90 shadow-lg' : ''}`} variant={plan.popular ? 'default' : 'outline'} onClick={() => handleSubscribe(plan.stripeUrl)} disabled={shouldDisableButton}>
                      {isCurrentPlan && isLifetime ? <>
                          <Infinity className="h-5 w-5 mr-2" />
                          Acesso Vitalício
                        </> : isCurrentPlan ? <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Plano Atual
                        </> : <>
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Assinar {plan.name}
                        </>}
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>

        {/* Traditional Plans Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Outros Planos Disponíveis</h2>
            <p className="text-sm text-muted-foreground">
              Opções tradicionais com diferentes níveis de funcionalidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.filter(plan => plan.category === 'traditional').map(plan => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription && subscription.subscription_tier === plan.name;
            const shouldDisableButton = isCurrentPlan || isLifetime && subscription?.subscription_tier === 'elite';
            return <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border'} ${isCurrentPlan ? 'bg-primary/5' : ''}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        Mais Popular
                      </Badge>
                    </div>}
                  
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
                      {plan.features.map((feature, index) => <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>)}
                    </ul>
                    
                    <Button className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} variant={plan.popular ? 'default' : 'outline'} onClick={() => handleSubscribe(plan.stripeUrl)} disabled={shouldDisableButton}>
                      {isCurrentPlan && isLifetime ? <>
                          <Infinity className="h-4 w-4 mr-2" />
                          Acesso Vitalício
                        </> : isCurrentPlan ? <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Plano Atual
                        </> : <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Assinar {plan.name}
                        </>}
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>
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

        {/* Help Section */}
        <Card>
          
          
        </Card>
      </div>
      
      <BottomNavigation />
    </div>;
};