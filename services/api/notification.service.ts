import { apiClient } from './apiClient';
import type { Notification } from '@/types/notification.types'; 

export const notificationService = {
  
async getNotifications(userId: number): Promise<Notification[]> {
  // Asegúrate de que apiClient.get está usando la versión mejorada con un manejo robusto de JSON/Status
  return await apiClient.get<Notification[]>(`/notifications/user/${userId}`);
},

  async markAsRead(notificationId: number): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
  },
};