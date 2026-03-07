import React from 'react';
import { Stack } from 'expo-router';
import { AuthGuard } from '@/firebase/auth-guard';

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="doctor/[id]"
          options={{
            headerShown: true,
            title: 'Médico',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="interaction/new"
          options={{
            headerShown: true,
            title: 'Nova Interação',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="visit/[id]"
          options={{
            headerShown: true,
            title: 'Visita',
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
