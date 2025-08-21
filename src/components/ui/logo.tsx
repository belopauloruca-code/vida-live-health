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
  return (
    <img
      src="/lovable-uploads/575dbbf3-5c0e-449f-ae3d-e65212364fb9.png"
      alt="Vida Live"
      className={`${sizeClasses[size]} object-contain ${className}`}
      loading="lazy"
    />
  );
};