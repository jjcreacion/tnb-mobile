import { apiClient } from './apiClient'
import type { User } from '@/types'

export const userService = {
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/user/findOne/${userId}`)
  },

  async toggleSmsNotifications(pkUser: number, newValue: boolean): Promise<any> {
    try {
        const response = await apiClient.patch(
            `/user/${pkUser}/toggle-sms-notifications`,
            { status: newValue } 
        );
        return response.data;
    } catch (error) {
       const errorMessage = error.message || 'Error desconocido al procesar la solicitud.';
       console.error('ERROR al cambiar notificaciones SMS:', errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
}
