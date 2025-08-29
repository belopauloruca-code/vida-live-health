import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DailyTip {
  id: string;
  tip_text: string;
  tip_category: string;
}

export const DailyTip: React.FC = () => {
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyTip();
  }, []);

  const loadDailyTip = async () => {
    try {
      setLoading(true);
      const today = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // Try to get tip for today first
      let { data: tip, error } = await supabase
        .from('daily_tips')
        .select('id, tip_text, tip_category')
        .eq('day_of_week', today)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // If no tip for today, get any active tip as fallback
      if (error || !tip) {
        const { data: fallbackTip } = await supabase
          .from('daily_tips')
          .select('id, tip_text, tip_category')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        tip = fallbackTip;
      }

      setDailyTip(tip);
    } catch (error) {
      console.error('Error loading daily tip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-primary/20 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-primary/10 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyTip) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-primary">Dica do Dia</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary-glow" />
                <span className="text-xs text-primary-glow font-medium">{dailyTip.tip_category}</span>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{dailyTip.tip_text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};