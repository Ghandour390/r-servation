'use server'

import axiosInstance from '../axios'

export interface Event {
    id: string
    title: string
    description: string
    dateTime: string
    location: string
    maxCapacity: number
    remainingPlaces: number
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELED'
    managerId: string
    manager?: {
        id: string
        firstName: string
        lastName: string
        email: string
    }
    _count?: {
        reservations: number
    }
    imageUrl?: string
    createdAt: string
    updatedAt: string
}

export interface CreateEventData {
    title: string
    description: string
    dateTime: string
    location: string
    maxCapacity: number
}

export interface UpdateEventData {
    title?: string
    description?: string
    dateTime?: string
    location?: string
    maxCapacity?: number
}

export interface EventsResponse {
    success: boolean
    data?: Event[]
    error?: string
}

export interface EventResponse {
    success: boolean
    data?: Event
    error?: string
}

// Get all events (authenticated - includes all statuses for admin)
export async function getEventsAction(params?: { search?: string; category?: string }): Promise<EventsResponse> {
    try {
        const response = await axiosInstance.get('/events', { params })
        console.log('get event', response.data);
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get events error:', error.message)
        return {
            success: false,
            error: error.message || 'Failed to fetch events',
        }
    }
}

// Get all published events (public - no auth required)
export async function getPublicEventsAction(params?: { search?: string; category?: string }): Promise<EventsResponse> {
    try {
        const response = await axiosInstance.get('/events', { params })

        // Filter to only show published events for public view
        const events = (response.data.data || response.data) as Event[]
        console.log('event public', events);
        const publishedEvents = events.filter(e => e.status === 'PUBLISHED')
        console.log('events public', publishedEvents);
        return { success: true, data: publishedEvents }
    } catch (error: any) {
        console.error('Get public events error:', error.message)
        return {
            success: false,
            error: error.message || 'Failed to fetch public events',
        }
    }
}

// Get event by ID
export async function getEventByIdAction(id: string): Promise<EventResponse> {
    try {
        const response = await axiosInstance.get(`/events/${id}`)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to fetch event' }
    }
}

// Create event (Admin only)
export async function createEventAction(formData: FormData): Promise<EventResponse> {
    try {
        const response = await axiosInstance.post('/events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Create event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to create event' }
    }
}

// Update event (Admin only)
export async function updateEventAction(id: string, formData: FormData): Promise<EventResponse> {
    try {
        const response = await axiosInstance.put(`/events/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Update event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to update event' }
    }
}

// Delete event (Admin only)
export async function deleteEventAction(id: string): Promise<EventResponse> {
    try {
        const response = await axiosInstance.delete(`/events/${id}`)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Delete event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to delete event' }
    }
}

// Publish event (Admin only)
export async function publishEventAction(id: string): Promise<EventResponse> {
    try {
        const response = await axiosInstance.put(`/events/${id}/publish`, {})
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Publish event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to publish event' }
    }
}

// Cancel event (Admin only)
export async function cancelEventAction(id: string): Promise<EventResponse> {
    try {
        const response = await axiosInstance.put(`/events/${id}/cancel`, {})
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Cancel event error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to cancel event' }
    }
}
