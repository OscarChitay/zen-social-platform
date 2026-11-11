// src/components/ImageFilterSelector.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FILTER_LIST, getFilterWithIntensity } from '../services/imageFilterService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente para seleccionar filtros de imagen
 * Muestra previews horizontales de todos los filtros disponibles
 */
function ImageFilterSelector({
  imageUrl,
  selectedFilter,
  onFilterChange,
  intensity = 100,
  onIntensityChange,
  className = ''
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  // Verificar si puede hacer scroll
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [imageUrl]);

  // Scroll horizontal
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Título */}
      <div className="mb-3 sm:mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Filtros
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Selecciona un filtro para tu imagen
          </p>
        </div>
      </div>

      {/* Control de Intensidad */}
      {selectedFilter !== 'normal' && (
        <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900 rounded-xl border border-gray-300 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-lg">🎚️</span>
              Intensidad del filtro
            </label>
            <span className="px-3 py-1 bg-white dark:bg-dark-surface rounded-lg text-sm font-bold text-primary border border-primary/20">
              {intensity}%
            </span>
          </div>

          {/* Slider mejorado */}
          <div className="relative px-1">
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange?.(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-dark-bg"
              style={{
                background: `linear-gradient(to right,
                  #8b5cf6 0%,
                  #d946ef ${intensity}%,
                  #e5e7eb ${intensity}%,
                  #e5e7eb 100%)`
              }}
            />
            {/* Marcadores de intensidad */}
            <div className="flex justify-between mt-2 px-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">0%</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">25%</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">50%</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">75%</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">100%</span>
            </div>
          </div>

          {/* Labels descriptivos */}
          <div className="flex justify-between mt-3 px-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              ← Suave
            </span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Intenso →
            </span>
          </div>
        </div>
      )}

      {/* Container de filtros con scroll */}
      <div className="relative group">
        {/* Botón scroll izquierda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-dark-surface shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Grid de filtros scrolleable */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {FILTER_LIST.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            // Usar intensidad solo para el filtro seleccionado, 100% para los demás
            const filterCss = isSelected && intensity !== 100
              ? getFilterWithIntensity(filter.id, intensity)
              : (filter.getFilter ? filter.getFilter(100) : filter.cssFilter);
            const filterStyle = { filter: filterCss !== 'none' ? filterCss : undefined };

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={`flex-shrink-0 w-20 sm:w-24 focus:outline-none group/filter transition-transform hover:scale-105 ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                {/* Preview de la imagen con filtro */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden mb-2 transition-all ${
                    isSelected
                      ? 'ring-3 sm:ring-4 ring-primary shadow-lg shadow-primary/30'
                      : 'ring-2 ring-gray-200 dark:ring-gray-700 group-hover/filter:ring-gray-300 dark:group-hover/filter:ring-gray-600'
                  }`}
                >
                  {/* Imagen con filtro aplicado */}
                  <img
                    src={imageUrl}
                    alt={`Filtro ${filter.name}`}
                    className="w-full h-full object-cover"
                    style={filterStyle}
                  />

                  {/* Overlay al seleccionar */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                  )}

                  {/* Checkmark cuando está seleccionado */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Nombre del filtro */}
                <div className="text-center">
                  <p
                    className={`text-xs sm:text-sm font-medium transition-colors ${
                      isSelected
                        ? 'text-primary font-semibold'
                        : 'text-gray-700 dark:text-gray-300 group-hover/filter:text-gray-900 dark:group-hover/filter:text-white'
                    }`}
                  >
                    <span className="mr-1">{filter.icon}</span>
                    {filter.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Botón scroll derecha */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-dark-surface shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Gradientes para indicar más contenido */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-dark-surface to-transparent pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-dark-surface to-transparent pointer-events-none" />
        )}
      </div>

      {/* CSS para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

ImageFilterSelector.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  selectedFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  intensity: PropTypes.number,
  onIntensityChange: PropTypes.func,
  className: PropTypes.string,
};

export default ImageFilterSelector;
