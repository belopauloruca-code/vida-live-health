import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Smartphone, ArrowRight } from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              Pagamento Realizado!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-lg text-gray-600">
              Parabéns! Sua assinatura do Vida Live Premium foi ativada com sucesso.
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">O que acontece agora?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ Acesso imediato a todos os recursos premium</li>
                <li>✅ Planos de refeição personalizados disponíveis</li>
                <li>✅ Biblioteca completa de exercícios desbloqueada</li>
                <li>✅ Assistente IA Dr. de Ajuda ativado</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Ir para o Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/download-app')}
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Baixar Aplicativo Mobile
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              <p>Você receberá um email de confirmação em breve.</p>
              <p>Dúvidas? Entre em contato: contato@vidalive.app</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};