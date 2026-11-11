// src/services/imageFilterService.js

/**
 * Servicio para aplicar filtros a imágenes usando Canvas API
 */

// Definición de filtros disponibles con función generadora
export const FILTERS = {
  NORMAL: {
    id: 'normal',
    name: 'Normal',
    icon: '✨',
    cssFilter: 'none',
    getFilter: () => 'none',
  },
  GRAYSCALE: {
    id: 'grayscale',
    name: 'B&W',
    icon: '⚫',
    cssFilter: 'grayscale(100%)',
    getFilter: (intensity = 100) => `grayscale(${intensity}%)`,
  },
  SEPIA: {
    id: 'sepia',
    name: 'Sepia',
    icon: '🟤',
    cssFilter: 'sepia(100%)',
    getFilter: (intensity = 100) => `sepia(${intensity}%)`,
  },
  BRIGHT: {
    id: 'bright',
    name: 'Brillo',
    icon: '☀️',
    cssFilter: 'brightness(130%)',
    getFilter: (intensity = 100) => {
      const value = 100 + (30 * intensity / 100);
      return `brightness(${value}%)`;
    },
  },
  CONTRAST: {
    id: 'contrast',
    name: 'Contraste',
    icon: '🌙',
    cssFilter: 'contrast(130%)',
    getFilter: (intensity = 100) => {
      const value = 100 + (30 * intensity / 100);
      return `contrast(${value}%)`;
    },
  },
  SATURATE: {
    id: 'saturate',
    name: 'Saturado',
    icon: '🎨',
    cssFilter: 'saturate(160%)',
    getFilter: (intensity = 100) => {
      const value = 100 + (60 * intensity / 100);
      return `saturate(${value}%)`;
    },
  },
  COOL: {
    id: 'cool',
    name: 'Frío',
    icon: '❄️',
    cssFilter: 'hue-rotate(-30deg) saturate(120%)',
    getFilter: (intensity = 100) => {
      const hue = -30 * intensity / 100;
      const sat = 100 + (20 * intensity / 100);
      return `hue-rotate(${hue}deg) saturate(${sat}%)`;
    },
  },
  WARM: {
    id: 'warm',
    name: 'Cálido',
    icon: '🔥',
    cssFilter: 'hue-rotate(30deg) saturate(120%)',
    getFilter: (intensity = 100) => {
      const hue = 30 * intensity / 100;
      const sat = 100 + (20 * intensity / 100);
      return `hue-rotate(${hue}deg) saturate(${sat}%)`;
    },
  },
  VINTAGE: {
    id: 'vintage',
    name: 'Vintage',
    icon: '📷',
    cssFilter: 'sepia(50%) contrast(120%) brightness(90%)',
    getFilter: (intensity = 100) => {
      const sepia = 50 * intensity / 100;
      const contrast = 100 + (20 * intensity / 100);
      const brightness = 100 - (10 * intensity / 100);
      return `sepia(${sepia}%) contrast(${contrast}%) brightness(${brightness}%)`;
    },
  },
  FADE: {
    id: 'fade',
    name: 'Desvanecido',
    icon: '🌫️',
    cssFilter: 'brightness(110%) contrast(90%) saturate(80%)',
    getFilter: (intensity = 100) => {
      const brightness = 100 + (10 * intensity / 100);
      const contrast = 100 - (10 * intensity / 100);
      const saturate = 100 - (20 * intensity / 100);
      return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
    },
  },
};

// Array de filtros para iteración
export const FILTER_LIST = Object.values(FILTERS);

/**
 * Aplica un filtro CSS a una imagen y retorna un Blob
 * @param {File|Blob} imageFile - Archivo de imagen original
 * @param {string} filterCss - String de filtro CSS (ej: 'grayscale(100%)')
 * @param {string} filterName - Nombre del filtro (para metadata)
 * @returns {Promise<{blob: Blob, url: string}>} - Blob procesado y URL
 */
export async function applyFilterToImage(imageFile, filterCss = 'none', filterName = 'normal') {
  return new Promise((resolve, reject) => {
    // Si no hay filtro, retornar el archivo original
    if (filterCss === 'none' || filterName === 'normal') {
      const url = URL.createObjectURL(imageFile);
      resolve({ blob: imageFile, url, filterApplied: 'normal' });
      return;
    }

    // Crear imagen temporal
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      try {
        // Crear canvas con dimensiones de la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Aplicar filtro CSS al contexto
        ctx.filter = filterCss;

        // Dibujar imagen con filtro
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convertir canvas a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                filterApplied: filterName,
                originalName: imageFile.name,
                width: img.width,
                height: img.height,
              });
            } else {
              reject(new Error('Error al convertir canvas a blob'));
            }
          },
          imageFile.type || 'image/jpeg',
          0.92 // Calidad (0.92 = alta calidad)
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    // Leer el archivo
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(imageFile);
  });
}

/**
 * Convierte un Blob a File manteniendo metadata
 * @param {Blob} blob - Blob a convertir
 * @param {string} fileName - Nombre del archivo
 * @param {string} filterName - Nombre del filtro aplicado
 * @returns {File} - Archivo con metadata
 */
export function blobToFile(blob, fileName, filterName = 'normal') {
  // Mantener extensión original o usar .jpg por defecto
  const extension = fileName.split('.').pop() || 'jpg';
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

  // Agregar sufijo del filtro si no es normal
  const finalName = filterName !== 'normal'
    ? `${nameWithoutExt}_${filterName}.${extension}`
    : fileName;

  return new File([blob], finalName, {
    type: blob.type || 'image/jpeg',
    lastModified: Date.now(),
  });
}

/**
 * Procesa una imagen con un filtro y retorna un File listo para upload
 * @param {File} imageFile - Archivo de imagen original
 * @param {string} filterId - ID del filtro a aplicar
 * @param {number} intensity - Intensidad del filtro (0-100)
 * @returns {Promise<File>} - Archivo procesado
 */
export async function processImageWithFilter(imageFile, filterId = 'normal', intensity = 100) {
  // Buscar configuración del filtro
  const filter = FILTER_LIST.find(f => f.id === filterId) || FILTERS.NORMAL;

  try {
    // Generar CSS del filtro con intensidad
    const filterCss = filter.getFilter ? filter.getFilter(intensity) : filter.cssFilter;

    // Aplicar filtro
    const { blob, filterApplied } = await applyFilterToImage(
      imageFile,
      filterCss,
      filter.id
    );

    // Convertir a File
    const processedFile = blobToFile(blob, imageFile.name, filterApplied);

    return processedFile;
  } catch (error) {
    console.error('Error procesando imagen con filtro:', error);
    // En caso de error, retornar archivo original
    return imageFile;
  }
}

/**
 * Obtiene el CSS de un filtro con intensidad específica
 * @param {string} filterId - ID del filtro
 * @param {number} intensity - Intensidad (0-100)
 * @returns {string} - String CSS del filtro
 */
export function getFilterWithIntensity(filterId, intensity = 100) {
  const filter = FILTER_LIST.find(f => f.id === filterId) || FILTERS.NORMAL;
  return filter.getFilter ? filter.getFilter(intensity) : filter.cssFilter;
}

/**
 * Procesa múltiples imágenes con sus respectivos filtros
 * @param {Array<{file: File, filterId: string}>} imagesWithFilters - Array de imágenes y filtros
 * @returns {Promise<Array<File>>} - Array de archivos procesados
 */
export async function processMultipleImagesWithFilters(imagesWithFilters) {
  const promises = imagesWithFilters.map(({ file, filterId }) =>
    processImageWithFilter(file, filterId)
  );

  return Promise.all(promises);
}

/**
 * Genera preview URL de una imagen con filtro aplicado (para mostrar en UI)
 * @param {string} imageUrl - URL de la imagen original
 * @param {string} filterCss - Filtro CSS a aplicar
 * @returns {string} - Inline style para aplicar al elemento img
 */
export function getFilterStyle(filterCss) {
  return filterCss !== 'none' ? { filter: filterCss } : {};
}

/**
 * Verifica si un archivo es una imagen
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
export function isImageFile(file) {
  return file && file.type && file.type.startsWith('image/');
}

/**
 * Verifica si un archivo es un video
 * @param {File} file - Archivo a verificar
 * @returns {boolean}
 */
export function isVideoFile(file) {
  return file && file.type && file.type.startsWith('video/');
}
