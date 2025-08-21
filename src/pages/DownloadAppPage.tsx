
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Smartphone, Download, QrCode, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const DownloadAppPage: React.FC = () => {
  const [isValidApk, setIsValidApk] = useState<boolean | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // These URLs can be updated when the actual APK and TestFlight links are available
  const androidApkUrl = import.meta.env.VITE_ANDROID_APK_URL || '/vida-live-app.apk';
  const iosTestFlightUrl = import.meta.env.VITE_IOS_TESTFLIGHT_URL || '';
  
  // Check if APK URL is valid on component mount
  useEffect(() => {
    const checkApkUrl = async () => {
      try {
        const response = await fetch(androidApkUrl, { method: 'HEAD' });
        setIsValidApk(response.ok);
      } catch (error) {
        setIsValidApk(false);
      }
    };
    
    if (androidApkUrl && !androidApkUrl.includes('/vida-live-app.apk')) {
      checkApkUrl();
    } else {
      setIsValidApk(false);
    }
  }, [androidApkUrl]);
  
  const generateQRCodeUrl = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(url)}`;
  };

  const handleDirectDownload = async (url: string) => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Try direct navigation first
      window.location.href = url;
      
      // Show success message after a delay
      setTimeout(() => {
        toast.success('Download iniciado! Verifique sua pasta de downloads.');
        setIsDownloading(false);
      }, 2000);
      
    } catch (error) {
      // Fallback to creating a download link
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vida-live-app.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download iniciado! Verifique sua pasta de downloads.');
      } catch (fallbackError) {
        toast.error('Erro ao iniciar download. Tente o link direto abaixo.');
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Baixar o App</h1>
          <p className="text-muted-foreground">Tenha o Vida Live sempre com você</p>
        </div>

        {/* Direct Download Links */}
        <div className="space-y-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary" />
                Android APK
              </CardTitle>
              <CardDescription>
                Download direto para dispositivos Android
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Download Status Warning */}
              {isValidApk === false && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div className="text-sm">
                    <p className="text-destructive font-medium">APK não disponível</p>
                    <p className="text-muted-foreground">O arquivo APK ainda não foi configurado pelo administrador.</p>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
                onClick={() => handleDirectDownload(androidApkUrl)}
                disabled={isDownloading || isValidApk === false}
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar APK Diretamente
                  </>
                )}
              </Button>
              
              {/* Direct Link Fallback */}
              {isValidApk !== false && (
                <div className="mb-4 p-2 bg-muted/50 rounded border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Se o download não iniciar:</p>
                  <a 
                    href={androidApkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm underline hover:no-underline"
                  >
                    Clique aqui para download direto
                  </a>
                </div>
              )}
              
              {/* QR Code for Android APK */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={generateQRCodeUrl(androidApkUrl)} 
                    alt="QR Code para download Android"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Escaneie para baixar no Android
              </p>
              <p className="text-center text-xs text-muted-foreground mt-1">
                Habilite "Origens desconhecidas" nas configurações
              </p>
            </CardContent>
          </Card>

          {iosTestFlightUrl && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                  iOS TestFlight
                </CardTitle>
                <CardDescription>
                  Versão beta para iPhone e iPad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4"
                  onClick={() => window.open(iosTestFlightUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir TestFlight
                </Button>
                
                {/* QR Code for iOS TestFlight */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={generateQRCodeUrl(iosTestFlightUrl)} 
                      alt="QR Code para TestFlight iOS"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Escaneie para abrir no iOS
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Por que usar o app mobile?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Notificações para lembretes de água e refeições
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Acesso offline aos seus planos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Timer de exercícios com vibração
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Sincronização automática com a nuvem
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Interface otimizada para toque
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        <Card className="border-border mt-6">
          <CardHeader>
            <CardTitle className="text-foreground">Como instalar no Android</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Baixe o arquivo APK clicando no botão acima</li>
              <li>Vá em Configurações → Segurança → Fontes Desconhecidas</li>
              <li>Ative a opção "Permitir instalação de aplicativos de fontes desconhecidas"</li>
              <li>Localize o arquivo baixado e toque nele para instalar</li>
              <li>Siga as instruções na tela para completar a instalação</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
