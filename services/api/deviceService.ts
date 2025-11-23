import { apiClient } from './apiClient';
import type { ReadDeviceDto, CreateDeviceDto, UpdateDevicePreferencesDto } from '@/types/device.types';

export const deviceService = {
    async registerDevice(data: CreateDeviceDto): Promise<ReadDeviceDto> {
        const response = await apiClient.post<ReadDeviceDto>('/devices/register', data);
        return response.data; 
    },
    async updatePreferences(data: UpdateDevicePreferencesDto): Promise<ReadDeviceDto> {
        const response = await apiClient.patch<ReadDeviceDto>('/devices/preferences', data);
        return response.data;
    },
};