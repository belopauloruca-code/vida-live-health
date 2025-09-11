
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingGate } from '@/components/auth/OnboardingGate';
import { PWAUpdater } from '@/components/PWAUpdater';
import { PWAInstallRedirect } from '@/components/PWAInstallRedirect';
import { SplashScreen } from '@/components/ui/splash-screen';
import Index from '@/pages/Index';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OnboardingPage } from '@/pages/OnboardingPage';

import { DashboardPage } from '@/pages/DashboardPage';
import { MealPlansPage } from '@/pages/MealPlansPage';
import ExercisesPage from '@/pages/ExercisesPage';
import FlexibilityPage from '@/pages/FlexibilityPage';
import YogaPage from '@/pages/YogaPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AdvancedPage from '@/pages/AdvancedPage';
import { DownloadAppPage } from '@/pages/DownloadAppPage';
import { TeasPage } from '@/pages/TeasPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { SubscriptionPlanPage } from '@/pages/SubscriptionPlanPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
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
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/download-app" element={<DownloadAppPage />} />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              
              {/* Protected user routes with onboarding gate */}
              <Route path="/dashboard" element={<ProtectedRoute><OnboardingGate><DashboardPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/meal-plans" element={<ProtectedRoute requireTier="basic"><OnboardingGate><MealPlansPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/exercises" element={<ProtectedRoute requireTier="basic"><OnboardingGate><ExercisesPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/teas" element={<ProtectedRoute><OnboardingGate><TeasPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/flexibility" element={<ProtectedRoute requireTier="basic"><OnboardingGate><FlexibilityPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/yoga" element={<ProtectedRoute><OnboardingGate><YogaPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><OnboardingGate><FavoritesPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/advanced" element={<ProtectedRoute requireTier="premium"><OnboardingGate><AdvancedPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute requireTier="basic"><OnboardingGate><ProfilePage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute requireTier="basic"><OnboardingGate><ReportsPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><OnboardingGate><SettingsPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute requireTier="premium"><OnboardingGate><AIAssistantPage /></OnboardingGate></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><OnboardingGate><SubscriptionPlanPage /></OnboardingGate></ProtectedRoute>} />
              
              {/* Admin login route (no protection needed) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              
              {/* Redirect to dashboard if logged in, otherwise to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
          <PWAUpdater />
          <PWAInstallRedirect />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
