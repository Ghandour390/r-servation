'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import DashboardLoading from '@/components/loading/DashboardLoading'
import {
    getEventByIdAction,
    updateEventAction,
    UpdateEventData,
    Event
} from '@/lib/actions/events'

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const eventId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState<UpdateEventData>({
        title: '',
        description: '',
        dateTime: '',
        location: '',
        maxCapacity: 100,
    })
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const result = await getEventByIdAction(eventId)
                if (result.success && result.data) {
                    const event = result.data
                    // Format datetime for input
                    const dateTime = new Date(event.dateTime).toISOString().slice(0, 16)
                    setFormData({
                        title: event.title,
                        description: event.description,
                        dateTime,
                        location: event.location,
                        maxCapacity: event.maxCapacity,
                    })
                    setExistingImageUrl(event.imageUrl || null)
                } else {
                    setError(result.error || 'Failed to load event')
                }
            } catch (err) {
                setError('Failed to load event')
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [eventId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSaving(true)

        try {
            const submitData = new FormData()
            if (formData.title) submitData.append('title', formData.title)
            if (formData.description) submitData.append('description', formData.description)
            if (formData.dateTime) submitData.append('dateTime', new Date(formData.dateTime).toISOString())
            if (formData.location) submitData.append('location', formData.location)
            if (formData.maxCapacity) submitData.append('maxCapacity', formData.maxCapacity.toString())

            if (image) {
                submitData.append('image', image)
            }

            const result = await updateEventAction(eventId, submitData)

            if (result.success) {
                router.push('/dashboard/admin/events')
            } else {
                setError(result.error || 'Failed to update event')
            }
        } catch (err) {
            setError('Failed to update event')
        } finally {
            setSaving(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImage(null)
        setImagePreview(null)
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

    if (loading) {
        return <DashboardLoading />
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
                    <h1 className="text-2xl font-bold text-primary">Edit Event</h1>
                    <p className="text-secondary">Update the event details</p>
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

                <div>
                    <label className="form-label">Event Cover Image</label>
                    <div className="mt-2">
                        {(imagePreview || existingImageUrl) ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-primary">
                                <img
                                    src={imagePreview || existingImageUrl || ''}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                                {!imagePreview && (
                                    <label className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg cursor-pointer">
                                        <PhotoIcon className="h-5 w-5" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-primary rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/5 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <PhotoIcon className="h-10 w-10 text-tertiary mb-3" />
                                    <p className="text-sm text-secondary">
                                        <span className="font-bold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-tertiary mt-1">
                                        Recommend: 16:9 Aspect Ratio (e.g. 1920x1080)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                    <Link href="/dashboard/admin/events" className="btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
