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

export default function StatisticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await getStatisticsAction()
                if (result.success && result.data) {
                    setStats(result.data)
                } else {
                    setError(result.error || 'Failed to load statistics')
                }
            } catch (err) {
                setError('Failed to load statistics')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

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
                    Try Again
                </button>
            </div>
        )
    }

    const eventStats = [
        { label: 'Total Events', value: stats.totalEvents, color: 'bg-indigo-500' },
        { label: 'Published', value: stats.publishedEvents, color: 'bg-emerald-500' },
        { label: 'Draft', value: stats.draftEvents, color: 'bg-amber-500' },
        { label: 'Cancelled', value: stats.cancelledEvents, color: 'bg-red-500' },
    ]

    const reservationStats = [
        { label: 'Total Reservations', value: stats.totalReservations, color: 'bg-indigo-500' },
        { label: 'Confirmed', value: stats.confirmedReservations, color: 'bg-emerald-500' },
        { label: 'Pending', value: stats.pendingReservations, color: 'bg-amber-500' },
        { label: 'Cancelled', value: stats.cancelledReservations, color: 'bg-red-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Statistics</h1>
                <p className="text-secondary">Detailed analytics and metrics for your platform</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-secondary-100 shadow-lg     rounded-lg p-6">
                <DashboardCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={<CalendarDaysIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title="Total Reservations"
                    value={stats.totalReservations}
                    icon={<TicketIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<UsersIcon className="h-6 w-6" />}
                />
                <DashboardCard
                    title="Confirmation Rate"
                    value={`${stats.totalReservations > 0
                        ? Math.round((stats.confirmedReservations / stats.totalReservations) * 100)
                        : 0}%`}
                    icon={<ChartBarIcon className="h-6 w-6" />}
                />
            </div>

            {/* Event Statistics */}
            <div className="dashboard-card bg-secondary-100 shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Event Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                <h3 className="text-lg font-semibold text-primary mb-6">Reservation Statistics</h3>
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
                                {stats.totalReservations > 0 ? Math.round((stat.value / stats.totalReservations) * 100) : 0}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-primary mb-4">Recent Reservations</h3>
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
                        <p className="text-tertiary text-center py-4">No recent reservations</p>
                    )}
                </div>

                <div className="dashboard-card">
                    <h3 className="text-lg font-semibold text-primary mb-4">Upcoming Events</h3>
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
                                        <p className="text-xs text-tertiary">spots left</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-tertiary text-center py-4">No upcoming events</p>
                    )}
                </div>
            </div>
        </div>
    )
}
