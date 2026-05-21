import api from './api';
import { Career } from '../types';

export const careerService = {
  getCareers: async (): Promise<Career[]> => {
    const response = await api.get('/careers/');
    // If backend wraps in { data: ... } or just returns array, adjust accordingly.
    return response.data.results || response.data;
  },

  getCareerDetails: async (id: string): Promise<Career> => {
    const response = await api.get(`/careers/${id}/`);
    return response.data;
  }
};
