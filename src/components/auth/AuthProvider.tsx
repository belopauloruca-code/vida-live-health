
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to defer async operations to prevent deadlock
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
        
        // Load saved language preference - with error handling
        try {
          // Dynamically import i18n to avoid circular dependency
          const { default: i18n } = await import('@/i18n');
          
          if (session.user.user_metadata?.language) {
            if (i18n && typeof i18n.changeLanguage === 'function') {
              await i18n.changeLanguage(session.user.user_metadata.language);
              document.documentElement.lang = session.user.user_metadata.language;
            }
          } else {
            const savedLanguage = localStorage.getItem('vida-leve-language');
            if (savedLanguage && i18n && typeof i18n.changeLanguage === 'function') {
              await i18n.changeLanguage(savedLanguage);
              document.documentElement.lang = savedLanguage;
            }
          }
        } catch (error) {
          console.warn('Could not load language preference:', error);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
