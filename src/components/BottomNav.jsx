import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glass container con gradiente mejorado para modo claro */}
      <div className="relative mx-4 mb-4 rounded-3xl overflow-hidden shadow-glass-lg">
        {/* Glass background - más visible en modo claro */}
        <div className="absolute inset-0 bg-white/90 dark:bg-dark-surface/80 backdrop-blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-secondary/8 to-accent/8 dark:from-primary/5 dark:via-secondary/5 dark:to-accent/5"></div>
        <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-3xl"></div>
        <div className="absolute inset-0 shadow-inner"></div>

        <div className="relative flex items-center justify-around h-20 px-4">
          <BottomNavLink
            to="/"
            icon={Home}
            active={isActive('/')}
          />
          <BottomNavLink
            to="/search"
            icon={Search}
            active={isActive('/search')}
          />
          <BottomNavLink
            to="/messages"
            icon={MessageCircle}
            active={isActive('/messages')}
          />
          <BottomNavLink
            to="/profile"
            icon={User}
            active={isActive('/profile')}
          />
        </div>
      </div>
    </nav>
  );
}

function BottomNavLink({ to, icon, active }) {
  const Icon = icon;

  return (
    <Link
      to={to}
      className={clsx(
        "relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl",
        "transition-all duration-300 group overflow-hidden",
        "active:scale-95"
      )}
    >
      {/* Glass background on active - mejorado para modo claro */}
      {active && (
        <>
          <div className="absolute inset-0 bg-white/60 dark:bg-white/5 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-secondary/8 to-accent/8 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10"></div>
          <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-2xl"></div>
        </>
      )}

      {/* Hover effect mejorado */}
      <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

      <Icon
        className={clsx(
          "w-7 h-7 transition-all duration-300 relative z-10",
          active ? "text-black dark:text-white scale-110 drop-shadow-lg" : "text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white group-hover:scale-110"
        )}
        strokeWidth={active ? 2.5 : 2}
      />

      {/* Indicador activo - punto gradient */}
      {active && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full shadow-glow-sm"></div>
      )}
    </Link>
  );
}
