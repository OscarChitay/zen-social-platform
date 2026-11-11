import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "fixed top-6 right-6 z-[100] w-12 h-12 rounded-2xl overflow-hidden group",
        "transition-all duration-500 hover:scale-110 active:scale-95",
        "animate-slide-down shadow-glass-lg"
      )}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {/* Glass background premium */}
      <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-2xl group-hover:border-primary/30 transition-colors duration-500"></div>
      <div className="absolute inset-0 shadow-inner"></div>

      {/* Rotating shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700 -z-10"></div>

      {/* Icon con animación de rotación suave */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-warning transition-all duration-700 group-hover:rotate-180 group-hover:scale-110 drop-shadow-lg" strokeWidth={2.5} />
        ) : (
          <Moon className="w-5 h-5 text-primary transition-all duration-700 group-hover:-rotate-45 group-hover:scale-110 drop-shadow-lg" strokeWidth={2.5} />
        )}
      </div>

      {/* Tooltip mejorado */}
      <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl backdrop-blur-sm">
        {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black dark:bg-white rotate-45"></div>
      </div>
    </button>
  );
}
