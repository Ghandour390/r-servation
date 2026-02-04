'use server'

import axiosInstance from '../axios'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'ADMIN' | 'PARTICIPANT'
    isEmailVerified: boolean
    avatarUrl?: string
    createdAt: string
    updatedAt: string
}

export interface UpdateProfileData {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    avatarUrl?: string
}

export interface UsersResponse {
    success: boolean
    data?: User[]
    error?: string
}

export interface UserResponse {
    success: boolean
    data?: User
    error?: string
}

// Get all users (Admin only)
export async function getUsersAction(): Promise<UsersResponse> {
    try {
        const response = await axiosInstance.get('/users')
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get users error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to fetch users',
        }
    }
}

// Delete user (Admin only)
export async function deleteUserAction(id: string): Promise<UserResponse> {
    try {
        const response = await axiosInstance.delete(`/users/${id}`)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Delete user error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to delete user',
        }
    }
}

// Get profile (Current User)
export async function getProfileAction(): Promise<UserResponse> {
    try {
        const response = await axiosInstance.get('/users/profile')
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Get profile error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to fetch profile',
        }
    }
}

// Update profile (Current User)
export async function updateProfileAction(data: UpdateProfileData): Promise<UserResponse> {
    try {
        const response = await axiosInstance.put('/users/profile', data)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Update profile error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to update profile',
        }
    }
}

// Upload avatar
export async function uploadAvatarAction(formData: FormData): Promise<UserResponse> {
    try {
        const response = await axiosInstance.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Upload avatar error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to upload avatar',
        }
    }
}

// Update user (Admin only)
export async function updateUserAction(id: string, data: UpdateProfileData): Promise<UserResponse> {
    try {
        const response = await axiosInstance.put(`/users/${id}`, data)
        return { success: true, data: response.data.data || response.data }
    } catch (error: any) {
        console.error('Update user error:', error.message)
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to update user',
        }
    }
}
