import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import {
  CalendarDaysIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import ReserveEventForm from '@/components/events/ReserveEventForm'
import {
  getCategoriesServerAction,
  getMyReservationsServerAction,
  getPublicEventsServerAction,
} from '@/lib/actions/events-server'
import { translations } from '@/lib/i18n/translations'
import type { Event } from '@/lib/actions/events'

type Language = 'en' | 'fr' | 'ar'
type SearchParamsInput = {
  search?: string | string[]
  category?: string | string[]
}

function firstValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

function resolveLanguage(acceptLanguage: string | null, cookieLanguage: string | null): Language {
  if (cookieLanguage && ['en', 'fr', 'ar'].includes(cookieLanguage)) {
    return cookieLanguage as Language
  }
  if (!acceptLanguage) {
    return 'en'
  }
  const normalized = acceptLanguage.toLowerCase()
  if (normalized.includes('ar')) {
    return 'ar'
  }
  if (normalized.includes('fr')) {
    return 'fr'
  }
  return 'en'
}

function formatDate(dateString: string, language: Language) {
  return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateString: string, language: Language) {
  return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: SearchParamsInput | Promise<SearchParamsInput>
}) {
  const params = await Promise.resolve(searchParams ?? {})
  const search = firstValue(params.search).trim()
  const category = firstValue(params.category).trim()

  const cookieStore = await cookies()
  const headerStore = await headers()
  const language = resolveLanguage(headerStore.get('accept-language'), cookieStore.get('language')?.value ?? null)
  const t = translations[language]

  const accessToken = cookieStore.get('access_token')?.value
  const userCookie = cookieStore.get('user')?.value
  const userRole = (() => {
    if (!userCookie) {
      return null
    }
    try {
      return JSON.parse(userCookie)?.role ?? null
    } catch {
      return null
    }
  })()

  const isAuthenticated = Boolean(accessToken)
  const isParticipant = isAuthenticated && userRole === 'PARTICIPANT'

  const [eventsResult, categoriesResult, reservationsResult] = await Promise.all([
    getPublicEventsServerAction({ search, category }),
    getCategoriesServerAction(),
    isParticipant && accessToken
      ? getMyReservationsServerAction(accessToken)
      : Promise.resolve({ success: true, data: [] }),
  ])

  const events = eventsResult.data ?? []
  const categories = categoriesResult.data ?? []
  const reservationIds = new Set(
    (reservationsResult.data ?? [])
      .map((reservation) => reservation.eventId)
      .filter((id): id is string => Boolean(id))
  )

  if (!eventsResult.success && events.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.common.error}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {eventsResult.error || t.eventsPage.errorLoading}
          </p>
          <Link
            href="/events"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t.eventsPage.tryAgain}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-primary">
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form method="get" className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-tertiary" />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder={t.eventsPage.searchPlaceholder || 'Search events...'}
                className="block w-full pl-10 pr-3 py-2.5 bg-primary border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-primary"
              />
            </div>

            <div className="relative min-w-[200px]">
              <select
                name="category"
                defaultValue={category}
                className="block w-full px-3 py-2.5 bg-primary border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-primary appearance-none"
              >
                <option value="">{t.events?.allCategories || 'All Categories'}</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary">
              {t.common.search}
            </button>

            {(search || category) && (
              <Link href="/events" className="btn-outline text-center">
                {t.common.cancel}
              </Link>
            )}
          </form>

          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDaysIcon className="h-16 w-16 text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">{t.eventsPage.noEventsTitle}</h3>
              <p className="text-secondary">{t.eventsPage.noEventsDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {events.map((event: Event) => {
                const isReserved = reservationIds.has(event.id)

                return (
                  <div key={event.id} className="card overflow-hidden">
                    <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          loading="lazy"
                          width="400"
                          height="225"
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
                          {formatDate(event.dateTime, language)}
                        </div>
                        <div className="text-secondary text-xs">{formatTime(event.dateTime, language)}</div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-secondary mb-4 line-clamp-2">{event.description}</p>

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

                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {t.eventsPage.free}
                          </div>
                          <Link
                            href={`/events/${event.id}`}
                            className="text-indigo-600 hover:underline text-xs sm:text-sm font-medium"
                          >
                            {t.eventsPage.viewDetails}
                          </Link>
                        </div>

                        {isParticipant && (
                          <ReserveEventForm
                            eventId={event.id}
                            isAuthenticated={isAuthenticated}
                            isParticipant={isParticipant}
                            isReserved={isReserved}
                            isSoldOut={event.remainingPlaces <= 0}
                            loginHref={`/login?redirect=/events/${event.id}`}
                            labels={{
                              reserve: t.eventsPage.reserve,
                              loading: t.common.loading,
                              soldOut: t.eventsPage.soldOut,
                              alreadyReserved: t.eventsPage.alreadyReserved,
                              login: t.navbar.login,
                              success: t.eventsPage.reservationSuccess,
                              errorFallback: t.common.error,
                            }}
                          />
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
