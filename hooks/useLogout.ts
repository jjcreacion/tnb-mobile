import { authLogoutService } from '@/services/api/authLogoutService'
import { useAppDispatch } from '@/store/hooks'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'

/**
 * Hook personalizado para manejar el logout
 * Limpia el estado y redirige al login
 */
export const useLogout = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const logout = useCallback(async () => {
    try {
      await authLogoutService.logout()
      // Redirigir a login sin posibilidad de retroceso
      router.replace('/(screens)/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Aun así redirigir al login
      router.replace('/(screens)/login')
    }
  }, [router, dispatch])

  return logout
}
