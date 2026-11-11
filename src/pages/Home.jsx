import { useState, useEffect } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import logo1 from '../assets/images/logo1.png';
import logo2 from '../assets/images/logo 2.png';
import { fetchFeed } from '../services/postService';


export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const page = 1;
  const limit = 20;
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simular carga de posts desde el backend
   useEffect(() => {
    let cancel = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const { items } = await fetchFeed({ page, limit, search: searchQuery });
        if (!cancel) {
          // Actualizar posts con la verificación del usuario actual si aplica
          const updatedPosts = items.map(post => {
            if (currentUser && post.user?.username === currentUser.username) {
              return {
                ...post,
                user: {
                  ...post.user,
                  isVerified: currentUser.isVerified || post.user.isVerified || false
                }
              };
            }
            return post;
          });
          setPosts(updatedPosts);
        }
      } catch (e) {
        console.error("Error cargando feed:", e);
        if (!cancel) {
          setPosts([]);
        }
      } finally {
        !cancel && setIsLoading(false);
      }
    };
    // pequeña espera para evitar disparar muchas requests mientras escribe
    const t = setTimeout(load, 250);
    return () => { cancel = true; clearTimeout(t); };
  }, [page, limit, searchQuery, currentUser?.isVerified]);

  const handleOpenPost = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Header flotante más pequeño y centrado - totalmente responsive */}
      <div className="sticky top-2 sm:top-4 z-20 px-2 sm:px-4 animate-slide-down">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl"></div>
            <div className="absolute inset-0 border border-gray-200/50 dark:border-white/10 rounded-2xl sm:rounded-3xl"></div>
            <div className="absolute inset-0 shadow-glass rounded-2xl sm:rounded-3xl"></div>

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer"></div>
            </div>

            {/* Content - responsive layout */}
            <div className="relative flex items-center justify-between gap-2 sm:gap-4 md:gap-6 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-3.5">
              {/* Logo ZEN - texto + imagen a la derecha */}
              <div className="group/logo flex-shrink-0 relative flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-display font-black bg-gradient-github bg-clip-text text-transparent tracking-tight hover:scale-110 transition-all duration-500 cursor-pointer">
                  ZEN
                </h1>
                <img
                  src={theme === 'dark' ? logo1 : logo2}
                  alt="ZEN Logo"
                  className="h-6 sm:h-7 md:h-8 w-auto hover:scale-110 transition-all duration-500 object-contain"
                />
                {/* Glow effect on hover */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-all duration-700 -z-10"></div>
              </div>

              {/* Buscador centrado - responsive */}
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md relative group/search">
                <div className="relative flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-light-bg/40 dark:bg-dark-bg/40 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-white/5 focus-within:border-primary/30 transition-colors">
                  <Search className="w-3.5 h-3.5 sm:w-4 md:w-4.5 md:h-4.5 text-gray-600 dark:text-gray-400 group-focus-within/search:text-primary transition-colors flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-xs sm:text-sm min-w-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-500 hover:text-primary transition-colors flex-shrink-0 text-base sm:text-lg leading-none"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Theme Toggle compacto - más pequeño en móvil */}
              <button
                onClick={toggleTheme}
                className="relative p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl overflow-hidden group/theme transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
                aria-label="Cambiar tema"
              >
                {/* Glass background */}
                <div className="absolute inset-0 bg-light-bg/40 dark:bg-dark-bg/40 backdrop-blur-sm"></div>
                <div className="absolute inset-0 border border-gray-200/50 dark:border-white/5 rounded-xl sm:rounded-2xl"></div>

                {/* Glow effect on hover */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-xl sm:rounded-2xl opacity-0 group-hover/theme:opacity-100 blur-xl transition-opacity duration-700"></div>

                {/* Icons - responsive size */}
                <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5">
                  <Sun
                    className={`absolute inset-0 w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-warning transition-all duration-500 ${
                      theme === 'light'
                        ? 'rotate-0 opacity-100 scale-100'
                        : 'rotate-180 opacity-0 scale-0'
                    }`}
                  />
                  <Moon
                    className={`absolute inset-0 w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-primary transition-all duration-500 ${
                      theme === 'dark'
                        ? 'rotate-0 opacity-100 scale-100'
                        : '-rotate-45 opacity-0 scale-0'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor principal - responsive padding */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-8 sm:py-10 md:py-12">
              <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/40 backdrop-blur-xl"></div>
                <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-2xl"></div>
                <div className="relative flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          ) : (
            /* Feed de Posts */
            posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                <PostCard post={post} onOpenModal={() => handleOpenPost(post)} />
              </div>
            ))
          )}

          {/* Empty State */}
          {!isLoading && posts.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="relative overflow-hidden rounded-2xl p-8 text-center">
                <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/40 backdrop-blur-xl"></div>
                <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-2xl"></div>
                <div className="relative">
                  <p className="text-gray-600 dark:text-gray-400">No hay posts para mostrar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Post */}
      <PostModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
