import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Interaction } from '@/types/interaction';
import { INTERACTION_TYPE_LABELS, RESULT_LABELS } from '@/lib/constants';
import { formatTimestamp, effectiveDate, hasLag, sortByEffectiveDate } from '@/lib/utils';

interface TimelineProps {
  interactions: (Interaction & { id: string })[];
}

export function Timeline({ interactions }: TimelineProps) {
  if (interactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhuma interação registrada</Text>
      </View>
    );
  }

  const sorted = [...interactions].sort(sortByEffectiveDate);

  return (
    <View style={styles.container}>
      {sorted.map((interaction, index) => (
        <View key={interaction.id} style={styles.item}>
          <View style={styles.dotColumn}>
            <View style={styles.dot} />
            {index < interactions.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.content}>
            <Text style={styles.type}>
              {interaction.type ? INTERACTION_TYPE_LABELS[interaction.type] : 'Visita'}
            </Text>
            <Text style={styles.result}>
              {RESULT_LABELS[interaction.resultCode] ?? `Código ${interaction.resultCode}`}
            </Text>
            {hasLag(interaction) ? (
              <Text style={styles.date}>
                {'Visita: '}
                {formatTimestamp(interaction.visitDate, 'dd/MM/yyyy')}
                {'  ·  Registrado: '}
                {formatTimestamp(interaction.createdAt, 'dd/MM/yyyy')}
              </Text>
            ) : (
              <Text style={styles.date}>
                {formatTimestamp(effectiveDate(interaction), 'dd/MM/yyyy HH:mm')}
              </Text>
            )}
            {interaction.notes ? (
              <Text style={styles.notes} numberOfLines={2}>
                {interaction.notes}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  result: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
