
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Eu sou o Dr. de Ajuda, seu assistente pessoal para uma vida mais saudável. Como posso te ajudar hoje?",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickSuggestions = [
    "Como bater minha meta de água?",
    "Sugestões de lanches até 200 kcal",
    "Treino rápido de 10 min",
    "Como calcular meu IMC ideal?",
    "Receitas ricas em proteína",
    "Exercícios para iniciantes"
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate AI response (in production, this would call a real AI API)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateResponse(inputMessage),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('água') || lowerMessage.includes('hidrat')) {
      return "💧 Ótima pergunta! Para bater sua meta de água: \n\n• Tenha sempre uma garrafa por perto\n• Configure lembretes no app\n• Beba um copo ao acordar\n• Adicione limão ou hortelã para variar\n• Monitore sua urina - ela deve estar clara\n\nLembre-se: sua meta atual é baseada no seu peso. Mantenha-se hidratado! 🌟";
    }
    
    if (lowerMessage.includes('lanche') || lowerMessage.includes('200') || lowerMessage.includes('kcal')) {
      return "🍎 Aqui estão ótimas opções de lanches até 200 kcal:\n\n• 1 maçã + 10g de amendoim (180 kcal)\n• 1 iogurte grego + 1 colher de granola (150 kcal)\n• 2 fatias de queijo branco + tomate (120 kcal)\n• 1 banana + 1 colher de pasta de amendoim (190 kcal)\n• Mix de castanhas (30g = 180 kcal)\n\nDica: combine sempre proteína com carboidrato para maior saciedade! 😋";
    }
    
    if (lowerMessage.includes('treino') || lowerMessage.includes('exerc') || lowerMessage.includes('10')) {
      return "💪 Treino rápido de 10 minutos para queimar calorias:\n\n1. Polichinelos - 1 min\n2. Agachamentos - 1 min\n3. Flexões (ou no joelho) - 1 min\n4. Prancha - 30s\n5. Mountain climbers - 1 min\n6. Burpees - 1 min\n7. Descanso - 30s\n8. Repetir sequência\n\nEsse treino queima ~80-100 kcal! Use o timer do app para acompanhar. 🔥";
    }
    
    if (lowerMessage.includes('imc') || lowerMessage.includes('peso')) {
      return "📊 O IMC (Índice de Massa Corporal) é calculado dividindo seu peso (kg) pela altura (m) ao quadrado.\n\nClassificação:\n• Abaixo de 18,5: Abaixo do peso\n• 18,5-24,9: Peso normal\n• 25-29,9: Sobrepeso\n• 30+: Obesidade\n\nSeu IMC atual está no seu perfil! Lembre-se: o IMC é apenas uma referência. Consulte sempre um profissional de saúde. 👩‍⚕️";
    }
    
    return "Entendo sua pergunta! Como assistente focado em emagrecimento saudável, posso te ajudar com:\n\n• Dicas de hidratação e alimentação\n• Sugestões de exercícios seguros\n• Orientações sobre metas calóricas\n• Motivação para manter a rotina\n\n⚠️ Importante: Para questões médicas específicas, sempre consulte um profissional de saúde qualificado.\n\nQue tal experimentar uma das sugestões rápidas abaixo? 😊";
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dr. de Ajuda</h1>
          <p className="text-gray-600">Seu assistente de saúde e bem-estar</p>
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <Card className="mb-6 border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600 text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Sugestões Rápidas
              </CardTitle>
              <CardDescription>
                Clique em uma das sugestões abaixo ou digite sua própria pergunta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left border-green-200 hover:bg-green-50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.isBot
                    ? 'bg-white border border-gray-200'
                    : 'bg-green-500 text-white'
                }`}
              >
                {message.isBot && (
                  <div className="flex items-center mb-2">
                    <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Dr. de Ajuda</span>
                  </div>
                )}
                <p className="whitespace-pre-line text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Dr. de Ajuda está digitando...</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <Card className="sticky bottom-24 bg-white shadow-lg">
          <CardContent className="pt-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua pergunta sobre saúde e bem-estar..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-green-500 hover:bg-green-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            ⚠️ Este assistente fornece informações gerais sobre saúde e bem-estar.
            Para questões médicas específicas, consulte sempre um profissional qualificado.
          </p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};
