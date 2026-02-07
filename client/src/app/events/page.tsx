'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDaysIcon, MapPinIcon, UsersIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { getPublicEventsAction, Event } from '@/lib/actions/events'
import { createReservationAction, getMyReservationsAction } from '@/lib/actions/reservations'
import { getCategoriesAction, Category } from '@/lib/actions/categories'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppSelector } from '@/lib/redux/hooks'
import FilterBar from '@/components/FilterBar'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [myEventIds, setMyEventIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [reservingId, setReservingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ search: '', category: '' })
  const [categories, setCategories] = useState<Category[]>([])
  const { t, language } = useTranslation()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  const fetchEvents = async (currentFilters = filters) => {
    try {
      const result = await getPublicEventsAction(currentFilters)
      if (result.success && result.data) {
        setEvents(result.data)
      } else {
        setError(result.error || t.eventsPage.errorLoading)
      }
    } catch (err) {
      setError(t.eventsPage.errorLoading)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyReservations = async () => {
    if (!isAuthenticated || user?.role !== 'PARTICIPANT') return
    try {
      const result = await getMyReservationsAction()
      if (result.success && result.data) {
        const ids = new Set(result.data.map(r => r.eventId))
        setMyEventIds(ids)
      }
    } catch (err) {
      console.error('Error fetching my reservations:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await getCategoriesAction()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  useEffect(() => {
    fetchEvents(filters)
  }, [filters])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReservations()
    }
  }, [isAuthenticated, user?.role])

  const handleReserve = async (eventId: string) => {
    if (!isAuthenticated) return

    setReservingId(eventId)
    try {
      const result = await createReservationAction(eventId)
      if (result.success) {
        alert(t.eventsPage.reservationSuccess)
        setMyEventIds(prev => new Set([...prev, eventId]))
        // Refresh events to update remaining places
        fetchEvents()
      } else {
        alert(result.error || t.common.error)
      }
    } catch (err) {
      alert(t.common.error)
    } finally {
      setReservingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
            {t.common.error}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t.eventsPage.tryAgain}
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
              {t.eventsPage.title} <span className="text-indigo-600 dark:text-indigo-400">{t.sidebar.events}</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              {t.eventsPage.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FilterBar
            onFilterChange={setFilters}
            t={t}
            placeholder={t.eventsPage.searchPlaceholder || 'Search events...'}
            categories={categories}
          />

          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDaysIcon className="h-16 w-16 text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                {t.eventsPage.noEventsTitle}
              </h3>
              <p className="text-secondary">
                {t.eventsPage.noEventsDesc}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const isReserved = myEventIds.has(event.id)
                const isParticipant = isAuthenticated && user?.role === 'PARTICIPANT'
                const canReserve = isParticipant && !isReserved && event.remainingPlaces > 0

                return (
                  <div key={event.id} className="card overflow-hidden">
                    {/* Event Image */}
                    <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center">
                          <PhotoIcon className="h-12 w-12 text-white/50" />
                        </div>
                      )}

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
                          {event.remainingPlaces} / {event.maxCapacity} {t.eventsPage.spotsAvailable}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {t.eventsPage.free}
                          </div>
                          <Link href={`/events/${event.id}`} className="text-indigo-600 hover:underline text-sm font-medium">
                            {t.eventsPage.viewDetails}
                          </Link>
                        </div>

                        {isParticipant && (
                          <button
                            onClick={() => handleReserve(event.id)}
                            disabled={!canReserve || reservingId === event.id}
                            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${isReserved
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                              : event.remainingPlaces <= 0
                                ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50'
                              }`}
                          >
                            {reservingId === event.id ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t.common.loading}</span>
                              </div>
                            ) : isReserved ? (
                              t.eventsPage.alreadyReserved
                            ) : event.remainingPlaces <= 0 ? (
                              t.eventsPage.soldOut
                            ) : (
                              t.eventsPage.reserve
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
