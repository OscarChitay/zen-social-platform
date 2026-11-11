// src/services/profileService.js
const PROFILE_URL = `${import.meta.env.VITE_API_URL}/api/profile`;
const POSTS_URL   =`${import.meta.env.VITE_API_URL}/api/posts`;

function getToken() {
  return localStorage.getItem("token");
}

export async function getMyProfile() {
  const res = await fetch(`${PROFILE_URL}/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.profile;
}

export async function getProfileByUsername(username) {
  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${PROFILE_URL}/${encodeURIComponent(username)}`, { headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.profile;
}

export async function updateMyProfile(payload) {
  const res = await fetch(`${PROFILE_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.profile;
}

export async function followUser(userId) {
  const res = await fetch(`${PROFILE_URL}/${userId}/follow`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return true;
}

export async function unfollowUser(userId) {
  const res = await fetch(`${PROFILE_URL}/${userId}/follow`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return true;
}

/**
 * NUEVO correcto según tus rutas backend:
 * GET /api/posts/user/:id?page=&limit=
 * (usa optionalAuth, así que el token es opcional)
 */
export async function getUserPostsById(userId, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const headers = {};
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${POSTS_URL}/user/${userId}?${params.toString()}`, { headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  // Se espera algo como: { ok: true, items: [...], total: number }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Error (${res.status}) cargando posts del usuario`);
  }

  return { items: data.items || [], total: data.total ?? 0 };
}
