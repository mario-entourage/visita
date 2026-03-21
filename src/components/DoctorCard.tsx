import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { Doctor } from '@/types/doctor';
import { PropensityBadge } from './PropensityBadge';
import { formatRelativeTime } from '@/lib/utils';

interface DoctorCardProps {
  doctor: Doctor & { id: string };
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/doctor/${doctor.id}`)}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{doctor.fullName}</Text>
          <Text style={styles.specialty}>
            {doctor.mainSpecialty || 'Sem especialidade'}
          </Text>
          {doctor.city && doctor.state ? (
            <Text style={styles.location}>
              {doctor.city}, {doctor.state}
            </Text>
          ) : null}
          {doctor.lastInteractionAt ? (
            <Text style={styles.lastVisit}>
              Última visita: {formatRelativeTime(doctor.lastInteractionAt)}
            </Text>
          ) : null}
        </View>
        <View style={styles.badge}>
          <PropensityBadge score={doctor.propensityScore} />
          {doctor.totalTouches != null ? (
            <Text style={styles.touches}>
              {doctor.totalTouches} {doctor.totalTouches === 1 ? 'toque' : 'toques'}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  specialty: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  lastVisit: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  badge: {
    alignItems: 'flex-end',
  },
  touches: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});
