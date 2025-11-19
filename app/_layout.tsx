import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="party-type" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="service-request" options={{ headerShown: false }} />
      <Stack.Screen name="my-requests" options={{ headerShown: false }} />
      <Stack.Screen name="recent-requests" options={{ headerShown: false }} />
      <Stack.Screen name="request-detail" options={{ headerShown: false }} />
      <Stack.Screen name="request-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="proposal-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-payment" options={{ headerShown: false }} />
      <Stack.Screen name="reservation-confirmed" options={{ headerShown: false }} />
    </Stack>
  );
}
