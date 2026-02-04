'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    CalendarDaysIcon,
    TicketIcon,
    ClockIcon,
    MapPinIcon
} from '@heroicons/react/24/outline'
import DashboardCard from '@/components/dashboard/DashboardCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { getMyReservationsAction, Reservation } from '@/lib/actions/reservations'

import { useTranslation } from '@/hooks/useTranslation'

export default function ParticipantDashboardPage() {
    const { t, language } = useTranslation()
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const result = await getMyReservationsAction()
                if (result.success && result.data) {
                    setReservations(result.data)
                } else {
                    setError(result.error || t.participant.failedLoad)
                }
            } catch (err) {
                setError(t.participant.failedLoad)
                console.error('Error fetching reservations:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchReservations()
    }, [t.participant.failedLoad])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Filter for upcoming events (events that haven't passed)
    const upcomingReservations = reservations.filter((r) => {
        if (!r.event?.dateTime) return false
        return new Date(r.event.dateTime) > new Date() && r.status !== 'CANCELED'
    })

    // Get confirmed reservations
    const confirmedReservations = reservations.filter((r) => r.status === 'CONFIRMED')
    const pendingReservations = reservations.filter((r) => r.status === 'PENDING')

    if (loading) {
        return <DashboardLoading />
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">{t.dashboard.participantCards.welcome}</h1>
                <p className="text-secondary">{t.dashboard.participantCards.subtitle}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                    title={t.dashboard.participantCards.totalReservations}
                    value={reservations.length}
                    icon={<TicketIcon className="h-6 w-6" />}
                    description={t.dashboard.participantCards.allTime}
                />
                <DashboardCard
                    title={t.dashboard.participantCards.confirmed}
                    value={confirmedReservations.length}
                    icon={<CalendarDaysIcon className="h-6 w-6" />}
                    description={t.dashboard.participantCards.ready}
                />
                <DashboardCard
                    title={t.dashboard.participantCards.pending}
                    value={pendingReservations.length}
                    icon={<ClockIcon className="h-6 w-6" />}
                    description={t.dashboard.participantCards.awaiting}
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Upcoming Events */}
            <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">{t.dashboard.participantCards.upcomingEvents}</h3>
                    <Link
                        href="/dashboard/participant/reservations"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        {t.dashboard.participantCards.viewAll}
                    </Link>
                </div>

                {upcomingReservations.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingReservations.slice(0, 3).map((reservation) => (
                            <div
                                key={reservation.id}
                                className="flex items-start space-x-4 p-4 bg-secondary rounded-lg hover:bg-tertiary transition-colors"
                            >
                                {/* Event Image Placeholder */}
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-emerald-400 rounded-lg flex-shrink-0" />

                                {/* Event Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-primary truncate">
                                                {reservation.event?.title || 'Event'}
                                            </h4>
                                            <div className="flex items-center text-sm text-tertiary mt-1">
                                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                                {reservation.event?.dateTime && formatDate(reservation.event.dateTime)}
                                            </div>
                                            <div className="flex items-center text-sm text-tertiary mt-1">
                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                {reservation.event?.location || t.participant.locationTBD}
                                            </div>
                                        </div>
                                        <StatusBadge status={reservation.status} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CalendarDaysIcon className="h-12 w-12 text-tertiary mx-auto mb-3" />
                        <p className="text-tertiary mb-4">{t.dashboard.participantCards.noUpcoming}</p>
                        <Link href="/events" className="btn-primary">
                            {t.dashboard.participantCards.browseEvents}
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/events"
                    className="dashboard-card flex items-center space-x-4 hover:bg-secondary transition-colors"
                >
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                        <CalendarDaysIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-medium text-primary">{t.dashboard.participantCards.quickActions.browseTitle}</h4>
                        <p className="text-sm text-tertiary">{t.dashboard.participantCards.quickActions.browseDesc}</p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/participant/reservations"
                    className="dashboard-card flex items-center space-x-4 hover:bg-secondary transition-colors"
                >
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <TicketIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-medium text-primary">{t.dashboard.participantCards.quickActions.reservationsTitle}</h4>
                        <p className="text-sm text-tertiary">{t.dashboard.participantCards.quickActions.reservationsDesc}</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
