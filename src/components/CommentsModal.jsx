import { useState, useEffect } from 'react';
import { X, Smile, Trash2, Loader, MessageCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { fetchComments, createComment, deleteComment } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';

function CommentsModal({ post, isOpen, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && post?.id) {
      loadCommentsData();
    } else {
      // Limpiar al cerrar
      setComments([]);
      setComment('');
    }
  }, [isOpen, post?.id]);

  const loadCommentsData = async () => {
    setLoadingComments(true);
    try {
      const data = await fetchComments(post.id);
      setComments(data.items || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        console.warn('Backend no disponible. Los comentarios no se cargarán.');
      }
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      const newComment = await createComment(post.id, comment.trim());

      if (!newComment || !newComment.id) {
        throw new Error('Respuesta inválida del servidor');
      }

      const formattedComment = {
        id: newComment.id,
        text: newComment.text || comment.trim(),
        createdAt: newComment.createdAt || new Date().toISOString(),
        user: newComment.user || {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      };

      setComments([...comments, formattedComment]);
      setComment('');
    } catch (error) {
      console.error('Error creating comment:', error);

      if (error.message.includes('No autorizado')) {
        alert('Debes iniciar sesión para comentar');
      } else if (error.message.includes('fetch')) {
        alert('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        alert(`Error al enviar comentario: ${error.message}`);
      }
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Eliminar comentario?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
    }
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // No modificar body overflow porque PostModal ya lo maneja
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content con altura ajustada para la barra inferior */}
      <div className="relative w-full h-[calc(85vh-8rem)] sm:h-auto sm:max-w-lg sm:max-h-[80vh] bg-white dark:bg-dark-surface rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col mb-28 sm:mb-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
          {/* Línea indicadora para deslizar (solo móvil) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full sm:hidden"></div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Comentarios
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors active:scale-90"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Comentarios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
          {loadingComments && (
            <div className="text-center py-8">
              <Loader className="inline-block animate-spin w-6 h-6 text-primary" />
              <p className="text-sm text-gray-500 mt-2">Cargando comentarios...</p>
            </div>
          )}

          {!loadingComments && comments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm">Sé el primero en comentar</p>
            </div>
          )}

          {comments.map((commentItem) => (
            <div key={commentItem.id} className="flex gap-3">
              <Avatar
                src={commentItem.user.avatar}
                name={commentItem.user.name}
                username={commentItem.user.username}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {commentItem.user.username}
                      </span>
                      <VerifiedBadge isVerified={commentItem.user?.isVerified} size="xs" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 break-words">
                      {commentItem.text}
                    </p>
                  </div>
                  {user?.id === commentItem.user.id && (
                    <button
                      onClick={() => handleDeleteComment(commentItem.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex-shrink-0 active:scale-90"
                      title="Eliminar comentario"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(commentItem.createdAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input de comentario */}
        <form
          onSubmit={handleComment}
          className="p-3 border-t border-gray-200 dark:border-dark-border flex-shrink-0 bg-white dark:bg-dark-surface"
        >
          <div className="flex items-center gap-2">
            <Avatar
              src={user?.avatar}
              name={user?.name}
              username={user?.username}
              size="sm"
              className="flex-shrink-0"
            />
            <div className="flex-1 flex items-center gap-1 bg-gray-100 dark:bg-dark-bg rounded-full px-3 py-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Añade un comentario..."
                disabled={sendingComment}
                className="flex-1 bg-transparent border-0 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 min-w-0"
                style={{ fontSize: '16px' }} // Prevenir zoom en iOS
              />
              <button
                type="button"
                className="p-1 hover:opacity-70 transition-opacity active:scale-90 flex-shrink-0"
                disabled={sendingComment}
              >
                <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!comment.trim() || sendingComment}
              className="px-3 py-2 bg-gradient-to-br from-primary to-secondary text-white rounded-full font-semibold text-sm hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sendingComment ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Enviar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CommentsModal.propTypes = {
  post: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CommentsModal;
