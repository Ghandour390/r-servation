'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { createEventAction, CreateEventData } from '@/lib/actions/events'

export default function CreateEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<CreateEventData>({
        title: '',
        description: '',
        dateTime: '',
        location: '',
        maxCapacity: 100,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // Convert datetime-local to ISO string
            const dateTime = new Date(formData.dateTime).toISOString()

            const result = await createEventAction({
                ...formData,
                dateTime,
            })
            console.log("create event", result);
            if (result.success) {
                router.push('/dashboard/admin/events')
            } else {
                setError(result.error || 'Failed to create event')
            }
        } catch (err) {
            setError('Failed to create event')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }))
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link
                    href="/dashboard/admin/events"
                    className="p-2 text-tertiary hover:text-secondary transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Create Event</h1>
                    <p className="text-secondary">Fill in the details to create a new event</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="dashboard-card space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="title" className="form-label">
                        Event Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter event title"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="form-label">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-input min-h-32"
                        placeholder="Describe your event..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="dateTime" className="form-label">
                            Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            id="dateTime"
                            name="dateTime"
                            value={formData.dateTime}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="maxCapacity" className="form-label">
                            Maximum Capacity *
                        </label>
                        <input
                            type="number"
                            id="maxCapacity"
                            name="maxCapacity"
                            value={formData.maxCapacity}
                            onChange={handleChange}
                            className="form-input"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="form-label">
                        Location *
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter event location"
                        required
                    />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                    <Link href="/dashboard/admin/events" className="btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    )
}
