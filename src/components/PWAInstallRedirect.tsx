import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export const PWAInstallRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const checkInstallRedirect = () => {
      const shouldOpenOnboarding = localStorage.getItem('openOnboardingAfterInstall');
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      
      if (shouldOpenOnboarding === 'true' && user && onboardingCompleted !== 'true') {
        localStorage.removeItem('openOnboardingAfterInstall');
        navigate('/onboarding', { replace: true });
      } else if (shouldOpenOnboarding === 'true' && user) {
        localStorage.removeItem('openOnboardingAfterInstall');
        navigate('/dashboard', { replace: true });
      }
    };

    checkInstallRedirect();
  }, [user, loading, navigate]);

  return null;
};