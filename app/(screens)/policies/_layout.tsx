import { Stack } from 'expo-router';
import React from 'react';

export default function PoliciesLayout() {
  return (
    <Stack>
      <Stack.Screen name="LongGrassPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="ThreeCutMinimum" options={{ headerShown: false }} />
      <Stack.Screen name="TrustAndSafety" options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" options={{ headerShown: false }} />
    </Stack>
  );
}

