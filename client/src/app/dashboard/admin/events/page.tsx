'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MegaphoneIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import DataTable from '@/components/dashboard/DataTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import DashboardLoading from '@/components/loading/DashboardLoading'
import {
    getEventsAction,
    deleteEventAction,
    publishEventAction,
    cancelEventAction,
    Event
} from '@/lib/actions/events'

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; event: Event | null }>({
        isOpen: false,
        event: null,
    })
    const [actionLoading, setActionLoading] = useState(false)

    const fetchEvents = async () => {
        try {
            const result = await getEventsAction()
            if (result.success && result.data) {
                setEvents(result.data)
            } else {
                setError(result.error || 'Failed to load events')
            }
        } catch (err) {
            setError('Failed to load events')
            console.error('Error fetching events:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const handleDelete = async () => {
        if (!deleteModal.event) return

        setActionLoading(true)
        try {
            const result = await deleteEventAction(deleteModal.event.id)
            if (result.success) {
                setEvents(events.filter((e) => e.id !== deleteModal.event?.id))
                setDeleteModal({ isOpen: false, event: null })
            } else {
                alert(result.error || 'Failed to delete event')
            }
        } catch (err) {
            alert('Failed to delete event')
        } finally {
            setActionLoading(false)
        }
    }

    const handlePublish = async (event: Event) => {
        setActionLoading(true)
        try {
            const result = await publishEventAction(event.id)
            if (result.success && result.data) {
                setEvents(events.map((e) => (e.id === event.id ? result.data! : e)))
            } else {
                alert(result.error || 'Failed to publish event')
            }
        } catch (err) {
            alert('Failed to publish event')
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancel = async (event: Event) => {
        setActionLoading(true)
        try {
            const result = await cancelEventAction(event.id)
            if (result.success && result.data) {
                setEvents(events.map((e) => (e.id === event.id ? result.data! : e)))
            } else {
                alert(result.error || 'Failed to cancel event')
            }
        } catch (err) {
            alert('Failed to cancel event')
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
        })
    }

    const columns = [
        {
            key: 'title',
            header: 'Event',
            sortable: true,
            render: (event: Event) => (
                <div>
                    <p className="font-medium text-primary">{event.title}</p>
                    <p className="text-xs text-tertiary truncate max-w-xs">{event.location}</p>
                </div>
            ),
        },
        {
            key: 'dateTime',
            header: 'Date',
            sortable: true,
            render: (event: Event) => (
                <span className="text-secondary">{formatDate(event.dateTime)}</span>
            ),
        },
        {
            key: 'capacity',
            header: 'Capacity',
            render: (event: Event) => (
                <span className="text-secondary">
                    {event.remainingPlaces}/{event.maxCapacity}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (event: Event) => <StatusBadge status={event.status} type="event" />,
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (event: Event) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={`/events/${event.id}`}
                        className="p-2 text-tertiary hover:text-indigo-600 transition-colors"
                        title="View"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={`/dashboard/admin/events/${event.id}/edit`}
                        className="p-2 text-tertiary hover:text-indigo-600 transition-colors"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    {event.status === 'DRAFT' && (
                        <button
                            onClick={() => handlePublish(event)}
                            disabled={actionLoading}
                            className="p-2 text-tertiary hover:text-emerald-600 transition-colors disabled:opacity-50"
                            title="Publish"
                        >
                            <MegaphoneIcon className="h-4 w-4" />
                        </button>
                    )}
                    {event.status === 'PUBLISHED' && (
                        <button
                            onClick={() => handleCancel(event)}
                            disabled={actionLoading}
                            className="p-2 text-tertiary hover:text-amber-600 transition-colors disabled:opacity-50"
                            title="Cancel Event"
                        >
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setDeleteModal({ isOpen: true, event })}
                        className="p-2 text-tertiary hover:text-red-600 transition-colors"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Events Management</h1>
                    <p className="text-secondary">Create and manage your events</p>
                </div>
                <Link href="/dashboard/admin/events/create" className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Event</span>
                </Link>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Events Table */}
            <div className="dashboard-card p-0 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={events}
                    keyField="id"
                    pageSize={10}
                    emptyMessage="No events found. Create your first event!"
                />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, event: null })}
                onConfirm={handleDelete}
                title="Delete Event"
                message={`Are you sure you want to delete "${deleteModal.event?.title}"? This action cannot be undone and all reservations for this event will be cancelled.`}
                confirmText="Delete"
                variant="danger"
                isLoading={actionLoading}
            />
        </div>
    )
}
