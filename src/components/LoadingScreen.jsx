import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import logo1 from '../assets/images/logo1.png'; // Logo claro
import logo2 from '../assets/images/logo 2.png'; // Logo oscuro (nota el espacio)

function LoadingScreen({ onLoadingComplete }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simular progreso de carga
    const duration = 5000; // 5 segundos (aumentado para poder verla mejor)
    const interval = 50; // Actualizar cada 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;

      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);

        // Iniciar animación de salida
        setTimeout(() => {
          setIsExiting(true);

          // Completar carga después de la animación
          setTimeout(() => {
            onLoadingComplete();
          }, 600);
        }, 300);
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg transition-all duration-600 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-6">
          {/* Logo ZEN - texto + imagen a la derecha */}
          <div className="relative animate-fade-in flex items-center gap-4">
            <h1 className="text-6xl md:text-7xl font-display font-black bg-gradient-github bg-clip-text text-transparent tracking-tight">
              ZEN
            </h1>
            <img
              src={theme === 'dark' ? logo1 : logo2}
              alt="ZEN Logo"
              className="h-16 md:h-20 w-auto object-contain"
            />

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-2xl opacity-60 animate-pulse-slow"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            Cargando experiencia...
          </p>

          {/* Progress bar */}
          <div className="w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Percentage */}
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

LoadingScreen.propTypes = {
  onLoadingComplete: PropTypes.func.isRequired,
};

export default LoadingScreen;
