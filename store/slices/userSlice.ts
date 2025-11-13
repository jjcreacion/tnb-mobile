import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { userService } from '@/services/api'
import type { User, Address } from '@/types'

interface UserState {
  userId: string | null
  userName: string
  userBalance: number | null
  userData: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  userId: null,
  userName: 'User',
  userBalance: null,
  userData: null,
  loading: false,
  error: null,
}

export const toggleSmsNotifications = createAsyncThunk(
  'user/toggleSmsNotifications',
  async (status: boolean, { getState, rejectWithValue }) => {
    try {
      // ... (Lógica para obtener userId se mantiene)
      const state = getState() as { user: UserState };
      let userId = state.user.userId;
      
      if (!userId) {
        // Esto devuelve el mensaje "User ID no encontrado para el toggle."
        return rejectWithValue('User ID no encontrado para el toggle.');
      }

      // 1. Llamada al servicio
      const newStatus = await userService.toggleSmsNotifications(userId, status);
      
      return newStatus; 
    } catch (error: any) {
      // 2. Manejo Universal de Errores: 
      // Si la API lanza un error, usamos su mensaje o proporcionamos uno genérico.
      const errorMessage = error?.message || 'Error al conectar con el servidor.';
      
      console.error('Error al cambiar notificaciones SMS:', errorMessage); 
      
      // 3. Devolver el mensaje de error seguro
      return rejectWithValue(errorMessage);
    }
  }
);


export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (_, { rejectWithValue }) => {
    try {
      const userId = await AsyncStorage.getItem('userId')
      if (!userId) {
        throw new Error('User ID not found')
      }

      const userData = await userService.getUserById(userId)
      console.log(userData);

      let userName = 'User'
      if (userData?.person?.firstName && userData?.person?.lastName) {
        userName = `${userData.person.firstName} ${userData.person.lastName}`
      } else if (userData?.person?.firstName) {
        userName = userData.person.firstName
      }

      return {
        userId,
        userName,
        userBalance: userData.balance,
        userData,
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setUserBalance: (state, action: PayloadAction<number>) => {
      state.userBalance = action.payload
    },
    clearUser: (state) => {
      state.userId = null
      state.userName = 'User'
      state.userBalance = null
      state.userData = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.loading = false
        state.userId = action.payload.userId
        state.userName = action.payload.userName
        state.userBalance = action.payload.userBalance
        state.userData = action.payload.userData
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.userName = 'User'
        state.userBalance = null
      })
      .addCase(toggleSmsNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSmsNotifications.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.loading = false;
        const numericStatus = action.payload ? 1 : 0;
        
        if (state.userData) {
          state.userData.smsNotifications = numericStatus;
        }
      })
      .addCase(toggleSmsNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Error al cambiar notificaciones SMS:', action.payload);
      });
  },
})

export const { setUserName, setUserBalance, clearUser } = userSlice.actions
export default userSlice.reducer
