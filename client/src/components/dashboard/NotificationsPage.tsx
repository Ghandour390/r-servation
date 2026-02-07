'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BellIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  NotificationItem,
  NotificationType,
} from '@/lib/actions/notifications'
import { useTranslation } from '@/hooks/useTranslation'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const lastCreatedAt = useMemo(() => {
    if (!notifications.length) return undefined
    return notifications[notifications.length - 1]?.createdAt
  }, [notifications])

  const fetchNotifications = async (options?: { reset?: boolean }) => {
    const isReset = options?.reset ?? false
    if (isReset) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const result = await getNotificationsAction({
        limit: PAGE_SIZE,
        before: isReset ? undefined : lastCreatedAt,
        unreadOnly,
      })

      if (result.success && result.data) {
        setNotifications((prev) => (isReset ? result.data! : [...prev, ...result.data!]))
        setHasMore(result.data.length === PAGE_SIZE)
      } else {
        setError(result.error || 'Failed to load notifications')
      }
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchNotifications({ reset: true })
  }, [unreadOnly])

  const handleMarkRead = async (id: string) => {
    setActionLoading(true)
    const result = await markNotificationReadAction(id)
    if (result.success) {
      setNotifications((prev) => {
        if (unreadOnly) {
          return prev.filter((n) => n.id !== id)
        }
        return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      })
    } else {
      setError(result.error || 'Failed to mark as read')
    }
    setActionLoading(false)
  }

  const handleMarkAllRead = async () => {
    setActionLoading(true)
    const result = await markAllNotificationsReadAction()
    if (result.success) {
      setNotifications((prev) => (unreadOnly ? [] : prev.map((n) => ({ ...n, isRead: true }))))
    } else {
      setError(result.error || 'Failed to mark all as read')
    }
    setActionLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTypeLabel = (type: NotificationType) => {
    if (type === 'RESERVATION_REQUEST') return t.notifications?.types?.reservationRequest || 'New reservation'
    return t.notifications?.types?.reservationConfirmed || 'Reservation confirmed'
  }

  if (loading) {
    return (
      <div className="dashboard-card p-8 flex items-center justify-center text-tertiary">
        {t.common?.loading || 'Loading...'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t.notifications?.title || 'Notifications'}
          </h1>
          <p className="text-secondary">
            {t.notifications?.subtitle || 'Stay up to date with reservations and updates'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchNotifications({ reset: true })}
            className="px-4 py-2 rounded-lg border border-primary text-secondary hover:text-primary hover:bg-secondary transition-colors flex items-center space-x-2"
            disabled={actionLoading}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>{t.notifications?.refresh || 'Refresh'}</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            disabled={actionLoading || notifications.length === 0}
          >
            <CheckIcon className="h-4 w-4" />
            <span>{t.notifications?.markAll || 'Mark all as read'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-secondary">
        <input
          id="unreadOnly"
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
          className="h-4 w-4 rounded border-primary text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="unreadOnly">{t.notifications?.unreadOnly || 'Unread only'}</label>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="dashboard-card p-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-tertiary py-12">
            <BellIcon className="h-10 w-10 mb-3" />
            <p>{t.notifications?.empty || 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-primary">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between py-4 ${notification.isRead ? '' : 'bg-indigo-500/5 rounded-lg px-3'}`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                      {getTypeLabel(notification.type)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary">{notification.title}</h3>
                  <p className="text-sm text-secondary">{notification.message}</p>
                  <p className="text-xs text-tertiary mt-1">{formatDate(notification.createdAt)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-sm text-indigo-500 hover:text-indigo-600"
                    >
                      {t.notifications?.open || 'Open'}
                    </Link>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="text-sm text-secondary hover:text-primary"
                      disabled={actionLoading}
                    >
                      {t.notifications?.markRead || 'Mark read'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-6">
            <button
              onClick={() => fetchNotifications()}
              className="px-4 py-2 rounded-lg border border-primary text-secondary hover:text-primary hover:bg-secondary transition-colors disabled:opacity-50"
              disabled={loadingMore}
            >
              {loadingMore ? (t.common?.loading || 'Loading...') : (t.notifications?.loadMore || 'Load more')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
