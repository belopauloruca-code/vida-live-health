
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Conta criada!",
        description: "Redirecionando para o pagamento...",
      });
      
      // Redirect to payment page after successful registration
      setTimeout(() => {
        navigate('/payment');
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-green-500">Vida</span> Live
          </CardTitle>
          <CardDescription>
            Crie sua conta e comece sua transformação hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link to="/login" className="text-green-500 hover:text-green-600 text-sm">
                Já tem conta? Faça login
              </Link>
            </div>
            <div className="text-center">
              <Link to="/" className="text-gray-500 hover:text-gray-600 text-sm">
                ← Voltar ao início
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
