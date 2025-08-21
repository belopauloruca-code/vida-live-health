
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Euro, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  started_at?: string;
  expires_at?: string;
  user_name?: string;
  user_email?: string;
}

export const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      // Get subscriptions with user data
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          product_id,
          status,
          started_at,
          expires_at,
          profiles:user_id (
            name,
            id
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // For now, just use profile data without auth admin access
      const mergedData = subscriptions?.map(sub => {
        const profile = sub.profiles as any;
        return {
          ...sub,
          user_name: profile?.name || 'Sem nome',
          user_email: 'contato@vidalive.app', // Placeholder since we can't access auth admin
        };
      }) || [];

      setSubscriptions(mergedData);

      // Calculate stats
      const total = mergedData.length;
      const active = mergedData.filter(s => s.status === 'active').length;
      const expired = mergedData.filter(s => s.status === 'expired').length;
      const revenue = active * 5; // €5 per active subscription

      setStats({ total, active, expired, revenue });
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'expired':
        return 'Expirado';
      case 'canceled':
        return 'Cancelado';
      case 'trialing':
        return 'Trial';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assinaturas</h1>
        <p className="text-gray-600">Gerencie assinaturas e receita do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Assinaturas totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Pagantes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam renovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{stats.revenue}</div>
            <p className="text-xs text-muted-foreground">
              Receita recorrente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
          <CardDescription>
            Lista de todas as assinaturas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    {subscription.user_name}
                  </TableCell>
                  <TableCell>{subscription.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Premium Monthly
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusText(subscription.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subscription.started_at 
                      ? new Date(subscription.started_at).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {subscription.expires_at 
                      ? new Date(subscription.expires_at).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell className="font-medium">€5.00</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {subscriptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma assinatura encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
