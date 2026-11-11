import { useState, useRef, useEffect } from 'react';
import { Search, Send, ArrowLeft, Check, CheckCheck, MoreVertical, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as messageService from '../services/messageService';
import { searchUsers } from '../services/searchService';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar Socket.IO y cargar conversaciones
  useEffect(() => {
    if (!user) {
      messageService.disconnectSocket();
      return;
    }

    const socket = messageService.initializeSocket();
    if (!socket) return;

    // Listener para mensajes recibidos
    const handleMessageReceived = (message) => {
      // Backend retorna: {id, senderId, receiverId, text, createdAt, read, sender}
      setMessages(prev => {
        // Solo agregar si no existe ya (evitar duplicados)
        if (prev.some(m => m.id === message.id)) return prev;

        return [...prev, {
          id: message.id,
          text: message.text,
          timestamp: new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit'
          }),
          isSent: message.senderId === user.id,
          isRead: message.read
        }];
      });
      loadConversations();
    };

    // Listener para confirmación de mensaje enviado
    const handleMessageSent = (message) => {
      // Actualizar el mensaje temporal con el ID real y datos del servidor
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        // Si el último mensaje es temporal (id tipo timestamp), reemplazarlo
        if (lastMsg && lastMsg.id > 1000000000000) {
          return [...prev.slice(0, -1), {
            id: message.id,
            text: message.text,
            timestamp: new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit'
            }),
            isSent: true,
            isRead: message.read
          }];
        }
        return prev;
      });
      loadConversations();
    };

    // Listener para typing
    const handleUserTyping = (data) => {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    messageService.onMessageReceived(handleMessageReceived);
    messageService.onMessageSent(handleMessageSent);
    messageService.onUserTyping(handleUserTyping);
    messageService.onUserStoppedTyping(handleUserStoppedTyping);

    loadConversations();

    // NO desconectar en cleanup - solo cuando no hay usuario
    return () => {
      // Los listeners se limpian automáticamente si se desconecta
    };
  }, [user]);

  // Cargar mensajes cuando cambia el chat activo
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      messageService.joinConversation(activeChat.id);
    }
  }, [activeChat]);

  const loadConversations = async () => {
    try {
      const convs = await messageService.fetchConversations();
      setConversations(convs);
      if (!activeChat && convs.length > 0) {
        setActiveChat(convs[0]);
      }
    } catch (e) {
      console.error('Error cargando conversaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await messageService.fetchMessages(userId);
      // Backend retorna: { ok, conversationId, messages: [{id, senderId, receiverId, text, createdAt, read, sender, isOwn}] }
      const msgs = data.messages || [];
      setMessages(msgs.map(m => ({
        id: m.id,
        text: m.text,
        timestamp: new Date(m.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit'
        }),
        isSent: m.senderId === user.id,
        isRead: m.read
      })));
    } catch (e) {
      console.error('Error cargando mensajes:', e);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    const tempMessage = {
      id: Date.now(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
      }),
      isSent: true,
      isRead: false
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageText = newMessage;
    setNewMessage('');

    try {
      messageService.sendMessage(activeChat.id, messageText);
      messageService.stopTyping(activeChat.id);
    } catch (e) {
      console.error('Error enviando mensaje:', e);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!activeChat) return;

    messageService.startTyping(activeChat.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      messageService.stopTyping(activeChat.id);
    }, 1000);
  };

  const handleSearchUsers = async (query) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const data = await searchUsers(query);
      // searchUsers retorna { items: [] }, no un array directo
      const users = data.items || [];
      // Filtrar el usuario actual
      setSearchResults(users.filter(u => u.id !== user.id));
    } catch (e) {
      console.error('Error buscando usuarios:', e);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleStartChat = (selectedUser) => {
    // Crear objeto de conversación temporal
    // searchUsers retorna: {id, username, name, avatar, bio}
    const newChat = {
      id: selectedUser.id,
      username: selectedUser.username,
      nombre: selectedUser.name,
      avatar_url: selectedUser.avatar,
      lastMessage: null,
      lastMessageTime: null
    };

    setActiveChat(newChat);
    setShowNewChat(false);
    setUserSearchQuery('');
    setSearchResults([]);

    // Agregar a conversaciones si no existe
    const exists = conversations.find(c => c.id === selectedUser.id);
    if (!exists) {
      setConversations(prev => [newChat, ...prev]);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)] bg-light-bg dark:bg-dark-bg">
      {/* Sidebar - Lista de conversaciones */}
      <aside className={`${activeChat && !showNewChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mensajes</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors"
              title="Nueva conversación"
            >
              {showNewChat ? (
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <UserPlus className="w-5 h-5 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={showNewChat ? userSearchQuery : searchQuery}
              onChange={(e) => showNewChat ? handleSearchUsers(e.target.value) : setSearchQuery(e.target.value)}
              placeholder={showNewChat ? "Buscar usuarios..." : "Buscar conversaciones..."}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Lista de conversaciones o resultados de búsqueda */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {showNewChat ? (
            // Búsqueda de nuevos usuarios
            <div>
              {searchingUsers ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <UserPlus className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {userSearchQuery ? 'No se encontraron usuarios' : 'Busca usuarios para iniciar un chat'}
                  </p>
                </div>
              ) : (
                searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChat(u)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                  >
                    <Avatar
                      src={u.avatar}
                      name={u.name}
                      username={u.username}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {u.name || u.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        @{u.username}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            // Lista de conversaciones existentes
            filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-gray-500 dark:text-gray-400">No hay conversaciones</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-3 text-primary hover:underline text-sm"
                >
                  Iniciar nueva conversación
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveChat(conv); setShowNewChat(false); }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors ${
                    activeChat?.id === conv.id ? 'bg-gray-100 dark:bg-dark-bg' : ''
                  }`}
                >
                  <Avatar
                    src={conv.avatar_url}
                    name={conv.nombre}
                    username={conv.username}
                    size="lg"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conv.nombre || conv.username}
                      </h3>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )
          )}
        </div>
      </aside>

      {/* Área de chat */}
      <main className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-dark-surface`}>
        {activeChat ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center gap-3">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar
                src={activeChat.avatar_url}
                name={activeChat.nombre}
                username={activeChat.username}
                size="md"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {activeChat.nombre || activeChat.username}
                </h3>
                {typingUsers.has(activeChat.id) && (
                  <p className="text-xs text-primary">Escribiendo...</p>
                )}
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isSent
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      message.isSent ? 'text-white/70 justify-end' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp}</span>
                      {message.isSent && (
                        message.isRead ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Escribe un mensaje..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full flex items-center justify-center">
                <Send className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Tus mensajes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona una conversación para empezar a chatear
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
