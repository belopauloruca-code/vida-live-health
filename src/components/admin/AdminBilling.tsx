import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Euro, Users, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueData {
  month: string;
  revenue: number;
}

interface BillingStats {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyGrowth: number;
  lastMonth: number;
}

export const AdminBilling: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    monthlyGrowth: 0,
    lastMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      // Get revenue by month from transactions
      const { data: revenueByMonth } = await supabase
        .from('admin_revenue_by_month')
        .select('*')
        .limit(12);

      // Get total revenue
      const { data: totalRevenueData } = await supabase
        .from('transactions')
        .select('amount_eur')
        .eq('status', 'completed');

      // Get active subscriptions count
      const { data: activeSubsData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      // Format revenue data for chart
      const formattedRevenue = revenueByMonth?.map(item => ({
        month: new Date(item.month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        revenue: Number(item.total_revenue) || 0,
      })) || [];

      // Calculate stats
      const totalRevenue = totalRevenueData?.reduce((sum, transaction) => 
        sum + (Number(transaction.amount_eur) || 0), 0) || 0;
      
      const activeSubscriptions = activeSubsData?.length || 0;
      
      // Calculate monthly growth
      const thisMonth = formattedRevenue[0]?.revenue || 0;
      const lastMonth = formattedRevenue[1]?.revenue || 0;
      const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      setRevenueData(formattedRevenue.reverse());
      setStats({
        totalRevenue,
        activeSubscriptions,
        monthlyGrowth,
        lastMonth,
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Euro className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
          <p className="text-gray-600">Acompanhe receitas e métricas financeiras</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor total arrecadado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Usuários premium ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.lastMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Receita do mês passado</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Evolução da receita nos últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Receita']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4CAF50" 
                  strokeWidth={2}
                  dot={{ fill: '#4CAF50' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};