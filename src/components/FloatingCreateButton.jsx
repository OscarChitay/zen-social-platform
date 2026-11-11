import { Plus } from 'lucide-react';
import PropTypes from 'prop-types';

function FloatingCreateButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 group"
      aria-label="Crear publicación"
    >
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse-slow"></div>

      {/* Main button - responsive size */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl hover:shadow-glow transition-all duration-300 group-hover:scale-110 active:scale-95 flex items-center justify-center">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Icon - responsive size */}
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white relative z-10 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.5} />

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
      </div>

      {/* Tooltip - oculto en móvil */}
      <div className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Crear publicación
        <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 dark:bg-white transform rotate-45 -mt-1"></div>
      </div>
    </button>
  );
}

FloatingCreateButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FloatingCreateButton;
