
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, Download, User, MessageCircle } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Ver Plano', path: '/subscription' },
    { icon: Activity, label: 'Exercícios', path: '/exercises' },
    { icon: MessageCircle, label: 'Dr. Ajuda', path: '/ai-assistant' },
    { icon: Download, label: 'App', path: '/download-app' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
              location.pathname === path
                ? 'text-green-500 bg-green-50'
                : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
