'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TicketIcon } from '@heroicons/react/24/outline'
import {
  reserveEventServerAction,
  type ReserveEventState,
} from '@/lib/actions/events-server'

const INITIAL_STATE: ReserveEventState = { success: false }

type ReserveEventFormProps = {
  eventId: string
  isAuthenticated: boolean
  isParticipant: boolean
  isReserved: boolean
  isSoldOut: boolean
  isPast?: boolean
  loginHref: string
  labels: {
    reserve: string
    loading: string
    soldOut: string
    alreadyReserved: string
    login: string
    noUpcomingEvents?: string
    success: string
    errorFallback: string
  }
  className?: string
}

export default function ReserveEventForm({
  eventId,
  isAuthenticated,
  isParticipant,
  isReserved,
  isSoldOut,
  isPast = false,
  loginHref,
  labels,
  className,
}: ReserveEventFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    reserveEventServerAction,
    INITIAL_STATE
  )

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [state.success, router])

  if (!isAuthenticated) {
    return (
      <Link href={loginHref} className={className || 'btn-outline w-full'}>
        {labels.login}
      </Link>
    )
  }

  if (!isParticipant) {
    return null
  }

  if (isPast) {
    return (
      <div className="text-center py-4">
        <p className="text-tertiary">{labels.noUpcomingEvents || labels.errorFallback}</p>
      </div>
    )
  }

  if (isReserved) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
      >
        {labels.alreadyReserved}
      </button>
    )
  }

  if (isSoldOut) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
      >
        {labels.soldOut}
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        disabled={isPending}
        className={
          className ||
          'w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all duration-200'
        }
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center space-x-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{labels.loading}</span>
          </span>
        ) : (
          <span className="inline-flex items-center justify-center space-x-2">
            <TicketIcon className="h-5 w-5" />
            <span>{labels.reserve}</span>
          </span>
        )}
      </button>

      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">{labels.success}</p>
      )}

      {!state.success && state.error && (
        <p className="text-sm text-red-500">{state.error || labels.errorFallback}</p>
      )}
    </form>
  )
}
