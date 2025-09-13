import React, { useEffect, useState } from 'react';
import { Logo } from './logo';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (splashShown) {
      setIsVisible(false);
      return;
    }

    // Show splash for 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <img 
              src="/lovable-uploads/light-life-splash.png" 
              alt="Light Life - Powered by Lovable AI" 
              className="w-32 h-32 object-contain drop-shadow-2xl animate-scale-in"
            />
            <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-white font-medium text-sm animate-fade-in">Powered by Lovable AI</span>
        </div>
      </div>
    </div>
  );
};