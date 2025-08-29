
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { getReply } from '@/data/drAjudaResponses';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const quickSuggestions = [
    "Como perder peso de forma saudável?",
    "O que posso comer à noite?",
    "Quantas vezes por semana devo treinar?",
    "Como manter a motivação no emagrecimento?",
    "Como posso aumentar meu consumo de água?",
    "Quais são os melhores lanches saudáveis?"
  ];

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dr_ajuda_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      const historyMessages: Message[] = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isBot: msg.role === 'assistant',
        timestamp: new Date(msg.created_at)
      }));

      // Add welcome message if no history
      if (historyMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          content: "Olá! Eu sou o Dr. Ajuda, seu assistente carinhoso para uma vida mais saudável. Como posso te ajudar hoje? 💚",
          isBot: true,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message on error
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Olá! Eu sou o Dr. Ajuda, seu assistente carinhoso para uma vida mais saudável. Como posso te ajudar hoje? 💚",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!user) return;

    try {
      await supabase.from('dr_ajuda_messages').insert({
        user_id: user.id,
        role,
        content
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message
    await saveMessage(userMessage.content, 'user');
    
    const currentInput = inputMessage;
    setInputMessage('');
    setLoading(true);

    // Generate Dr. Ajuda response with delay for natural feeling
    setTimeout(async () => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getReply(currentInput),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Save bot message
      await saveMessage(botResponse.content, 'assistant');
      
      setLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt="Dr. Ajuda" />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  DA
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Dr. Ajuda
                </CardTitle>
              </div>
            </div>
            <p className="text-muted-foreground">
              Seu assistente carinhoso de saúde e bem-estar
            </p>
          </CardHeader>
        </Card>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                💬 Como posso te ajudar hoje?
              </CardTitle>
              <CardDescription>
                Clique em uma das sugestões abaixo ou digite sua própria pergunta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left h-auto p-3 justify-start hover:scale-105 transition-transform"
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
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in-50 slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex items-start gap-2 max-w-xs lg:max-w-md ${message.isBot ? '' : 'flex-row-reverse'}`}>
                    {message.isBot && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarImage src="" alt="Dr. Ajuda" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          DA
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.isBot
                          ? 'bg-white border border-border text-foreground rounded-bl-sm'
                          : 'bg-primary text-primary-foreground rounded-br-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarImage src="" alt="Dr. Ajuda" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        DA
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-border text-foreground">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Dr. Ajuda está digitando...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua pergunta sobre saúde e bem-estar..."
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !inputMessage.trim()}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>💡 Aviso:</strong> Dr. Ajuda oferece dicas gerais de saúde e bem-estar. 
            Para orientações médicas específicas, sempre consulte um profissional de saúde.
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
