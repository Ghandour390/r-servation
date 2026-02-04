'use client'

import { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import DashboardLoading from '@/components/loading/DashboardLoading'
import {
    getAllReservationsAction,
    updateReservationStatusAction,
    Reservation
} from '@/lib/actions/reservations'

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean
        reservation: Reservation | null
        action: 'confirm' | 'refuse' | null
    }>({
        isOpen: false,
        reservation: null,
        action: null,
    })
    const [actionLoading, setActionLoading] = useState(false)

    const fetchReservations = async () => {
        try {
            const result = await getAllReservationsAction()
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

    const handleAction = async () => {
        if (!actionModal.reservation || !actionModal.action) return

        setActionLoading(true)
        try {
            const status = actionModal.action === 'confirm' ? 'CONFIRMED' : 'REFUSED'
            const result = await updateReservationStatusAction(
                actionModal.reservation.id,
                status
            )

            if (result.success && result.data) {
                setReservations(
                    reservations.map((r) =>
                        r.id === actionModal.reservation?.id ? result.data! : r
                    )
                )
                setActionModal({ isOpen: false, reservation: null, action: null })
            } else {
                alert(result.error || 'Failed to update reservation')
            }
        } catch (err) {
            alert('Failed to update reservation')
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const columns = [
        {
            key: 'user',
            header: 'Participant',
            render: (reservation: Reservation) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {reservation.user?.firstName?.charAt(0).toUpperCase() || '?'}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-primary">
                            {reservation.user
                                ? `${reservation.user.firstName} ${reservation.user.lastName}`
                                : 'Unknown User'}
                        </p>
                        <p className="text-xs text-tertiary">{reservation.user?.email || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'event.title',
            header: 'Event',
            sortable: true,
            render: (reservation: Reservation) => (
                <span className="text-secondary">{reservation.event?.title || 'Unknown Event'}</span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Reserved On',
            sortable: true,
            render: (reservation: Reservation) => (
                <span className="text-secondary text-sm">{formatDate(reservation.createdAt)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (reservation: Reservation) => (
                <StatusBadge status={reservation.status} type="reservation" />
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (reservation: Reservation) => (
                <div className="flex items-center space-x-2">
                    {reservation.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() =>
                                    setActionModal({
                                        isOpen: true,
                                        reservation,
                                        action: 'confirm',
                                    })
                                }
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Confirm"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() =>
                                    setActionModal({
                                        isOpen: true,
                                        reservation,
                                        action: 'refuse',
                                    })
                                }
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Refuse"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    {reservation.status !== 'PENDING' && (
                        <span className="text-xs text-tertiary">No actions available</span>
                    )}
                </div>
            ),
        },
    ]

    if (loading) {
        return <DashboardLoading />
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">Reservations Management</h1>
                <p className="text-secondary">Review and manage participant reservations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="dashboard-card text-center">
                    <p className="text-2xl font-bold text-primary">{reservations.length}</p>
                    <p className="text-sm text-tertiary">Total</p>
                </div>
                <div className="dashboard-card text-center">
                    <p className="text-2xl font-bold text-amber-600">
                        {reservations.filter((r) => r.status === 'PENDING').length}
                    </p>
                    <p className="text-sm text-tertiary">Pending</p>
                </div>
                <div className="dashboard-card text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                        {reservations.filter((r) => r.status === 'CONFIRMED').length}
                    </p>
                    <p className="text-sm text-tertiary">Confirmed</p>
                </div>
                <div className="dashboard-card text-center">
                    <p className="text-2xl font-bold text-red-600">
                        {reservations.filter((r) => r.status === 'REFUSED' || r.status === 'CANCELED').length}
                    </p>
                    <p className="text-sm text-tertiary">Cancelled/Refused</p>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Reservations Table */}
            <div className="dashboard-card p-0 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={reservations}
                    keyField="id"
                    pageSize={10}
                    emptyMessage="No reservations found."
                />
            </div>

            {/* Action Confirmation Modal */}
            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ isOpen: false, reservation: null, action: null })}
                onConfirm={handleAction}
                title={actionModal.action === 'confirm' ? 'Confirm Reservation' : 'Refuse Reservation'}
                message={
                    actionModal.action === 'confirm'
                        ? `Are you sure you want to confirm the reservation for ${actionModal.reservation?.user
                            ? `${actionModal.reservation.user.firstName} ${actionModal.reservation.user.lastName}`
                            : 'this participant'
                        }?`
                        : `Are you sure you want to refuse the reservation for ${actionModal.reservation?.user
                            ? `${actionModal.reservation.user.firstName} ${actionModal.reservation.user.lastName}`
                            : 'this participant'
                        }? They will be notified.`
                }
                confirmText={actionModal.action === 'confirm' ? 'Confirm' : 'Refuse'}
                variant={actionModal.action === 'confirm' ? 'info' : 'danger'}
                isLoading={actionLoading}
            />
        </div>
    )
}
