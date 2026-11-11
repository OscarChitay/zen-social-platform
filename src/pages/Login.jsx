import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo1 from '../assets/images/logo1.png'; // Logo claro
import logo2 from '../assets/images/logo 2.png'; // Logo oscuro (nota el espacio)
import { GoogleLogin } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const recaptchaRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const newErrors = {};
    if (!formData.email) newErrors.email = "El email es requerido";
    if (!formData.password) newErrors.password = "La contraseña es requerida";
    if (!isLogin) {
      if (!formData.username) newErrors.username = "El nombre de usuario es requerido";
      if (!formData.name) newErrors.name = "El nombre es requerido";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // ✅ Genera un token FRESCO cada vez (sin resetear antes)
       const captcha = await recaptchaRef.current.executeAsync();
       if (!captcha) throw new Error("No se pudo obtener reCAPTCHA");

      const url = `${API_URL}/api/auth/${isLogin ? "login" : "register"}`;
      const body = isLogin
        ? { email: formData.email, password: formData.password, captcha }
        : {
            email: formData.email,
            password: formData.password,
            username: formData.username,
            nombre_completo: formData.name,
            captcha,
          };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Error de autenticación");
      }

      login(data.usuario, data.token);
      navigate("/");

    } catch (error) {
      console.error("❌ Error en login:", error);
      setErrors({ general: error.message });
    } finally {
      // ✅ Resetea SOLO al final
      try {
        recaptchaRef.current?.reset();
      } catch {
        console.log("No se pudo resetear reCAPTCHA");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrors({});

    try {
      const tokenGoogle = credentialResponse.credential;

      const captcha = await recaptchaRef.current.executeAsync();
      if (!captcha) throw new Error("No se pudo obtener reCAPTCHA");


      const res = await fetch(`${API_URL}/api/auth/login-google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenGoogle, captcha}),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Error con Google Login");
      }

      login(data.usuario, data.token);
      navigate("/");

    } catch (err) {
      console.error("Error en Google login:", err);
      setErrors({ general: err.message });
    } finally {
      try {
        recaptchaRef.current?.reset();
      } catch {
        console.log("No se pudo resetear reCAPTCHA");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: "No se pudo iniciar sesión con Google." });
  };


  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      username: '',
      name: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg">
      {/* Animated background gradient orbs - responsive */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Glassmorphism container - responsive */}
        <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl"></div>
        <div className="absolute inset-0 border border-gray-200/60 dark:border-white/10 rounded-2xl sm:rounded-3xl"></div>
        <div className="absolute inset-0 shadow-2xl rounded-2xl sm:rounded-3xl"></div>

        <div className="relative p-5 sm:p-6 md:p-8">
          {/* Header con logo - responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black bg-gradient-github bg-clip-text text-transparent tracking-tight">
                ZEN
              </h1>
              <img
                src={theme === 'dark' ? logo1 : logo2}
                alt="ZEN Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta en ZEN'}
            </p>
          </div>

          {/* Error general - responsive */}
          {errors.general && (
            <div className="mb-4 p-2.5 sm:p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Form - responsive */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name (solo registro) */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Username (solo registro) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot password (solo login) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-secondary transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-br from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </>
              ) : (
                isLogin ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 dark:bg-dark-surface/70 text-gray-500 dark:text-gray-400">
                o
              </span>
            </div>
          </div>
          <div className="flex justify-center">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme={theme === 'dark' ? 'filled_black' : 'outline'}
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
          </div>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={recaptchaSiteKey}
            size="invisible"
            badge="bottomright"
          />



          {/* Switch mode */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                onClick={switchMode}
                className="text-primary hover:text-secondary font-semibold transition-colors"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
