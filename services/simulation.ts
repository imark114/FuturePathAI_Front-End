import api from './api';
import { Simulation } from '../types';

export const simulationService = {
  startSimulation: async (careerId: string): Promise<Simulation> => {
    const response = await api.post('/simulations/', { career_id: careerId });
    return response.data;
  },

  getSimulation: async (id: string): Promise<Simulation> => {
    const response = await api.get(`/simulations/${id}/`);
    return response.data;
  },

  submitSimulationAction: async (id: string, actionData: any): Promise<Simulation> => {
    const response = await api.post(`/simulations/${id}/action/`, actionData);
    return response.data;
  }
};
