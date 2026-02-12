import axiosInstance from '../axios';
import { Reservation } from './events';

export interface UpdateReservationStatusData {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
}

export const reservationsApi = {
  // Create reservation for an event
  create: async (eventId: string): Promise<Reservation> => {
    const response = await axiosInstance.post(`/reservations/${eventId}`);
    return response.data.data;
  },

  // Get all reservations (Admin only)
  getAll: async (): Promise<Reservation[]> => {
    const response = await axiosInstance.get('/reservations');
    return response.data.data;
  },

  // Get current user's reservations
  getMy: async (): Promise<Reservation[]> => {
    const response = await axiosInstance.get('/reservations/my');
    return response.data.data;
  },

  // Get reservation by ID
  getById: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.get(`/reservations/${id}`);
    return response.data.data;
  },

  // Update reservation status (Admin only)
  updateStatus: async (id: string, data: UpdateReservationStatusData): Promise<Reservation> => {
    const response = await axiosInstance.put(`/reservations/${id}/status`, data);
    return response.data.data;
  },

  // Cancel reservation
  cancel: async (id: string): Promise<Reservation> => {
    const response = await axiosInstance.put(`/reservations/${id}/cancel`);
    return response.data.data;
  },
};