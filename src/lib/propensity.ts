import type { Interaction } from '@/types/interaction';
import { INTERACTION_WEIGHTS } from './constants';

/**
 * Calculate propensity score (1-5) from a list of interactions.
 *
 * Algorithm: weighted average of the last N interactions' result codes,
 * mapped to a 1-5 scale.
 *
 * - Result codes range from 1 (Não Receptivo) to 7 (Evangelizando)
 * - Each interaction type has a weight (field_visit=1.0, clinical_event=1.5, etc.)
 * - The weighted average is mapped: 1-7 → 1-5
 */
export function calculatePropensity(
  interactions: Pick<Interaction, 'type' | 'resultCode'>[],
  maxInteractions = 10
): number {
  if (interactions.length === 0) return 1;

  const recent = interactions.slice(0, maxInteractions);

  let weightedSum = 0;
  let totalWeight = 0;

  for (const interaction of recent) {
    const weight = INTERACTION_WEIGHTS[interaction.type] ?? 1.0;
    weightedSum += interaction.resultCode * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 1;

  const weightedAvg = weightedSum / totalWeight;

  // Map 1-7 range to 1-5 range
  const score = Math.round(((weightedAvg - 1) / 6) * 4 + 1);

  return Math.max(1, Math.min(5, score));
}
