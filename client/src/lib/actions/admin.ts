'use server'

import axiosInstance from '../axios'
import { getCurrentUser } from './auth'

export interface DashboardStats {
    totalEvents: number
    publishedEvents: number
    draftEvents: number
    cancelledEvents: number
    totalReservations: number
    confirmedReservations: number
    pendingReservations: number
    cancelledReservations: number
    totalUsers: number
    recentReservations: {
        id: string
        userName: string
        eventTitle: string
        eventImageUrl?: string
        status: string
        createdAt: string
    }[]
    upcomingEvents: {
        id: string
        title: string
        dateTime: string
        remainingPlaces: number
        maxCapacity: number
        imageUrl?: string
    }[]
}

export interface StatsResponse {
    success: boolean
    data?: DashboardStats
    error?: string
}

export interface ExportResponse {
    success: boolean
    data?: string // CSV or JSON string
    error?: string
}

// Check if current user is admin
export async function isAdminAction(): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === 'ADMIN'
}

// Get dashboard statistics (Admin only)
export async function getStatisticsAction(): Promise<StatsResponse> {
    try {
        const user = await getCurrentUser()

        if (user?.role !== 'ADMIN') {
            return { success: false, error: 'Admin access required' }
        }

        const response = await axiosInstance.get('/admin/stats')
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get statistics error:', error.message)
        // Return demo stats on error
        return { success: false, error: error.message || 'Failed to fetch statistics' }
    }
}

// Export data as CSV (Admin only)
export async function exportEventsAction(): Promise<ExportResponse> {
    try {
        const user = await getCurrentUser()

        if (user?.role !== 'ADMIN') {
            return { success: false, error: 'Admin access required' }
        }

        const response = await axiosInstance.get('/events')
        const events = response.data.data || response.data || []

        // Convert to CSV
        const headers = ['ID', 'Title', 'Description', 'Date', 'Location', 'Max Capacity', 'Remaining Places', 'Status']
        const rows = events.map((e: { id: string; title: string; description: string; dateTime: string; location: string; maxCapacity: number; remainingPlaces: number; status: string }) => [
            e.id,
            `"${e.title.replace(/"/g, '""')}"`,
            `"${e.description.replace(/"/g, '""')}"`,
            e.dateTime,
            `"${e.location.replace(/"/g, '""')}"`,
            e.maxCapacity,
            e.remainingPlaces,
            e.status,
        ])

        const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n')

        return { success: true, data: csv }
    } catch (error: any) {
        console.error('Export events error:', error.message)
        return { success: false, error: 'Failed to export data' }
    }
}

// Export reservations as CSV (Admin only)
export async function exportReservationsAction(): Promise<ExportResponse> {
    try {
        const user = await getCurrentUser()

        if (user?.role !== 'ADMIN') {
            return { success: false, error: 'Admin access required' }
        }

        const response = await axiosInstance.get('/reservations')
        const reservations = response.data.data || response.data || []

        // Convert to CSV
        const headers = ['ID', 'User', 'Email', 'Event', 'Status', 'Created At']
        const rows = reservations.map((r: { id: string; user?: { firstName: string; lastName: string; email: string }; event?: { title: string }; status: string; createdAt: string }) => [
            r.id,
            `"${r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown'}"`,
            r.user?.email || '',
            `"${r.event?.title?.replace(/"/g, '""') || 'Unknown'}"`,
            r.status,
            r.createdAt,
        ])

        const csv = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n')

        return { success: true, data: csv }
    } catch (error: any) {
        console.error('Export reservations error:', error.message)
        return { success: false, error: 'Failed to export data' }
    }
}
