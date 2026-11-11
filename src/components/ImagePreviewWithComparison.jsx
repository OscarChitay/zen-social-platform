// src/components/ImagePreviewWithComparison.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Componente de preview de imagen con comparación integrada
 * Permite ver antes/después sin abrir modal adicional
 */
function ImagePreviewWithComparison({
  imageUrl,
  filterCss,
  hasFilter = false,
  className = ''
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Imagen con o sin filtro */}
      <div className="aspect-square max-h-96 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-contain transition-all duration-300"
          style={showOriginal || !hasFilter ? {} : { filter: filterCss }}
        />
      </div>

      {/* Botón de comparación (solo si hay filtro) */}
      {hasFilter && (
        <button
          type="button"
          onMouseDown={() => setShowOriginal(true)}
          onMouseUp={() => setShowOriginal(false)}
          onMouseLeave={() => setShowOriginal(false)}
          onTouchStart={() => setShowOriginal(true)}
          onTouchEnd={() => setShowOriginal(false)}
          className="absolute bottom-3 right-3 px-4 py-2.5 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-dark-border flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
        >
          {showOriginal ? (
            <>
              <EyeOff className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                Con filtro
              </span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                Mantén presionado
              </span>
            </>
          )}
        </button>
      )}

      {/* Indicador de estado */}
      {hasFilter && (
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${showOriginal ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
          {showOriginal ? 'Original' : 'Con filtro'}
        </div>
      )}

      {/* Instrucciones para mobile */}
      {hasFilter && !showOriginal && (
        <div className="absolute bottom-16 right-3 px-3 py-2 bg-primary/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg animate-bounce sm:hidden">
          👆 Toca para comparar
        </div>
      )}
    </div>
  );
}

ImagePreviewWithComparison.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  filterCss: PropTypes.string.isRequired,
  hasFilter: PropTypes.bool,
  className: PropTypes.string,
};

export default ImagePreviewWithComparison;
