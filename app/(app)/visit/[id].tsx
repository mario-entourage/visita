import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/use-doc';
import { formatTimestamp } from '@/lib/utils';
import type { ScheduledVisit } from '@/types/scheduled-visit';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  rescheduled: 'Reagendada',
};

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useFirestore();

  const visitRef = useMemoFirebase(
    () => (db && id ? doc(db, 'scheduled_visits', id) : null),
    [db, id]
  );

  const { data: visit, isLoading } = useDoc<ScheduledVisit>(visitRef);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Visita não encontrada</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: visit.doctorName || 'Detalhes da Visita' }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Médico</Text>
          <Text style={styles.value}>{visit.doctorName || '-'}</Text>

          <Text style={styles.label}>Data Agendada</Text>
          <Text style={styles.value}>
            {formatTimestamp(visit.scheduledFor, "dd/MM/yyyy 'às' HH:mm")}
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {STATUS_LABELS[visit.status] || visit.status}
          </Text>

          {visit.notes ? (
            <>
              <Text style={styles.label}>Observações</Text>
              <Text style={styles.value}>{visit.notes}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
});
