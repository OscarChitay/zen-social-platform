import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/Login';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import PublicProfile from "./pages/PublicProfile";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Verificar si ya se mostró la pantalla de carga en esta sesión
  useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem('hasLoaded');

    if (hasLoadedBefore) {
      // Si ya se cargó antes en esta sesión, saltar la pantalla de carga
      setIsLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Marcar que ya se mostró la pantalla de carga en esta sesión
    sessionStorage.setItem('hasLoaded', 'true');
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <Routes>
      {/* Ruta pública - Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout><Home /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <MainLayout><Search /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainLayout noPadding><Messages /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <MainLayout><PublicProfile /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
