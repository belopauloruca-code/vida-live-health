
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplets, Utensils, Target, Heart, Timer } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: "Metas Personalizadas",
      description: "Defina suas metas de peso, calorias e hidratação personalizadas"
    },
    {
      icon: <Utensils className="h-8 w-8 text-green-500" />,
      title: "Planos de Refeições",
      description: "Receba planos semanais com receitas balanceadas e saborosas"
    },
    {
      icon: <Activity className="h-8 w-8 text-green-500" />,
      title: "Exercícios Guiados",
      description: "Biblioteca completa de exercícios para todos os níveis"
    },
    {
      icon: <Droplets className="h-8 w-8 text-green-500" />,
      title: "Controle de Hidratação",
      description: "Monitore sua ingestão diária de água com lembretes inteligentes"
    },
    {
      icon: <Heart className="h-8 w-8 text-green-500" />,
      title: "Assistente IA",
      description: "Dr. de Ajuda sempre disponível para suas dúvidas sobre saúde"
    },
    {
      icon: <Timer className="h-8 w-8 text-green-500" />,
      title: "Resultados Rápidos",
      description: "Veja resultados em poucas semanas com nosso método comprovado"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-green-500">Vida</span> Live
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Seu companheiro digital para uma vida mais saudável. Alcance seus objetivos de emagrecimento 
            com planos personalizados, exercícios guiados e acompanhamento inteligente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/register')}
            >
              Assinar plano — €5/mês
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-green-500 text-green-500 hover:bg-green-50 px-8 py-3 text-lg"
              onClick={() => navigate('/login')}
            >
              Entrar / Criar conta
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <CardTitle className="text-lg text-gray-900">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500">
          <a href="#" className="hover:text-green-500 mx-2">Política de Privacidade</a>
          <span>•</span>
          <a href="#" className="hover:text-green-500 mx-2">Termos de Uso</a>
        </div>
      </div>
    </div>
  );
};
