import type { CreateDeviceDto, ReadDeviceDto, UpdateDevicePreferencesDto } from '@/types/device.types';
import { apiClient } from './apiClient';

export const deviceService = {
    async registerDevice(data: CreateDeviceDto): Promise<ReadDeviceDto> {
        return apiClient.post<ReadDeviceDto>('/devices/register', data);
    },
    async updatePreferences(data: UpdateDevicePreferencesDto): Promise<ReadDeviceDto> {
        return apiClient.patch<ReadDeviceDto>('/devices/preferences', data);
    },
};