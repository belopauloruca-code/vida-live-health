
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplets, Utensils, Target, Heart, Timer, ExternalLink } from 'lucide-react';
import heroImage from '/images/hero-vida-leve.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.personalizedGoals.title'),
      description: t('home.benefits.personalizedGoals.description')
    },
    {
      icon: <Utensils className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.mealPlans.title'),
      description: t('home.benefits.mealPlans.description')
    },
    {
      icon: <Activity className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.guidedExercises.title'),
      description: t('home.benefits.guidedExercises.description')
    },
    {
      icon: <Droplets className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.hydrationControl.title'),
      description: t('home.benefits.hydrationControl.description')
    },
    {
      icon: <Heart className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.aiAssistant.title'),
      description: t('home.benefits.aiAssistant.description')
    },
    {
      icon: <Timer className="h-8 w-8 text-green-500" />,
      title: t('home.benefits.quickResults.title'),
      description: t('home.benefits.quickResults.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Banner */}
        <div className="mb-16 rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={heroImage} 
            alt={t('home.title')}
            className="w-full h-56 sm:h-72 md:h-96 object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-500">{t('home.title')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => navigate('/subscription')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('home.subscribe')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-green-500 text-green-500 hover:bg-green-50 px-8 py-3 text-lg"
              onClick={() => navigate('/login')}
            >
              {t('home.login')}
            </Button>
          </div>

          {/* Download App Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate('/download-app')}
            >
              {t('home.downloadApp')}
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <CardTitle className="text-lg text-gray-900">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500">
          <a href="#" className="hover:text-green-500 mx-2">Política de Privacidade</a>
          <span>•</span>
          <a href="#" className="hover:text-green-500 mx-2">Termos de Uso</a>
        </div>
      </div>
    </div>
  );
};
