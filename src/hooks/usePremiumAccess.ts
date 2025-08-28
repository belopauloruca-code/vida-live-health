import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useTrial } from './useTrial';

interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const { isTrialActive, isLoading: trialLoading } = useTrial();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setHasActiveSubscription(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscribed', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
      }

      // Check if subscription is still valid (if subscription_end exists)
      let isValidSubscription = false;
      if (data) {
        if (data.subscription_end) {
          isValidSubscription = new Date(data.subscription_end) > new Date();
        } else {
          // If no end date, assume it's active
          isValidSubscription = true;
        }
      }

      setHasActiveSubscription(isValidSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with Stripe once per session
  const syncWithStripe = async () => {
    if (!user) return;
    
    try {
      await supabase.functions.invoke('check-subscription');
      // Recheck subscription after sync
      setTimeout(() => {
        checkSubscription();
      }, 1000);
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
    }
  };

  useEffect(() => {
    checkSubscription();
    // Sync with Stripe once when component mounts
    if (user) {
      syncWithStripe();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time subscribers table changes
    const channel = supabase
      .channel('subscribers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          checkSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasPremiumAccess = isTrialActive || hasActiveSubscription;

  return {
    hasPremiumAccess,
    hasActiveSubscription,
    isTrialActive,
    isLoading: isLoading || trialLoading
  };
};