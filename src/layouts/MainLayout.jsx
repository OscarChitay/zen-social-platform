import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import FloatingCreateButton from '../components/FloatingCreateButton';
import CreatePostModal from '../components/CreatePostModal';

export default function MainLayout({ children, noPadding = false }) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const location = useLocation();

  // Ocultar botón flotante en la página de mensajes
  const shouldShowFloatingButton = location.pathname !== '/messages';

  const handleCreatePost = (newPost) => {
    console.log('Nueva publicación creada desde FAB:', newPost);
    // Aquí iría la lógica para guardar la publicación
    // Por ejemplo: postService.createPost(newPost)
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-all duration-300">
      {/* Sidebar para desktop - oculto en móvil */}
      <Sidebar />

      {/* Contenido principal - responsive padding */}
      <main className="pb-20 sm:pb-20 lg:pb-0 lg:pl-60 xl:pl-64 min-h-screen transition-all duration-300">
        {noPadding ? (
          children
        ) : (
          <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {children}
          </div>
        )}
      </main>

      {/* Bottom navigation - solo en móvil y tablet */}
      <BottomNav />

      {/* Botón flotante - oculto en la página de mensajes */}
      {shouldShowFloatingButton && (
        <FloatingCreateButton onClick={() => setIsCreatePostOpen(true)} />
      )}

      {/* Modal de crear publicación */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPost={handleCreatePost}
      />
    </div>
  );
}
