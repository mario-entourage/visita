import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
