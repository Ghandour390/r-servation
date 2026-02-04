'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { getPublicEventsAction, Event } from '@/lib/actions/events'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getPublicEventsAction()
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

    fetchEvents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-primary">
      {/* Header */}
      <section className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Discover <span className="text-indigo-600 dark:text-indigo-400">Events</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Find amazing events happening near you. From conferences to concerts, there's something for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDaysIcon className="h-16 w-16 text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                No events found
              </h3>
              <p className="text-secondary">
                Check back later for new events or try refreshing the page.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="card overflow-hidden">
                  {/* Event Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-indigo-400 to-emerald-400 relative">
                    <div className="absolute top-4 left-4">
                      <span className={event.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}>
                        {event.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-orange-600 dark:text-orange-400 font-bold text-sm">
                        {formatDate(event.dateTime)}
                      </div>
                      <div className="text-secondary text-xs">
                        {formatTime(event.dateTime)}
                      </div>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-secondary mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-tertiary">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-tertiary">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {event.remainingPlaces} / {event.maxCapacity} spots available
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        Free
                      </div>
                      <Link href={`/events/${event.id}`} className="btn-primary text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}