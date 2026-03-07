import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PROPENSITY_LABELS } from '@/lib/constants';

const COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#3b82f6',
};

interface PropensityBadgeProps {
  score: number | undefined;
}

export function PropensityBadge({ score }: PropensityBadgeProps) {
  const s = score ?? 0;
  if (s < 1 || s > 5) {
    return (
      <View style={[styles.badge, { backgroundColor: '#9ca3af' }]}>
        <Text style={styles.text}>N/A</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: COLORS[s] }]}>
      <Text style={styles.text}>
        {s} - {PROPENSITY_LABELS[s]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
