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
  const logoSrc = "/lovable-uploads/6adff54d-a871-4013-b61d-151fd65d71ca.png";
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