'use client'

import { useState, useEffect } from 'react'
import {
    CalendarDaysIcon,
    TicketIcon,
    UsersIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline'
import DashboardCard from '@/components/dashboard/DashboardCard'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { getStatisticsAction, DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function StatisticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { t } = useTranslation()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await getStatisticsAction()
                if (result.success && result.data) {
                    setStats(result.data)
                } else {
                    setError(result.error || t.common.error)
                }
            } catch (err) {
                setError(t.common.error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [t])

    if (loading) {
        return <DashboardLoading />
    }

    if (error || !stats) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 btn-primary"
                >
                    {t.common.tryAgain}
                </button>
            </div>
        )
    }

    const eventStats = [
        { label: t.dashboard.totalEvents, value: stats.totalEvents, color: 'bg-indigo-500' },
        { label: t.dashboard.statistics.published, value: stats.publishedEvents, color: 'bg-emerald-500' },
        { label: t.dashboard.statistics.draft, value: stats.draftEvents, color: 'bg-amber-500' },
        { label: t.dashboard.statistics.cancelled, value: stats.cancelledEvents, color: 'bg-red-500' },
    ]

    const reservationStats = [
        { label: t.dashboard.totalReservations, value: stats.totalReservations, color: 'bg-indigo-500' },
        { label: t.dashboard.statistics.confirmed, value: stats.confirmedReservations, color: 'bg-emerald-500' },
        { label: t.dashboard.statistics.pending, value: stats.pendingReservations, color: 'bg-amber-500' },
        { label: t.dashboard.statistics.cancelled, value: stats.cancelledReservations, color: 'bg-red-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    {t.dashboard.statistics.title}
                </h1>
                <p className="text-secondary">{t.dashboard.statistics.description}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title={t.dashboard.totalEvents}
                    value={stats.totalEvents}
                    icon={<CalendarDaysIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title={t.dashboard.totalReservations}
                    value={stats.totalReservations}
                    icon={<TicketIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title={t.dashboard.totalUsers}
                    value={stats.totalUsers}
                    icon={<UsersIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title={t.dashboard.statistics.confirmationRate}
                    value={`${stats.totalReservations > 0
                        ? Math.round((stats.confirmedReservations / stats.totalReservations) * 100)
                        : 0}%`}
                    icon={<ChartBarIcon className="h-6 w-6" />}
                />
            </div>

            {/* Event Statistics */}
            <div className="dashboard-card">
                <h3 className="text-lg font-semibold text-primary mb-6">{t.dashboard.statistics.eventStatistics}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ">
                    {eventStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-tertiary">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-4">
                    {eventStats.slice(1).map((stat) => (
                        <div key={stat.label} className="flex items-center space-x-4">
                            <div className="w-24 text-sm text-secondary">{stat.label}</div>
                            <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${stats.totalEvents > 0 ? (stat.value / stats.totalEvents) * 100 : 0}%` }}
                                />
                            </div>
                            <div className="w-12 text-left text-sm font-medium text-primary">
                                {stat.value}
                            </div>
                            <div className="w-12 text-right text-sm font-medium text-primary">
                                {stats.totalEvents > 0 ? Math.round((stat.value / stats.totalEvents) * 100) : 0}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reservation Statistics */}
            <div className="dashboard-card">
                <h3 className="text-lg font-semibold text-primary mb-6">{t.dashboard.statistics.reservationStatistics}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {reservationStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-tertiary">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-4">
                    {reservationStats.slice(1).map((stat) => (
                        <div key={stat.label} className="flex items-center space-x-4">
                            <div className="w-24 text-sm text-secondary">{stat.label}</div>
                            <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${stats.totalReservations > 0 ? (stat.value / stats.totalReservations) * 100 : 0}%` }}
                                />
                            </div>
                            <div className="w-12 text-left text-sm font-medium text-primary">
                                {stat.value}
                            </div>
                            <div className="w-12 text-right text-sm font-medium text-primary">
                                {stats.totalReservations > 0 ? Math.round((stat.value / stats.totalReservations) * 100) : 0}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-primary mb-4">{t.dashboard.statistics.recentReservations}</h3>
                    {stats.recentReservations.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentReservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="flex items-center justify-between py-2 border-b border-primary last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-primary">{reservation.userName}</p>
                                        <p className="text-xs text-tertiary">{reservation.eventTitle}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${reservation.status === 'CONFIRMED'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        : reservation.status === 'PENDING'
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        }`}>
                                        {reservation.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-tertiary text-center py-4">{t.dashboard.statistics.noRecentReservations}</p>
                    )}
                </div>

                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-primary mb-4">{t.dashboard.statistics.upcomingEvents}</h3>
                    {stats.upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                            {stats.upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between py-2 border-b border-primary last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-primary">{event.title}</p>
                                        <p className="text-xs text-tertiary">
                                            {new Date(event.dateTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-primary">
                                            {event.remainingPlaces}/{event.maxCapacity}
                                        </p>
                                        <p className="text-xs text-tertiary">{t.dashboard.statistics.spotsLeft}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-tertiary text-center py-4">{t.dashboard.statistics.noUpcomingEvents}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
