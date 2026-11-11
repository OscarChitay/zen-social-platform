import { Heart, Send, Bookmark, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { likePost, unlikePost, savePost, unsavePost } from '../services/postService';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { getCachedAnalysis } from '../services/faceDetectionBackendService';
import FaceAnalysisDisplay from './FaceAnalysisDisplay';


export default function PostCard({ post, onOpenModal }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.userHasLiked || post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.userHasSaved || post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes || 0);
  const [faceAnalysis, setFaceAnalysis] = useState(null);

  // Load cached face analysis on mount
  useEffect(() => {
    const loadFaceAnalysis = async () => {
      if (post.id && post.media?.type === 'image') {
        try {
          const analysis = await getCachedAnalysis(post.id);
          if (analysis) {
            setFaceAnalysis(analysis);
          }
        } catch (error) {
          // Silenciar error 404 - es normal si no hay análisis cached
          if (!error.message?.includes('404')) {
            console.error('Error loading face analysis:', error);
          }
        }
      }
    };

    loadFaceAnalysis();
  }, [post.id, post.media?.type]);

  const handleLike = async () => {
    // Optimistic UI update
    const newLikedState = !isLiked;
    const previousLikes = likesCount;
    setIsLiked(newLikedState);
    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);

    try {
      if (newLikedState) {
        const newCount = await likePost(post.id);
        setLikesCount(newCount);
      } else {
        const newCount = await unlikePost(post.id);
        setLikesCount(newCount);
      }
    } catch (error) {
      // Revertir en caso de error
      setIsLiked(!newLikedState);
      setLikesCount(previousLikes);
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    // Optimistic UI update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (newSavedState) {
        await savePost(post.id);
      } else {
        await unsavePost(post.id);
      }
    } catch (error) {
      // Revertir en caso de error
      setIsSaved(!newSavedState);
      console.error('Error toggling save:', error);
    }
  };

  const handleUserClick = (e) => {
    e.stopPropagation(); // Prevenir que se abra el modal del post
    if (post.user?.username) {
      navigate(`/profile/${post.user.username}`);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-2xl sm:rounded-3xl animate-fade-in group/post">
      {/* Glass background con gradiente sutil */}
      <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-primary/5 dark:from-white/5 dark:via-transparent dark:to-primary/10"></div>
      <div className="absolute inset-0 border border-gray-200/60 dark:border-white/10 rounded-2xl sm:rounded-3xl"></div>
      <div className="absolute inset-0 shadow-glass"></div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover/post:opacity-100 transition-opacity duration-700 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer"></div>
      </div>

      {/* Contenido del post */}
      <div className="relative">
        {/* Header: Avatar, Username, Time - responsive */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 pb-2 sm:pb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Avatar con glass effect - más pequeño en móvil */}
            <div
              onClick={handleUserClick}
              className="relative group/avatar cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-full animate-pulse-slow opacity-75 group-hover/avatar:opacity-100 transition-opacity blur-sm"></div>
              <Avatar
                src={post.user.avatar}
                name={post.user.name}
                username={post.user.username}
                size="md"
                className="relative border-2 border-white dark:border-dark-surface transition-transform duration-500 group-hover/avatar:scale-110"
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p
                  onClick={handleUserClick}
                  className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-none"
                >
                  {post.user.username}
                </p>
                <VerifiedBadge isVerified={post.user?.isVerified} size="sm" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{post.timestamp}</p>
            </div>
          </div>

          {/* Menú de opciones oculto - sin funcionalidad
          <button className="p-1.5 sm:p-2 md:p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-300 group/menu active:scale-90">
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 dark:text-gray-200 group-hover/menu:scale-110 transition-transform" />
          </button>
          */}
        </div>

        {/* Media: Imagen o Video */}
        {post.media && (
          <div className="relative overflow-hidden bg-black/5 dark:bg-black/20">
            {post.media.type === 'image' ? (
              <>
                <img
                  src={post.media.url}
                  alt="Post content"
                  onClick={onOpenModal}
                  className="w-full object-cover max-h-[400px] sm:max-h-[500px] md:max-h-[600px] cursor-pointer hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Face Detection Badge - Compact */}
                {faceAnalysis && faceAnalysis.hasFaces && (
                  <div className="absolute top-3 left-3 z-10">
                    <FaceAnalysisDisplay
                      analysis={faceAnalysis}
                      compact={true}
                    />
                  </div>
                )}
              </>
            ) : (
              <video
                src={post.media.url}
                controls
                className="w-full max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-cover"
              />
            )}
          </div>
        )}

        {/* Acciones: Like, Comment, Share, Save - responsive */}
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 pb-2">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={clsx(
                "group/like transition-all duration-500 hover:-translate-y-0.5 active:scale-90",
                "relative"
              )}
            >
              <Heart
                className={clsx(
                  "w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 transition-all duration-500 group-hover/like:scale-110",
                  isLiked
                    ? "fill-danger text-danger animate-pulse-slow"
                    : "text-gray-800 dark:text-gray-200 group-hover/like:text-danger"
                )}
                strokeWidth={2}
              />
              {/* Glow effect en hover */}
              <div className={clsx(
                "absolute -inset-2 rounded-full opacity-0 group-hover/like:opacity-100 blur-lg transition-opacity duration-500",
                isLiked ? "bg-danger/30" : "bg-danger/20"
              )}></div>
            </button>

            {/* Comment Button */}
            <button
              onClick={onOpenModal}
              className="group/comment transition-all duration-500 hover:-translate-y-0.5 active:scale-90 relative"
            >
              <MessageCircle
                className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 text-gray-800 dark:text-gray-200 group-hover/comment:text-primary group-hover/comment:scale-110 transition-all duration-500"
                strokeWidth={2}
              />
              <div className="absolute -inset-2 bg-primary/20 rounded-full opacity-0 group-hover/comment:opacity-100 blur-lg transition-opacity duration-500"></div>
            </button>

            {/* Share Button oculto - sin funcionalidad
            <button className="group/share transition-all duration-500 hover:-translate-y-0.5 active:scale-90 relative">
              <Send
                className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 text-gray-800 dark:text-gray-200 group-hover/share:text-secondary group-hover/share:scale-110 group-hover/share:rotate-12 transition-all duration-500"
                strokeWidth={2}
              />
              <div className="absolute -inset-2 bg-secondary/20 rounded-full opacity-0 group-hover/share:opacity-100 blur-lg transition-opacity duration-500"></div>
            </button>
            */}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="group/save transition-all duration-500 hover:-translate-y-0.5 active:scale-90 relative"
          >
            <Bookmark
              className={clsx(
                "w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 transition-all duration-500 group-hover/save:scale-110",
                isSaved
                  ? "fill-warning text-warning"
                  : "text-gray-800 dark:text-gray-200 group-hover/save:text-warning"
              )}
              strokeWidth={2}
            />
            <div className={clsx(
              "absolute -inset-2 rounded-full opacity-0 group-hover/save:opacity-100 blur-lg transition-opacity duration-500",
              isSaved ? "bg-warning/30" : "bg-warning/20"
            )}></div>
          </button>
        </div>

        {/* Likes count - responsive */}
        {likesCount > 0 && (
          <div className="px-3 sm:px-4 md:px-5 pt-1 pb-2 sm:pb-2.5">
            <button className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'me gusta' : 'me gusta'}
            </button>
          </div>
        )}

        {/* Caption - responsive */}
        {post.caption && (
          <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4">
            <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">
              <span className="font-semibold mr-2 hover:text-primary transition-colors cursor-pointer">
                {post.user.username}
              </span>
              <span className="text-gray-800 dark:text-gray-200">{post.caption}</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
