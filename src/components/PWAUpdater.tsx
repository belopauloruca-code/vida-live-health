import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export const PWAUpdater = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App pronta para usar offline!', {
        description: 'Todos os recursos estão disponíveis offline.',
      });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast('Nova versão disponível!', {
        description: 'Clique para atualizar para a versão mais recente.',
        action: {
          label: 'Atualizar',
          onClick: () => updateServiceWorker(true),
        },
        duration: 0, // Keep toast until user acts
      });
    }
  }, [needRefresh, updateServiceWorker]);

  // This component doesn't render anything visible
  return null;
};