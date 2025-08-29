import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Smartphone, Share2, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface InstallAppButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ 
  className, 
  size = 'default',
  variant = 'default'
}) => {
  const { canInstallPWA, isInstalling, isInstalled, platform, isInIframe, isInAppBrowser, installPWA, getInstallInstructions } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (canInstallPWA || (platform === 'android' && isInAppBrowser)) {
      await installPWA();
    } else {
      setShowInstructions(true);
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
        return <Share2 className="h-4 w-4" />;
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'ios':
        return 'iPhone/iPad (Safari)';
      case 'android':
        return 'Android (Chrome/Edge)';
      case 'desktop':
        return 'Desktop';
      default:
        return 'Seu Dispositivo';
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <CheckCircle className="h-4 w-4 mr-2" />
        App Instalado
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={className}
        onClick={handleInstallClick}
        disabled={isInstalling}
      >
        {isInstalling ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Instalando...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </>
        )}
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {getPlatformIcon()}
              <span className="ml-2">Como Instalar</span>
            </DialogTitle>
            <DialogDescription>
              {isInIframe ? 'Para instalar o app, você precisa abri-lo em uma nova aba' : `Instruções para ${getPlatformName()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <ol className="text-sm space-y-2 list-decimal list-inside">
                {getInstallInstructions().map((instruction, index) => (
                  <li key={index} className="text-foreground">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
            {isInIframe && platform === 'desktop' && (
              <Button 
                variant="default" 
                className="w-full mb-2" 
                onClick={() => window.open(window.location.href, '_blank')}
              >
                Abrir em Nova Aba
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowInstructions(false)}
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};