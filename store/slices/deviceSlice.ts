import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReadDeviceDto, CreateDeviceDto, UpdateDevicePreferencesDto } from '@/types/device.types'; 
import { deviceService } from '@/services/api/deviceService'; 
import Constants from 'expo-constants';

interface DeviceState {
  token: string | null;           
  notificationsEnabled: boolean; 
  loading: boolean;
  error: string | null;
}

const initialState: DeviceState = {
  token: null,
  notificationsEnabled: true, 
  loading: false,
  error: null,
}

export const registerDevice = createAsyncThunk<
  ReadDeviceDto, 
  void,          
  { rejectValue: string } 
>(
  'device/registerDevice',
  async (_, { rejectWithValue }) => {
    
    if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
      console.warn('Skipping push notification registration: Not supported in Expo Go on Android. Use a development build.');
      return rejectWithValue('Push notifications are not supported in Expo Go on Android.');
    }
    
    const userIdRaw = await AsyncStorage.getItem('userId');

    if (userIdRaw === null) {
      return rejectWithValue('No se encontró el ID de usuario. Inicie sesión.'); 
    }
    
    const userId = parseInt(userIdRaw, 10);
    
    const rawPlatform = Platform.OS;
    const acceptedPlatforms = ['ios', 'android', 'web'];
    
    const platform = acceptedPlatforms.includes(rawPlatform) 
        ? rawPlatform as 'ios' | 'android' | 'web'
        : 'web'; 

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
        return rejectWithValue('Permiso de notificaciones no concedido.');
    }
    
    const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
    
    if (!expoToken) {
        return rejectWithValue('No se pudo obtener el Expo Push Token.');
    }

    try {
        const payload: CreateDeviceDto = {
            fkUser: userId, 
            expoPushToken: expoToken,
            platform: platform, 
        };
        
        const response = await deviceService.registerDevice(payload);
        await AsyncStorage.setItem('deviceToken', expoToken); 
        console.log("Token = "+expoToken); 
        return response.data; 
    } catch (error) {
        return rejectWithValue('Error al registrar el dispositivo en el servidor.');
    }
  }
);



export const updateDevicePreferences = createAsyncThunk<
  ReadDeviceDto, 
  boolean,       
  { rejectValue: string } 
>(
  'device/updateDevicePreferences',
  async (notificationsEnabled: boolean, { rejectWithValue }) => {
    
    const token = await AsyncStorage.getItem('deviceToken');

    if (token === null) {
      return rejectWithValue('Token de dispositivo no encontrado. No se puede actualizar la preferencia.');
    }

    try {
        const payload: UpdateDevicePreferencesDto = {
            expoPushToken: token,
            notificationsEnabled: notificationsEnabled,
        };
        
        const response = await deviceService.updatePreferences(payload);
        
        return response.data; 
    } catch (error) {
        return rejectWithValue('Error al actualizar las preferencias en el servidor.');
    }
  }
);



const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
  }, 
  extraReducers: (builder) => {
    builder
      .addCase(registerDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.expoPushToken;
        state.notificationsEnabled = action.payload.notificationsEnabled;
      })
      .addCase(registerDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Error en el registro del dispositivo.';
        state.notificationsEnabled = false; 
      })
      
      .addCase(updateDevicePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDevicePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.notificationsEnabled = action.payload.notificationsEnabled;
      })
      .addCase(updateDevicePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Error al actualizar las preferencias.';
      })
  },
});

export default deviceSlice.reducer;