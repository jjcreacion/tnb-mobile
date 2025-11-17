
export interface Device {
    device_id: number;
    fk_user: number;
    platfrom: string;
    notifications_enabled: boolean;
  }
 
export interface ReadDeviceDto {
    pkDevice: number;
    expoPushToken: string;
    platform: string;
    notificationsEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateDeviceDto {
    fkUser: number;
    expoPushToken: string;
    platform: 'ios' | 'android' | 'web'; 
  }
  
  export interface UpdateDevicePreferencesDto {
    expoPushToken: string;
    notificationsEnabled: boolean;
  }