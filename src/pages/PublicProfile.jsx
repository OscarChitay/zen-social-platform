// src/pages/PublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import PostModal from "../components/PostModal";
import { getProfileByUsername, getUserPostsById, followUser, unfollowUser } from "../services/profileService";
import Avatar from "../components/Avatar";


export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile]   = useState(null);
  const [posts, setPosts]       = useState([]);
  const [page, setPage]         = useState(1);
  const [limit]                 = useState(20);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab]     = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  // Cargar perfil + primera página de posts
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const p = await getProfileByUsername(username); // {id, username, name, bio, avatar, website, stats, isOwnProfile, isFollowing}
        if (cancel) return;
        setProfile(p);

        const { items, total } = await getUserPostsById(p.id, { page: 1, limit });
        if (cancel) return;
        setPosts(items);
        setTotal(total);
        setPage(1);
      } catch (e) {
        console.error("PublicProfile load error:", e);
        if (!cancel) setProfile(null);
      } finally {
        !cancel && setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [username, limit]);

  // Cargar más (paginación)
  useEffect(() => {
    let cancel = false;
    if (!profile || page === 1) return;
    (async () => {
      try {
        const { items } = await getUserPostsById(profile.id, { page, limit });
        if (!cancel) setPosts(prev => [...prev, ...items]);
      } catch (e) { console.error(e); }
    })();
    return () => { cancel = true; };
  }, [page, limit, profile]);

  const toggleFollow = async () => {
    try {
      if (!profile || profile.isOwnProfile) return;
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
        setProfile(p => ({ ...p, isFollowing: false, stats: { ...p.stats, followers: Math.max(0, p.stats.followers - 1) }}));
      } else {
        await followUser(profile.id);
        setProfile(p => ({ ...p, isFollowing: true, stats: { ...p.stats, followers: p.stats.followers + 1 }}));
      }
    } catch (e) {
      console.error("toggleFollow error:", e);
    }
  };

  const openPost  = (post) => { setSelectedPost(post); setIsModalOpen(true); };
  const closePost = () => { setIsModalOpen(false); setTimeout(() => setSelectedPost(null), 250); };

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center">Cargando…</div>;
  if (!profile) return <div className="max-w-4xl mx-auto p-6 text-center">Perfil no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl rounded-2xl"></div>
          <div className="absolute inset-0 border border-gray-200/60 dark:border-white/10 rounded-2xl"></div>

          <div className="relative p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="flex justify-center md:justify-start">
              <Avatar
                src={profile.avatar}
                name={profile.name}
                username={profile.username}
                size="2xl"
                className="ring-4 ring-white dark:ring-dark-border"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <div className="flex gap-2 flex-wrap justify-center">
                  {profile.isOwnProfile ? (
                    <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-bg opacity-70">Tu perfil</span>
                  ) : (
                    <>
                      <button onClick={toggleFollow}
                              className={`px-5 py-2 rounded-xl font-semibold ${profile.isFollowing
                                ? "bg-gray-100 dark:bg-dark-bg"
                                : "bg-gradient-to-br from-primary to-secondary text-white"}`}>
                        {profile.isFollowing ? "Siguiendo" : "Seguir"}
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-bg">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-6 justify-center md:justify-start">
                <div><b>{profile.stats.posts}</b> publicaciones</div>
                <div><b>{profile.stats.followers}</b> seguidores</div>
                <div><b>{profile.stats.following}</b> siguiendo</div>
              </div>

              <div>
                <div className="font-semibold">{profile.name}</div>
                {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{profile.bio}</p>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-primary">
                    {profile.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-dark-border mb-4">
        <div className="flex justify-center gap-10">
          <button onClick={()=>setActiveTab("posts")}
                  className={`flex items-center gap-2 py-3 ${activeTab==="posts" ? "font-semibold" : "text-gray-400"}`}>
            <Grid className="w-5 h-5" /> <span className="hidden sm:inline">PUBLICACIONES</span>
          </button>
          <button onClick={()=>setActiveTab("saved")}
                  className={`flex items-center gap-2 py-3 ${activeTab==="saved" ? "font-semibold" : "text-gray-400"}`}>
            <Bookmark className="w-5 h-5" /> <span className="hidden sm:inline">GUARDADOS</span>
          </button>
        </div>
      </div>

      {/* Grid de posts */}
      {activeTab==="posts" && (
        <>
          {posts.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No hay publicaciones</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
              {posts.map(p => (
                <div key={p.id} className="relative aspect-square group cursor-pointer" onClick={()=>openPost(p)}>
                  {p.media?.type === "video"
                    ? <video src={p.media.url} className="w-full h-full object-cover"/>
                    : <img src={p.media?.url} className="w-full h-full object-cover" alt={p.caption || ""}/>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Heart className="w-6 h-6 fill-white"/><span>{p.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <MessageCircle className="w-6 h-6 fill-white"/><span>{p.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page * limit < total && (
            <div className="flex justify-center py-6">
              <button onClick={()=>setPage(p=>p+1)}
                      className="px-5 py-2 rounded-xl bg-light-bg/60 dark:bg-dark-bg/60 hover:opacity-80">
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {activeTab==="saved" && (
        <div className="py-20 text-center text-gray-500">Solo visible para el dueño (pendiente)</div>
      )}

      <PostModal post={selectedPost} isOpen={isModalOpen} onClose={closePost}/>
    </div>
  );
}
