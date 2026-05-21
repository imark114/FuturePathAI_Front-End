import api from './api';

export const learningService = {
  getPaths: async () => {
    const res = await api.get('/learning/');
    return res.data.results || res.data;
  },

  getPath: async (id: number) => {
    const res = await api.get(`/learning/${id}/`);
    return res.data;
  },

  generatePath: async () => {
    const res = await api.post('/learning/generate/');
    return res.data;
  },

  completeStep: async (stepId: number) => {
    const res = await api.post(`/learning/steps/${stepId}/complete/`);
    return res.data;
  },
};
