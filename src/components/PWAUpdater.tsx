import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: 'App pronta para usar offline!',
        description: 'Todos os recursos estão disponíveis offline.',
      });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: 'Nova versão disponível!',
        description: 'Clique para atualizar para a versão mais recente.',
        action: (
          <button 
            onClick={() => updateServiceWorker(true)}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Atualizar
          </button>
        ),
      });
    }
  }, [needRefresh, updateServiceWorker]);

  // This component doesn't render anything visible
  return null;
};