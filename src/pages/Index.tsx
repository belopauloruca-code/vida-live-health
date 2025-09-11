import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrandHeader } from '@/components/ui/brand-header';
import { Heart, Activity, Calendar, Droplets, Clock, Shield } from 'lucide-react';
import teaIcon from '../assets/tea-icon.webp';
const Index = () => {
  const navigate = useNavigate();
  const benefits = [{
    icon: Heart,
    title: 'Saúde Completa',
    description: 'Monitoramento abrangente da sua saúde'
  }, {
    icon: Activity,
    title: 'Exercícios Personalizados',
    description: 'Treinos adaptados ao seu perfil'
  }, {
    icon: Calendar,
    title: 'Planos de Refeição',
    description: 'Cardápios semanais balanceados'
  }, {
    icon: Droplets,
    title: 'Hidratação Inteligente',
    description: 'Lembretes para beber água'
  }, {
    icon: Clock,
    title: 'Rotina Otimizada',
    description: 'Horários personalizados para seus objetivos'
  }, {
    icon: Shield,
    title: '+ 500 Receitas de Chás',
    description: 'Receitas funcionais para sua saúde',
    image: teaIcon
  }];
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Hero Banner */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden mb-8">
        <img src="/lovable-uploads/d49cc7e9-bbee-4091-bf10-83af1367e109.png" alt="Light Life - Plataforma de saúde e bem-estar" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center">
          <div className="container px-4 mx-[23px]">
            
            
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <BrandHeader title="Light Life" subtitle="Sua plataforma completa de saúde e bem-estar" className="justify-center mb-8" />
          <div className="space-y-4 mb-8">
            <Button size="lg" onClick={() => navigate('/subscription')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
              Quero começar
            </Button>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/login')} className="border-primary text-primary hover:bg-primary/10">
                Entrar
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')} className="border-accent text-accent hover:bg-accent/10">
                Cadastrar
              </Button>
            </div>
            <Button variant="ghost" onClick={() => navigate('/download-app')} className="text-muted-foreground hover:text-primary">
              Baixar App Mobile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map(({
          icon: Icon,
          title,
          description,
          image
        }, index) => <Card key={index} className="p-6 text-center border-border/50 hover:shadow-lg transition-shadow">
              {image ? <img src={image} alt={title} className="w-12 h-12 mx-auto mb-4 object-contain" /> : <Icon className="h-12 w-12 text-primary mx-auto mb-4" />}
              <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </Card>)}
        </div>

        <div className="text-center text-sm text-muted-foreground space-x-4">
          <span>Política de Privacidade</span>
          <span>•</span>
          <span>Termos de Uso</span>
        </div>
      </div>
    </div>;
};
export default Index;