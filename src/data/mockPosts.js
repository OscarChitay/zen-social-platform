// MOCK DATA - Reemplazar con llamadas al backend
// Este archivo contiene datos de ejemplo para desarrollo
// TODO: Crear servicio API para obtener posts reales

export const MOCK_POSTS = [
  {
    id: 1,
    user: {
      username: 'maria.design',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isVerified: true
    },
    timestamp: 'Hace 2 horas',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'
    },
    caption: '✨ Nuevo proyecto completado! Me encanta cómo quedó el diseño #design #creative',
    likes: 1234,
    isLiked: false,
    isSaved: false
  },
  {
    id: 2,
    user: {
      username: 'photographer_pro',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: false
    },
    timestamp: 'Hace 5 horas',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1682687221038-404670f09439?w=800&q=80'
    },
    caption: 'Atardecer mágico en la ciudad 🌆 #photography #sunset #citylife',
    likes: 3521,
    isLiked: true,
    isSaved: true
  },
  {
    id: 3,
    user: {
      username: 'food_heaven',
      avatar: 'https://i.pravatar.cc/150?img=25',
      isVerified: true
    },
    timestamp: 'Hace 8 horas',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
    },
    caption: 'Receta del día: Pasta carbonara auténtica 🍝 ¡Deliciosa! #food #cooking #italian',
    likes: 892,
    isLiked: false,
    isSaved: false
  },
  {
    id: 4,
    user: {
      username: 'tech_insights',
      avatar: 'https://i.pravatar.cc/150?img=33',
      isVerified: true
    },
    timestamp: 'Hace 12 horas',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    },
    caption: 'El futuro de la tecnología está aquí 🚀 #tech #innovation #future',
    likes: 2156,
    isLiked: false,
    isSaved: true
  },
  {
    id: 5,
    user: {
      username: 'fitness_journey',
      avatar: 'https://i.pravatar.cc/150?img=48',
      isVerified: false
    },
    timestamp: 'Hace 1 día',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'
    },
    caption: 'Día de entrenamiento completado 💪 ¡Siempre hacia adelante! #fitness #motivation #gym',
    likes: 1678,
    isLiked: true,
    isSaved: false
  }
];

// Función helper para simular delay de API
export const fetchPosts = async () => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_POSTS;
};
