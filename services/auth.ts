import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ access: string; refresh: string }>('/auth/login/', { email, password });

    // Fetch the real user profile using the received token
    const meResponse = await api.get<User>('/users/me/', {
      headers: { Authorization: `Bearer ${response.data.access}` }
    });

    return { user: meResponse.data, token: response.data.access, refreshToken: response.data.refresh };
  },

  register: async (email: string, password: string, first_name: string, last_name: string) => {
    const response = await api.post<ApiResponse<{ user_id: string; email: string }>>('/auth/register/', {
      email,
      password,
      first_name,
      last_name
    });
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await api.post<{ user: User, token: { access: string, refresh: string } }>('/auth/google/', {
      id_token: idToken
    });
    // Return user object, access token, and refresh token
    return { user: response.data.user, token: response.data.token.access, refreshToken: response.data.token.refresh };
  },

  refreshToken: async (refresh: string) => {
    const response = await api.post<{ access: string }>('/auth/refresh/', { refresh });
    return response.data.access;
  }
};
