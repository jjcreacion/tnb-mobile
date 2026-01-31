import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  userId: string | null
  isLoading: boolean
  error: string | null
  isHydrated: boolean // Indica si se ha completado la recuperación del estado persistido
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  userId: null,
  isLoading: false,
  error: null,
  isHydrated: false,
}

/**
 * Thunk asincrónico para recuperar el estado de autenticación desde AsyncStorage
 * Se ejecuta al iniciar la app para restaurar la sesión si existe
 */
export const rehydrateAuth = createAsyncThunk(
  'auth/rehydrate',
  async (_, { rejectWithValue }) => {
    try {
      const [accessToken, userId] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userId'),
      ])

      // Si ambos existen, el usuario está autenticado
      if (accessToken && userId) {
        return {
          isAuthenticated: true,
          accessToken,
          userId,
        }
      }

      return {
        isAuthenticated: false,
        accessToken: null,
        userId: null,
      }
    } catch (error) {
      console.error('Error rehydrating auth:', error)
      return rejectWithValue('Failed to rehydrate authentication state')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Establece el estado de autenticación cuando el login es exitoso
     */
    setAuthenticated: (
      state,
      action: PayloadAction<{ accessToken: string; userId: string }>
    ) => {
      state.isAuthenticated = true
      state.accessToken = action.payload.accessToken
      state.userId = action.payload.userId
      state.error = null
    },

    /**
     * Limpia el estado de autenticación cuando el usuario hace logout
     */
    setLogout: (state) => {
      state.isAuthenticated = false
      state.accessToken = null
      state.userId = null
      state.error = null
    },

    /**
     * Establece un mensaje de error
     */
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },

    /**
     * Limpia el mensaje de error
     */
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Rehydrate - Pending
      .addCase(rehydrateAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      // Rehydrate - Fulfilled
      .addCase(rehydrateAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isHydrated = true
        state.isAuthenticated = action.payload.isAuthenticated
        state.accessToken = action.payload.accessToken
        state.userId = action.payload.userId
      })
      // Rehydrate - Rejected
      .addCase(rehydrateAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isHydrated = true
        state.error = action.payload as string
        state.isAuthenticated = false
        state.accessToken = null
        state.userId = null
      })
  },
})

export const {
  setAuthenticated,
  setLogout,
  setAuthError,
  clearAuthError,
} = authSlice.actions

export default authSlice.reducer
