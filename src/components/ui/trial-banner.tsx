import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Crown } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';
import { useNavigate } from 'react-router-dom';

export const TrialBanner: React.FC = () => {
  const { isTrialActive, isTrialExpired, formatTimeRemaining, isLoading } = useTrial();
  const navigate = useNavigate();

  if (isLoading) return null;

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