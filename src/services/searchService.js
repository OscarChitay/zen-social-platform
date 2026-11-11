// src/services/searchService.js
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/search`;

function getToken() {
  return localStorage.getItem("token");
}
function authHeaders() {
  const h = {};
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function searchAll(q, { uLimit = 5, pLimit = 9 } = {}) {
  const qs = new URLSearchParams({ q, uLimit: String(uLimit), pLimit: String(pLimit) });
  const res = await fetch(`${BASE_URL}/all?${qs}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data; // { users:[], posts:[] }
}

export async function searchUsers(q, { page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  const res = await fetch(`${BASE_URL}/users?${qs}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data; // {page,limit,total,items:[{id,username,name,avatar,bio}]}
}

export async function searchPosts(q, { page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  const res = await fetch(`${BASE_URL}/posts?${qs}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data; // {page,limit,total,items:[postNormalizado]}
}
