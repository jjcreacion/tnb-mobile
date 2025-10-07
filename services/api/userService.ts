import { apiClient } from './apiClient'
import type { User } from '@/types'

export const userService = {
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/user/findOne/${userId}`)
  },
}
