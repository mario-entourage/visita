import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getInteractionsByRepQuery } from '@/services/interactions.service';
import { Timeline } from '@/components/Timeline';
import { C } from '@/theme';
import type { Interaction } from '@/types/interaction';

export default function RepDetailScreen() {
  const { repId, repName } = useLocalSearchParams<{
    repId: string;
    repName: string;
  }>();
  const db = useFirestore();

  const interactionsQuery = useMemoFirebase(
    () => (db && repId ? getInteractionsByRepQuery(db, repId) : null),
    [db, repId]
  );

  const { data: interactions, isLoading } = useCollection<Interaction>(interactionsQuery);

  const totalInteractions = interactions?.length ?? 0;
  const totalSamples = interactions?.filter((i) => i.samplesDelivered).length ?? 0;
  const totalFollowUps = interactions?.filter((i) => i.followUpScheduled).length ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: repName || 'Representante',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.teal} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <StatCard
                icon="chatbubbles-outline"
                label="Interações"
                value={String(totalInteractions)}
              />
              <StatCard
                icon="medkit-outline"
                label="Amostras"
                value={String(totalSamples)}
              />
              <StatCard
                icon="calendar-outline"
                label="Follow-ups"
                value={String(totalFollowUps)}
              />
            </View>

            {/* Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histórico de Interações</Text>
              <Timeline interactions={interactions ?? []} />
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={C.teal} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
});
