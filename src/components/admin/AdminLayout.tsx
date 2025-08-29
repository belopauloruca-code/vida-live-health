
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Shield,
  User
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { robustLogout } = await import('@/utils/auth');
    await robustLogout(navigate);
    setIsLoggingOut(false);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
    { icon: User, label: 'Perfil', path: '/admin/profile' },
    { icon: CreditCard, label: 'Faturamento', path: '/admin/billing' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <Shield className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Vida Live</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                className={`w-full justify-start ${
                  location.pathname === path 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => navigate(path)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};
