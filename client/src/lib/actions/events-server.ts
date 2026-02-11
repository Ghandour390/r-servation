'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { Category } from './categories'
import type { Event } from './events'
import type { Reservation } from './reservations'

const API_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.URL_BACKEND ||
  'http://localhost:5000'

export type ReserveEventState = {
  success: boolean
  error?: string
}

type ApiResult<T> = {
  success: boolean
  data?: T
  error?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function buildQuery(params?: Record<string, string>) {
  if (!params) {
    return ''
  }

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value.trim()) {
      query.set(key, value)
    }
  })

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback
  }

  const message = payload.message
  const error = payload.error

  if (Array.isArray(message)) {
    return message.join(', ')
  }

  if (typeof message === 'string') {
    return message
  }

  if (typeof error === 'string') {
    return error
  }

  return fallback
}

function readData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}

async function apiGet<T>(path: string, accessToken?: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      cache: 'no-store',
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      return {
        success: false,
        error: readErrorMessage(payload, 'Request failed'),
      }
    }

    return { success: true, data: readData<T>(payload) }
  } catch {
    return { success: false, error: 'Network error occurred' }
  }
}

export async function getPublicEventsServerAction(params?: {
  search?: string
  category?: string
}): Promise<ApiResult<Event[]>> {
  const query = buildQuery({
    search: params?.search ?? '',
    category: params?.category ?? '',
  })
  const result = await apiGet<Event[]>(`/events${query}`)

  if (!result.success || !result.data) {
    return result
  }

  return {
    success: true,
    data: result.data.filter((event) => event.status === 'PUBLISHED'),
  }
}

export async function getEventByIdServerAction(id: string): Promise<ApiResult<Event>> {
  return apiGet<Event>(`/events/${id}`)
}

export async function getCategoriesServerAction(): Promise<ApiResult<Category[]>> {
  return apiGet<Category[]>('/categories')
}

export async function getMyReservationsServerAction(accessToken: string): Promise<ApiResult<Reservation[]>> {
  return apiGet<Reservation[]>('/reservations/my', accessToken)
}

export async function reserveEventServerAction(
  _prevState: ReserveEventState,
  formData: FormData
): Promise<ReserveEventState> {
  const eventId = String(formData.get('eventId') || '')
  if (!eventId) {
    return { success: false, error: 'Event id is required' }
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) {
    return { success: false, error: 'Please login first' }
  }

  try {
    const response = await fetch(`${API_URL}/reservations/${eventId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      return {
        success: false,
        error: readErrorMessage(payload, 'Failed to reserve this event'),
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/dashboard/participant/reservations')

    return { success: true }
  } catch {
    return { success: false, error: 'Network error occurred' }
  }
}
