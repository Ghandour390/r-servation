'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CalendarDaysIcon,
    MapPinIcon,
    UsersIcon,
    ArrowLeftIcon,
    TicketIcon
} from '@heroicons/react/24/outline'
import { getEventByIdAction, Event } from '@/lib/actions/events'
import { createReservationAction } from '@/lib/actions/reservations'
import { useAppSelector } from '@/lib/redux/hooks'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import { useTranslation } from '@/hooks/useTranslation'

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string
    const { t, language } = useTranslation()

    const { isAuthenticated, user } = useAppSelector((state) => state.auth)

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reserving, setReserving] = useState(false)
    const [reserveModal, setReserveModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const result = await getEventByIdAction(eventId)
                if (result.success && result.data) {
                    setEvent(result.data)
                } else {
                    setError(result.error || t.eventsPage.noEventsTitle)
                }
            } catch (err) {
                setError(t.eventsPage.errorLoading)
            } finally {
                setLoading(false)
            }
        }

        if (eventId) {
            fetchEvent()
        }
    }, [eventId, t])

    const handleReserve = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/events/${eventId}`)
            return
        }

        setReserving(true)
        try {
            const result = await createReservationAction(eventId)
            if (result.success) {
                setSuccessMessage(t.eventsPage.reservationSuccess)
                setReserveModal(false)
                // Update remaining places
                if (event) {
                    setEvent({ ...event, remainingPlaces: event.remainingPlaces - 1 })
                }
            } else {
                alert(result.error || t.common.error)
            }
        } catch (err) {
            alert(t.common.error)
        } finally {
            setReserving(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="pt-16 min-h-screen bg-primary">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-48 bg-tertiary rounded" />
                        <div className="h-64 bg-tertiary rounded-xl" />
                        <div className="h-32 bg-tertiary rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="pt-16 min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">{t.common.error}</h2>
                    <p className="text-secondary mb-6">{error || t.eventsPage.noEventsDesc}</p>
                    <Link href="/events" className="btn-primary">
                        {t.eventsPage.browseEvents}
                    </Link>
                </div>
            </div>
        )
    }

    const isEventPast = new Date(event.dateTime) < new Date()
    const isSoldOut = event.remainingPlaces <= 0
    const isParticipant = isAuthenticated && user?.role === 'PARTICIPANT'
    // const isAdmin       = isAuthentificated && user?.role ==='ADMIN'

    return (
        <div className="pt-16 min-h-screen bg-primary">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    href="/events"
                    className="inline-flex items-center text-secondary hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t.sidebar.backToHome}
                </Link>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg mb-6">
                        {successMessage}
                        <Link
                            href="/dashboard/participant/reservations"
                            className="underline ml-2"
                        >
                            {t.participant.myReservations}
                        </Link>
                    </div>
                )}

                {/* Event Image */}
                <div className="h-64 md:h-80 rounded-2xl relative mb-8 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                        src={event.imageUrl || '/event.avif'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute top-4 left-4">
                        <span className={event.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}>
                            {event.status}
                        </span>
                    </div>
                </div>

                {/* Event Content */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-primary mb-4">{event.title}</h1>
                            <p className="text-secondary leading-relaxed">{event.description}</p>
                        </div>

                        {/* Event Details */}
                        <div className="dashboard-card space-y-4">
                            <h3 className="font-semibold text-primary">{t.eventsPage.viewDetails}</h3>

                            <div className="flex items-center text-secondary">
                                <CalendarDaysIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <div>
                                    <p className="font-medium">{formatDate(event.dateTime)}</p>
                                    <p className="text-sm text-tertiary">{formatTime(event.dateTime)}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-secondary">
                                <MapPinIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <p>{event.location}</p>
                            </div>

                            <div className="flex items-center text-secondary">
                                <UsersIcon className="h-5 w-5 mr-3 text-indigo-500" />
                                <p>
                                    <span className="font-medium">{event.remainingPlaces}</span> / {event.maxCapacity} {t.eventsPage.spotsAvailable}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Reservation Card */}
                    <div className="md:col-span-1">
                        <div className="dashboard-card sticky top-24">
                            <div className="text-center mb-6">
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{t.eventsPage.free}</p>
                            </div>

                            {isEventPast ? (
                                <div className="text-center py-4">
                                    <p className="text-tertiary">{t.dashboard.statistics.noUpcomingEvents}</p>
                                </div>
                            ) : isSoldOut ? (
                                <div className="text-center py-4">
                                    <p className="text-red-500 font-medium">{t.eventsPage.soldOut}</p>
                                </div>
                            ) : successMessage ? (
                                <div className="text-center py-4">
                                    <p className="text-emerald-500 font-medium">{t.common.status.confirmed} ✓</p>
                                </div>
                            ) : isParticipant ? (
                                <button
                                    onClick={() => setReserveModal(true)}
                                    className="btn-primary w-full flex items-center justify-center space-x-2"
                                >
                                    <TicketIcon className="h-5 w-5" />
                                    <span>{t.eventsPage.reserve}</span>
                                </button>
                            ) : !isAuthenticated ? (
                                <button
                                    onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
                                    className="btn-outline w-full"
                                >
                                    {t.navbar.login}
                                </button>
                            ) :null }
                            <div className="mt-4 text-center">
                                <p className="text-xs text-tertiary">
                                    {event.remainingPlaces} {t.dashboard.statistics.spotsLeft}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservation Confirmation Modal */}
            <ConfirmModal
                isOpen={reserveModal}
                onClose={() => setReserveModal(false)}
                onConfirm={handleReserve}
                title={t.eventsPage.reserve}
                message={`${t.eventsPage.reserve} "${event.title}"?`}
                confirmText={t.common.confirm}
                cancelText={t.common.cancel}
                variant="info"
                isLoading={reserving}
            />
        </div>
    )
}

