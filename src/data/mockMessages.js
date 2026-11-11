// TODO: Reemplazar con datos reales del backend

/**
 * Conversaciones de demostración
 */
export const mockConversations = [
  {
    id: 1,
    user: {
      username: 'sophialee',
      name: 'Sophia Lee',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isOnline: true
    },
    lastMessage: {
      text: 'Sounds great! See you then 🎉',
      timestamp: '2m',
      isRead: true,
      isSent: false
    },
    unreadCount: 0
  },
  {
    id: 2,
    user: {
      username: 'alexmorgan',
      name: 'Alex Morgan',
      avatar: 'https://i.pravatar.cc/150?img=2',
      isOnline: true
    },
    lastMessage: {
      text: 'You: Thanks for sharing!',
      timestamp: '1h',
      isRead: true,
      isSent: true
    },
    unreadCount: 0
  },
  {
    id: 3,
    user: {
      username: 'emmawilson',
      name: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      isOnline: false
    },
    lastMessage: {
      text: 'That photo is amazing! Where did you take it?',
      timestamp: '3h',
      isRead: false,
      isSent: false
    },
    unreadCount: 2
  },
  {
    id: 4,
    user: {
      username: 'jameschen',
      name: 'James Chen',
      avatar: 'https://i.pravatar.cc/150?img=4',
      isOnline: false
    },
    lastMessage: {
      text: 'You: Let me know when you\'re free',
      timestamp: '1d',
      isRead: false,
      isSent: true
    },
    unreadCount: 0
  },
  {
    id: 5,
    user: {
      username: 'oliviabrown',
      name: 'Olivia Brown',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isOnline: true
    },
    lastMessage: {
      text: 'Perfect! I\'ll bring the camera 📸',
      timestamp: '2d',
      isRead: true,
      isSent: false
    },
    unreadCount: 0
  },
  {
    id: 6,
    user: {
      username: 'michaelkim',
      name: 'Michael Kim',
      avatar: 'https://i.pravatar.cc/150?img=6',
      isOnline: false
    },
    lastMessage: {
      text: 'You: Check out my latest post!',
      timestamp: '3d',
      isRead: true,
      isSent: true
    },
    unreadCount: 0
  },
  {
    id: 7,
    user: {
      username: 'isabellarodriguez',
      name: 'Isabella Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=7',
      isOnline: true
    },
    lastMessage: {
      text: 'Love it! Can\'t wait to try it myself',
      timestamp: '4d',
      isRead: true,
      isSent: false
    },
    unreadCount: 0
  },
  {
    id: 8,
    user: {
      username: 'danielpark',
      name: 'Daniel Park',
      avatar: 'https://i.pravatar.cc/150?img=8',
      isOnline: false
    },
    lastMessage: {
      text: 'You: See you at the meetup!',
      timestamp: '5d',
      isRead: true,
      isSent: true
    },
    unreadCount: 0
  }
];

/**
 * Mensajes de demostración para el chat activo
 */
export const mockMessages = [
  {
    id: 1,
    text: 'Hey! How are you doing?',
    timestamp: '10:30 AM',
    isSent: false,
    isRead: true
  },
  {
    id: 2,
    text: 'I\'m great! Just finished editing some photos',
    timestamp: '10:32 AM',
    isSent: true,
    isRead: true
  },
  {
    id: 3,
    text: 'Oh nice! Can\'t wait to see them',
    timestamp: '10:33 AM',
    isSent: false,
    isRead: true
  },
  {
    id: 4,
    text: 'Sure! I\'ll share them soon',
    timestamp: '10:35 AM',
    isSent: true,
    isRead: true
  },
  {
    id: 5,
    text: 'By the way, are you free this weekend?',
    timestamp: '10:36 AM',
    isSent: false,
    isRead: true
  },
  {
    id: 6,
    text: 'Yeah! What did you have in mind?',
    timestamp: '10:38 AM',
    isSent: true,
    isRead: true
  },
  {
    id: 7,
    text: 'Maybe we could do a photo session at the park?',
    timestamp: '10:40 AM',
    isSent: false,
    isRead: true
  },
  {
    id: 8,
    text: 'Sounds great! See you then 🎉',
    timestamp: '10:42 AM',
    isSent: false,
    isRead: true
  }
];
