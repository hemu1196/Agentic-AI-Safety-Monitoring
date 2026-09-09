import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProjectProvider } from './hooks/useProject';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';

// Auth Pages Suite
import { LoginPage } from './features/auth/pages/LoginPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';

// Protected Routes
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleProtectedRoute } from './routes/RoleProtectedRoute';

// Dashboard / App Pages
import { Dashboard } from './pages/Dashboard';
import { SafetyMonitoring } from './pages/SafetyMonitoring';
import { ProjectMonitoring } from './pages/ProjectMonitoring';
import { ResourceManagement } from './pages/ResourceManagement';
import { Alerts } from './pages/Alerts';
import { Weather } from './pages/Weather';

// Lazy loaded heavy components for optimized load time
const WorkerEntrySafety = React.lazy(() => import('./pages/WorkerEntrySafety').then(m => ({ default: m.WorkerEntrySafety })));
const RiskAnalytics = React.lazy(() => import('./pages/RiskAnalytics').then(m => ({ default: m.RiskAnalytics })));
const AIPredictions = React.lazy(() => import('./pages/AIPredictions').then(m => ({ default: m.AIPredictions })));
const AgenticAI = React.lazy(() => import('./pages/AgenticAI').then(m => ({ default: m.AgenticAI })));
const Reports = React.lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const SiteMap = React.lazy(() => import('./pages/SiteMap').then(m => ({ default: m.SiteMap })));
const WorkerReports = React.lazy(() => import('./pages/WorkerReports').then(m => ({ default: m.WorkerReports })));

// Worker Pages
import { WorkerDashboard } from './pages/WorkerDashboard';
import { WorkerEntryHistory } from './pages/WorkerEntryHistory';
import { WorkerSafetyStatus } from './pages/WorkerSafetyStatus';
import { MyAttendance } from './pages/MyAttendance';
import { ReportIssue } from './pages/ReportIssue';
import { MyReports } from './pages/MyReports';
import { ApplyLeave } from './pages/ApplyLeave';
import { WorkerNotifications } from './pages/WorkerNotifications';
import { WorkerWeather } from './pages/WorkerWeather';
import { WorkerSettings } from './pages/WorkerSettings';
import { SettingsPage } from './pages/SettingsPage';
import FloatingChatbot from './components/FloatingChatbot';

// Shared Route wrappers to preserve Admin pages untouched
const WeatherRoute: React.FC = () => {
  const { user } = useAuth();
  return user?.role === 'WORKER' ? <WorkerWeather /> : <Weather />;
};

const SettingsRoute: React.FC = () => {
  const { user } = useAuth();
  return user?.role === 'WORKER' ? <WorkerSettings /> : <SettingsPage />;
};

// Main Layout wrapping sidebar and navigation
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <span className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest mt-3 text-slate-400">Loading Site Sentinel...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-150 relative">
      {/* Navigation sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Top Navbar & Scrollable Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Chatbot Assistant */}
      <FloatingChatbot />
    </div>
  );
};

// Route security filter for Login page
const LoginRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    if (user.role === 'WORKER') {
      return <Navigate to="/worker-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Smart home route router
const HomeRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'WORKER') {
    return <Navigate to="/worker-dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <React.Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
              <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest mt-3 text-slate-400">Loading Section...</span>
            </div>
          }>
            <Routes>
              {/* Public authentication pages */}
              <Route
                path="/login"
                element={
                  <LoginRoute>
                    <LoginPage />
                  </LoginRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <LoginRoute>
                    <ForgotPasswordPage />
                  </LoginRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <LoginRoute>
                    <ResetPasswordPage />
                  </LoginRoute>
                }
              />

              {/* Secure routes inside layout wrapper */}
              <Route path="/" element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />

              {/* Admin Specific Secure Routes */}
              <Route path="/dashboard" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><Dashboard /></RoleProtectedRoute></MainLayout>} />
              <Route path="/safety" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><SafetyMonitoring /></RoleProtectedRoute></MainLayout>} />
              <Route path="/worker-safety" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><WorkerEntrySafety /></RoleProtectedRoute></MainLayout>} />
              <Route path="/worker-reports" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><WorkerReports /></RoleProtectedRoute></MainLayout>} />
              <Route path="/risk" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><RiskAnalytics /></RoleProtectedRoute></MainLayout>} />
              <Route path="/project-monitoring" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><ProjectMonitoring /></RoleProtectedRoute></MainLayout>} />
              <Route path="/resources" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><ResourceManagement /></RoleProtectedRoute></MainLayout>} />
              <Route path="/predictions" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><AIPredictions /></RoleProtectedRoute></MainLayout>} />
              <Route path="/agentic-ai" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><AgenticAI /></RoleProtectedRoute></MainLayout>} />
              <Route path="/reports" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><Reports /></RoleProtectedRoute></MainLayout>} />
              <Route path="/alerts" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><Alerts /></RoleProtectedRoute></MainLayout>} />
              <Route path="/map" element={<MainLayout><RoleProtectedRoute allowedRoles={['ADMIN']}><SiteMap /></RoleProtectedRoute></MainLayout>} />

              {/* Worker Specific Secure Routes */}
              <Route path="/worker-dashboard" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><WorkerDashboard /></RoleProtectedRoute></MainLayout>} />
              <Route path="/my-attendance" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><MyAttendance /></RoleProtectedRoute></MainLayout>} />
              <Route path="/my-entry-history" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><WorkerEntryHistory /></RoleProtectedRoute></MainLayout>} />
              <Route path="/my-safety-status" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><WorkerSafetyStatus /></RoleProtectedRoute></MainLayout>} />
              <Route path="/report-issue" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><ReportIssue /></RoleProtectedRoute></MainLayout>} />
              <Route path="/my-reports" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><MyReports /></RoleProtectedRoute></MainLayout>} />
              <Route path="/apply-leave" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><ApplyLeave /></RoleProtectedRoute></MainLayout>} />
              <Route path="/notifications" element={<MainLayout><RoleProtectedRoute allowedRoles={['WORKER']}><WorkerNotifications /></RoleProtectedRoute></MainLayout>} />

              {/* Shared Secure Routes */}
              <Route path="/weather" element={<MainLayout><ProtectedRoute><WeatherRoute /></ProtectedRoute></MainLayout>} />
              <Route path="/settings" element={<MainLayout><ProtectedRoute><SettingsRoute /></ProtectedRoute></MainLayout>} />

              {/* Alias redirects to keep matching requested specifications */}
              <Route path="/safety-monitoring" element={<Navigate to="/safety" replace />} />
              <Route path="/worker-entry-safety" element={<Navigate to="/worker-safety" replace />} />
              <Route path="/risk-analytics" element={<Navigate to="/risk" replace />} />
              <Route path="/resource-management" element={<Navigate to="/resources" replace />} />
              <Route path="/ai-predictions" element={<Navigate to="/predictions" replace />} />
              <Route path="/site-map" element={<Navigate to="/map" replace />} />
              <Route path="/projects" element={<Navigate to="/project-monitoring" replace />} />
              <Route path="/worker-entry-history" element={<Navigate to="/my-entry-history" replace />} />
              <Route path="/worker-safety-status" element={<Navigate to="/my-safety-status" replace />} />

              {/* Fallback navigation to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}
