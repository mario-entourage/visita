import React from 'react';
import { Stack } from 'expo-router';
import { AuthGuard } from '@/firebase/auth-guard';
import { C } from '@/theme';

const headerDefaults = {
  headerStyle: { backgroundColor: C.tealDark },
  headerTitleStyle: { color: C.white, fontWeight: '700' as const },
  headerTintColor: C.white,
};

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="doctors"
          options={{
            headerShown: true,
            title: 'Médicos',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="doctor/[id]"
          options={{
            headerShown: true,
            title: 'Médico',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="interaction/new"
          options={{
            headerShown: true,
            title: 'Nova Interação',
            presentation: 'modal',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="visit/[id]"
          options={{
            headerShown: true,
            title: 'Visita',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="manager/team"
          options={{
            headerShown: true,
            title: 'Equipe',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="manager/schedules"
          options={{
            headerShown: true,
            title: 'Agendas',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="manager/rep-detail"
          options={{
            headerShown: true,
            title: 'Representante',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="manager/schedule-meeting"
          options={{
            headerShown: true,
            title: 'Agendar Reunião',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="expense/index"
          options={{
            headerShown: true,
            title: 'Despesas',
            headerBackTitle: 'Voltar',
            ...headerDefaults,
          }}
        />
        <Stack.Screen
          name="expense/new"
          options={{
            headerShown: true,
            title: 'Nova Despesa',
            headerBackTitle: 'Voltar',
            presentation: 'modal',
            ...headerDefaults,
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
