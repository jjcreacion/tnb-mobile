import { apiClient } from './apiClient';
import type { Notification } from '@/types/notification.types'; 

export const notificationService = {
  
async getNotifications(userId: number): Promise<Notification[]> {
  return await apiClient.get<Notification[]>(`/notifications/user/${userId}`);
},

  async markAsRead(notificationId: number): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
  },
};