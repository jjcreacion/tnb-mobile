import type { User } from '@/types';
import { apiClient } from './apiClient';

export const userService = {
    async getUserById(userId: string): Promise<User> {
        return apiClient.get<User>(`/user/findOne/${userId}`)
    },

    async toggleSmsNotifications(pkUser: number, newValue: boolean): Promise<User> {
        return apiClient.patch<User>(
            `/user/${pkUser}/toggle-sms-notifications`,
            { status: newValue }
        );
    }
}