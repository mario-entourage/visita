import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { Doctor } from '@/types/doctor';
import { PropensityBadge } from './PropensityBadge';
import { formatRelativeTime } from '@/lib/utils';
import { RESULT_LABELS, DOCTOR_TAG_MAP } from '@/lib/constants';
import { C, S, RESULT_COLORS } from '@/theme';

interface DoctorCardProps {
  doctor: Doctor & { id: string };
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const router = useRouter();

  const pipelineLabel = doctor.lastInteractionResult
    ? RESULT_LABELS[doctor.lastInteractionResult]
    : null;
  const pipelineColor = doctor.lastInteractionResult
    ? RESULT_COLORS[doctor.lastInteractionResult]
    : null;

  const tags = (doctor.tags ?? [])
    .map((k) => DOCTOR_TAG_MAP[k])
    .filter(Boolean);

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

          {/* Pipeline stage */}
          {pipelineLabel && pipelineColor ? (
            <View style={[styles.pipelineBadge, { backgroundColor: pipelineColor.bg }]}>
              <Text style={[styles.pipelineText, { color: pipelineColor.text }]}>
                {pipelineLabel}
              </Text>
            </View>
          ) : null}

          {/* Tags (abbreviated) */}
          {tags.length > 0 ? (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View
                  key={tag.key}
                  style={[styles.tagChip, { backgroundColor: tag.color + '22' }]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>
                    {tag.abbr}
                  </Text>
                </View>
              ))}
            </View>
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
    ...S.card,
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
  pipelineBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
  },
  pipelineText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
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
