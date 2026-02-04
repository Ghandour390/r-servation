'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.URL_BACKEND || 'http://localhost:5000'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'ADMIN' | 'PARTICIPANT'
}

export interface VerifyEmailData {
  email: string
  code: string
}

export interface ResetPasswordData {
  email: string
  code: string
  newPassword: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
    }
    access_token: string
    refresh_token: string
  }
  error?: string
}

export interface MessageResponse {
  success: boolean
  message?: string
  error?: string
}

// Login Action
export async function loginAction(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Login failed' }
    }

    const authData = result.data || result

    // Set cookies for authentication
    const cookieStore = await cookies()
    cookieStore.set('access_token', authData.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    cookieStore.set('refresh_token', authData.refresh_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('user', JSON.stringify(authData.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return { success: true, data: authData }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Register Action
export async function registerAction(data: RegisterData): Promise<MessageResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Registration failed' }
    }

    return { success: true, message: result.message || 'Registration successful' }
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Verify Email Action
export async function verifyEmailAction(data: VerifyEmailData): Promise<MessageResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Verification failed' }
    }

    return { success: true, message: result.message || 'Email verified successfully' }
  } catch (error) {
    console.error('Verify email error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Resend Verification Action
export async function resendVerificationAction(email: string): Promise<MessageResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to resend verification' }
    }

    return { success: true, message: result.message || 'Verification email sent' }
  } catch (error) {
    console.error('Resend verification error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Forgot Password Action
export async function forgotPasswordAction(email: string): Promise<MessageResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Failed to send reset email' }
    }

    return { success: true, message: result.message || 'Reset email sent' }
  } catch (error) {
    console.error('Forgot password error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Reset Password Action
export async function resetPasswordAction(data: ResetPasswordData): Promise<MessageResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.message || 'Password reset failed' }
    }

    return { success: true, message: result.message || 'Password reset successful' }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Logout Action
export async function logoutAction(): Promise<MessageResponse> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    cookieStore.delete('user')

    return { success: true, message: 'Logged out successfully' }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Logout failed' }
  }
}

// Get Current User from Cookies
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  const token = cookieStore.get('access_token')

  if (!userCookie || !token) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')
  return !!token
}

// Get auth token for API calls
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')
  return token?.value || null
}
