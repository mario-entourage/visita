import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/use-doc';
import { useCollection } from '@/firebase/use-collection';
import { getInteractionsByDoctorQuery } from '@/services/interactions.service';
import { PropensityBadge } from '@/components/PropensityBadge';
import { Timeline } from '@/components/Timeline';
import type { Doctor } from '@/types/doctor';
import type { Interaction } from '@/types/interaction';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useFirestore();
  const router = useRouter();

  const doctorRef = useMemoFirebase(
    () => (db && id ? doc(db, 'doctors', id) : null),
    [db, id]
  );

  const { data: doctor, isLoading: doctorLoading } = useDoc<Doctor>(doctorRef);

  const interactionsQuery = useMemoFirebase(
    () => (db && id ? getInteractionsByDoctorQuery(db, id) : null),
    [db, id]
  );

  const { data: interactions, isLoading: interactionsLoading } =
    useCollection<Interaction>(interactionsQuery);

  if (doctorLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Médico não encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: doctor.fullName }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{doctor.fullName}</Text>
          <Text style={styles.specialty}>
            {doctor.mainSpecialty || 'Sem especialidade'}
          </Text>
          {doctor.city && doctor.state && (
            <Text style={styles.location}>
              {doctor.city}, {doctor.state}
            </Text>
          )}
          <View style={styles.badges}>
            <PropensityBadge score={doctor.propensityScore} />
            {doctor.totalTouches != null && (
              <Text style={styles.touches}>
                {doctor.totalTouches}{' '}
                {doctor.totalTouches === 1 ? 'toque' : 'toques'}
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: '/(app)/interaction/new',
                params: { doctorId: id, doctorName: doctor.fullName },
              })
            }
          >
            <Text style={styles.actionText}>Registrar Interação</Text>
          </Pressable>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Histórico de Interações</Text>
        {interactionsLoading ? (
          <ActivityIndicator
            size="small"
            color="#3b82f6"
            style={{ marginTop: 16 }}
          />
        ) : (
          <Timeline interactions={interactions ?? []} />
        )}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  specialty: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  touches: {
    fontSize: 13,
    color: '#6b7280',
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
