import PropTypes from 'prop-types';

/**
 * Componente Avatar que muestra la imagen del usuario o sus iniciales
 * @param {string} src - URL de la imagen del avatar
 * @param {string} name - Nombre del usuario (para generar iniciales)
 * @param {string} username - Username (fallback si no hay name)
 * @param {string} size - Tamaño: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Clases adicionales
 */
export default function Avatar({ src, name, username, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-20 h-20 text-3xl',
  };

  const getInitials = () => {
    const displayName = name || username || '?';
    const words = displayName.trim().split(' ');

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const getColorFromName = () => {
    const str = name || username || 'default';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-indigo-500',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || username}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Si falla cargar la imagen, ocultar el elemento y mostrar iniciales
          e.target.style.display = 'none';
          e.target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ${getColorFromName()} ${className}`}
    >
      {getInitials()}
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  username: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};
