'use server'

import axiosInstance from '../axios'

export interface Reservation {
    id: string
    userId: string
    eventId: string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REFUSED'
    ticketUrl?: string
    user?: {
        id: string
        firstName: string
        lastName: string
        email: string
    }
    event?: {
        id: string
        title: string
        dateTime: string
        location: string
    }
    createdAt: string
    updatedAt: string
}

export interface ReservationsResponse {
    success: boolean
    data?: Reservation[]
    error?: string
}

export interface ReservationResponse {
    success: boolean
    data?: Reservation
    error?: string
}

// Create reservation
export async function createReservationAction(eventId: string): Promise<ReservationResponse> {
    try {
        const response = await axiosInstance.post(`/reservations/${eventId}`, {})
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Create reservation error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to create reservation' }
    }
}

// Get all reservations (Admin only)
export async function getAllReservationsAction(): Promise<ReservationsResponse> {
    try {
        const response = await axiosInstance.get('/reservations')
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get all reservations error:', error.message)
        return {
            success: false,
            error: error.message || 'Failed to fetch reservations',
        }
    }
}

// Get my reservations (Participant)
export async function getMyReservationsAction(): Promise<ReservationsResponse> {
    try {
        const response = await axiosInstance.get('/reservations/my')
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get my reservations error:', error.message)
        // Return demo data on error
        return {
            success: false,
            error: error.message || 'Failed to fetch my reservations',
        }
    }
}

// Get reservation by ID
export async function getReservationByIdAction(id: string): Promise<ReservationResponse> {
    try {
        const response = await axiosInstance.get(`/reservations/${id}`)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get reservation error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to fetch reservation' }
    }
}

// Update reservation status (Admin only)
export async function updateReservationStatusAction(
    id: string,
    status: 'CONFIRMED' | 'REFUSED' | 'CANCELED'
): Promise<ReservationResponse> {
    try {
        const response = await axiosInstance.put(`/reservations/${id}/status`, { status })
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Update reservation status error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to update reservation' }
    }
}

// Cancel reservation
export async function cancelReservationAction(id: string): Promise<ReservationResponse> {
    try {
        const response = await axiosInstance.put(`/reservations/${id}/cancel`, {})
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Cancel reservation error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Failed to cancel reservation' }
    }
}

// Download ticket
export async function downloadTicketAction(reservationId: string): Promise<{
    success: boolean
    url?: string
    error?: string
}> {
    try {
        const response = await axiosInstance.get(`/reservations/${reservationId}/ticket`)
        const data = response.data.data || response.data
        return { success: true, url: data.ticketUrl || data.url }
    } catch (error: any) {
        console.error('Download ticket error:', error.message)
        return { success: false, error: error.response?.data?.message || 'Ticket not available' }
    }
}
