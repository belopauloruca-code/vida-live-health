import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Crown, CheckCircle } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useTrial } from '@/hooks/useTrial';
import { useNavigate } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const { hasPremiumAccess, hasActiveSubscription, isTrialActive, isLoading } = usePremiumAccess();
  const { formatTimeRemaining, isTrialExpired } = useTrial();
  const navigate = useNavigate();

  if (isLoading) return null;

  // Se tem assinatura ativa, mostrar status premium
  if (hasActiveSubscription) {
    return (
      <Card className="border-primary bg-primary/10 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-primary-foreground">Premium Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Acesso completo a todos os recursos
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

  if (isTrialActive) {
    return (
      <Card className="border-accent bg-accent/10 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-accent-foreground">Trial Premium Ativo</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Tempo restante: {formatTimeRemaining}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/subscription')}
              className="bg-accent hover:bg-accent/90"
            >
              Assinar Agora
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTrialExpired) {
    return (
      <Card className="border-destructive bg-destructive/10 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive-foreground">Trial Expirado</p>
                <p className="text-sm text-muted-foreground">
                  Assine para acessar todos os recursos premium
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/subscription')}
              className="bg-primary hover:bg-primary/90"
            >
              Assinar Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};