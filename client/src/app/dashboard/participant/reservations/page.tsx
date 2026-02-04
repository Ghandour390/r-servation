'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

export default function ParticipantReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; reservation: Reservation | null }>({
        isOpen: false,
        reservation: null,
    })
    const [actionLoading, setActionLoading] = useState(false)

    const fetchReservations = async () => {
        try {
            const result = await getMyReservationsAction()
            if (result.success && result.data) {
                setReservations(result.data)
            } else {
                setError(result.error || 'Failed to load reservations')
            }
        } catch (err) {
            setError('Failed to load reservations')
            console.error('Error fetching reservations:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReservations()
    }, [])

    const handleCancel = async () => {
        if (!cancelModal.reservation) return

        setActionLoading(true)
        try {
            const result = await cancelReservationAction(cancelModal.reservation.id)
            if (result.success) {
                setReservations(
                    reservations.map((r) =>
                        r.id === cancelModal.reservation?.id ? { ...r, status: 'CANCELED' as const } : r
                    )
                )
                setCancelModal({ isOpen: false, reservation: null })
            } else {
                alert(result.error || 'Failed to cancel reservation')
            }
        } catch (err) {
            alert('Failed to cancel reservation')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDownloadTicket = async (reservation: Reservation) => {
        try {
            const result = await downloadTicketAction(reservation.id)
            if (result.success && result.url) {
                // Open ticket URL in new tab or download
                window.open(result.url, '_blank')
            } else {
                alert(result.error || 'Ticket not available yet')
            }
        } catch (err) {
            alert('Failed to download ticket')
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
                <h1 className="text-2xl font-bold text-primary">My Reservations</h1>
                <p className="text-secondary">View and manage all your event reservations</p>
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
                    <h3 className="text-xl font-semibold text-primary mb-2">No Reservations Yet</h3>
                    <p className="text-secondary mb-6">You haven't made any reservations yet.</p>
                    <Link href="/events" className="btn-primary">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <>
                    {/* Upcoming Reservations */}
                    {upcomingReservations.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-primary mb-4">Upcoming Events</h2>
                            <div className="space-y-4">
                                {upcomingReservations.map((reservation) => (
                                    <div key={reservation.id} className="dashboard-card">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Event Image */}
                                            <div className="w-full md:w-32 h-24 bg-gradient-to-br from-indigo-400 to-emerald-400 rounded-lg flex-shrink-0" />

                                            {/* Event Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-primary text-lg">
                                                            {reservation.event?.title || 'Event'}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-secondary mt-2">
                                                            <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                            {reservation.event?.dateTime && formatDate(reservation.event.dateTime)}
                                                        </div>
                                                        <div className="flex items-center text-sm text-secondary mt-1">
                                                            <MapPinIcon className="h-4 w-4 mr-2" />
                                                            {reservation.event?.location || 'Location TBD'}
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
                                                        <span>Download Ticket</span>
                                                    </button>
                                                )}
                                                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                                                    <button
                                                        onClick={() => setCancelModal({ isOpen: true, reservation })}
                                                        className="btn-secondary flex items-center justify-center space-x-2 text-sm text-red-500 hover:text-red-600"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                        <span>Cancel</span>
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/events/${reservation.eventId}`}
                                                    className="btn-secondary text-sm text-center"
                                                >
                                                    View Event
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
                            <h2 className="text-lg font-semibold text-primary mb-4">Past & Cancelled</h2>
                            <div className="space-y-4">
                                {pastAndCancelledReservations.map((reservation) => (
                                    <div key={reservation.id} className="dashboard-card opacity-75">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Event Image */}
                                            <div className="w-full md:w-24 h-16 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0" />

                                            {/* Event Details */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-primary">
                                                            {reservation.event?.title || 'Event'}
                                                        </h3>
                                                        <p className="text-sm text-tertiary mt-1">
                                                            {reservation.event?.dateTime && formatDate(reservation.event.dateTime)}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={reservation.status} />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <Link
                                                href={`/events/${reservation.eventId}`}
                                                className="btn-secondary text-sm"
                                            >
                                                View Event
                                            </Link>
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
                title="Cancel Reservation"
                message={`Are you sure you want to cancel your reservation for "${cancelModal.reservation?.event?.title || 'this event'}"? This action cannot be undone.`}
                confirmText="Cancel Reservation"
                cancelText="Keep Reservation"
                variant="danger"
                isLoading={actionLoading}
            />
        </div>
    )
}
