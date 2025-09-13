import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useTrial } from '@/hooks/useTrial';
import { useNavigate } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const {
    hasActiveSubscription,
    isLoading,
    isLifetime
  } = usePremiumAccess();
  const {
    isTrialActive,
    isTrialExpired,
    formatTimeRemaining,
    isLoading: trialLoading
  } = useTrial();
  const navigate = useNavigate();
  
  if (isLoading || trialLoading) return null;

  // Se tem trial ativo, mostrar cronômetro
  if (isTrialActive) {
    return (
      <Card className="border-blue-500 bg-blue-50 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  🎉 Trial Premium Ativo
                </p>
                <p className="text-sm text-blue-600">
                  Tempo restante: {formatTimeRemaining}
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/subscription')} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assinar Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se trial expirou, mostrar mensagem de bloqueio
  if (isTrialExpired) {
    return (
      <Card className="border-red-500 bg-red-50 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  ⏰ Trial Expirado
                </p>
                <p className="text-sm text-red-600">
                  Assine para continuar usando os recursos premium
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/subscription')} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Assinar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se tem assinatura ativa, mostrar status premium
  if (hasActiveSubscription) {
    return (
      <Card className="border-primary bg-primary/10 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-lime-600">
                  {isLifetime ? 'Acesso Vitalício' : 'Premium Ativo'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isLifetime ? 'Acesso permanente a todos os recursos' : 'Acesso completo a todos os recursos'}
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate('/settings')} 
              className="border-primary text-primary hover:bg-primary/10"
            >
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem assinatura, mostrar banner para assinar
  return (
    <Card className="border-primary bg-primary/10 mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-primary">Desbloqueie todos os recursos</p>
            <p className="text-sm text-muted-foreground">
              Assine para acessar exercícios premium, planos personalizados e muito mais
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/subscription')} 
            className="bg-primary hover:bg-primary/90"
          >
            Assinar Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};