import { CheckCircle2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Badge de verificación para mostrar junto al nombre de usuario
 * @param {boolean} isVerified - Si el usuario está verificado
 * @param {string} size - Tamaño del badge: 'xs', 'sm', 'md', 'lg'
 * @param {string} className - Clases adicionales
 */
export default function VerifiedBadge({ isVerified, size = 'sm', className = '' }) {
  if (!isVerified) return null;

  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <CheckCircle2
      className={`${sizes[size]} text-blue-500 fill-blue-500 ${className}`}
      strokeWidth={2.5}
    />
  );
}

VerifiedBadge.propTypes = {
  isVerified: PropTypes.bool,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};
