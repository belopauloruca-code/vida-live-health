import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandHeader } from '@/components/ui/brand-header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfDay } from 'date-fns';
import { Calendar, Clock, Droplets, Flame, Utensils, Weight, StickyNote, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DailyReport {
  id: string;
  report_date: string;
  water_consumed_ml: number;
  exercises_completed: number;
  kcal_burned: number;
  planned_meals: number;
  weight_kg?: number;
  sleep_hours?: number;
  notes?: string;
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [recentReports, setRecentReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingToday, setEditingToday] = useState(false);
  const [formData, setFormData] = useState({
    water_consumed_ml: 0,
    exercises_completed: 0,
    kcal_burned: 0,
    planned_meals: 0,
    weight_kg: '',
    sleep_hours: '',
    notes: ''
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadTodayReport();
      loadRecentReports();
    }
  }, [user]);

  const loadTodayReport = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_user_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('report_date', today)
      .maybeSingle();

    if (error) {
      console.error('Error loading today report:', error);
      return;
    }

    if (data) {
      setTodayReport(data);
      setFormData({
        water_consumed_ml: data.water_consumed_ml || 0,
        exercises_completed: data.exercises_completed || 0,
        kcal_burned: data.kcal_burned || 0,
        planned_meals: data.planned_meals || 0,
        weight_kg: data.weight_kg?.toString() || '',
        sleep_hours: data.sleep_hours?.toString() || '',
        notes: data.notes || ''
      });
    } else {
      // Auto-populate with today's data
      await loadTodayData();
    }
  };

  const loadTodayData = async () => {
    if (!user) return;

    // Get hydration data
    const { data: hydrationData } = await supabase
      .from('hydration_logs')
      .select('amount_ml')
      .eq('user_id', user.id)
      .gte('ts', startOfDay(new Date()).toISOString());

    const waterConsumed = hydrationData?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0;

    // Get exercise data
    const { data: exerciseData } = await supabase
      .from('exercise_sessions')
      .select('kcal_burned')
      .eq('user_id', user.id)
      .gte('started_at', startOfDay(new Date()).toISOString());

    const exercisesCount = exerciseData?.length || 0;
    const kcalBurned = exerciseData?.reduce((sum, session) => sum + (session.kcal_burned || 0), 0) || 0;

    // Get meal plan data
    const { data: mealPlanData } = await supabase
      .from('meal_plans')
      .select('meals_per_day')
      .eq('user_id', user.id)
      .lte('start_date', today)
      .gte('end_date', today)
      .maybeSingle();

    const plannedMeals = mealPlanData?.meals_per_day || 0;

    setFormData(prev => ({
      ...prev,
      water_consumed_ml: waterConsumed,
      exercises_completed: exercisesCount,
      kcal_burned: kcalBurned,
      planned_meals: plannedMeals
    }));
  };

  const loadRecentReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_user_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('report_date', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Error loading recent reports:', error);
      return;
    }

    setRecentReports(data || []);
  };

  const saveTodayReport = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const reportData = {
        user_id: user.id,
        report_date: today,
        water_consumed_ml: formData.water_consumed_ml,
        exercises_completed: formData.exercises_completed,
        kcal_burned: formData.kcal_burned,
        planned_meals: formData.planned_meals,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
        notes: formData.notes || null
      };

      const { data, error } = await supabase
        .from('daily_user_reports')
        .upsert(reportData, { onConflict: 'user_id,report_date' })
        .select()
        .single();

      if (error) throw error;

      setTodayReport(data);
      setEditingToday(false);
      toast({
        title: "Relatório salvo!",
        description: "Seu relatório diário foi salvo com sucesso.",
      });

      await loadRecentReports();
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = recentReports
    .slice(0, 7)
    .reverse()
    .map(report => ({
      date: format(new Date(report.report_date), 'dd/MM'),
      agua: report.water_consumed_ml,
      exercicios: report.exercises_completed,
      kcal: report.kcal_burned
    }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <BrandHeader 
            title="Relatórios"
            subtitle="Acompanhe seu progresso diário"
          />
        </div>

        {/* Today's Report */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Relatório de Hoje</CardTitle>
            </div>
            <Button
              variant={editingToday ? "outline" : "default"}
              size="sm"
              onClick={() => setEditingToday(!editingToday)}
            >
              {editingToday ? "Cancelar" : "Editar"}
            </Button>
          </CardHeader>
          <CardContent>
            {editingToday ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="water">Água Consumida (ml)</Label>
                    <Input
                      id="water"
                      type="number"
                      value={formData.water_consumed_ml}
                      onChange={(e) => setFormData(prev => ({ ...prev, water_consumed_ml: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="exercises">Exercícios Realizados</Label>
                    <Input
                      id="exercises"
                      type="number"
                      value={formData.exercises_completed}
                      onChange={(e) => setFormData(prev => ({ ...prev, exercises_completed: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kcal">Kcal Queimadas</Label>
                    <Input
                      id="kcal"
                      type="number"
                      value={formData.kcal_burned}
                      onChange={(e) => setFormData(prev => ({ ...prev, kcal_burned: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meals">Refeições Planejadas</Label>
                    <Input
                      id="meals"
                      type="number"
                      value={formData.planned_meals}
                      onChange={(e) => setFormData(prev => ({ ...prev, planned_meals: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sleep">Horas de Sono</Label>
                    <Input
                      id="sleep"
                      type="number"
                      step="0.5"
                      value={formData.sleep_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, sleep_hours: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notas do Dia</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Como foi o seu dia? Alguma observação importante..."
                    rows={3}
                  />
                </div>
                <Button onClick={saveTodayReport} disabled={isLoading} className="w-full">
                  {isLoading ? "Salvando..." : "Salvar Relatório"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Água</div>
                    <div className="font-medium">{todayReport?.water_consumed_ml || 0}ml</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Exercícios</div>
                    <div className="font-medium">{todayReport?.exercises_completed || 0}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Kcal</div>
                    <div className="font-medium">{todayReport?.kcal_burned || 0}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Refeições</div>
                    <div className="font-medium">{todayReport?.planned_meals || 0}</div>
                  </div>
                </div>
                {todayReport?.weight_kg && (
                  <div className="flex items-center space-x-2">
                    <Weight className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Peso</div>
                      <div className="font-medium">{todayReport.weight_kg}kg</div>
                    </div>
                  </div>
                )}
                {todayReport?.sleep_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Sono</div>
                      <div className="font-medium">{todayReport.sleep_hours}h</div>
                    </div>
                  </div>
                )}
                {todayReport?.notes && (
                  <div className="col-span-2 md:col-span-4 flex items-start space-x-2">
                    <StickyNote className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground">Notas</div>
                      <div className="text-sm">{todayReport.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span>Hidratação (7 dias)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}ml`, 'Água']} />
                    <Line type="monotone" dataKey="agua" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>Kcal Queimadas (7 dias)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kcal`, 'Queimadas']} />
                    <Bar dataKey="kcal" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum relatório encontrado. Comece criando o relatório de hoje!
              </p>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{format(new Date(report.report_date), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600">{report.water_consumed_ml}ml</span>
                      <span className="text-green-600">{report.exercises_completed} ex</span>
                      <span className="text-orange-600">{report.kcal_burned} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};