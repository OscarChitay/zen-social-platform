// TODO: Reemplazar con datos reales del backend

/**
 * Perfil de usuario de demostración
 */
export const mockUserProfile = {
  id: 1,
  username: 'johndoe',
  name: 'John Doe',
  avatar: 'https://i.pravatar.cc/300?img=12',
  bio: '🎨 Diseñador UI/UX\n📸 Fotógrafo de viajes\n✨ Creando experiencias digitales\n🌍 Explorando el mundo',
  website: 'johndoe.com',
  isOnline: true,
  isVerified: false, // Badge de verificación
  isOwnProfile: true, // Cambiar a false para ver vista de otro usuario
  stats: {
    posts: 127,
    followers: '2.4K',
    following: 845
  }
};

/**
 * Posts del usuario de demostración
 */
export const mockUserPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=800&fit=crop',
    caption: 'Beautiful sunset 🌅',
    likes: 1234,
    comments: 89,
    hasMultipleImages: false,
    timeAgo: 'Hace 2 horas',
    location: 'Santorini, Greece',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: false
    },
    sampleComments: [
      {
        username: 'sophialee',
        avatar: 'https://i.pravatar.cc/150?img=1',
        text: 'Absolutely stunning! 😍',
        timeAgo: 'Hace 1h'
      },
      {
        username: 'alexmorgan',
        avatar: 'https://i.pravatar.cc/150?img=2',
        text: 'This is goals! When are we going?',
        timeAgo: 'Hace 45m'
      },
      {
        username: 'emmawilson',
        avatar: 'https://i.pravatar.cc/150?img=3',
        text: 'The colors are amazing! 🎨',
        timeAgo: 'Hace 30m'
      }
    ]
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800&h=800&fit=crop',
    caption: 'City lights at night',
    likes: 2156,
    comments: 143,
    hasMultipleImages: true,
    timeAgo: 'Hace 5 horas',
    location: 'New York, USA',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: [
      {
        username: 'michaelkim',
        avatar: 'https://i.pravatar.cc/150?img=6',
        text: 'NYC never sleeps! ⭐',
        timeAgo: 'Hace 4h'
      },
      {
        username: 'oliviabrown',
        avatar: 'https://i.pravatar.cc/150?img=5',
        text: 'I love the composition',
        timeAgo: 'Hace 3h'
      }
    ]
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&h=800&fit=crop',
    caption: 'Nature walk 🌿',
    likes: 987,
    comments: 56,
    hasMultipleImages: false,
    timeAgo: 'Hace 1 día',
    location: 'Pacific Northwest',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: [
      {
        username: 'jameschen',
        avatar: 'https://i.pravatar.cc/150?img=4',
        text: 'So peaceful 🌲',
        timeAgo: 'Hace 20h'
      }
    ]
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1682687220795-796d3f6f7000?w=800&h=800&fit=crop',
    caption: 'Coffee time ☕',
    likes: 1543,
    comments: 92,
    hasMultipleImages: false,
    timeAgo: 'Hace 2 días',
    location: 'Local Café',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: [
      {
        username: 'isabellarodriguez',
        avatar: 'https://i.pravatar.cc/150?img=7',
        text: 'Best way to start the day!',
        timeAgo: 'Hace 2d'
      }
    ]
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=800&h=800&fit=crop',
    caption: 'Mountain views',
    likes: 3201,
    comments: 187,
    hasMultipleImages: true,
    timeAgo: 'Hace 3 días',
    location: 'Swiss Alps',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: [
      {
        username: 'danielpark',
        avatar: 'https://i.pravatar.cc/150?img=8',
        text: 'Dream destination! 🏔️',
        timeAgo: 'Hace 3d'
      }
    ]
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1682687221176-620d4e72c617?w=800&h=800&fit=crop',
    caption: 'Urban exploration',
    likes: 1876,
    comments: 124,
    hasMultipleImages: false,
    timeAgo: 'Hace 4 días',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1682687218608-5e2522b04673?w=800&h=800&fit=crop',
    caption: 'Beach vibes 🏖️',
    likes: 2543,
    comments: 156,
    hasMultipleImages: true,
    timeAgo: 'Hace 5 días',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1682687218147-9806132dc697?w=800&h=800&fit=crop',
    caption: 'Street photography',
    likes: 1654,
    comments: 98,
    hasMultipleImages: false,
    timeAgo: 'Hace 6 días',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=800&h=800&fit=crop',
    caption: 'Golden hour magic',
    likes: 2987,
    comments: 201,
    hasMultipleImages: false,
    timeAgo: 'Hace 1 semana',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1682687221178-342110e3b085?w=800&h=800&fit=crop',
    caption: 'Minimalist design',
    likes: 1432,
    comments: 87,
    hasMultipleImages: false,
    timeAgo: 'Hace 1 semana',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1682687220866-c856f566f1bd?w=800&h=800&fit=crop',
    caption: 'Colorful patterns',
    likes: 1765,
    comments: 112,
    hasMultipleImages: true,
    timeAgo: 'Hace 2 semanas',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=800&h=800&fit=crop',
    caption: 'Workspace setup 💻',
    likes: 2234,
    comments: 145,
    hasMultipleImages: false,
    timeAgo: 'Hace 2 semanas',
    user: {
      username: 'johndoe',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    sampleComments: []
  }
];

/**
 * Posts guardados del usuario (para la pestaña "Guardados")
 */
export const mockSavedPosts = [
  {
    id: 101,
    image: 'https://images.unsplash.com/photo-1682687982360-3fbab65f9d50?w=400&h=400&fit=crop',
    caption: 'Inspiration saved',
    likes: 5432,
    comments: 234,
    hasMultipleImages: false
  },
  {
    id: 102,
    image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=400&fit=crop',
    caption: 'Design reference',
    likes: 3456,
    comments: 178,
    hasMultipleImages: true
  }
];
