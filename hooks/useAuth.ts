import { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { rehydrateAuth } from '@/store/slices/authSlice'
import { useEffect } from 'react'

/**
 * Hook personalizado para acceder al estado de autenticación
 * Proporciona:
 * - isAuthenticated: booleano que indica si hay sesión activa
 * - accessToken: token JWT almacenado
 * - userId: ID del usuario
 * - isLoading: indica si se está cargando el estado de autenticación
 * - isHydrated: indica si se ha completado la recuperación del estado persistido
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state: RootState) => state.auth)

  return {
    isAuthenticated: authState.isAuthenticated,
    accessToken: authState.accessToken,
    userId: authState.userId,
    isLoading: authState.isLoading,
    isHydrated: authState.isHydrated,
    error: authState.error,
  }
}

/**
 * Hook que se ejecuta una sola vez al iniciar la app
 * para recuperar el estado de autenticación desde AsyncStorage
 */
export const useAuthRehydration = () => {
  const dispatch = useAppDispatch()
  const { isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) {
      dispatch(rehydrateAuth() as any)
    }
  }, [dispatch, isHydrated])

  return isHydrated
}
