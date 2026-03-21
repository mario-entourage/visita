import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { startOfWeek, subWeeks } from 'date-fns';
import type { WeeklyGoal } from '@/types/weekly-goal';

function getGoalsRef(db: Firestore) {
  return collection(db, 'weekly_goals');
}

/** Get the goal for a rep for a specific week. */
export async function getGoalForWeek(
  db: Firestore,
  repId: string,
  weekStart: Date
): Promise<(WeeklyGoal & { id: string }) | null> {
  const dayStart = new Date(weekStart);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(weekStart);
  dayEnd.setHours(23, 59, 59, 999);

  const q = query(
    getGoalsRef(db),
    where('repId', '==', repId),
    where('weekStart', '>=', Timestamp.fromDate(dayStart)),
    where('weekStart', '<=', Timestamp.fromDate(dayEnd))
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as WeeklyGoal & { id: string };
}

/** Create or update a weekly goal. */
export async function setGoalForWeek(
  db: Firestore,
  repId: string,
  weekStart: Date,
  target: number,
  setBy: string
): Promise<void> {
  const existing = await getGoalForWeek(db, repId, weekStart);

  if (existing) {
    await updateDoc(doc(db, 'weekly_goals', existing.id), {
      target,
      setBy,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(getGoalsRef(db), {
      repId,
      weekStart: Timestamp.fromDate(weekStart),
      target,
      setBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Get the default target for this week:
 * 1. Prior week's goal target, OR
 * 2. Prior week's actual visit count if no goal was set
 */
export async function getPriorWeekDefault(
  db: Firestore,
  repId: string,
  currentWeekStart: Date
): Promise<number> {
  const priorWeekStart = subWeeks(currentWeekStart, 1);

  // Try prior week's goal first
  const priorGoal = await getGoalForWeek(db, repId, priorWeekStart);
  if (priorGoal) return priorGoal.target;

  // Fall back to prior week's actual visit count
  const priorEnd = new Date(currentWeekStart);
  priorEnd.setMilliseconds(-1); // End of prior week

  const { getVisitsRef } = await import('./visits.service');
  const q = query(
    getVisitsRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    where('scheduledFor', '>=', Timestamp.fromDate(priorWeekStart)),
    where('scheduledFor', '<', Timestamp.fromDate(currentWeekStart))
  );

  const snap = await getDocs(q);
  return snap.size || 5; // Default to 5 if no prior data at all
}

/** Get current week start (Monday 00:00). */
export function getCurrentWeekStart(): Date {
  const now = new Date();
  const ws = startOfWeek(now, { weekStartsOn: 1 });
  ws.setHours(0, 0, 0, 0);
  return ws;
}
