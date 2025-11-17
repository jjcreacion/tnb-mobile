import { apiClient } from './apiClient';
import type { ReadDeviceDto, CreateDeviceDto, UpdateDevicePreferencesDto } from '@/types/device.types'; 

export const deviceService = {
  async registerDevice(data: CreateDeviceDto): Promise<{ data: ReadDeviceDto }> {
    return apiClient.post<{ data: ReadDeviceDto }>('/devices/register', data);
  },

  async updatePreferences(data: UpdateDevicePreferencesDto): Promise<{ data: ReadDeviceDto }> {
    return apiClient.patch<{ data: ReadDeviceDto }>('/devices/preferences', data);
  },
};