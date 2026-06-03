import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Sedes from './pages/Sedes';
import Operadores from './pages/Operadores';
import Preloader from './components/Preloader';

import DashboardLayout from './layouts/DashboardLayout';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />;
};

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  const handlePreloaderFinish = useCallback(() => {
    setShowPreloader(false);
  }, []);

  return (
    <>
      {showPreloader && <Preloader onFinish={handlePreloaderFinish} />}

      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes wrapped in DashboardLayout */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="estudiantes" element={<Estudiantes />} />
          <Route path="sedes" element={<Sedes />} />
          <Route path="operadores" element={<Operadores />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;

