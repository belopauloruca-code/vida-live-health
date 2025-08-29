
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { BrandHeader } from '@/components/ui/brand-header';
import { InstallAppButton } from '@/components/ui/install-app-button';
import { Smartphone, Download, QrCode, Zap, Wifi, Timer, Cloud, Share2 } from 'lucide-react';

export const DownloadAppPage: React.FC = () => {
  
  const generateQRCodeUrl = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(url)}`;
  };

  const currentUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <BrandHeader 
            title="Baixar App Vida Leve"
            subtitle="Instale o app diretamente no seu dispositivo"
            className="justify-center text-center"
          />
        </div>

        {/* PWA Installation */}
        <div className="space-y-4 mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Download className="h-5 w-5 mr-2" />
                Instalar App (PWA)
              </CardTitle>
              <CardDescription>
                Aplicativo web progressivo - funciona em todos os dispositivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <InstallAppButton 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                  size="lg"
                />
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ⚡ Instalação direta - Funciona em Android e iOS
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sem precisar da Google Play ou App Store
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                  {/* Android Instructions */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-primary" />
                      Android (Chrome/Edge)
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Toque no menu (⋮) do navegador</li>
                      <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                      <li>Confirme a instalação</li>
                    </ol>
                  </div>

                  {/* iOS Instructions */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <Share2 className="h-4 w-4 mr-2 text-primary" />
                      iPhone/iPad (Safari)
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Toque no botão de compartilhar (□↗)</li>
                      <li>Role e selecione "Adicionar à Tela de Início"</li>
                      <li>Toque em "Adicionar"</li>
                    </ol>
                  </div>

                  {/* Desktop Instructions */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center">
                      <Download className="h-4 w-4 mr-2 text-primary" />
                      Desktop
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Procure o ícone de instalação (⊕) na barra de endereços</li>
                      <li>Ou use o menu do navegador → "Instalar Vida Live"</li>
                      <li>Confirme a instalação</li>
                    </ol>
                  </div>
                </div>
              
              {/* QR Code for easy mobile access */}
              <div className="flex justify-center mt-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden mx-auto mb-2">
                    <img 
                      src={generateQRCodeUrl(currentUrl)} 
                      alt="QR Code para acessar o app"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escaneie para abrir no celular
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Vantagens do App PWA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Rápido e Confiável</h4>
                  <p className="text-sm text-muted-foreground">Carregamento instantâneo e performance nativa</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Wifi className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Funciona Offline</h4>
                  <p className="text-sm text-muted-foreground">Acesso aos seus dados mesmo sem internet</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Timer className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Notificações</h4>
                  <p className="text-sm text-muted-foreground">Lembretes de água, refeições e exercícios</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Cloud className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground">Sincronização</h4>
                  <p className="text-sm text-muted-foreground">Dados sempre atualizados em todos os dispositivos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
