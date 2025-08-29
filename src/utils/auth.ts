import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const robustLogout = async (navigate: (path: string) => void) => {
  try {
    // Attempt to sign out through Supabase
    const { error } = await supabase.auth.signOut();
    
    // Ignore session_not_found errors - user is already logged out
    if (error && error.message !== 'session_not_found') {
      console.error('Logout error:', error);
      // Continue with logout even if there's an error
    }
    
    // Clear any local session tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Show success message
    toast({
      title: "Logout realizado",
      description: "Até logo! Volte sempre ao Vida Live.",
    });
    
    // Redirect to home page
    navigate('/');
    
  } catch (error: any) {
    console.error('Unexpected logout error:', error);
    
    // Force logout by clearing storage and redirecting
    localStorage.clear();
    
    toast({
      title: "Logout realizado",
      description: "Sessão encerrada com sucesso.",
    });
    
    navigate('/');
  }
};