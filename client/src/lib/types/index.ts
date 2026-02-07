export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PARTICIPANT';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}


