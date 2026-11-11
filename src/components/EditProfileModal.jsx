import { useState, useEffect } from 'react';
import { X, Camera, Loader, CheckCircle2, LogOut } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

function EditProfileModal({ profile, isOpen, onClose, onSave }) {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    avatar: '',
    isVerified: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        website: profile.website || '',
        avatar: profile.avatar || '',
        isVerified: profile.isVerified || false
      });
      setPreviewImage(profile.avatar);
    }
  }, [profile]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implementar guardado real con backend
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-dark-surface rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex flex-col">
        {/* Header - responsive */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Editar perfil
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Form - responsive con overflow y padding extra al final para móvil */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-32 lg:pb-6">
          {/* Avatar - responsive */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="relative group">
              <img
                src={previewImage || 'https://via.placeholder.com/150'}
                alt="Avatar preview"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-200 dark:ring-dark-border"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Haz clic para cambiar la foto</p>
          </div>

          {/* Name - responsive */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="Tu nombre"
            />
          </div>

          {/* Username - responsive */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="tunombredeusuario"
            />
          </div>

          {/* Bio - responsive */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Biografía
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length} / 150
            </p>
          </div>

          {/* Website - responsive */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Sitio web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="https://tusitio.com"
            />
          </div>

          {/* Verificación - Toggle Switch */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    Cuenta verificada
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activa el símbolo de verificación
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isVerified: !prev.isVerified }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  formData.isVerified ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isVerified ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Cerrar Sesión */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                  logout();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-semibold text-red-600 dark:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-xl font-semibold text-gray-900 dark:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-br from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProfileModal.propTypes = {
  profile: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default EditProfileModal;
