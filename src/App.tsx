
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PWAUpdater } from '@/components/PWAUpdater';
import { SplashScreen } from '@/components/ui/splash-screen';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

import { DashboardPage } from '@/pages/DashboardPage';
import { MealPlansPage } from '@/pages/MealPlansPage';
import { ExercisesPage } from '@/pages/ExercisesPage';
import { DownloadAppPage } from '@/pages/DownloadAppPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { SubscriptionPlanPage } from '@/pages/SubscriptionPlanPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SplashScreen />
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              
              
              {/* Protected user routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/meal-plans" element={<ProtectedRoute><MealPlansPage /></ProtectedRoute>} />
              <Route path="/exercises" element={<ProtectedRoute requirePremium><ExercisesPage /></ProtectedRoute>} />
              <Route path="/download-app" element={<ProtectedRoute requirePremium><DownloadAppPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requirePremium><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute requirePremium><AIAssistantPage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPlanPage /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              
              {/* Redirect to dashboard if logged in, otherwise to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
          <PWAUpdater />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
