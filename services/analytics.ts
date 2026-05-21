import api from './api';
import { AnalyticsData } from '../types';

export const analyticsService = {
  getStudentAnalytics: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics/student/');
    return response.data;
  }
};
