
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
    <div className="fixed top-1/2 right-2 -translate-y-1/2 bg-white border border-gray-200 rounded-xl px-2 py-4 z-50 shadow-lg">
      <div className="flex flex-col items-center space-y-3">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] p-2 rounded-lg transition-colors ${
              location.pathname === path
                ? 'text-green-500 bg-green-50'
                : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
            }`}
            title={label}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium mt-1 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
