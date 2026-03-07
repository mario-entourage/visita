import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getUpcomingVisitsQuery } from '@/services/visits.service';
import { formatTimestamp } from '@/lib/utils';
import type { ScheduledVisit } from '@/types/scheduled-visit';

export default function ScheduleScreen() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const visitsQuery = useMemoFirebase(
    () => (db && user ? getUpcomingVisitsQuery(db, user.uid) : null),
    [db, user?.uid]
  );

  const { data: visits, isLoading } = useCollection<ScheduledVisit>(visitsQuery);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/visit/${item.id}`)}
          >
            <Text style={styles.doctorName}>
              {item.doctorName || 'Médico'}
            </Text>
            <Text style={styles.date}>
              {formatTimestamp(item.scheduledFor, "dd/MM/yyyy 'às' HH:mm")}
            </Text>
            {item.notes && (
              <Text style={styles.notes} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Nenhuma visita agendada</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 4,
  },
  notes: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
