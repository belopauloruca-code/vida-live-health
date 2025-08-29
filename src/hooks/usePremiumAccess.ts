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

type SubscriptionTier = 'basic' | 'premium' | 'elite' | null;

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const { isTrialActive, isLoading: trialLoading } = useTrial();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [isLifetime, setIsLifetime] = useState(false);
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
      let tier: SubscriptionTier = null;
      
      if (data) {
        if (data.subscription_end) {
          isValidSubscription = new Date(data.subscription_end) > new Date();
        } else {
          // If no end date, assume it's active
          isValidSubscription = true;
        }
        
        // Normalize subscription tier
        if (isValidSubscription && data.subscription_tier) {
          const tierName = data.subscription_tier.toLowerCase();
          if (tierName.includes('basic') || tierName.includes('básico')) {
            tier = 'basic';
          } else if (tierName.includes('premium')) {
            tier = 'premium';
          } else if (tierName.includes('elite')) {
            tier = 'elite';
          }
        }
      }

      setHasActiveSubscription(isValidSubscription);
      setSubscriptionTier(tier);
      setIsLifetime(data?.subscription_end === null && isValidSubscription);
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
      const response = await supabase.functions.invoke('check-subscription');
      if (response.data) {
        const { subscribed, subscription_tier, subscription_end, isLifetime: lifetime } = response.data;
        setHasActiveSubscription(subscribed || false);
        setSubscriptionTier(subscription_tier || null);
        setIsLifetime(lifetime || subscription_end === null);
      }
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
  
  // Check access levels based on subscription tier
  const hasBasicAccess = hasPremiumAccess;
  const hasPremiumAccess_Level = hasPremiumAccess && (subscriptionTier === 'premium' || subscriptionTier === 'elite');
  const hasEliteAccess = hasPremiumAccess && subscriptionTier === 'elite';

  return {
    hasPremiumAccess,
    hasActiveSubscription,
    isTrialActive,
    subscriptionTier,
    hasBasicAccess,
    hasPremiumAccess_Level,
    hasEliteAccess,
    isLifetime,
    isLoading: isLoading || trialLoading
  };
};