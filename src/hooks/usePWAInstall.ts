import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else if (isDesktop) {
      setPlatform('desktop');
    }

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // PWA installation prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstallPWA(false);
      setIsInstalled(true);
      toast.success('App instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return false;
    
    setIsInstalling(true);
    
    try {
      const { outcome } = await deferredPrompt.prompt();
      
      if (outcome === 'accepted') {
        toast.success('Instalação iniciada!');
        return true;
      } else {
        toast.info('Instalação cancelada.');
        return false;
      }
    } catch (error) {
      toast.error('Erro na instalação. Tente pelo menu do navegador.');
      return false;
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setCanInstallPWA(false);
    }
  }, [deferredPrompt]);

  const getInstallInstructions = useCallback(() => {
    switch (platform) {
      case 'ios':
        return [
          'Toque no botão de compartilhar (□↗)',
          'Role e selecione "Adicionar à Tela de Início"',
          'Toque em "Adicionar"'
        ];
      case 'android':
        return [
          'Toque no menu (⋮) do navegador',
          'Selecione "Instalar app" ou "Adicionar à tela inicial"',
          'Confirme a instalação'
        ];
      case 'desktop':
        return [
          'Procure o ícone de instalação (⊕) na barra de endereços',
          'Ou use o menu do navegador → "Instalar Vida Live"',
          'Confirme a instalação'
        ];
      default:
        return ['Use o menu do seu navegador para instalar o app'];
    }
  }, [platform]);

  return {
    canInstallPWA,
    isInstalling,
    isInstalled,
    platform,
    installPWA,
    getInstallInstructions
  };
};