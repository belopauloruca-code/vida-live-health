
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Register and assign admin role
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Update profile role
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id);

          // Add admin role
          await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: 'admin' });
        }

        toast({
          title: "Conta admin criada!",
          description: "Você agora tem acesso ao painel administrativo.",
        });
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login admin realizado!",
          description: "Bem-vindo ao painel administrativo.",
        });
      }
      
      navigate('/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
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
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Painel Admin - <span className="text-green-500">Vida</span> Live
          </CardTitle>
          <CardDescription>
            {isRegister ? 'Criar conta de administrador' : 'Acesso restrito para administradores'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome do administrador"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@vidalive.com"
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
              {loading 
                ? (isRegister ? 'Criando...' : 'Entrando...') 
                : (isRegister ? 'Criar Admin' : 'Entrar como Admin')
              }
            </Button>
          </form>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-green-500 hover:text-green-600 text-sm"
              >
                {isRegister ? 'Já tem conta admin? Faça login' : 'Criar primeira conta admin'}
              </button>
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
