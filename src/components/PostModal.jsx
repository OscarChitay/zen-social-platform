import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, Trash2, Scan, Loader } from 'lucide-react';
import PropTypes from 'prop-types';
import { likePost, unlikePost, savePost, unsavePost, fetchComments, createComment, deleteComment } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { getCachedAnalysis, analyzeFaceFromPost } from '../services/faceDetectionBackendService';
import FaceAnalysisDisplay from './FaceAnalysisDisplay';
import CommentsModal from './CommentsModal';


function PostModal({ post, onClose, isOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post?.userHasLiked || post?.isLiked || false);
  const [isSaved, setIsSaved] = useState(post?.userHasSaved || post?.isSaved || false);
  const [comment, setComment] = useState('');
  const [likes, setLikes] = useState(post?.likesCount || post?.likes || 0);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount || post?.comments || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [faceAnalysis, setFaceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Sincronizar estados cuando cambia el post
  useEffect(() => {
    if (post) {
      setIsLiked(post.userHasLiked || post.isLiked || false);
      setIsSaved(post.userHasSaved || post.isSaved || false);
      setLikes(post.likesCount || post.likes || 0);
      setCommentsCount(post.commentsCount || post.comments || 0);
    }
  }, [post]);

  // Cargar comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && post?.id) {
      loadComments();
      loadCachedFaceAnalysis();
    } else {
      // IMPORTANTE: Limpiar análisis cuando se cierra el modal
      setFaceAnalysis(null);
      setShowAnalysis(false);
    }
  }, [isOpen, post?.id]);

  // NUEVO: Limpiar análisis cuando cambia el post
  useEffect(() => {
    setFaceAnalysis(null);
    setShowAnalysis(false);
  }, [post?.id]);

  const loadCachedFaceAnalysis = async () => {
    try {
      const analysis = await getCachedAnalysis(post.id);
      if (analysis) {
        setFaceAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading cached analysis:', error);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await fetchComments(post.id);
      setComments(data.items || []);
      setCommentsCount(data.total || data.items?.length || 0);
    } catch (error) {
      console.error('Error loading comments:', error);

      // Si el backend no está disponible, no mostrar error al usuario
      // Solo registrar en consola
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        console.warn('Backend no disponible. Los comentarios no se cargarán.');
      }

      // Mantener comentarios vacíos en caso de error
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Cerrar modal con tecla ESC
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

  if (!isOpen || !post) return null;

  const handleLike = async () => {
    const previousLikes = likes;
    const previousLiked = isLiked;

    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      if (!isLiked) {
        const newCount = await likePost(post.id);
        setLikes(newCount);
      } else {
        const newCount = await unlikePost(post.id);
        setLikes(newCount);
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      if (!isSaved) {
        await savePost(post.id);
      } else {
        await unsavePost(post.id);
      }
    } catch (error) {
      setIsSaved(previousSaved);
      console.error('Error toggling save:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      const newComment = await createComment(post.id, comment.trim());

      // Verificar que el comentario tenga la estructura correcta
      if (!newComment || !newComment.id) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Asegurar que el comentario tenga toda la info necesaria
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
      setCommentsCount(commentsCount + 1);
      setComment('');
    } catch (error) {
      console.error('Error creating comment:', error);

      // Mostrar mensaje más específico
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
      setCommentsCount(Math.max(0, commentsCount - 1));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
    }
  };

  const handleAnalyzeFace = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFaceFromPost(post.id);
      if (analysis && analysis.success) {
        setFaceAnalysis(analysis);
        setShowAnalysis(true);

        // Si no hay rostros, informar al usuario
        if (!analysis.analysis.hasFaces) {
          alert('No se detectaron rostros en esta imagen.');
        }
      } else {
        alert('No se pudo analizar esta imagen. Puede ser una imagen antigua o en formato no compatible.');
      }
    } catch (error) {
      console.error('Error analyzing face:', error);
      alert('Error al analizar rostros. Por favor, intenta más tarde.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUserClick = () => {
    if (post.user?.username) {
      onClose(); // Cerrar el modal primero
      navigate(`/profile/${post.user.username}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content - responsive con altura ajustada para móvil */}
      <div className="relative w-full h-[calc(100vh-8rem)] sm:h-auto sm:max-w-5xl lg:max-w-6xl sm:max-h-[92vh] flex flex-col sm:flex-row bg-white dark:bg-dark-surface sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        {/* Botón cerrar - más grande y visible en móvil */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 p-2 sm:p-2.5 bg-black/60 hover:bg-black/80 rounded-full transition-all active:scale-90"
        >
          <X className="w-6 h-6 sm:w-5 sm:h-5 text-white" />
        </button>

        {/* Imagen - Lado izquierdo en desktop, arriba en móvil */}
        <div className="w-full h-[55vh] lg:h-auto lg:w-3/5 bg-black flex items-center justify-center overflow-hidden relative group flex-shrink-0">
          <img
            src={post.media?.url || post.image}
            alt={post.caption}
            className="w-full h-full object-contain"
          />

          {/* Face Detection Button - siempre visible en móvil */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {!faceAnalysis ? (
              <button
                onClick={handleAnalyzeFace}
                disabled={isAnalyzing}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 shadow-lg text-sm active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Analizando...</span>
                    <span className="sm:hidden">Analizando...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span className="hidden sm:inline">Analizar Rostros</span>
                    <span className="sm:hidden">Analizar</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-dark-surface transition-all shadow-lg text-sm active:scale-95"
              >
                <Scan className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">{showAnalysis ? 'Ocultar' : 'Ver'} Análisis</span>
                <span className="sm:hidden">{showAnalysis ? 'Ocultar' : 'Ver'}</span>
              </button>
            )}
          </div>

          {/* Face Analysis Display - responsive */}
          {faceAnalysis && showAnalysis && (
            <div className="absolute inset-3 sm:top-4 sm:left-4 sm:right-4 sm:bottom-auto max-h-[80%] sm:max-h-none sm:max-w-md overflow-y-auto">
              <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    Análisis Facial
                  </h3>
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <FaceAnalysisDisplay analysis={faceAnalysis} compact={false} />
              </div>
            </div>
          )}
        </div>

        {/* Sección de acciones - Solo visible en móvil */}
        <div className="lg:hidden flex-1 flex flex-col bg-white dark:bg-dark-surface overflow-hidden">
          {/* Botones de acción */}
          <div className="p-4 space-y-3 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
                >
                  <Heart
                    className={`w-7 h-7 ${
                      isLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowCommentsModal(true)}
                  className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
                >
                  <MessageCircle className="w-7 h-7 text-gray-900 dark:text-white" />
                </button>
                {/* Botón Send oculto - sin funcionalidad
                <button className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1">
                  <Send className="w-7 h-7 text-gray-900 dark:text-white" />
                </button>
                */}
              </div>
              <button
                onClick={handleSave}
                className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
              >
                <Bookmark
                  className={`w-7 h-7 ${
                    isSaved
                      ? 'fill-gray-900 dark:fill-white text-gray-900 dark:text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                />
              </button>
            </div>

            {/* Contador de likes */}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {likes.toLocaleString()} Me gusta
              </p>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span
                    onClick={handleUserClick}
                    className="font-semibold text-gray-900 dark:text-white text-sm cursor-pointer hover:opacity-70"
                  >
                    {post.user?.username}
                  </span>
                  <VerifiedBadge isVerified={post.user?.isVerified} size="xs" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  {post.caption}
                </span>
              </div>
            )}

            {/* Ver comentarios */}
            {commentsCount > 0 && (
              <button
                onClick={() => setShowCommentsModal(true)}
                className="text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Ver los {commentsCount} comentarios
              </button>
            )}

            {/* Tiempo */}
            <p className="text-xs text-gray-500">
              {post.timeAgo || post.timestamp || 'Hace 2 horas'}
            </p>
          </div>
        </div>

        {/* Contenido - Lado derecho en desktop, oculto en móvil */}
        <div className="hidden lg:flex w-full flex-1 lg:w-2/5 flex-col overflow-hidden">
          {/* Header del post - responsive */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div onClick={handleUserClick} className="cursor-pointer">
                <Avatar
                  src={post.user?.avatar}
                  name={post.user?.name}
                  username={post.user?.username}
                  size="sm"
                  className="flex-shrink-0"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3
                    onClick={handleUserClick}
                    className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate cursor-pointer hover:opacity-70"
                  >
                    {post.user?.username || 'johndoe'}
                  </h3>
                  <VerifiedBadge isVerified={post.user?.isVerified} size="sm" />
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {post.location || 'Ubicación'}
                </p>
              </div>
            </div>
            {/* Botón de menú oculto - sin funcionalidad
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors active:scale-90 flex-shrink-0">
              <MoreHorizontal className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            </button>
            */}
          </div>

          {/* Caption y comentarios - responsive con mejor scroll */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 overscroll-contain">
            {/* Caption */}
            {post.caption && (
              <div className="flex gap-2 sm:gap-3">
                <div onClick={handleUserClick} className="cursor-pointer">
                  <Avatar
                    src={post.user?.avatar}
                    name={post.user?.name}
                    username={post.user?.username}
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <span
                        onClick={handleUserClick}
                        className="font-semibold text-gray-900 dark:text-white text-sm flex-shrink-0 cursor-pointer hover:opacity-70"
                      >
                        {post.user?.username || 'johndoe'}
                      </span>
                      <VerifiedBadge isVerified={post.user?.isVerified} size="xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm break-words">
                      {post.caption}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.timeAgo || post.timestamp || 'Hace 2 horas'}
                  </p>
                </div>
              </div>
            )}

            {/* Comentarios reales desde backend */}
            <div className="space-y-3 sm:space-y-4">
              {loadingComments && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {!loadingComments && comments.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  Sé el primero en comentar
                </p>
              )}

              {comments.map((commentItem) => (
                <div key={commentItem.id} className="flex gap-2 sm:gap-3">
                  <Avatar
                    src={commentItem.user.avatar}
                    name={commentItem.user.name}
                    username={commentItem.user.username}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                        {commentItem.user.username}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm flex-1">
                        {commentItem.text}
                      </span>
                      {user?.id === commentItem.user.id && (
                        <button
                          onClick={() => handleDeleteComment(commentItem.id)}
                          className="p-1 hover:opacity-70 text-red-500"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(commentItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones del post - responsive y táctil con sombra en móvil */}
          <div className="border-t border-gray-200 dark:border-dark-border p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0 bg-white dark:bg-dark-surface shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:shadow-none">
            {/* Botones de acción - más grandes en móvil */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-4">
                <button
                  onClick={handleLike}
                  className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
                >
                  <Heart
                    className={`w-7 h-7 sm:w-7 sm:h-7 ${
                      isLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowCommentsModal(true)}
                  className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
                >
                  <MessageCircle className="w-7 h-7 sm:w-7 sm:h-7 text-gray-900 dark:text-white" />
                </button>
                {/* Botón Send oculto - sin funcionalidad
                <button className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1">
                  <Send className="w-7 h-7 sm:w-7 sm:h-7 text-gray-900 dark:text-white" />
                </button>
                */}
              </div>
              <button
                onClick={handleSave}
                className="hover:opacity-70 transition-all active:scale-90 p-1 -m-1"
              >
                <Bookmark
                  className={`w-7 h-7 sm:w-7 sm:h-7 ${
                    isSaved
                      ? 'fill-gray-900 dark:fill-white text-gray-900 dark:text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}
                />
              </button>
            </div>

            {/* Contador de likes y total de comentarios */}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                {likes.toLocaleString()} Me gusta
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {commentsCount > 0 && `${commentsCount} ${commentsCount === 1 ? 'comentario' : 'comentarios'} • `}
                {post.timeAgo || post.timestamp || 'Hace 2 horas'}
              </p>
            </div>

            {/* Input de comentario - optimizado para móvil */}
            <form onSubmit={handleComment} className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-dark-border">
              <button
                type="button"
                className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity active:scale-90 flex-shrink-0"
              >
                <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Añade un comentario..."
                disabled={sendingComment}
                className="flex-1 bg-transparent border-0 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 py-1"
              />
              <button
                type="submit"
                disabled={!comment.trim() || sendingComment}
                className="font-semibold text-sm sm:text-base text-primary hover:text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 px-1 flex-shrink-0"
              >
                {sendingComment ? 'Enviando...' : 'Publicar'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de comentarios para móvil */}
      <CommentsModal
        post={post}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
      />
    </div>
  );
}

PostModal.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    image: PropTypes.string,
    caption: PropTypes.string,
    likes: PropTypes.number,
    comments: PropTypes.number,
    timeAgo: PropTypes.string,
    location: PropTypes.string,
    hasMultipleImages: PropTypes.bool,
    user: PropTypes.shape({
      username: PropTypes.string,
      avatar: PropTypes.string
    }),
    sampleComments: PropTypes.arrayOf(
      PropTypes.shape({
        username: PropTypes.string,
        avatar: PropTypes.string,
        text: PropTypes.string,
        timeAgo: PropTypes.string
      })
    )
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default PostModal;
