// Servicio de autenticación
// TODO: Reemplazar las URLs con las del backend real

const API_URL = '/api/auth'; // Cambiar por la URL real del backend

export const authService = {
  // Login
  async login(credentials) {
    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`${API_URL}/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials),
      // });

      // if (!response.ok) {
      //   throw new Error('Error al iniciar sesión');
      // }

      // const data = await response.json();
      // return data;

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        user: {
          id: 1,
          email: credentials.email,
          username: 'user123',
          name: 'Usuario Demo',
          avatar: 'https://i.pravatar.cc/150?img=1',
          bio: 'Amante de la fotografía y el diseño',
          followers: 1234,
          following: 567,
          posts: 89
        },
        token: 'mock-jwt-token-123'
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Register
  async register(userData) {
    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`${API_URL}/register`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userData),
      // });

      // if (!response.ok) {
      //   throw new Error('Error al registrarse');
      // }

      // const data = await response.json();
      // return data;

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        user: {
          id: Date.now(),
          email: userData.email,
          username: userData.username,
          name: userData.name,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          bio: '',
          followers: 0,
          following: 0,
          posts: 0
        },
        token: `mock-jwt-token-${Date.now()}`
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      // TODO: Reemplazar con llamada real al backend
      // await fetch(`${API_URL}/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  // Verificar token
  async verifyToken(token) {
    try {
      void token;
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`${API_URL}/verify`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error('Token inválido');
      // }

      // const data = await response.json();
      // return data;

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 300));
      return { valid: true };
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  },

  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      void email;
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`${API_URL}/forgot-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });

      // if (!response.ok) {
      //   throw new Error('Error al enviar email de recuperación');
      // }

      // const data = await response.json();
      // return data;

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Se ha enviado un email con instrucciones para recuperar tu contraseña'
      };
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      throw error;
    }
  },

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      void token;
      void newPassword;
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`${API_URL}/reset-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token, newPassword }),
      // });

      // if (!response.ok) {
      //   throw new Error('Error al resetear contraseña');
      // }

      // const data = await response.json();
      // return data;

      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      throw error;
    }
  }
};
