import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Interaction } from '@/types/interaction';

export function timestampToDate(timestamp: Timestamp | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

export function formatTimestamp(
  timestamp: Timestamp | undefined,
  pattern = 'dd/MM/yyyy'
): string {
  const date = timestampToDate(timestamp);
  if (!date) return '-';
  return format(date, pattern, { locale: ptBR });
}

export function formatRelativeTime(timestamp: Timestamp | undefined): string {
  const date = timestampToDate(timestamp);
  if (!date) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

// ── Visit backdate helpers ────────────────────────────────────────────────────

// 5 minutes — chosen to be larger than normal clock drift / optimistic-write delay
// but small enough to catch genuine same-day late entries (e.g. logged 10 min after visit).
// Not a hard business rule; used only to decide whether to show the dual-date label.
export const LAG_THRESHOLD_MS = 5 * 60 * 1000;

// The date to display and sort by: visitDate if set, createdAt otherwise.
// createdAt can be null during optimistic write (serverTimestamp() pending).
export function effectiveDate(i: Interaction): Timestamp {
  return i.visitDate ?? i.createdAt;
}

// True when the rep logged the visit significantly later than it happened.
// Directional check — Math.abs() fires spuriously on sub-second clock drift.
export function hasLag(i: Interaction): boolean {
  if (!i.visitDate || !i.createdAt) return false;
  return (i.createdAt.toMillis() - i.visitDate.toMillis()) > LAG_THRESHOLD_MS;
}

// Sort comparator: newest effectiveDate first.
// Use this everywhere interactions are sorted — Timeline, ATIVIDADE tab, etc. —
// to ensure consistent ordering when visitDate is present.
export function sortByEffectiveDate(a: Interaction, b: Interaction): number {
  return effectiveDate(b).toMillis() - effectiveDate(a).toMillis();
}
