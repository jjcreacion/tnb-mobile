import { apiClient } from './apiClient'
import type { Category } from '@/types'

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/category/findAll')
  },
}
