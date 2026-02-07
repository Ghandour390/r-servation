import axiosInstance from '../axios';

export interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  maxCapacity: number;
  remainingPlaces: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
  managerId: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reservations?: Reservation[];
  _count?: {
    reservations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  dateTime: string;
  location: string;
  maxCapacity: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  dateTime?: string;
  location?: string;
  maxCapacity?: number;
}

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';
  ticketUrl?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export const eventsApi = {
  // Get all events (public - returns count, authenticated - returns details based on role)
  getAll: async (): Promise<Event[]> => {
    try {
      const response = await axiosInstance.get('/events');
      return response.data.data || response.data;
    } catch (error) {
      console.warn('API not available, using demo data');
      // Return demo data when API is not available
      return [
        {
          id: '1',
          title: 'Tech Conference 2024',
          description: 'Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge technologies.',
          dateTime: '2024-12-15T09:00:00Z',
          location: 'San Francisco Convention Center',
          maxCapacity: 500,
          remainingPlaces: 150,
          status: 'PUBLISHED' as const,
          managerId: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Digital Marketing Workshop',
          description: 'Learn the latest digital marketing strategies and tools to grow your business online.',
          dateTime: '2024-12-20T14:00:00Z',
          location: 'New York Business Center',
          maxCapacity: 100,
          remainingPlaces: 45,
          status: 'PUBLISHED' as const,
          managerId: '2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          title: 'Music Festival 2024',
          description: 'Experience amazing live music from top artists in a beautiful outdoor setting.',
          dateTime: '2024-12-25T18:00:00Z',
          location: 'Central Park, New York',
          maxCapacity: 2000,
          remainingPlaces: 800,
          status: 'PUBLISHED' as const,
          managerId: '3',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
        {
          id: '4',
          title: 'Startup Pitch Competition',
          description: 'Watch innovative startups pitch their ideas to top investors and win funding.',
          dateTime: '2024-12-30T10:00:00Z',
          location: 'Silicon Valley Hub',
          maxCapacity: 300,
          remainingPlaces: 120,
          status: 'PUBLISHED' as const,
          managerId: '4',
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
        },
        {
          id: '5',
          title: 'Photography Workshop',
          description: 'Master the art of photography with hands-on training from professional photographers.',
          dateTime: '2025-01-05T11:00:00Z',
          location: 'Los Angeles Art Studio',
          maxCapacity: 50,
          remainingPlaces: 20,
          status: 'PUBLISHED' as const,
          managerId: '5',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
        },
        {
          id: '6',
          title: 'Cooking Masterclass',
          description: 'Learn to cook gourmet meals with renowned chefs in this interactive cooking experience.',
          dateTime: '2025-01-10T16:00:00Z',
          location: 'Culinary Institute, Chicago',
          maxCapacity: 30,
          remainingPlaces: 12,
          status: 'PUBLISHED' as const,
          managerId: '6',
          createdAt: '2024-01-06T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
        },
      ];
    }
  },

  // Get event by ID (public - returns count, authenticated - returns details based on role)
  getById: async (id: string): Promise<Event> => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data.data;
  },

  // Create event (Admin only)
  create: async (data: CreateEventData): Promise<Event> => {
    const response = await axiosInstance.post('/events', data);
    return response.data.data;
  },

  // Update event (Admin only)
  update: async (id: string, data: UpdateEventData): Promise<Event> => {
    const response = await axiosInstance.put(`/events/${id}`, data);
    return response.data.data;
  },

  // Delete event (Admin only)
  delete: async (id: string): Promise<Event> => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data.data;
  },

  // Publish event (Admin only)
  publish: async (id: string): Promise<Event> => {
    const response = await axiosInstance.put(`/events/${id}/publish`);
    return response.data.data;
  },
};