import { useEffect, useState } from 'react';
import { Search as SearchIcon, X, Users, Image, Hash } from 'lucide-react';
import clsx from 'clsx';
import { searchAll, searchUsers, searchPosts } from '../services/searchService';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';


export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, users, posts
  const [isSearching, setIsSearching] = useState(false);

  // resultados
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [usersPage, setUsersPage] = useState({ page: 1, total: 0, limit: 20 });
  const [postsPage, setPostsPage] = useState({ page: 1, total: 0, limit: 20 });

  // dispara búsquedas
  useEffect(() => {
    let cancel = false;
    if (!searchQuery.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    async function run() {
      setIsSearching(true);
      try {
        if (activeTab === 'all') {
          const { users, posts } = await searchAll(searchQuery, { uLimit: 6, pLimit: 9 });
          if (cancel) return;
          setUserResults(users);
          setPostResults(posts);
        } else if (activeTab === 'users') {
          const { items, page, total, limit } = await searchUsers(searchQuery, { page: usersPage.page, limit: usersPage.limit });
          if (cancel) return;
          setUserResults(items);
          setUsersPage({ page, total, limit });
        } else if (activeTab === 'posts') {
          const { items, page, total, limit } = await searchPosts(searchQuery, { page: postsPage.page, limit: postsPage.limit });
          if (cancel) return;
          setPostResults(items);
          setPostsPage({ page, total, limit });
        }
      } catch (e) {
        console.error("search error:", e);
        if (!cancel) { setUserResults([]); setPostResults([]); }
      } finally {
        !cancel && setIsSearching(false);
      }
    }

    const t = setTimeout(run, 250); // debounced
    return () => { cancel = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab, usersPage.page, postsPage.page]);

  const clearSearch = () => {
    setSearchQuery('');
    setUserResults([]);
    setPostResults([]);
    setUsersPage(p => ({ ...p, page: 1 }));
    setPostsPage(p => ({ ...p, page: 1 }));
  };

  const tabs = [
    { id: 'all', label: 'Todo', icon: SearchIcon },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'posts', label: 'Posts', icon: Image },
  ];

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      {/* Header con búsqueda flotante - responsive */}
      <div className="sticky top-2 sm:top-4 z-20 px-3 sm:px-4 animate-slide-down">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl"></div>
            <div className="absolute inset-0 border border-gray-200/60 dark:border-white/10 rounded-2xl sm:rounded-3xl"></div>
            <div className="absolute inset-0 shadow-glass rounded-2xl sm:rounded-3xl"></div>

            <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
              {/* Barra de búsqueda - más táctil en móvil */}
              <div className="relative group/search">
                <div className="absolute inset-0 bg-light-bg/40 dark:bg-dark-bg/40 backdrop-blur-sm rounded-xl sm:rounded-2xl"></div>
                <div className="absolute inset-0 border border-gray-200/50 dark:border-white/5 rounded-xl sm:rounded-2xl group-focus-within/search:border-primary/30 transition-colors"></div>

                <div className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4">
                  <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-focus-within/search:text-primary transition-colors flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setUsersPage(p=>({...p, page:1})); setPostsPage(p=>({...p, page:1})); }}
                    placeholder="Buscar usuarios, posts..."
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base min-w-0"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={clearSearch} className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/5 transition-colors flex-shrink-0">
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors" />
                    </button>
                  )}
                </div>

                {isSearching && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer"></div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              {searchQuery && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap relative overflow-hidden",
                          activeTab === tab.id ? "text-white" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        {activeTab === tab.id && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                            <div className="absolute inset-0 shadow-glow-sm"></div>
                          </>
                        )}
                        {activeTab !== tab.id && (
                          <div className="absolute inset-0 bg-light-bg/40 dark:bg-dark-bg/40 opacity-0 hover:opacity-100 transition-opacity"></div>
                        )}
                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="text-sm font-medium relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!searchQuery ? (
          /* Vista inicial: Sin búsquedas */
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Busca usuarios o publicaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Escribe algo en el buscador para empezar
              </p>
            </div>
          </div>
        ) : (
          /* Resultados */
          <div className="space-y-6">
            {isSearching ? (
              <div className="flex justify-center py-12">
                <div className="relative overflow-hidden rounded-2xl p-6">
                  <div className="absolute inset-0 bg-white/60 dark:bg-dark-surface/40 backdrop-blur-xl"></div>
                  <div className="absolute inset-0 border border-gray-200 dark:border-white/10 rounded-2xl"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ALL: 2 buckets */}
                {activeTab === 'all' && (
                  <>
                    {/* Usuarios */}
                    <section>
                      <h3 className="px-1 mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Usuarios</h3>
                      {userResults.length === 0 ? (
                        <div className="text-center text-gray-500">Sin resultados</div>
                      ) : (
                        <div className="space-y-2">
                          {userResults.map(u => (
                            <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                              <Avatar src={u.avatar} name={u.name} username={u.username} size="md" />
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{u.username}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{u.name}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Posts grid */}
                    <section>
                      <h3 className="px-1 mt-6 mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Posts</h3>
                      {postResults.length === 0 ? (
                        <div className="text-center text-gray-500">Sin resultados</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
                          {postResults.map(p => (
                            <div key={p.id} className="relative aspect-square bg-black/5 dark:bg-black/20 rounded-md overflow-hidden">
                              {p.media?.type === "video"
                                ? <video src={p.media.url} className="w-full h-full object-cover" />
                                : <img src={p.media?.url} alt={p.caption || ""} className="w-full h-full object-cover" />
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                {/* USERS tab */}
                {activeTab === 'users' && (
                  <section className="space-y-2">
                    {userResults.length === 0 ? (
                      <div className="text-center text-gray-500">Sin resultados</div>
                    ) : userResults.map(u => (
                      <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                        <Avatar src={u.avatar} name={u.name} username={u.username} size="lg" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">{u.username}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{u.name}</div>
                          {u.bio && <div className="text-xs text-gray-500 line-clamp-1">{u.bio}</div>}
                        </div>
                      </Link>
                    ))}
                    {/* paginación simple */}
                    {usersPage.total > usersPage.limit && (
                      <div className="flex justify-center gap-2 pt-3">
                        <button
                          onClick={() => setUsersPage(p => ({ ...p, page: Math.max(1, p.page-1) }))}
                          className="px-3 py-1 rounded-lg bg-light-bg/60 dark:bg-dark-bg/60 hover:opacity-80"
                          disabled={usersPage.page === 1}
                        >Anterior</button>
                        <button
                          onClick={() => setUsersPage(p => ({ ...p, page: p.page+1 }))}
                          className="px-3 py-1 rounded-lg bg-light-bg/60 dark:bg-dark-bg/60 hover:opacity-80"
                          disabled={usersPage.page * usersPage.limit >= usersPage.total}
                        >Siguiente</button>
                      </div>
                    )}
                  </section>
                )}

                {/* POSTS tab */}
                {activeTab === 'posts' && (
                  <>
                    {postResults.length === 0 ? (
                      <div className="text-center text-gray-500">Sin resultados</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
                        {postResults.map(p => (
                          <div key={p.id} className="relative aspect-square bg-black/5 dark:bg-black/20 rounded-md overflow-hidden">
                            {p.media?.type === "video"
                              ? <video src={p.media.url} className="w-full h-full object-cover" />
                              : <img src={p.media?.url} alt={p.caption || ""} className="w-full h-full object-cover" />
                            }
                          </div>
                        ))}
                      </div>
                    )}
                    {postsPage.total > postsPage.limit && (
                      <div className="flex justify-center gap-2 pt-3">
                        <button
                          onClick={() => setPostsPage(p => ({ ...p, page: Math.max(1, p.page-1) }))}
                          className="px-3 py-1 rounded-lg bg-light-bg/60 dark:bg-dark-bg/60 hover:opacity-80"
                          disabled={postsPage.page === 1}
                        >Anterior</button>
                        <button
                          onClick={() => setPostsPage(p => ({ ...p, page: p.page+1 }))}
                          className="px-3 py-1 rounded-lg bg-light-bg/60 dark:bg-dark-bg/60 hover:opacity-80"
                          disabled={postsPage.page * postsPage.limit >= postsPage.total}
                        >Siguiente</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
