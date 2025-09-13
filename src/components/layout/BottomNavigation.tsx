
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, Activity, Download, User, MessageCircle, Lock, Utensils, BarChart3, Coffee, Heart, Zap, Star } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasBasicAccess, hasPremiumAccess_Level } = usePremiumAccess();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('navigation.dashboard'), path: '/dashboard', requiresPremium: false, requiredTier: undefined },
    { icon: Utensils, label: t('navigation.meals'), path: '/meal-plans', requiresPremium: true, requiredTier: 'basic' as const },
    { icon: Activity, label: t('navigation.exercises'), path: '/exercises', requiresPremium: true, requiredTier: 'basic' as const },
    { icon: Coffee, label: 'Chás', path: '/teas', requiresPremium: true, requiredTier: 'basic' as const },
    { icon: MessageCircle, label: t('navigation.assistant'), path: '/ai-assistant', requiresPremium: true, requiredTier: 'premium' as const },
    { icon: User, label: t('navigation.profile'), path: '/profile', requiresPremium: true, requiredTier: 'basic' as const },
  ];

  const handleNavigation = (path: string, requiresPremium: boolean, requiredTier?: 'basic' | 'premium' | 'elite' | null) => {
    if (requiresPremium) {
      let hasAccess = false;
      if (requiredTier === 'basic') {
        hasAccess = hasBasicAccess;
      } else if (requiredTier === 'premium') {
        hasAccess = hasPremiumAccess_Level;
      }
      
      if (!hasAccess) {
        navigate('/subscription');
        return;
      }
    }
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl border-t border-border/50 z-50 bottom-nav-safe shadow-2xl">
      <div className="overflow-x-auto scrollbar-hide px-2 py-2">
        <div className="flex items-center justify-start gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            let isLocked = false;
            if (item.requiresPremium) {
              if (item.requiredTier === 'basic') {
                isLocked = !hasBasicAccess;
              } else if (item.requiredTier === 'premium') {
                isLocked = !hasPremiumAccess_Level;
              }
            }
            
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.requiresPremium, item.requiredTier)}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[50px] px-2 py-1.5 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gradient-to-b from-primary/20 to-primary/10 text-primary shadow-lg scale-105 border border-primary/20'
                    : isLocked
                    ? 'text-muted-foreground/60 hover:text-muted-foreground/80 hover:bg-muted/30'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-105 hover:shadow-md'
                } active:scale-95`}
              >
                <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                  <Icon className={`h-4 w-4 transition-all duration-200 ${
                    isLocked ? 'opacity-60' : ''
                  } ${
                    isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'
                  }`} />
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center shadow-md border border-background">
                      <Lock className="h-1.5 w-1.5 text-background" />
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium mt-0.5 transition-all duration-200 leading-tight text-center ${
                  isLocked ? 'opacity-60' : ''
                } ${
                  isActive ? 'font-semibold text-primary' : 'group-hover:font-medium'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-fade-in"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
