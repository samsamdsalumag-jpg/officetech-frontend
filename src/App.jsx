import RegisterPage from './pages/RegisterPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import BorrowPage from './pages/BorrowPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingAdminsPage from './pages/PendingAdminsPage';
import AdminManagementPage from './pages/AdminManagementPage';

// Layout
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
  return admin ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="borrow" element={<BorrowPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="pending-admins" element={<PendingAdminsPage />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
