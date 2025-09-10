import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingGateProps {
  children: React.ReactNode;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        // Check if onboarding was completed in localStorage
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        if (onboardingCompleted === 'true') {
          setNeedsOnboarding(false);
          setLoading(false);
          return;
        }

        // Check if user has essential profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, age, height_cm, weight_kg')
          .eq('id', user.id)
          .single();

        // If no profile or missing essential data, redirect to onboarding
        if (!profile || !profile.name || !profile.age || !profile.height_cm || !profile.weight_kg) {
          setNeedsOnboarding(true);
        } else {
          // User has profile data, mark onboarding as completed
          localStorage.setItem('onboardingCompleted', 'true');
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};