import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getActiveRepsQuery } from '@/services/reps.service';
import { getUpcomingVisitsQuery } from '@/services/visits.service';
import { WeeklyGoalEditor } from '@/components/WeeklyGoalEditor';
import { formatTimestamp } from '@/lib/utils';
import { C, S } from '@/theme';
import type { Representante } from '@/types/representante';
import type { ScheduledVisit } from '@/types/scheduled-visit';

export default function ManagerSchedulesScreen() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

  const repsQuery = useMemoFirebase(
    () => (db ? getActiveRepsQuery(db) : null),
    [db]
  );
  const { data: reps, isLoading: repsLoading } = useCollection<Representante>(repsQuery);

  // Get visits for the selected rep (by their userId, falling back to id)
  const visitsQuery = useMemoFirebase(
    () => {
      if (!db || !selectedRepId || !reps) return null;
      const rep = reps.find((r) => r.id === selectedRepId);
      const uid = rep?.userId ?? selectedRepId;
      return getUpcomingVisitsQuery(db, uid);
    },
    [db, selectedRepId, reps]
  );
  const { data: visits, isLoading: visitsLoading } = useCollection<ScheduledVisit>(visitsQuery);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Agendas',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <View style={styles.container}>
        {/* Rep selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.repRow}
          style={styles.repScroll}
        >
          {repsLoading ? (
            <ActivityIndicator size="small" color={C.teal} />
          ) : (
            reps?.map((rep) => {
              const active = selectedRepId === rep.id;
              return (
                <Pressable
                  key={rep.id}
                  style={[styles.repChip, active ? styles.repChipActive : null]}
                  onPress={() => setSelectedRepId(active ? null : rep.id)}
                >
                  <Text style={[styles.repChipText, active ? styles.repChipTextActive : null]}>
                    {rep.name.split(' ')[0]}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        {/* Weekly goal + schedule meeting (when rep selected) */}
        {selectedRepId && db && user ? (
          <View style={styles.goalArea}>
            <WeeklyGoalEditor
              db={db}
              repId={(() => {
                const rep = reps?.find((r) => r.id === selectedRepId);
                return rep?.userId ?? selectedRepId;
              })()}
              managerId={user.uid}
              visitCount={visits?.length ?? 0}
            />
            <Pressable
              style={styles.scheduleMeetingBtn}
              onPress={() => {
                const rep = reps?.find((r) => r.id === selectedRepId);
                router.push({
                  pathname: '/(app)/manager/schedule-meeting',
                  params: {
                    doctorId: '',
                    doctorName: '',
                    repId: rep?.userId ?? selectedRepId,
                    repName: rep?.name ?? '',
                  },
                });
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={C.teal} />
              <Text style={styles.scheduleMeetingText}>Agendar Reunião</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Visits list */}
        {!selectedRepId ? (
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={48} color={C.textLight} />
            <Text style={styles.placeholder}>Selecione um representante</Text>
          </View>
        ) : visitsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.teal} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {visits && visits.length > 0 ? (
              visits.map((visit) => (
                <Pressable
                  key={visit.id}
                  style={styles.card}
                  onPress={() => router.push(`/(app)/doctor/${visit.doctorId}`)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.doctorName}>
                      {visit.doctorName || 'Médico'}
                    </Text>
                    <Text style={styles.visitTime}>
                      {formatTimestamp(visit.scheduledFor, "EEEE d 'de' MMM', ' HH:mm")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.textLight} />
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma visita agendada</Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  repScroll: {
    maxHeight: 52,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  repRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  repChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.teal,
  },
  repChipActive: {
    backgroundColor: C.teal,
  },
  repChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.teal,
  },
  repChipTextActive: {
    color: C.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholder: {
    fontSize: 14,
    color: C.textLight,
  },
  list: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 12,
    padding: 14,
    ...S.card,
  },
  cardContent: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  visitTime: {
    fontSize: 13,
    color: C.teal,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: C.textLight,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  goalArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scheduleMeetingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  scheduleMeetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.teal,
  },
});
