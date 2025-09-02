import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  // Redirect if already admin
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isRegistering) {
        // Register new admin user
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            },
            emailRedirectTo: `${window.location.origin}/admin/login`,
          },
        });

        if (signUpError) {
          toast({
            title: 'Erro no registro',
            description: signUpError.message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Registro realizado com sucesso',
          description: 'Verifique seu email para confirmar a conta. Após confirmação, você será promovido a admin.',
        });
        setIsRegistering(false);
        form.reset();
      } else {
        // Sign in with Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        // Check if user has admin role
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !userRoles) {
          // Sign out the user if they don't have admin role
          await supabase.auth.signOut();
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar o painel administrativo',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo ao painel administrativo',
        });
        navigate('/admin');
      }
    } catch (error) {
      toast({
        title: isRegistering ? 'Erro no registro' : 'Erro no login',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegistering ? 'Registro Admin' : 'Admin Panel'}
          </CardTitle>
          <CardDescription>
            {isRegistering ? 'Criar nova conta de administrador' : 'Vida Leve - Painel Administrativo'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isRegistering && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@vidaleve.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isRegistering ? 'Registrando...' : 'Entrando...')
                  : (isRegistering ? 'Registrar' : 'Entrar')
                }
              </Button>
            </form>
          </Form>
          <div className="mt-4 space-y-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsRegistering(!isRegistering);
                form.reset();
              }}
            >
              {isRegistering ? 'Já tem conta? Fazer login' : 'Criar nova conta admin'}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              <p>Use suas credenciais de usuário registrado.</p>
              <p>Somente administradores podem acessar este painel.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};