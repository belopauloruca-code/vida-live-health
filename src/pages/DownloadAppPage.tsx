
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Smartphone, Download, QrCode } from 'lucide-react';

export const DownloadAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <Smartphone className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Baixar o App</h1>
          <p className="text-gray-600">Tenha o Vida Live sempre com você</p>
        </div>

        {/* App Store Links */}
        <div className="space-y-4 mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-green-500" />
                Google Play Store
              </CardTitle>
              <CardDescription>
                Para dispositivos Android
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 mb-4"
                onClick={() => window.open('https://play.google.com', '_blank')}
              >
                Baixar no Google Play
              </Button>
              
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                QR Code para Android
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-green-500" />
                Apple App Store
              </CardTitle>
              <CardDescription>
                Para iPhone e iPad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 mb-4"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
              >
                Baixar na App Store
              </Button>
              
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                QR Code para iOS
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-600">Por que usar o app mobile?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Notificações para lembretes de água e refeições
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Acesso offline aos seus planos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Timer de exercícios com vibração
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Sincronização automática com a nuvem
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Interface otimizada para toque
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Os links serão atualizados assim que o app for publicado nas lojas oficiais.
          </p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
