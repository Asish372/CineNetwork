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
};

export default contentService;
