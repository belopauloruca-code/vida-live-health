import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    "Planos de refeição personalizados",
    "Biblioteca completa de exercícios",
    "Acompanhamento de hidratação",
    "Assistente IA Dr. de Ajuda",
    "Relatórios de progresso",
    "Suporte prioritário"
  ];

  const handleSubscribe = () => {
    // Open Stripe payment link in new tab
    window.open('https://buy.stripe.com/6oU7sMb7Y3d0dr4gTB2sM06', '_blank');
    
    // Redirect to success page after a brief delay
    setTimeout(() => {
      navigate('/payment-success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu <span className="text-green-500">Plano Premium</span>
          </h1>
          <p className="text-lg text-gray-600">
            Acesse todos os recursos do Vida Live e transforme sua saúde
          </p>
        </div>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center bg-green-50">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-green-500 rounded-full p-3">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Plano Premium</CardTitle>
            <CardDescription className="text-lg">
              Acesso completo a todas as funcionalidades
            </CardDescription>
            <div className="text-4xl font-bold text-green-500 mt-4">
              €5<span className="text-lg text-gray-500">/mês</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
                onClick={handleSubscribe}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Assinar Agora - €5/mês
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Voltar ao Início
              </Button>
            </div>

            <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2" />
              Pagamento seguro processado pelo Stripe
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Cancele a qualquer momento. Sem compromisso de permanência.</p>
        </div>
      </div>
    </div>
  );
};