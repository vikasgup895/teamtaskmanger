import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkspacePage from './pages/WorkspacePage';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import TaskBoardPage from './pages/TaskboardPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading TaskFlow…</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/workspace" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/workspace" replace />} />
              <Route path="workspace"         element={<WorkspacePage />} />
              <Route path="spaces"            element={<SpacesPage />} />
              <Route path="spaces/:id"        element={<SpaceDetailPage />} />
              <Route path="spaces/:id/board"  element={<TaskBoardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/workspace" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
