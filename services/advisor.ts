import api from './api';
import { AdvisorSession, AdvisorMessage } from '../types';

export const advisorService = {
  getSessions: async (): Promise<AdvisorSession[]> => {
    const response = await api.get('/advisor/sessions/');
    return response.data.results || response.data;
  },

  startSession: async (): Promise<AdvisorSession> => {
    const response = await api.post('/advisor/sessions/', {});
    return response.data;
  },

  getSession: async (sessionId: string): Promise<AdvisorSession> => {
    const response = await api.get(`/advisor/sessions/${sessionId}/`);
    return response.data;
  },

  sendMessage: async (sessionId: string, content: string): Promise<AdvisorMessage> => {
    const response = await api.post(`/advisor/sessions/${sessionId}/messages/`, { content });
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/advisor/sessions/${sessionId}/`);
  },
};
