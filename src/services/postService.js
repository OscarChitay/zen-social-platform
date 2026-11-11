// src/services/postService.js
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/posts`; // ajusta el puerto si usas otro

function getToken() {
  // Usa tu mecanismo real; muchos proyectos guardan en localStorage
  return localStorage.getItem("token");
}
// Normaliza el objeto para tu PostCard
function toUiPost(p) {
  return {
    id: p.id,
    caption: p.caption || "",
    likes: p.likesCount ?? p.likes ?? 0,
    likesCount: p.likesCount ?? p.likes ?? 0,
    comments: p.commentsCount ?? p.comments ?? 0,
    commentsCount: p.commentsCount ?? p.comments ?? 0,
    userHasLiked: p.userHasLiked || p.isLiked || false,
    userHasSaved: p.userHasSaved || p.isSaved || false,
    isLiked: p.userHasLiked || p.isLiked || false,
    isSaved: p.userHasSaved || p.isSaved || false,
    createdAt: p.createdAt,
    timestamp: new Date(p.createdAt).toLocaleString(),
    media: p.media || null,
    user: {
      id: p.user?.id,
      username: p.user?.username || "user",
      avatar: p.user?.avatar || "https://via.placeholder.com/150/6e40c9/ffffff?text=User",
    },
  };
}

export async function createPostsService({ caption, location, files }) {
  const fd = new FormData();
  if (caption) fd.append("descripcion", caption);
  if (location) fd.append("location", location);
  files.forEach(f => fd.append("media", f));

  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // sin Content-Type (FormData lo pone)
    body: fd,
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error subiendo post");
  }
  return data.posts; // array de posts creados (uno por archivo)
}

export async function fetchFeed({ page = 1, limit = 20, search = "" } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), search });
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`; // optionalAuth

  const res = await fetch(`${BASE_URL}?${qs.toString()}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || `Error HTTP ${res.status}`);
  }
  return { ...data, items: data.items.map(toUiPost) };
}

export async function fetchMyPosts({ page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const token = getToken();
  if (!token) throw new Error("No hay token de sesión");

  const res = await fetch(`${BASE_URL}/me?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || `Error HTTP ${res.status}`);
  }
  return { ...data, items: data.items.map(toUiPost) };
}

export async function fetchUserPosts(userId, { page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/user/${userId}?${qs.toString()}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || `Error HTTP ${res.status}`);
  }
  return { ...data, items: data.items.map(toUiPost) };
}

export async function fetchSavedPosts({ page = 1, limit = 50 } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const token = getToken();
  if (!token) throw new Error("No hay token de sesión");

  const res = await fetch(`${BASE_URL}/saved?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || `Error HTTP ${res.status}`);
  }
  return { ...data, items: data.items.map(toUiPost) };
}

// ==================== LIKES ====================

export async function likePost(postId) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const res = await fetch(`${BASE_URL}/${postId}/like`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al dar like");
  }
  return data.likes; // retorna el nuevo contador
}

export async function unlikePost(postId) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const res = await fetch(`${BASE_URL}/${postId}/like`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al quitar like");
  }
  return data.likes; // retorna el nuevo contador
}

// ==================== GUARDADOS ====================

export async function savePost(postId) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const res = await fetch(`${BASE_URL}/${postId}/save`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al guardar post");
  }
  return data;
}

export async function unsavePost(postId) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const res = await fetch(`${BASE_URL}/${postId}/save`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al quitar guardado");
  }
  return data;
}

// ==================== COMENTARIOS ====================

export async function fetchComments(postId, { page = 1, limit = 50 } = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/${postId}/comments?${qs.toString()}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || `Error HTTP ${res.status}`);
  }
  return data; // { ok, page, limit, total, items: [{id, postId, text, createdAt, user}] }
}

export async function createComment(postId, text) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const res = await fetch(`${BASE_URL}/${postId}/comments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al crear comentario");
  }
  return data.comment; // { id, postId, text, createdAt, user }
}

export async function deleteComment(commentId) {
  const token = getToken();
  if (!token) throw new Error("No autorizado");

  const COMMENTS_BASE_URL = `${import.meta.env.VITE_API_URL}/api/comments`;
  const res = await fetch(`${COMMENTS_BASE_URL}/${commentId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || "Error al eliminar comentario");
  }
  return data;
}
