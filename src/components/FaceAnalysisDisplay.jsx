import PropTypes from 'prop-types';
import { Users, TrendingUp, User, Smile, X } from 'lucide-react';

/**
 * Componente para mostrar análisis facial del backend
 */
function FaceAnalysisDisplay({ analysis, compact = false, onClose }) {
  if (!analysis?.analysis?.hasFaces) {
    return compact ? null : (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
          No se detectaron rostros en esta imagen
        </p>
      </div>
    );
  }

  const { faceCount, faces } = analysis.analysis;

  const stats = {
    faceCount,
    averageAge: 0,
    maleCount: 0,
    femaleCount: 0,
    emotions: {},
  };

  // Calcular estadísticas
  const ages = faces.map(f => f.age);
  stats.averageAge = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);

  faces.forEach(face => {
    if (face.gender === 'male') stats.maleCount++;
    if (face.gender === 'female') stats.femaleCount++;

    const emotion = face.expressions.dominant.expression;
    stats.emotions[emotion] = (stats.emotions[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.keys(stats.emotions).length > 0
    ? Object.entries(stats.emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null;

  const emotionLabels = {
    neutral: '😐 Neutral',
    happy: '😊 Feliz',
    sad: '😢 Triste',
    angry: '😠 Enojado',
    fearful: '😨 Asustado',
    disgusted: '🤢 Disgustado',
    surprised: '😲 Sorprendido',
  };

  // Vista compacta (badge)
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span className="font-medium">{faceCount}</span>
        </div>
        {stats.averageAge > 0 && (
          <span className="text-gray-300">{stats.averageAge} años</span>
        )}
        {dominantEmotion && (
          <span>{emotionLabels[dominantEmotion]}</span>
        )}
      </div>
    );
  }

  // Vista completa
  return (
    <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-xl p-4 border border-gray-200/60 dark:border-white/10 shadow-xl max-h-96 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <Users className="w-5 h-5 text-primary" />
          Análisis Facial
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Resumen general */}
      <div className="space-y-3 mb-4">
        {/* Rostros detectados */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rostros detectados
            </span>
          </div>
          <span className="text-lg font-bold text-primary">{faceCount}</span>
        </div>

        {/* Edad promedio */}
        {stats.averageAge > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Edad promedio
              </span>
            </div>
            <span className="text-lg font-bold text-secondary">{stats.averageAge} años</span>
          </div>
        )}

        {/* Distribución de género */}
        {(stats.maleCount > 0 || stats.femaleCount > 0) && (
          <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Género
              </span>
            </div>
            <div className="flex gap-4">
              {stats.maleCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.maleCount}</span>
                </div>
              )}
              {stats.femaleCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👩</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.femaleCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emoción dominante */}
        {dominantEmotion && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Emoción dominante
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {emotionLabels[dominantEmotion]}
            </span>
          </div>
        )}
      </div>

      {/* Detalles por rostro */}
      <div className="border-t border-gray-200 dark:border-dark-border pt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Detalles por Rostro
        </h4>
        <div className="space-y-3">
          {faces.map((face, index) => (
            <div
              key={face.id}
              className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                  Rostro {index + 1}
                </h5>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                  ID: {face.id}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Edad y género */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Edad:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {face.age} años
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Género:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {face.gender === 'male' ? 'Hombre' : 'Mujer'} ({face.genderConfidence}%)
                  </span>
                </div>

                {/* Expresión dominante */}
                <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expresión:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {emotionLabels[face.expressions.dominant.expression].split(' ')[0]}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {face.expressions.dominant.probability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Landmarks info */}
                {face.landmarks && (
                  <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
                    <span className="text-gray-600 dark:text-gray-400">
                      {face.landmarks.total} puntos faciales detectados
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Análisis realizado con face-api.js en el backend
        </p>
        {analysis.cached && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            ⚡ Resultado en caché desde {new Date(analysis.analyzedAt).toLocaleString('es-ES')}
          </p>
        )}
      </div>
    </div>
  );
}

FaceAnalysisDisplay.propTypes = {
  analysis: PropTypes.shape({
    success: PropTypes.bool,
    analysis: PropTypes.shape({
      hasFaces: PropTypes.bool,
      faceCount: PropTypes.number,
      faces: PropTypes.arrayOf(PropTypes.object),
    }),
    cached: PropTypes.bool,
    analyzedAt: PropTypes.string,
  }),
  compact: PropTypes.bool,
  onClose: PropTypes.func,
};

export default FaceAnalysisDisplay;
