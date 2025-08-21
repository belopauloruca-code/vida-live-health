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
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-4 flex justify-center">
          <Logo size="xl" className="drop-shadow-lg" />
        </div>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
};