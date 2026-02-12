import axiosInstance from '../axios'

export type NotificationType = 'RESERVATION_REQUEST' | 'RESERVATION_CONFIRMED'

export interface NotificationItem {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationsResponse {
  success: boolean
  data?: NotificationItem[]
  error?: string
}

export interface NotificationResponse {
  success: boolean
  data?: NotificationItem
  error?: string
}

export interface UnreadCountResponse {
  success: boolean
  count?: number
  error?: string
}

export async function getNotificationsAction(params?: {
  limit?: number
  before?: string
  unreadOnly?: boolean
}): Promise<NotificationsResponse> {
  try {
    const response = await axiosInstance.get('/notifications', { params })
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Get notifications error:', error.message)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch notifications',
    }
  }
}

export async function markNotificationReadAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosInstance.patch(`/notifications/${id}/read`)
    return { success: true }
  } catch (error: any) {
    console.error('Mark notification read error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to mark as read' }
  }
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosInstance.post('/notifications/read-all')
    return { success: true }
  } catch (error: any) {
    console.error('Mark all notifications read error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to mark all as read' }
  }
}

export async function getUnreadNotificationsCountAction(): Promise<UnreadCountResponse> {
  try {
    const response = await axiosInstance.get('/notifications/unread-count')
    const data = response.data.data || response.data
    return { success: true, count: typeof data.count === 'number' ? data.count : 0 }
  } catch (error: any) {
    const isNetworkError = !error?.response || error?.message === 'Network Error'
    if (isNetworkError) {
      return { success: true, count: 0 }
    }
    console.error('Get unread notifications count error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to fetch unread count' }
  }
}
