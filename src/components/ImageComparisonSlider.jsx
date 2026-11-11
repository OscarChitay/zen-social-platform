// src/components/ImageComparisonSlider.jsx
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getFilterStyle } from '../services/imageFilterService';

/**
 * Componente de comparación antes/después con slider interactivo
 * Muestra imagen original vs imagen con filtro aplicado
 */
function ImageComparisonSlider({ imageUrl, filterCss, filterName, className = '' }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Manejar movimiento del slider
  const handleMove = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    setSliderPosition(percentage);
  };

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const filterStyle = getFilterStyle(filterCss);
  const isNormalFilter = filterCss === 'none' || filterName === 'normal';

  return (
    <div className={`relative ${className}`}>
      {/* Container de comparación */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg cursor-ew-resize select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Imagen CON filtro (fondo completo) */}
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Con filtro"
            className="w-full h-full object-cover"
            style={filterStyle}
            draggable={false}
          />
          {/* Label "Con filtro" */}
          {!isNormalFilter && (
            <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
              Con filtro
            </div>
          )}
        </div>

        {/* Imagen SIN filtro (clippeada) */}
        <div
          className="absolute inset-0 overflow-hidden transition-all duration-100"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={imageUrl}
            alt="Original"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Label "Original" */}
          {!isNormalFilter && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
              Original
            </div>
          )}
        </div>

        {/* Línea divisoria del slider */}
        {!isNormalFilter && (
          <>
            {/* Línea vertical */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transition-all duration-100"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Handle del slider */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-ew-resize group hover:scale-110 transition-transform">
                {/* Iconos de flechas */}
                <div className="flex items-center gap-0.5">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <svg
                    className="w-4 h-4 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Ring animado al hacer hover/drag */}
                <div
                  className={`absolute inset-0 rounded-full border-2 border-primary transition-opacity ${
                    isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </div>

            {/* Sombras en los bordes para mejor contraste */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
          </>
        )}

        {/* Mensaje si es filtro normal */}
        {isNormalFilter && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <div className="px-4 py-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium">
              Sin filtro aplicado
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      {!isNormalFilter && (
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
          Arrastra el slider para comparar
        </p>
      )}
    </div>
  );
}

ImageComparisonSlider.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  filterCss: PropTypes.string.isRequired,
  filterName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ImageComparisonSlider;
