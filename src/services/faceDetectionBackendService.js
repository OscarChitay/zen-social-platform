/**
 * Servicio para comunicarse con el backend de detección facial
 * Backend API: http://localhost:4000/api/face-detection
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Flag para evitar múltiples logs de servicio no disponible
let serviceUnavailableLogged = false;

/**
 * Verifica si el servicio de detección facial está disponible
 * @returns {Promise<boolean>} true si está disponible, false si no
 */
export async function isFaceDetectionAvailable() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/face-detection/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Analiza una imagen enviándola al backend
 * @param {File} imageFile - Archivo de imagen a analizar
 * @returns {Promise<Object|null>} Análisis facial desde el backend o null si no está disponible
 */
export async function analyzeFaceFromBackend(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/face-detection/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    // Si el endpoint no existe (404), retornar null silenciosamente
    if (response.status === 404) {
      if (!serviceUnavailableLogged) {
        console.info('💡 Face detection API not available. This feature requires backend implementation.');
        serviceUnavailableLogged = true;
      }
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Face detection error:', errorData.error || response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (!serviceUnavailableLogged) {
      console.info('💡 Face detection service unavailable:', error.message);
      serviceUnavailableLogged = true;
    }
    return null;
  }
}

/**
 * Analiza la imagen de un post existente por su ID
 * Genera nuevo análisis y lo cachea en la BD
 * @param {number} postId - ID del post a analizar
 * @returns {Promise<Object>} Análisis facial desde el backend
 */
export async function analyzeFaceFromPost(postId) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/face-detection/analyze/${postId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Si el endpoint no existe (404), retornar null silenciosamente
    if (response.status === 404) {
      console.warn('Post no encontrado o sin imagen');
      return null;
    }

    // Si es error 500, puede ser por URL legacy o imagen en S3
    if (response.status === 500) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Error al analizar (puede ser imagen legacy):', errorData.error);
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Face detection error:', errorData.error || response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Face detection service unavailable:', error.message);
    return null;
  }
}

/**
 * Obtiene el análisis cacheado de un post (sin generar nuevo análisis)
 * @param {number} postId - ID del post
 * @returns {Promise<Object|null>} Análisis cacheado o null si no existe
 */
export async function getCachedAnalysis(postId) {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/face-detection/analyze/${postId}/cached`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Si el endpoint no existe o no hay cache, retornar null silenciosamente
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch {
    // Silenciar errores de red o endpoint no disponible
    return null;
  }
}

/**
 * Analiza múltiples imágenes en lote
 * @param {File[]} imageFiles - Array de archivos de imagen
 * @returns {Promise<Array>} Array de análisis faciales
 */
export async function analyzeBatchFaces(imageFiles) {
  try {
    const promises = imageFiles.map(file => analyzeFaceFromBackend(file));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error analyzing batch faces:', error);
    throw error;
  }
}

/**
 * Helper: Obtiene la expresión dominante en formato amigable
 * @param {Object} analysis - Análisis completo
 * @returns {Array} Array de expresiones dominantes por rostro
 */
export function getDominantExpressions(analysis) {
  if (!analysis?.analysis?.hasFaces) return [];

  const expressionEmojis = {
    neutral: '😐',
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲',
  };

  const expressionLabels = {
    neutral: 'Neutral',
    happy: 'Feliz',
    sad: 'Triste',
    angry: 'Enojado',
    fearful: 'Asustado',
    disgusted: 'Disgustado',
    surprised: 'Sorprendido',
  };

  return analysis.analysis.faces.map((face) => ({
    id: face.id,
    emoji: expressionEmojis[face.expressions.dominant.expression],
    label: expressionLabels[face.expressions.dominant.expression],
    expression: face.expressions.dominant.expression,
    probability: face.expressions.dominant.probability,
    age: face.age,
    gender: face.gender === 'male' ? 'Hombre' : 'Mujer',
    genderConfidence: face.genderConfidence,
  }));
}

/**
 * Helper: Obtiene estadísticas generales del análisis
 * @param {Object} analysis - Análisis completo
 * @returns {Object} Estadísticas resumidas
 */
export function getAnalysisStats(analysis) {
  if (!analysis?.analysis?.hasFaces) {
    return {
      hasFaces: false,
      faceCount: 0,
      averageAge: 0,
      maleCount: 0,
      femaleCount: 0,
      dominantEmotion: null,
    };
  }

  const faces = analysis.analysis.faces;
  const ages = faces.map(f => f.age);
  const averageAge = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);

  const maleCount = faces.filter(f => f.gender === 'male').length;
  const femaleCount = faces.filter(f => f.gender === 'female').length;

  // Contar emociones
  const emotions = {};
  faces.forEach(face => {
    const emotion = face.expressions.dominant.expression;
    emotions[emotion] = (emotions[emotion] || 0) + 1;
  });

  const dominantEmotion = Object.keys(emotions).length > 0
    ? Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null;

  return {
    hasFaces: true,
    faceCount: faces.length,
    averageAge,
    maleCount,
    femaleCount,
    dominantEmotion,
    emotions,
  };
}

export default {
  analyzeFaceFromBackend,
  analyzeFaceFromPost,
  getCachedAnalysis,
  analyzeBatchFaces,
  getDominantExpressions,
  getAnalysisStats,
};
