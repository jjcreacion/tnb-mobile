import { store } from '@/store'
import { setLogout } from '@/store/slices/authSlice'
import { clearUser } from '@/store/slices/userSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Servicio de autenticación
 * Maneja el logout y la limpieza de estado
 */
export const authLogoutService = {
  /**
   * Realiza un logout limpio:
   * 1. Limpia AsyncStorage
   * 2. Limpia Redux auth state
   * 3. Limpia Redux user state
   */
  async logout(): Promise<void> {
    try {
      // Limpiar AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('userId'),
      ])

      // Limpiar Redux state
      store.dispatch(setLogout())
      store.dispatch(clearUser())

      console.log('User logged out successfully')
    } catch (error) {
      console.error('Error during logout:', error)
      // Aun así continuamos con el logout aunque falle
      store.dispatch(setLogout())
      store.dispatch(clearUser())
    }
  },
}
