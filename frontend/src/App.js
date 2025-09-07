import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import Absences from './pages/Absences';
import Incidents from './pages/Incidents';
import Discipline from './pages/Discipline';
import Settings from './pages/Settings';
import ThemeDemo from './components/ThemeDemo';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant principal de l'application
const AppContent = () => {
  return (
    <Routes>
      {/* Route publique */}
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="parents" element={<Parents />} />
        <Route path="absences" element={<Absences />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="discipline" element={<Discipline />} />
        <Route path="settings" element={<Settings />} />
        <Route path="theme-demo" element={<ThemeDemo />} />
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Composant racine avec les contextes
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
