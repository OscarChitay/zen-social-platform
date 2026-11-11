import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageCircle, User, LogOut, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo1 from '../assets/images/logo1.png'; // Logo claro
import logo2 from '../assets/images/logo 2.png'; // Logo oscuro (nota el espacio)

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const navRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleCreatePost = (newPost) => {
    console.log('Nueva publicación creada:', newPost);
    // Aquí iría la lógica para guardar la publicación
    // Por ejemplo: postService.createPost(newPost)
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Actualizar posición del indicador cuando cambia la ruta (Apple-style animation)
  useEffect(() => {
    if (!navRef.current) return;

    const updateIndicator = () => {
      // Rutas simplificadas: Inicio, Búsqueda, Mensajes, Perfil
      const navPaths = ['/', '/search', '/messages', '/profile'];
      const currentIndex = navPaths.findIndex(path => path === location.pathname);

      if (currentIndex !== -1) {
        // Obtener todos los links del nav
        const links = navRef.current.querySelectorAll('a');

        if (links.length > currentIndex) {
          const activeLink = links[currentIndex];

          if (activeLink) {
            // Usar requestAnimationFrame para sincronizar con el navegador
            requestAnimationFrame(() => {
              const navRect = navRef.current.getBoundingClientRect();
              const linkRect = activeLink.getBoundingClientRect();
              const topPosition = linkRect.top - navRect.top;

              // Solo actualizar si los valores son válidos
              if (topPosition >= 0 && linkRect.height > 0) {
                setIndicatorStyle({
                  top: topPosition,
                  height: linkRect.height
                });

                // Marcar como inicializado después del primer cálculo válido
                if (!isInitialized) {
                  setIsInitialized(true);
                }
              }
            });
          }
        }
      } else {
        // Si no hay ruta activa, ocultar el indicador
        setIndicatorStyle({ top: 0, height: 0 });
      }
    };

    // Ejecutar inmediatamente sin animación en la primera carga
    if (!isInitialized) {
      updateIndicator();
    } else {
      // Con un pequeño delay para animación suave en cambios subsecuentes
      const timer = setTimeout(updateIndicator, 10);
      return () => clearTimeout(timer);
    }

    // Recalcular en resize
    const handleResize = () => {
      requestAnimationFrame(updateIndicator);
    };

    window.addEventListener('resize', handleResize);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname, isInitialized]);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-light-bg dark:bg-dark-bg flex-col py-8 px-6 z-40 border-r border-gray-200 dark:border-dark-border">
      {/* Header: Logo */}
      <div className="flex items-center gap-3 mb-10">
        {/* Logo ZEN - texto + imagen a la derecha */}
        <Link to="/" className="group flex items-center gap-2 relative">
          <h1 className="text-3xl font-display font-black bg-gradient-github bg-clip-text text-transparent tracking-tight hover:scale-110 transition-all duration-500">
            ZEN
          </h1>
          <img
            src={theme === 'dark' ? logo1 : logo2}
            alt="ZEN Logo"
            className="h-9 w-auto hover:scale-110 transition-all duration-500 object-contain"
          />
          {/* Glow effect on hover */}
          <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 group-hover:blur-3xl"></div>
        </Link>
      </div>

      {/* Botón Crear - mejorado con glassmorphism */}
      <button
        onClick={() => setIsCreatePostOpen(true)}
        className="w-full mb-6 py-3.5 px-6 relative group overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-100 group-hover:opacity-90 transition-opacity"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center gap-2.5 text-white font-bold text-base">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          <span>Crear</span>
        </div>
      </button>

      {/* Navigation Links con indicador animado estilo Apple */}
      <nav ref={navRef} className="flex-1 space-y-2 relative" style={{ animation: 'slideUp 0.5s ease-out' }}>
        {/* Indicador de fondo animado (estilo Apple) */}
        <div
          className={clsx(
            "absolute left-0 right-0 pointer-events-none z-0",
            isInitialized ? "transition-all duration-500 ease-out" : ""
          )}
          style={{
            top: `${indicatorStyle.top}px`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.height > 0 ? 1 : 0,
            transform: 'translateZ(0)', // Force GPU acceleration
            willChange: 'top, height, opacity', // Optimización de rendimiento
          }}
        >
          <div className="absolute inset-0 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-secondary/8 to-accent/8 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10 rounded-xl"></div>
          <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-xl"></div>
          <div className="absolute inset-0 shadow-inner rounded-xl"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-primary via-secondary to-accent rounded-r-full shadow-glow-sm"></div>
        </div>

        {/* Links de navegación */}
        <SidebarLink
          to="/"
          icon={Home}
          label="Inicio"
          active={isActive('/')}
        />
        <SidebarLink
          to="/search"
          icon={Search}
          label="Búsqueda"
          active={isActive('/search')}
        />
        <SidebarLink
          to="/messages"
          icon={MessageCircle}
          label="Mensajes"
          active={isActive('/messages')}
        />
        <SidebarLink
          to="/profile"
          icon={User}
          label="Perfil"
          active={isActive('/profile')}
        />
      </nav>

      {/* Bottom Section - Cerrar Sesión */}
      <div className="pt-6 animate-fade-in">
        <button
          onClick={handleLogout}
          className={clsx(
            "w-full flex items-center gap-4 px-5 py-4 rounded-xl relative group overflow-hidden",
            "transition-all duration-500 hover:-translate-y-0.5",
            "text-gray-700 dark:text-gray-300",
            "hover:text-red-600 dark:hover:text-red-400"
          )}
        >
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <LogOut className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" />
          <span className="text-base font-semibold relative z-10">
            Cerrar sesión
          </span>
        </button>
      </div>

      {/* Modal de Crear Publicación */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPost={handleCreatePost}
      />
    </aside>
  );
}

function SidebarLink({ to, icon, label, active }) {
  const Icon = icon;

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-4 px-5 py-4 rounded-xl relative group overflow-hidden z-10",
        "transition-all duration-500 hover:-translate-y-0.5",
        "animate-slide-up",
        active
          ? "font-bold text-black dark:text-white"
          : "font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:scale-[1.02]"
      )}
    >
      {/* Hover glass effect solo cuando NO está activo */}
      {!active && (
        <>
          <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"></div>
          <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        </>
      )}

      <div className="relative z-10 transition-transform duration-500 group-hover:scale-105">
        <Icon
          className={clsx(
            "w-6 h-6 transition-all duration-500",
            active ? "scale-110 drop-shadow-lg" : "group-hover:scale-110 group-hover:rotate-3"
          )}
          strokeWidth={active ? 2.5 : 2}
        />
      </div>

      <span className="relative z-10 transition-all duration-500 group-hover:translate-x-1">{label}</span>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </Link>
  );
}
