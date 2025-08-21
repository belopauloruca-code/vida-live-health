
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BMICard } from '@/components/profile/BMICard';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { User, Droplets } from 'lucide-react';

interface ProfileData {
  name: string;
  age: string;
  sex: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  goal: string;
  wake_time: string;
  sleep_time: string;
  work_hours: string;
  water_goal_ml: string;
  avatar_url: string;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    sex: 'Masculino',
    height_cm: '',
    weight_kg: '',
    activity_level: 'Sedentário',
    goal: 'Emagrecer',
    wake_time: '',
    sleep_time: '',
    work_hours: '',
    water_goal_ml: '3850',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile({
        name: data.name || '',
        age: data.age?.toString() || '',
        sex: data.sex || 'Masculino',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || '',
        activity_level: data.activity_level || 'Sedentário',
        goal: data.goal || 'Emagrecer',
        wake_time: data.wake_time || '',
        sleep_time: data.sleep_time || '',
        work_hours: data.work_hours || '',
        water_goal_ml: data.water_goal_ml?.toString() || '3850',
        avatar_url: data.avatar_url || '',
      });
    }
  };

  const handleAvatarUpdate = (newUrl: string) => {
    setProfile(prev => ({ ...prev, avatar_url: newUrl }));
  };

  const handleProfileUpdate = (updatedProfile: Omit<ProfileData, 'avatar_url'>) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const calculateWaterGoal = () => {
    const weight = parseFloat(profile.weight_kg);
    if (weight) {
      return Math.round(weight * 35);
    }
    return 3850;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="h-6 w-6 mr-2 text-green-500" />
            Meu Perfil
          </h1>
          <p className="text-gray-600">Mantenha suas informações atualizadas</p>
        </div>

        {/* Avatar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <AvatarUploader
              currentAvatarUrl={profile.avatar_url}
              userName={profile.name}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </CardContent>
        </Card>

        {/* BMI Display */}
        <BMICard weight={profile.weight_kg} height={profile.height_cm} />

        {/* Hydration Goal Display */}
        {profile.weight_kg && (
          <Card className="mb-6 border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-600">Meta de Hidratação Recomendada</div>
                  <div className="text-lg font-bold text-gray-900">{calculateWaterGoal()}ml</div>
                  <div className="text-sm text-gray-500">Baseado no seu peso atual</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <ProfileForm
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
      
      <BottomNavigation />
    </div>
  );
};
