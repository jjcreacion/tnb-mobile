import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />

        <Stack.Screen name="register" options={{ headerShown: false }} />

        <Stack.Screen name="RequestModal" options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" options={{ headerShown: false }} />
        <Stack.Screen name="ShareAndEarn" options={{ headerShown: false }} />
        <Stack.Screen name="TermsAndPolicies" options={{ headerShown: false }} />
        <Stack.Screen name="policies" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />

        <Stack.Screen name="ServiceRequestDetail" options={{ headerShown: false }} />
        <Stack.Screen name="registerComplete" options={{ headerShown: false }} />
        <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="verificode" options={{ headerShown: false }} />
        <Stack.Screen name="verificodeReset" options={{ headerShown: false }} />
        <Stack.Screen name="SetNewPassword" options={{ headerShown: false }} />
        <Stack.Screen name="NotificationDetail" options={{ headerShown: false }} />
    </Stack>   
  )
}