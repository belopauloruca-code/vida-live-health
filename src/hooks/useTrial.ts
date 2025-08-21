import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Trial {
  id: string;
  user_id: string;
  started_at: string;
  ends_at: string;
  is_active: boolean;
}

export const useTrial = () => {
  const [trial, setTrial] = useState<Trial | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkTrial = async () => {
    if (!user) return;

    try {
      const { data: existingTrial } = await supabase
        .from('trials')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingTrial) {
        setTrial(existingTrial);
        const endsAt = new Date(existingTrial.ends_at).getTime();
        const now = Date.now();
        setTimeRemaining(Math.max(0, endsAt - now));
      } else {
        // Create new trial
        const { data: newTrial, error } = await supabase
          .from('trials')
          .insert({
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        setTrial(newTrial);
        const endsAt = new Date(newTrial.ends_at).getTime();
        const now = Date.now();
        setTimeRemaining(Math.max(0, endsAt - now));

        toast({
          title: "🎉 Trial ativado!",
          description: "Você tem 24 horas para explorar todos os recursos premium.",
        });
      }
    } catch (error) {
      console.error('Error checking trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTrialActive = () => {
    return trial?.is_active && timeRemaining > 0;
  };

  const isTrialExpired = () => {
    return trial && (!trial.is_active || timeRemaining <= 0);
  };

  useEffect(() => {
    if (user) {
      checkTrial();
    }
  }, [user]);

  // Real-time countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            toast({
              title: "⏰ Trial expirado",
              description: "Seu trial de 24 horas expirou. Assine para continuar usando os recursos premium.",
              variant: "destructive",
            });
          }
          return Math.max(0, newTime);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeRemaining, toast]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trials-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trials',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Trial change:', payload);
          checkTrial();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    trial,
    timeRemaining,
    isLoading,
    isTrialActive: isTrialActive(),
    isTrialExpired: isTrialExpired(),
    formatTimeRemaining: formatTimeRemaining(timeRemaining),
    checkTrial,
  };
};