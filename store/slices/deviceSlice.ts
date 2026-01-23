import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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

let expoToken: string;
      
// --- Thunk: registerDevice (Registro del dispositivo) ---

export const registerDevice = createAsyncThunk<
    ReadDeviceDto, 
    void,
    { rejectValue: string }
>(
    'device/registerDevice',
    async (_, { rejectWithValue }) => {
        
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

        if (Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default Channel',
                    importance: Notifications.AndroidImportance.MAX, 
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            } catch (e) {
                console.error("LOG ERROR: Fallo al configurar el canal de Android.", e);
            }
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
            console.error("LOG ERROR: Fallo - No se encontró el EAS Project ID en app.json.");
            return rejectWithValue('No se encontró el EAS Project ID en app.json.');
        }
        
        try {
            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId: projectId, 
            });
            expoToken = tokenResponse.data;

        } catch (e) {
            return rejectWithValue('Excepción al obtener el Expo Push Token. Revise logs nativos.');
        }
        
        if (!expoToken) {
            return rejectWithValue('No se pudo obtener el Expo Push Token.');
        }
     
        try {
            const payload: CreateDeviceDto = {
                fkUser: userId,
                expoPushToken: expoToken,
                platform: platform,
            };
            
            const deviceData = await deviceService.registerDevice(payload); 
            await AsyncStorage.setItem('deviceToken', expoToken);
            
            if (!deviceData) {
                 console.warn("Payload de registro vacío. Usando valor predeterminado (notificationsEnabled: true).");
                 return { notificationsEnabled: true } as ReadDeviceDto;
            }

            return deviceData; 
        } catch (error) {
            console.error("LOG ERROR: Fallo al registrar el dispositivo en el servidor.");
            return rejectWithValue('Error al registrar el dispositivo en el servidor.');
        }
    }
);

// --- Thunk: updateDevicePreferences (Actualización de preferencias) ---

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

            const responseData = await deviceService.updatePreferences(payload);
            
            if (!responseData) {
                console.warn("Payload de actualización vacío. Usando valor de notificación enviado.");
                return { notificationsEnabled: notificationsEnabled } as ReadDeviceDto;
            }
            
            return responseData; 
        } catch (error) {
            return rejectWithValue('Error al actualizar las preferencias en el servidor.');
        }
    }
);


const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setNotificationsEnabledStatus: (state, action: PayloadAction<boolean>) => {
        state.notificationsEnabled = action.payload;
        state.error = null;
    },
  }, 
  extraReducers: (builder) => {
    builder
      .addCase(registerDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.token = expoToken; 
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

export const { setNotificationsEnabledStatus } = deviceSlice.actions; 
export default deviceSlice.reducer;