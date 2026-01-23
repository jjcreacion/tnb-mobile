import { apiClient } from './apiClient'
import type { User } from '@/types'

export const userService = {
    async getUserById(userId: string): Promise<User> {
        return apiClient.get<User>(`/user/findOne/${userId}`)
    },

    async toggleSmsNotifications(pkUser: number, newValue: boolean): Promise<User> {
        const response = await apiClient.patch<User>(
            `/user/${pkUser}/toggle-sms-notifications`,
            { status: newValue }
        );
        
        return response.data; 
    }
}