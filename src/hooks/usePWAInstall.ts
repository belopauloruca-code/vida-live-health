import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [isInIframe, setIsInIframe] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  // Detect platform and installation status
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

    // Check if in iframe (preview mode)
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    // Detect in-app browsers (WhatsApp, Instagram, Facebook, etc.)
    const inAppBrowser = /wv|fban|fbav|fbsv|instagram|whatsapp|line|twitter|tiktok|linkedin|telegram/.test(userAgent);
    setIsInAppBrowser(inAppBrowser);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = isIOS && (window.navigator as any).standalone;
    
    if (isStandalone || isIOSStandalone) {
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
      setIsInstalling(false);
        toast({
          title: "Instalação concluída!",
          description: "Bem-vindo ao Vida Leve! O app está pronto para usar.",
        });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    // If in-app browser on Android, redirect to Chrome
    if (platform === 'android' && isInAppBrowser && !isInIframe) {
      toast({
        title: "Abrindo no Chrome...",
        description: "Para instalar o app, você será redirecionado para o Chrome.",
      });
      
      const currentUrl = window.location.href;
      const chromeIntent = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`;
      
      try {
        window.location.href = chromeIntent;
      } catch {
        // Fallback to direct URL
        window.open(currentUrl, '_blank');
      }
      return false;
    }

    if (!deferredPrompt) return false;
    
    setIsInstalling(true);
    
    // Show installing toast
    toast({
      title: "Instalando Vida Leve...",
      description: "Aguarde enquanto o app está sendo instalado.",
    });
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Keep showing installing state, success will be handled by appinstalled event
        return true;
      } else {
        setIsInstalling(false);
        toast({
          title: "Instalação cancelada",
          description: "Você pode tentar instalar novamente quando quiser.",
        });
        return false;
      }
    } catch (error) {
      setIsInstalling(false);
      toast({
        title: "Erro na instalação",
        description: "Tente pelo menu do navegador ou abra em nova aba.",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeferredPrompt(null);
      setCanInstallPWA(false);
    }
  }, [deferredPrompt, platform, isInAppBrowser, isInIframe]);

  const getInstallInstructions = useCallback(() => {
    const baseInstructions = {
      ios: [
        'Toque no botão de compartilhar (□↗)',
        'Role e selecione "Adicionar à Tela de Início"',
        'Toque em "Adicionar"'
      ],
      android: isInAppBrowser ? [
        'Abra este app no Chrome',
        'Toque no menu (⋮) do navegador',
        'Selecione "Instalar app" ou "Adicionar à tela inicial"',
        'Confirme a instalação'
      ] : [
        'Toque no menu (⋮) do navegador',
        'Selecione "Instalar app" ou "Adicionar à tela inicial"',
        'Confirme a instalação'
      ],
      desktop: [
        'Procure o ícone de instalação (⊕) na barra de endereços',
        'Ou use o menu do navegador → "Instalar Vida Leve"',
        'Confirme a instalação'
      ],
      default: ['Use o menu do seu navegador para instalar o app']
    };

    const instructions = baseInstructions[platform] || baseInstructions.default;
    
    if (isInIframe && platform === 'desktop') {
      return [
        'Abra o app em uma nova aba para instalar',
        ...instructions
      ];
    }
    
    return instructions;
  }, [platform, isInIframe, isInAppBrowser]);

  return {
    canInstallPWA,
    isInstalling,
    isInstalled,
    platform,
    isInIframe,
    isInAppBrowser,
    installPWA,
    getInstallInstructions
  };
};