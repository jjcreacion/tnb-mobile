import { Stack } from 'expo-router'
import React from 'react'

export default function RootLayout() {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="loginMigrated" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="registerMigrated" options={{ headerShown: false }} />
        <Stack.Screen name="RequestModal" options={{ headerShown: false }} />
        <Stack.Screen name="RequestModalMigrated" options={{ headerShown: false }} />
        <Stack.Screen name="ShareAndEarn" options={{ headerShown: false }} />
        <Stack.Screen name="TermsAndPolicies" options={{ headerShown: false }} />
        <Stack.Screen name="policies" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="profileMigrated" options={{ headerShown: false }} />
        <Stack.Screen name="ServiceRequestDetail" options={{ headerShown: false }} />
        <Stack.Screen name="registerComplete" options={{ headerShown: false }} />
        <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="singup" options={{ headerShown: false }} />
        <Stack.Screen name="verificode" options={{ headerShown: false }} />
        <Stack.Screen name="verificodeReset" options={{ headerShown: false }} />
        <Stack.Screen name="SetNewPassword" options={{ headerShown: false }} />
        <Stack.Screen name="ModalContext" options={{ headerShown: false }} />
    </Stack>   
  )
}