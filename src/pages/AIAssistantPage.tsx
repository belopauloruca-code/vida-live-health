
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { MessageCircle, Send, Sparkles, Smile, Paperclip, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { getReply } from '@/data/drAjudaResponses';
import { useToast } from '@/hooks/use-toast';
import { getEmbedSource } from '@/utils/videoUtils';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-border">
    <div className="flex items-center space-x-1" aria-label="Digitando...">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
    </div>
  </div>
);

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    t('aiAssistant.suggestions.weightLoss'),
    t('aiAssistant.suggestions.nightFood'),
    t('aiAssistant.suggestions.exercise'),
    t('aiAssistant.suggestions.motivation'),
    t('aiAssistant.suggestions.water'),
    t('aiAssistant.suggestions.snacks')
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
          content: t('aiAssistant.welcome'),
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
        content: t('aiAssistant.welcome'),
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-expand textarea
  const handleTextareaInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  // Enhanced key press handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Detect and render video content
  const renderMessageContent = (content: string) => {
    const urlRegex = /https?:\/\/\S+/g;
    const urls = content.match(urlRegex);
    
    if (!urls || urls.length === 0) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const videoUrl = urls.find(url => {
      const source = getEmbedSource(url);
      return source.type !== 'unknown';
    });

    if (!videoUrl) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const source = getEmbedSource(videoUrl);
    
    return (
      <div>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {source.type !== 'unknown' && (
          <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-black">
            {source.type === 'file' ? (
              <video controls className="w-full h-full">
                <source src={source.src} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : (
              <iframe
                src={source.src}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title="Vídeo embarcado"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-20">
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
                {t('aiAssistant.title')}
              </CardTitle>
            </div>
          </div>
          <p className="text-muted-foreground">
            {t('aiAssistant.subtitle')}
          </p>
          </CardHeader>
        </Card>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                {t('aiAssistant.howCanIHelp')}
              </CardTitle>
              <CardDescription>
                {t('aiAssistant.suggestionDescription')}
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
            <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-4">
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
                      {renderMessageContent(message.content)}
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
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp-style Input - Fixed for mobile */}
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-3 sm:relative sm:bottom-auto sm:border-t-0 sm:p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex items-center gap-2 flex-1 bg-muted rounded-full px-3 sm:px-4 py-2">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTextareaInput();
                  }}
                  onInput={handleTextareaInput}
                  placeholder={t('aiAssistant.placeholder')}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-transparent border-0 focus:ring-0 resize-none min-h-[36px] sm:min-h-[40px] max-h-32 sm:max-h-40 py-2 px-0 text-sm sm:text-base"
                />
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              </div>
              {inputMessage.trim() ? (
                <Button 
                  onClick={sendMessage} 
                  disabled={loading}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0 flex-shrink-0"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              ) : (
                <button 
                  type="button" 
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 grid place-items-center bg-primary text-primary-foreground/90 hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 mb-20 sm:mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>💡 {t('aiAssistant.disclaimer.title')}:</strong> {t('aiAssistant.disclaimer.content')}
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
