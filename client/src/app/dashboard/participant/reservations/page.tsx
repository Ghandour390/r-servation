'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    CalendarDaysIcon,
    MapPinIcon,
    ArrowDownTrayIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import DashboardLoading from '@/components/loading/DashboardLoading'
import {
    getMyReservationsAction,
    cancelReservationAction,
    downloadTicketAction,
    Reservation
} from '@/lib/actions/reservations'
import { useTranslation } from '@/hooks/useTranslation'

export default function ParticipantReservationsPage() {
    const router = useRouter()
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; reservation: Reservation | null }>({
        isOpen: false,
        reservation: null,
    })
    const [actionLoading, setActionLoading] = useState(false)
    const { t } = useTranslation()

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

    useEffect(() => {
        fetchReservations()
    }, [t])

    const handleCancel = async () => {
        if (!cancelModal.reservation) return

        setActionLoading(true)
        try {
            const result = await cancelReservationAction(cancelModal.reservation.id)
            if (result.success) {
                setReservations(
                    reservations.filter((r) => r.id !== cancelModal.reservation?.id)
                )
                setCancelModal({ isOpen: false, reservation: null })
            } else {
                alert(result.error || t.participant.failedCancel)
            }
        } catch (err) {
            alert(t.participant.failedCancel)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDownloadTicket = async (reservation: Reservation) => {
        try {
            const result = await downloadTicketAction(reservation.id)
            if (result.success && result.url) {
                // Trigger a real browser download (saved to user's Downloads folder by default browser settings)
                const link = document.createElement('a')
                link.href = result.url
                link.download = ''
                link.rel = 'noopener'
                document.body.appendChild(link)
                link.click()
                link.remove()
            } else {
                const msg = result.error || t.participant.ticketNotAvailable
                alert(msg)
                if (msg.toLowerCase().includes('profile photo')) {
                    router.push('/dashboard/profile')
                }
            }
        } catch (err) {
            alert(t.participant.failedDownload)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const isUpcoming = (dateString: string) => {
        return new Date(dateString) > new Date()
    }

    if (loading) {
        return <DashboardLoading />
    }

    // Group reservations: upcoming first, then past
    const upcomingReservations = reservations.filter(
        (r) => r.event?.dateTime && isUpcoming(r.event.dateTime) && r.status !== 'CANCELED'
    )
    const pastAndCancelledReservations = reservations.filter(
        (r) => !r.event?.dateTime || !isUpcoming(r.event.dateTime) || r.status === 'CANCELED'
    )

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">{t.participant.myReservations}</h1>
                <p className="text-secondary">{t.participant.reservationsDesc}</p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {reservations.length === 0 ? (
                <div className="dashboard-card text-center py-12">
                    <CalendarDaysIcon className="h-16 w-16 text-tertiary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-primary mb-2">{t.participant.noReservationsYet}</h3>
                    <p className="text-secondary mb-6">{t.participant.noReservationsDesc}</p>
                    <Link href="/events" className="btn-primary">
                        {t.home.browseEvents}
                    </Link>
                </div>
            ) : (
                <>
                    {/* Upcoming Reservations */}
                    {upcomingReservations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4">{t.participant.upcomingEvents}</h2>
                            <div className="space-y-4">
                                {upcomingReservations.map((reservation) => (
                                    <div key={reservation.id} className="dashboard-card">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Event Image */}
                                            <div className="w-full md:w-32 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-primary">
                                                <img
                                                    src={reservation.event?.imageUrl || '/event.avif'}
                                                    alt={reservation.event?.title || 'Event'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Event Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-primary text-lg">
                                                            {reservation.event?.title || t.reservations.event}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-secondary mt-2">
                                                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                            {reservation.event?.dateTime && formatDate(reservation.event.dateTime)}
                                                        </div>
                                                        <div className="flex items-center text-sm text-secondary mt-1">
                                                            <MapPinIcon className="h-4 w-4 mr-2" />
                                                            {reservation.event?.location || t.participant.locationTBD}
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={reservation.status} />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-row md:flex-col gap-2">
                                                {reservation.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleDownloadTicket(reservation)}
                                                        className="btn-primary flex items-center justify-center space-x-2 text-sm"
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                                        <span>{t.participant.downloadTicket}</span>
                                                    </button>
                                                )}
                                                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                                                    <button
                                                        onClick={() => setCancelModal({ isOpen: true, reservation })}
                                                        className="btn-secondary flex items-center justify-center space-x-2 text-sm text-red-500 hover:text-red-600"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                        <span>{t.participant.cancel}</span>
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/events/${reservation.eventId}`}
                                                    className="btn-secondary text-sm text-center"
                                                >
                                                    {t.participant.viewEvent}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past/Cancelled Reservations */}
                    {pastAndCancelledReservations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4">{t.participant.pastCancelled}</h2>
                            <div className="space-y-4">
                                {pastAndCancelledReservations.map((reservation) => (
                                    <div key={reservation.id} className="dashboard-card opacity-75">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Event Image */}
                                            <div className="w-full md:w-24 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-primary">
                                                <img
                                                    src={reservation.event?.imageUrl || '/event.avif'}
                                                    alt={reservation.event?.title || 'Event'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Event Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-primary">
                                                            {reservation.event?.title || t.reservations.event}
                                                        </h3>
                                                        <p className="text-sm text-tertiary mt-1">
                                                            {reservation.event?.dateTime && formatDate(reservation.event.dateTime)}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={reservation.status} />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-row md:flex-col gap-2">
                                                {reservation.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={() => handleDownloadTicket(reservation)}
                                                        className="btn-primary flex items-center justify-center space-x-2 text-sm"
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                                        <span>{t.participant.downloadTicket}</span>
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/events/${reservation.eventId}`}
                                                    className="btn-secondary text-sm text-center"
                                                >
                                                    {t.participant.viewEvent}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, reservation: null })}
                onConfirm={handleCancel}
                title={t.participant.cancelModalTitle}
                message={`${t.participant.cancelModalMessage} "${cancelModal.reservation?.event?.title || t.reservations.event}"${t.participant.cancelModalSuffix}`}
                confirmText={t.participant.btnCancelReservation}
                cancelText={t.participant.btnKeepReservation}
                variant="danger"
                isLoading={actionLoading}
            />
        </div>
    )
}
