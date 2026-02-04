import axiosInstance from '../axios';

export const appApi = {
  // Health check endpoint
  healthCheck: async (): Promise<string> => {
    const response = await axiosInstance.get('/');
    return response.data;
  },
};