// src/services/messageService.js
import io from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL;
let socket = null;

function getToken() {
  return localStorage.getItem('token');
}

export function initializeSocket() {
  // Si ya existe y está conectado, reutilizarlo
  if (socket?.connected) {
    console.log('♻️ Socket ya conectado, reutilizando');
    return socket;
  }

  // Si existe pero está desconectado, desconectarlo completamente
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const token = getToken();
  if (!token) {
    console.warn('⚠️ No hay token, no se puede conectar socket');
    return null;
  }

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => console.log('✅ Socket conectado:', socket.id));
  socket.on('disconnect', (reason) => console.log('❌ Socket desconectado:', reason));
  socket.on('connect_error', (error) => console.error('🔴 Error de conexión:', error.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log('🔌 Desconectando socket');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function onMessageReceived(callback) {
  if (!socket) return;
  socket.on('message:received', callback);
}

export function onMessageSent(callback) {
  if (!socket) return;
  socket.on('message:sent', callback);
}

export function onUserTyping(callback) {
  if (!socket) return;
  socket.on('typing:start', callback);
}

export function onUserStoppedTyping(callback) {
  if (!socket) return;
  socket.on('typing:stop', callback);
}

export function sendMessage(receptorId, mensaje) {
  if (!socket?.connected) return;

  const token = getToken();
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.sub;
    const ids = [currentUserId, receptorId].sort((a, b) => a - b);
    const conversationId = `conv_${ids[0]}_${ids[1]}`;

    socket.emit('message:send', {
      receiverId: receptorId,
      text: mensaje,
      conversationId: conversationId
    });
  } catch (e) {
    console.error('Error al enviar mensaje:', e);
  }
}

export function joinConversation(userId) {
  if (!socket?.connected) return;
  const token = getToken();
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.sub;
    const ids = [currentUserId, userId].sort((a, b) => a - b);
    const conversationId = `conv_${ids[0]}_${ids[1]}`;
    socket.emit('conversation:join', conversationId);
  } catch (e) {
    console.error('Error:', e);
  }
}

export function startTyping(receptorId) {
  if (!socket?.connected) return;

  const token = getToken();
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.sub;
    const ids = [currentUserId, receptorId].sort((a, b) => a - b);
    const conversationId = `conv_${ids[0]}_${ids[1]}`;

    socket.emit('typing:start', {
      receiverId: receptorId,
      conversationId: conversationId
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

export function stopTyping(receptorId) {
  if (!socket?.connected) return;

  const token = getToken();
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUserId = payload.sub;
    const ids = [currentUserId, receptorId].sort((a, b) => a - b);
    const conversationId = `conv_${ids[0]}_${ids[1]}`;

    socket.emit('typing:stop', {
      receiverId: receptorId,
      conversationId: conversationId
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

export async function fetchConversations() {
  const token = getToken();
  if (!token) throw new Error('No autorizado');

  const res = await fetch(`${BASE_URL}/api/messages/conversations`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || 'Error obteniendo conversaciones');
  }

  // Transformar conversaciones para que usen user.id como id principal
  const conversations = (data.conversations || []).map(conv => ({
    id: conv.user.id,                    // ID del otro usuario (para cargar mensajes)
    conversationId: conv.id,             // ID de la conversación
    username: conv.user.username,
    nombre: conv.user.name,
    avatar_url: conv.user.avatar,
    lastMessage: conv.lastMessage?.text,
    lastMessageTime: conv.lastMessage?.createdAt
      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit'
        })
      : null,
    unreadCount: 0  // TODO: implementar contador de no leídos
  }));

  return conversations;
}

export async function fetchMessages(userId, { page = 1, limit = 50 } = {}) {
  const token = getToken();
  if (!token) throw new Error('No autorizado');

  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${BASE_URL}/api/messages/${userId}?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error || 'Error obteniendo mensajes');
  }
  // Retornar el objeto completo con conversationId y messages
  return data;
}
