
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, Download, User, MessageCircle, Lock } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPremiumAccess } = usePremiumAccess();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', requiresPremium: false },
    { icon: Calendar, label: 'Ver Plano', path: '/subscription', requiresPremium: false },
    { icon: Activity, label: 'Exercícios', path: '/exercises', requiresPremium: true },
    { icon: MessageCircle, label: 'Dr. Ajuda', path: '/ai-assistant', requiresPremium: true },
    { icon: Download, label: 'App', path: '/download-app', requiresPremium: true },
    { icon: User, label: 'Perfil', path: '/profile', requiresPremium: true },
  ];

  const handleNavigation = (path: string, requiresPremium: boolean) => {
    if (requiresPremium && !hasPremiumAccess) {
      navigate('/subscription');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path, requiresPremium }) => {
          const isLocked = requiresPremium && !hasPremiumAccess;
          const DisplayIcon = isLocked ? Lock : Icon;
          
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path, requiresPremium)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors relative ${
                location.pathname === path
                  ? 'text-green-500 bg-green-50'
                  : isLocked
                  ? 'text-gray-400 hover:text-gray-500'
                  : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
              }`}
            >
              <DisplayIcon className={`h-5 w-5 ${isLocked ? 'opacity-60' : ''}`} />
              <span className={`text-xs font-medium mt-1 ${isLocked ? 'opacity-60' : ''}`}>
                {label}
              </span>
              {isLocked && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                  <Lock className="h-2 w-2 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
