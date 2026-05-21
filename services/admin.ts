import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/users/admin/stats/');
    return res.data;
  },
  getUsers: async (search = '', page = 1) => {
    const res = await api.get('/users/admin/users/', { params: { search, page } });
    return res.data;
  },
  toggleUser: async (id: number) => {
    const res = await api.post(`/users/admin/users/${id}/toggle/`);
    return res.data;
  },
  getCareers: async (search = '') => {
    const res = await api.get('/users/admin/careers/', { params: { search } });
    return res.data.results || res.data;
  },
  createCareer: async (data: any) => {
    const res = await api.post('/users/admin/careers/', data);
    return res.data;
  },
  updateCareer: async (id: number, data: any) => {
    const res = await api.patch(`/users/admin/careers/${id}/`, data);
    return res.data;
  },
  deleteCareer: async (id: number) => {
    await api.delete(`/users/admin/careers/${id}/`);
  },
  getSimulations: async (page = 1) => {
    const res = await api.get('/users/admin/simulations/', { params: { page } });
    return res.data;
  },
};
