import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  // Try multiple logo sources with fallbacks
  const logoSrc = "/lovable-uploads/575dbbf3-5c0e-449f-ae3d-e65212364fb9.png";
  const fallbackSrc = "/pwa-192x192.png";
  
  return (
    <img
      src={logoSrc}
      alt="Vida Live"
      className={`${sizeClasses[size]} object-contain ${className}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
    />
  );
};