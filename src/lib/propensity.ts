import type { Interaction } from '@/types/interaction';
import { INTERACTION_WEIGHTS } from './constants';

/**
 * Calculate propensity score (1-5) from a list of interactions.
 *
 * Algorithm: weighted average of the last N interactions' result codes.
 * Result codes already range 1-5, matching propensity scale directly.
 *
 * - Result codes: 1 (Não) to 5 (Prescrevendo)
 * - Each interaction type has a weight (field_visit=1.0, clinical_event=1.5, etc.)
 * - The weighted average is rounded to nearest integer
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

  const score = Math.round(weightedSum / totalWeight);

  return Math.max(1, Math.min(5, score));
}
