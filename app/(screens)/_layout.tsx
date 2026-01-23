import { useAuth } from '@/hooks/useAuth'
import { Stack } from 'expo-router'

export default function ScreensLayout() {
  const { isAuthenticated } = useAuth()

  return (
    <Stack>
        {/* Pantalla de bienvenida - Siempre mostrar */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />

        {/* Login - Deshabilitar gestos si ya está autenticado */}
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isAuthenticated,
          }} 
        />

        {/* Registro - Deshabilitar gestos si ya está autenticado */}
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isAuthenticated,
          }} 
        />

        <Stack.Screen 
          name="RequestModal" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="Notifications" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="ShareAndEarn" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
            name="TermsAndPolicies" 
            options={{ 
                headerShown: false, 
                presentation: 'modal' 
            }} 
        />
        
        <Stack.Screen 
          name="policies" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false 
          }} 
        />

        <Stack.Screen 
          name="ServiceRequestDetail" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="registerComplete" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isAuthenticated,
          }} 
        />
        
        <Stack.Screen 
          name="resetPassword" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isAuthenticated,
          }} 
        />
        
        <Stack.Screen 
          name="verificode" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="verificodeReset" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="SetNewPassword" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="NotificationDetail" 
          options={{ 
            headerShown: false 
          }} 
        />
    </Stack>   
  )
}