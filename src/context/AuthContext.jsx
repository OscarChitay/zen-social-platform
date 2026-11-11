import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const authStatus = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('token');

      if (savedUser && authStatus === 'true' && token) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        // evita estado inconsistente
        logout();
      }
    } catch (e) {
      console.error('Error al verificar autenticación:', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ⬇️ Acepta DOS argumentos (como llamas desde Login)
  const login = (userData, token) => {
    if (!userData || !token) {
      throw new Error('Faltan credenciales de login (user o token)');
    }
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', token);     // << guarda token
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');         // << limpia token
    sessionStorage.removeItem('hasLoaded');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
