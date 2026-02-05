'use server'

import axiosInstance from '../axios'

export interface Category {
  id: string
  name: string
  description: string
}

export interface CategoryResponse {
  success: boolean
  data?: Category
  error?: string
}

export interface CategoriesResponse {
  success: boolean
  data?: Category[]
  error?: string
}

export async function getCategoriesAction(): Promise<CategoriesResponse> {
  try {
    const response = await axiosInstance.get('/categories')
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Get categories error:', error.message)
    return { success: false, error: error.message || 'Failed to fetch categories' }
  }
}

export async function getCategoryByIdAction(id: string): Promise<CategoryResponse> {
  try {
    const response = await axiosInstance.get(`/categories/${id}`)
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Get category error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to fetch category' }
  }
}

export async function createCategoryAction(data: { name: string; description: string }): Promise<CategoryResponse> {
  try {
    const response = await axiosInstance.post('/categories', data)
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Create category error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to create category' }
  }
}

export async function updateCategoryAction(id: string, data: { name?: string; description?: string }): Promise<CategoryResponse> {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, data)
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Update category error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to update category' }
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryResponse> {
  try {
    const response = await axiosInstance.delete(`/categories/${id}`)
    return { success: true, data: response.data.data || response.data }
  } catch (error: any) {
    console.error('Delete category error:', error.message)
    return { success: false, error: error.response?.data?.message || 'Failed to delete category' }
  }
}
