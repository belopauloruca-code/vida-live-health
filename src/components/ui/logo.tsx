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
  // Use the new generated logo with fallback
  const logoSrc = "/logo-icon-512.png";
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