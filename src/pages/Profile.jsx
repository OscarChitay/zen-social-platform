// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Settings, Grid, Bookmark, Camera, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import PostModal from '../components/PostModal';
import EditProfileModal from '../components/EditProfileModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { getMyProfile, getProfileByUsername, updateMyProfile, followUser, unfollowUser } from '../services/profileService';
import { fetchUserPosts, fetchSavedPosts } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';


function Profile() {
  const { username } = useParams(); // define la ruta como /profile/:username?
  const { user: sessionUser, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Cargar perfil + posts
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const prof = username ? await getProfileByUsername(username) : await getMyProfile();
        if (cancel) return;

        // Si es el perfil propio, combinar con datos del contexto (incluye isVerified)
        const profileData = !username && sessionUser ? {
          ...prof,
          isVerified: sessionUser.isVerified || prof.isVerified || false
        } : prof;

        setProfile(profileData);
        setIsFollowing(!!prof.isFollowing);

        // Cargar posts del usuario
        const { items } = await fetchUserPosts(prof.id, { page: 1, limit: 50 });
        if (cancel) return;
        setPosts(items);
      } catch (e) {
        console.error("Error cargando perfil:", e);
        if (!cancel) {
          setProfile(null);
          setPosts([]);
        }
      } finally {
        !cancel && setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [username, sessionUser?.isVerified]);

  // Cargar posts guardados cuando cambie a la tab "saved"
  useEffect(() => {
    if (activeTab === 'saved' && savedPosts.length === 0) {
      let cancel = false;
      (async () => {
        setLoadingSaved(true);
        try {
          const { items } = await fetchSavedPosts({ page: 1, limit: 50 });
          if (!cancel) setSavedPosts(items);
        } catch (e) {
          console.error("Error cargando guardados:", e);
          if (!cancel) setSavedPosts([]);
        } finally {
          !cancel && setLoadingSaved(false);
        }
      })();
      return () => { cancel = true; };
    }
  }, [activeTab]);

  // Acciones
  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(p => ({ ...p, stats: { ...p.stats, followers: p.stats.followers - 1 } }));
      } else {
        await followUser(profile.id);
        setIsFollowing(true);
        setProfile(p => ({ ...p, stats: { ...p.stats, followers: p.stats.followers + 1 } }));
      }
    } catch (e) {
      console.error("Follow error:", e);
    }
  };

  const handlePostClick = (post) => { setSelectedPost(post); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setTimeout(() => setSelectedPost(null), 300); };

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleSaveProfile = async (updated) => {
    try {
      // Actualizar perfil localmente primero (para que se vea inmediatamente)
      const updatedProfile = {
        ...profile,
        name: updated.name,
        bio: updated.bio,
        website: updated.website,
        avatar: updated.avatar,
        isVerified: updated.isVerified
      };
      setProfile(updatedProfile);

      // Actualizar también el contexto de autenticación y localStorage
      updateUser({
        name: updated.name,
        avatar: updated.avatar,
        isVerified: updated.isVerified
      });

      // Intentar guardar en el backend (pero no fallar si no funciona)
      try {
        await updateMyProfile({
          nombre_completo: updated.name,
          biografia: updated.bio,
          sitio_web: updated.website,
          avatar_url: updated.avatar,
          is_verified: updated.isVerified,
        });
      } catch (backendError) {
        console.log("Backend save error (using local storage):", backendError);
      }

      setIsEditModalOpen(false);
    } catch (e) {
      console.error("Update profile error:", e);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center opacity-70">Cargando perfil…</div>;
  }
  if (!profile) {
    return <div className="max-w-4xl mx-auto p-8 text-center">Perfil no encontrado</div>;
  }

  const isOwn = !!profile.isOwnProfile || (sessionUser && sessionUser.id === profile.id);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-2 sm:px-0">
      {/* Header del Perfil */}
      <header className="mb-6 sm:mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl"></div>
          <div className="absolute inset-0 border border-gray-200/60 dark:border-white/10 rounded-2xl sm:rounded-3xl"></div>
          <div className="absolute inset-0 shadow-glass rounded-2xl sm:rounded-3xl"></div>

          <div className="relative p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              <div className="flex justify-center md:justify-start">
                <div className="relative group/avatar">
                  <Avatar
                    src={profile.avatar}
                    name={profile.name}
                    username={profile.username}
                    size="2xl"
                    className="ring-4 ring-white dark:ring-dark-border shadow-xl"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {profile.username}
                    </h1>
                    <VerifiedBadge isVerified={profile.isVerified} size="md" />
                  </div>

                  <div className="flex gap-2 flex-wrap justify-center">
                    {isOwn ? (
                      <>
                        <button
                          onClick={handleOpenEditModal}
                          className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-xl font-semibold text-gray-900 dark:text-white transition-colors"
                        >
                          Editar perfil
                        </button>
                        <button className="p-1.5 sm:p-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-xl transition-colors">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl font-semibold transition-all ${
                            isFollowing
                              ? 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-border'
                              : 'bg-gradient-to-br from-primary to-secondary text-white hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                        <button className="p-1.5 sm:p-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-xl transition-colors">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
                        </button>
                        <button className="p-1.5 sm:p-2 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-xl transition-colors">
                          <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center md:justify-start">
                  <div className="text-center md:text-left">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.stats?.posts ?? 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">publicaciones</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.stats?.followers ?? 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">seguidores</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.stats?.following ?? 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">siguiendo</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {profile.name}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {profile.bio}
                  </p>
                  {!!profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer"
                       className="text-xs sm:text-sm text-primary hover:text-secondary transition-colors inline-block">
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-dark-border mb-4 sm:mb-6">
        <div className="flex justify-center gap-8 sm:gap-10 md:gap-12">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3 sm:py-4 border-t-2 ${
              activeTab === 'posts'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">PUBLICACIONES</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 sm:py-4 border-t-2 ${
              activeTab === 'saved'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">GUARDADOS</span>
          </button>
        </div>
      </div>

      {/* Grid Posts */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 sm:gap-1 md:gap-2">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="relative aspect-square group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
              >
                {/* Imagen/Video */}
                {post.media?.type === "video" ? (
                  <video src={post.media.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media?.url} alt={post.caption || ""} className="w-full h-full object-cover" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Heart className="w-6 h-6 fill-white" />
                    <span>{post.likes ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span>{post.comments ?? 0}</span>
                  </div>
                </div>

                {/* Indicador múltiples (si algún día agregas) */}
                {/* {post.hasMultipleImages && <div className="absolute top-2 right-2"><Camera className="w-5 h-5 text-white" /></div>} */}
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay publicaciones aún</h3>
              <p className="text-gray-600 dark:text-gray-400">Comparte tus primeros momentos</p>
            </div>
          )}
        </div>
      )}

      {/* Guardados */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {loadingSaved ? (
            <div className="col-span-3 py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="relative aspect-square bg-black overflow-hidden group cursor-pointer"
              >
                <img
                  src={post.media?.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Hover overlay con stats */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="w-6 h-6 fill-white" />
                    <span>{post.likes ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span>{post.comments ?? 0}</span>
                  </div>
                </div>

                {/* Indicador de guardado */}
                <div className="absolute top-2 right-2">
                  <Bookmark className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full flex items-center justify-center">
                <Bookmark className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Guarda tus publicaciones favoritas</h3>
              <p className="text-gray-600 dark:text-gray-400">Solo tú puedes ver lo que has guardado</p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <PostModal post={selectedPost} isOpen={isModalOpen} onClose={handleCloseModal} />
      <EditProfileModal profile={profile} isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveProfile} />
    </div>
  );
}

export default Profile;
