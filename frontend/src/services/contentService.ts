import api from './api';

export const contentService = {
  getHomeContent: async () => {
    const response = await api.get('/content/home');
    return response.data;
  },

  getMovies: async () => {
    const response = await api.get('/content/movies');
    return response.data;
  },

  getShorts: async () => {
    const response = await api.get('/content/shorts');
    return response.data;
  },

  getContentById: async (id: string | number) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  searchContent: async (query: string) => {
    const response = await api.get(`/content/search?query=${query}`);
    return response.data;
  },

  addToWatchlist: async (contentId: string | number) => {
    const response = await api.post('/interactions/watchlist/add', { contentId });
    return response.data;
  },

  removeFromWatchlist: async (contentId: string | number) => {
    const response = await api.post('/interactions/watchlist/remove', { contentId });
    return response.data;
  },

  getWatchlist: async () => {
    const response = await api.get('/interactions/watchlist');
    return response.data;
  },

  checkWatchlistStatus: async (contentId: string | number) => {
    const response = await api.get(`/interactions/watchlist/${contentId}`);
    return response.data;
  },

  getCategoryContent: async (title: string) => {
    const response = await api.get(`/content/category/${title}`);
    return response.data;
  },

  getStreamUrl: async (contentId: string | number) => {
    try {
        const response = await api.get(`/video/url/${contentId}`);
        return response.data.videoUrl;
    } catch (error) {
        console.error("Error fetching stream URL:", error);
        return null;
    }
  },

  getLayout: async (page: 'home' | 'shorts') => {
    try {
      const response = await api.get(`/layout/${page}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${page} layout:`, error);
      return null;
    }
  },
  getPlans: async () => {
    const response = await api.get('/plans');
    return response.data;
  },
};

export default contentService;
