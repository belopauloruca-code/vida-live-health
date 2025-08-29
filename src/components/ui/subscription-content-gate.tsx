import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Lock, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

interface SubscriptionContentGateProps {
  children?: React.ReactNode;
  requiredTier: 'basic' | 'premium' | 'elite';
  title?: string;
  description?: string;
}

export const SubscriptionContentGate: React.FC<SubscriptionContentGateProps> = ({
  children,
  requiredTier,
  title,
  description
}) => {
  const navigate = useNavigate();
  const { hasBasicAccess, hasPremiumAccess_Level, hasEliteAccess, subscriptionTier } = usePremiumAccess();

  const hasRequiredAccess = () => {
    switch (requiredTier) {
      case 'basic':
        return hasBasicAccess;
      case 'premium':
        return hasPremiumAccess_Level;
      case 'elite':
        return hasEliteAccess;
    }
  };

  if (hasRequiredAccess()) {
    return <>{children}</>;
  }

  const getTierIcon = () => {
    switch (requiredTier) {
      case 'basic':
        return <Lock className="h-8 w-8 text-muted-foreground" />;
      case 'premium':
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 'elite':
        return <Star className="h-8 w-8 text-purple-500" />;
    }
  };

  const getTierName = () => {
    switch (requiredTier) {
      case 'basic':
        return 'Básico';
      case 'premium':
        return 'Premium';
      case 'elite':
        return 'Elite';
    }
  };

  const getUpgradeMessage = () => {
    if (!subscriptionTier) {
      return `Assine o plano ${getTierName()} para acessar este conteúdo.`;
    }
    
    return `Faça upgrade para o plano ${getTierName()} para acessar este conteúdo.`;
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getTierIcon()}
        </div>
        <CardTitle className="text-xl">
          {title || `Conteúdo ${getTierName()}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {description || getUpgradeMessage()}
        </p>
        <Button 
          onClick={() => navigate('/subscription')}
          className="w-full"
        >
          {!subscriptionTier ? 'Ver Planos' : 'Fazer Upgrade'}
        </Button>
      </CardContent>
    </Card>
  );
};