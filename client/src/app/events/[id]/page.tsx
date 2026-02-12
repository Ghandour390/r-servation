import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import ReserveEventForm from '@/components/events/ReserveEventForm'
import {
  getEventByIdServerAction,
  getMyReservationsServerAction,
} from '@/lib/actions/events-server'
import { translations } from '@/lib/i18n/translations'

type Language = 'en' | 'fr' | 'ar'
type ParamsInput = { id: string }

function resolveLanguage(acceptLanguage: string | null): Language {
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateString: string, language: Language) {
  return new Date(dateString).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EventDetailPage({
  params,
}: {
  params: ParamsInput | Promise<ParamsInput>
}) {
  const routeParams = await Promise.resolve(params)
  const eventId = routeParams.id
  const cookieStore = await cookies()
  const headerStore = await headers()
  const language = resolveLanguage(headerStore.get('accept-language'))
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

  const [eventResult, reservationsResult] = await Promise.all([
    getEventByIdServerAction(eventId),
    isParticipant && accessToken
      ? getMyReservationsServerAction(accessToken)
      : Promise.resolve({ success: true, data: [] }),
  ])

  const event = eventResult.data
  const isReserved = Boolean(
    (reservationsResult.data ?? []).some((reservation) => reservation.eventId === eventId)
  )

  if (!eventResult.success || !event) {
    return (
      <div className="pt-16 min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">{t.common.error}</h2>
          <p className="text-secondary mb-6">{eventResult.error || t.eventsPage.noEventsDesc}</p>
          <Link href="/events" className="btn-primary">
            {t.eventsPage.browseEvents}
          </Link>
        </div>
      </div>
    )
  }

  const isEventPast = new Date(event.dateTime) < new Date()
  const isSoldOut = event.remainingPlaces <= 0

  return (
    <div className="pt-16 min-h-screen bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t.sidebar.backToHome}
        </Link>

        <div className="h-64 md:h-80 rounded-2xl relative mb-8 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img src={event.imageUrl || '/event.avif'} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={event.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-4">{event.title}</h1>
              <p className="text-secondary leading-relaxed">{event.description}</p>
            </div>

            <div className="dashboard-card space-y-4">
              <h3 className="font-semibold text-primary">{t.eventsPage.viewDetails}</h3>

              <div className="flex items-center text-secondary">
                <CalendarDaysIcon className="h-5 w-5 mr-3 text-indigo-500" />
                <div>
                  <p className="font-medium">{formatDate(event.dateTime, language)}</p>
                  <p className="text-sm text-tertiary">{formatTime(event.dateTime, language)}</p>
                </div>
              </div>

              <div className="flex items-center text-secondary">
                <MapPinIcon className="h-5 w-5 mr-3 text-indigo-500" />
                <p>{event.location}</p>
              </div>

              <div className="flex items-center text-secondary">
                <UsersIcon className="h-5 w-5 mr-3 text-indigo-500" />
                <p>
                  <span className="font-medium">{event.remainingPlaces}</span> / {event.maxCapacity}{' '}
                  {t.eventsPage.spotsAvailable}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="dashboard-card sticky top-24">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {t.eventsPage.free}
                </p>
              </div>

              <ReserveEventForm
                eventId={event.id}
                isAuthenticated={isAuthenticated}
                isParticipant={isParticipant}
                isReserved={isReserved}
                isSoldOut={isSoldOut}
                isPast={isEventPast}
                loginHref={`/login?redirect=/events/${event.id}`}
                className="btn-primary w-full flex items-center justify-center space-x-2"
                labels={{
                  reserve: t.eventsPage.reserve,
                  loading: t.common.loading,
                  soldOut: t.eventsPage.soldOut,
                  alreadyReserved: t.eventsPage.alreadyReserved,
                  login: t.navbar.login,
                  noUpcomingEvents: t.dashboard.statistics.noUpcomingEvents,
                  success: t.eventsPage.reservationSuccess,
                  errorFallback: t.common.error,
                }}
              />

              <div className="mt-4 text-center">
                <p className="text-xs text-tertiary">
                  {event.remainingPlaces} {t.dashboard.statistics.spotsLeft}
                </p>
              </div>

              {isReserved && (
                <div className="mt-4 text-center">
                  <Link
                    href="/dashboard/participant/reservations"
                    className="text-sm underline text-emerald-600 dark:text-emerald-400"
                  >
                    {t.participant.myReservations}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
