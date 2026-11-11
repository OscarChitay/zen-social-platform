import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Image as ImageIcon, Video, Smile, MapPin, Loader, Scan } from 'lucide-react';
import { createPostsService } from "../services/postService";
import { analyzeFaceFromBackend } from '../services/faceDetectionBackendService';
import FaceAnalysisDisplay from './FaceAnalysisDisplay';
import ImageFilterSelector from './ImageFilterSelector';
import ImagePreviewWithComparison from './ImagePreviewWithComparison';
import { processImageWithFilter, isImageFile, getFilterWithIntensity } from '../services/imageFilterService';

function CreatePostModal({ isOpen, onClose, onPost }) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [faceAnalyses, setFaceAnalyses] = useState({});
  const [analyzingImages, setAnalyzingImages] = useState({});
  const [enableFaceDetection, setEnableFaceDetection] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({}); // { imageIndex: 'filterId' }
  const [filterIntensities, setFilterIntensities] = useState({}); // { imageIndex: intensity }
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validar tipos de archivo
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length === 0) {
      alert('Por favor selecciona solo imágenes o videos');
      return;
    }

    // Crear previews
    const newPreviews = [];
    const newFiles = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {

        newPreviews.push({
          url: reader.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        });
        newFiles.push(file);

        // Cuando se hayan cargado todos los archivos
        if (newPreviews.length === validFiles.length) {
          setMediaPreviews(prev => [...prev, ...newPreviews]);
          setMediaFiles(prev => [...prev, ...newFiles]);

          // Analizar rostros en imágenes si está habilitado
          if (enableFaceDetection) {
            newFiles.forEach(async (f, idx) => {
              if (f.type.startsWith('image/')) {
                const index = mediaPreviews.length + idx;
                setAnalyzingImages(prev => ({ ...prev, [index]: true }));

                try {
                  const result = await analyzeFaceFromBackend(f);
                  if (result) {
                    setFaceAnalyses(prev => ({ ...prev, [index]: result }));
                  }
                } catch (error) {
                  console.warn('Face detection not available:', error);
                } finally {
                  setAnalyzingImages(prev => ({ ...prev, [index]: false }));
                }
              }
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (index) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));

    // IMPORTANTE: Limpiar análisis facial asociado
    setFaceAnalyses(prev => {
      const newAnalyses = { ...prev };
      delete newAnalyses[index];

      // Reindexar análisis para índices superiores
      const reindexed = {};
      Object.keys(newAnalyses).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newAnalyses[key];
        } else {
          reindexed[key] = newAnalyses[key];
        }
      });

      return reindexed;
    });

    setAnalyzingImages(prev => {
      const newAnalyzing = { ...prev };
      delete newAnalyzing[index];

      // Reindexar estado de análisis
      const reindexed = {};
      Object.keys(newAnalyzing).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newAnalyzing[key];
        } else {
          reindexed[key] = newAnalyzing[key];
        }
      });

      return reindexed;
    });
    // Limpiar filtro de esta imagen
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[index];
      // Reindexar los filtros restantes
      const reindexed = {};
      Object.keys(newFilters).forEach(key => {
        const oldIndex = parseInt(key);
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        reindexed[newIndex] = newFilters[key];
      });
      return reindexed;
    });
    // Limpiar intensidad
    setFilterIntensities(prev => {
      const newIntensities = { ...prev };
      delete newIntensities[index];
      const reindexed = {};
      Object.keys(newIntensities).forEach(key => {
        const oldIndex = parseInt(key);
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        reindexed[newIndex] = newIntensities[key];
      });
      return reindexed;
    });
    // Limpiar análisis facial
    setFaceAnalyses(prev => {
      const newAnalyses = { ...prev };
      delete newAnalyses[index];
      const reindexed = {};
      Object.keys(newAnalyses).forEach(key => {
        const oldIndex = parseInt(key);
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        reindexed[newIndex] = newAnalyses[key];
      });
      return reindexed;
    });
  };

  const handleFilterChange = (imageIndex, filterId) => {
    setSelectedFilters(prev => ({
      ...prev,
      [imageIndex]: filterId
    }));
  };

  const handleIntensityChange = (imageIndex, intensity) => {
    setFilterIntensities(prev => ({
      ...prev,
      [imageIndex]: intensity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mediaFiles.length === 0) {
      alert('Por favor selecciona al menos una imagen o video');
      return;
    }

    setIsLoading(true);
    try {
      // Procesar archivos con filtros antes de enviar
      const processedFiles = await Promise.all(
        mediaFiles.map(async (file, index) => {
          // Solo aplicar filtros a imágenes
          if (isImageFile(file)) {
            const filterId = selectedFilters[index] || 'normal';
            const intensity = filterIntensities[index] || 100;

            // Si el filtro es 'normal', retornar archivo original
            if (filterId === 'normal') {
              return file;
            }
            // Aplicar filtro con intensidad
            return await processImageWithFilter(file, filterId, intensity);
          }
          // Videos se envían sin procesar
          return file;
        })
      );

      // Llamada real al backend con archivos procesados
      const created = await createPostsService({
        caption,
        location,
        files: processedFiles,
      });

      // Notifica al padre con los posts creados (array)
      onPost(created);

      // Reset
      setCaption('');
      setLocation('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setSelectedFilters({});
      setFilterIntensities({});
      setFaceAnalyses({});
      setAnalyzingImages({});
      onClose();
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      alert(error.message || 'Hubo un error al crear la publicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCaption('');
      setLocation('');
      setMediaFiles([]);
      setMediaPreviews([]);
      setSelectedFilters({});
      setFilterIntensities({});
      setFaceAnalyses({});
      setAnalyzingImages({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal - responsive con altura máxima optimizada para móvil */}
      <div className="relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
        {/* Glassmorphism container */}
        <div className="absolute inset-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-none sm:rounded-2xl md:rounded-3xl"></div>
        <div className="absolute inset-0 border-0 sm:border sm:border-gray-200/60 sm:dark:border-white/10 rounded-none sm:rounded-2xl md:rounded-3xl"></div>
        <div className="absolute inset-0 shadow-none sm:shadow-2xl rounded-none sm:rounded-2xl md:rounded-3xl"></div>

        <div className="relative flex flex-col h-full sm:max-h-[90vh]">
          {/* Header - más compacto en móvil */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Crear publicación
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-all active:scale-90 disabled:opacity-50"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content - responsive con padding extra al final para móvil */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 pb-32 lg:pb-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Face Detection Toggle */}
              {mediaPreviews.length > 0 && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                        Detección Facial
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Analiza rostros en las imágenes
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableFaceDetection(!enableFaceDetection)}
                    className={`relative w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-colors ${
                      enableFaceDetection
                        ? 'bg-gradient-to-r from-primary to-secondary'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform ${
                        enableFaceDetection ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Media Preview - responsive grid */}
              {mediaPreviews.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Grid de previews */}
                  <div className="grid grid-cols-1 gap-4 sm:gap-5">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="space-y-3 sm:space-y-4">
                        {/* Preview de imagen/video */}
                        <div className="relative group">
                          {preview.type === 'image' ? (
                            <ImagePreviewWithComparison
                              imageUrl={preview.url}
                              filterCss={getFilterWithIntensity(
                                selectedFilters[index] || 'normal',
                                filterIntensities[index] || 100
                              )}
                              hasFilter={selectedFilters[index] && selectedFilters[index] !== 'normal'}
                            />
                          ) : (
                            <div className="aspect-square max-h-96 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg">
                              <video
                                src={preview.url}
                                controls
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}

                          {/* Botón eliminar */}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(index)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Badge de tipo */}
                          {preview.type === 'video' && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg">
                              Video
                            </div>
                          )}

                          {/* Face Detection Badge */}
                          {preview.type === 'image' && analyzingImages[index] && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs rounded-lg flex items-center gap-1 z-10">
                              <Loader className="w-3 h-3 animate-spin" />
                              Analizando...
                            </div>
                          )}

                          {/* Face Analysis Result Badge */}
                          {preview.type === 'image' && faceAnalyses[index] && !analyzingImages[index] && (
                            <div className="absolute top-2 left-2 z-10">
                              <FaceAnalysisDisplay
                                analysis={faceAnalyses[index]}
                                compact={true}
                              />
                            </div>
                          )}
                        </div>

                        {/* Selector de filtros solo para imágenes */}
                        {preview.type === 'image' && (
                          <ImageFilterSelector
                            imageUrl={preview.url}
                            selectedFilter={selectedFilters[index] || 'normal'}
                            onFilterChange={(filterId) => handleFilterChange(index, filterId)}
                            intensity={filterIntensities[index] || 100}
                            onIntensityChange={(intensity) => handleIntensityChange(index, intensity)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Face Analysis Details */}
                  {Object.keys(faceAnalyses).length > 0 && (
                    <div className="space-y-2">
                      {mediaPreviews.map((preview, index) => (
                        preview.type === 'image' && faceAnalyses[index] && (
                          <div key={index} className="p-3 sm:p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-200 dark:border-dark-border">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                              {preview.name}
                            </p>
                            <FaceAnalysisDisplay
                              analysis={faceAnalyses[index]}
                              compact={false}
                            />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button - responsive */}
              <div className="space-y-3 sm:space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full p-6 sm:p-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl sm:rounded-2xl hover:border-primary dark:hover:border-primary transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="flex gap-3 sm:gap-4">
                      <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">
                      Seleccionar fotos o videos
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Puedes seleccionar múltiples archivos
                    </p>
                  </div>
                </button>
              </div>

              {/* Caption - textarea más táctil en móvil */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escribe una descripción..."
                    disabled={isLoading}
                    className="w-full p-3 sm:p-4 pr-10 sm:pr-12 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none disabled:opacity-50 min-h-[100px] sm:min-h-[120px]"
                    rows="4"
                    maxLength="2200"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-90"
                    disabled={isLoading}
                  >
                    <Smile className="w-5 h-5 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-right">
                  {caption.length}/2200 caracteres
                </p>
              </div>

              {/* Location - input más táctil */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Añadir ubicación"
                    disabled={isLoading}
                    className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Footer - botón más grande en móvil */}
            <div className="p-4 sm:p-5 md:p-6 border-t border-gray-200 dark:border-dark-border flex-shrink-0">
              <button
                type="submit"
                disabled={isLoading || mediaFiles.length === 0}
                className="w-full py-3.5 sm:py-3 px-6 text-base sm:text-base font-bold bg-gradient-to-br from-primary to-secondary text-white rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

CreatePostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPost: PropTypes.func.isRequired,
};

export default CreatePostModal;
