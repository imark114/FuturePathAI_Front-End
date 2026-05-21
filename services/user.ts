import api from './api';
import { User } from '../types';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    return response.data;
  },

  updateMe: async (data: Partial<User & { major?: string, graduation_year?: string, target_roles?: string }>): Promise<User> => {
    const response = await api.patch<User>('/users/me/', data);
    return response.data;
  }
};
