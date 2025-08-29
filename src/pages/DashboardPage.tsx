import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrandHeader } from '@/components/ui/brand-header';
import { TrialBanner } from '@/components/ui/trial-banner';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { Droplets, Target, Calendar, Activity, Plus, LogOut, Lock, Star } from 'lucide-react';
import dashboardHeroBg from '@/assets/dashboard-hero-bg.jpg';
import subscriptionCardBg from '@/assets/subscription-card-bg.jpg';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasActiveSubscription } = usePremiumAccess();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [hydrationToday, setHydrationToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3850);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mealPlanStats, setMealPlanStats] = useState({ meals: 0, recipes: 0, duration: 0 });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadHydrationToday();
      loadMealPlanStats();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
      setWaterGoal(data.water_goal_ml || 3850);
    }
  };

  const loadHydrationToday = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', user.id)
      .gte('ts', `${today}T00:00:00`)
      .lte('ts', `${today}T23:59:59`);
    
    if (data) {
      const total = data.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
      setHydrationToday(total);
    }
  };

  const loadMealPlanStats = async () => {
    if (!user) return;
    
    const { data: mealPlans, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items(*)
      `)
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error loading meal plan stats:', error);
      return;
    }
    
    if (mealPlans && mealPlans.length > 0) {
      const plan = mealPlans[0];
      const items = plan.meal_plan_items || [];
      const startDate = new Date(plan.start_date);
      const endDate = new Date(plan.end_date);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setMealPlanStats({
        meals: plan.meals_per_day || 4,
        recipes: items.length,
        duration: duration
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;
    
    // Subscribe to hydration changes
    const hydrationChannel = supabase
      .channel('hydration-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'hydration_logs',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadHydrationToday();
        }
      )
      .subscribe();
    
    // Subscribe to profile changes (for water goal updates)
    const profileChannel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.new.water_goal_ml !== waterGoal) {
            setWaterGoal(payload.new.water_goal_ml || 2500);
          }
          setProfile(payload.new);
        }
      )
      .subscribe();
    
    // Subscribe to meal plan changes
    const mealPlanChannel = supabase
      .channel('meal-plan-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meal_plans',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadMealPlanStats();
        }
      )
      .subscribe();
  };

  const addWater = async (amount: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('hydration_logs')
      .insert({
        user_id: user.id,
        amount_ml: amount,
      });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar a água",
      });
    } else {
      setHydrationToday(prev => prev + amount);
      toast({
        title: "Água registrada!",
        description: `${amount}ml adicionados ao seu consumo diário`,
      });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { robustLogout } = await import('@/utils/auth');
    await robustLogout(navigate);
    setIsLoggingOut(false);
  };

  const waterProgress = Math.min((hydrationToday / waterGoal) * 100, 100);
  const cupsRemaining = Math.max(0, Math.ceil((waterGoal - hydrationToday) / 250));
  const cupsDrunk = Math.floor(hydrationToday / 250);

  return (
    <div className="min-h-screen bg-background pb-safe-bottom-nav">
      {/* Hero Cover Section */}
      <div 
        className="relative h-40 sm:h-48 md:h-56 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1)), url(${dashboardHeroBg})`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('dashboard.banner.title')}</h1>
            <p className="text-base sm:text-lg opacity-90">{t('dashboard.banner.subtitle')}</p>
            <Button 
              className="mt-4 bg-white text-green-600 hover:bg-gray-100" 
              onClick={() => navigate('/subscription')}
            >
              {t('dashboard.banner.cta')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <BrandHeader 
            title={`${t('dashboard.welcome')}, ${profile?.name || 'Usuário'}!`}
            subtitle="Como está sua jornada hoje?"
            showLogo={false}
          />
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Saindo...' : t('dashboard.logout')}
            </Button>
          </div>
        </div>
        
        <TrialBanner />

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                {t('dashboard.stats.caloricGoal')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1,800</div>
              <p className="text-xs text-gray-500">kcal/dia</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                {t('dashboard.stats.meals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mealPlanStats.meals}</div>
              <p className="text-xs text-gray-500">por dia</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-500" />
                {t('dashboard.stats.duration')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mealPlanStats.duration}</div>
              <p className="text-xs text-gray-500">dias</p>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('dashboard.stats.recipes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mealPlanStats.recipes || '50+'}</div>
              <p className="text-xs text-gray-500">disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Hydration Card */}
        <Card className="mb-6 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Droplets className="h-5 w-5 mr-2" />
              {t('dashboard.hydration.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - waterProgress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">{Math.round(waterProgress)}%</span>
                  <span className="text-sm font-bold text-gray-900">{hydrationToday}ml</span>
                  <span className="text-xs text-gray-500">de {waterGoal}ml</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[150, 200, 300, 500].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  onClick={() => addWater(amount)}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  {amount}ml
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('dashboard.hydration.cupsRemaining', { cups: cupsRemaining })}</span>
              <span>{t('dashboard.hydration.cupsDrunk', { cups: cupsDrunk })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Card */}
        <Card className="mb-6 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <Activity className="h-5 w-5 mr-2" />
              {t('dashboard.exercise.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Caminhada Rápida</h3>
                <p className="text-sm text-gray-600">15 min • ~75 kcal</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Polichinelos</h3>
                <p className="text-sm text-gray-600">10 min • ~80 kcal</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Abdominais</h3>
                <p className="text-sm text-gray-600">6 min • ~30 kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hasActiveSubscription ? (
            <Button 
              variant="outline" 
              className="h-16 border-green-200 hover:bg-green-50"
              onClick={() => window.location.href = '/meal-plans'}
            >
              {t('dashboard.quickActions.viewMealPlans')}
            </Button>
          ) : (
            <div 
              className="relative h-16 bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.8)), url(${subscriptionCardBg})`
              }}
              onClick={() => navigate('/subscription')}
            >
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">Desbloquear Planos Premium</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm"
                  >
                    Assinar
                  </Button>
                </div>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            className="h-16 border-green-200 hover:bg-green-50"
            onClick={() => window.location.href = '/exercises'}
          >
            {t('dashboard.quickActions.browseExercises')}
          </Button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};