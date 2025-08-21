import React from 'react';
import { Logo } from './logo';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLogo && <Logo size="md" />}
      <div className="flex flex-col">
        {title && (
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
};