import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  Timestamp,
  Firestore,
  Query,
} from 'firebase/firestore';
import type { ScheduledVisit } from '@/types/scheduled-visit';

// ---------------------------------------------------------------------------
// Collection / document references
// ---------------------------------------------------------------------------

export function getVisitsRef(db: Firestore) {
  return collection(db, 'scheduled_visits');
}

export function getVisitRef(db: Firestore, visitId: string) {
  return doc(db, 'scheduled_visits', visitId);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createVisit(
  db: Firestore,
  data: Omit<ScheduledVisit, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(getVisitsRef(db), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVisit(
  db: Firestore,
  visitId: string,
  data: Partial<Omit<ScheduledVisit, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(getVisitRef(db, visitId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteVisit(
  db: Firestore,
  visitId: string
): Promise<void> {
  await updateDoc(getVisitRef(db, visitId), {
    active: false,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getUpcomingVisitsQuery(
  db: Firestore,
  repId: string
): Query {
  return query(
    getVisitsRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    where('status', '==', 'scheduled'),
    orderBy('scheduledFor', 'asc')
  );
}

export function getVisitsByDoctorQuery(
  db: Firestore,
  doctorId: string
): Query {
  return query(
    getVisitsRef(db),
    where('doctorId', '==', doctorId),
    where('active', '==', true),
    orderBy('scheduledFor', 'desc')
  );
}

// ---------------------------------------------------------------------------
// Calendar sync helpers
// ---------------------------------------------------------------------------

/** Query visits for a rep within a date range. */
export function getVisitsByWeekQuery(
  db: Firestore,
  repId: string,
  start: Date,
  end: Date
): Query {
  return query(
    getVisitsRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    where('scheduledFor', '>=', Timestamp.fromDate(start)),
    where('scheduledFor', '<=', Timestamp.fromDate(end)),
    orderBy('scheduledFor', 'asc')
  );
}

/** Check if a visit already exists for a doctor on a specific day (dedup). */
export async function visitExistsForDoctorOnDate(
  db: Firestore,
  repId: string,
  doctorId: string,
  date: Date
): Promise<boolean> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const q = query(
    getVisitsRef(db),
    where('repId', '==', repId),
    where('doctorId', '==', doctorId),
    where('active', '==', true),
    where('scheduledFor', '>=', Timestamp.fromDate(dayStart)),
    where('scheduledFor', '<=', Timestamp.fromDate(dayEnd))
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/** Check if a visit with this Google Calendar event ID already exists. */
export async function visitExistsForCalendarEvent(
  db: Firestore,
  repId: string,
  googleCalendarEventId: string
): Promise<boolean> {
  const q = query(
    getVisitsRef(db),
    where('repId', '==', repId),
    where('googleCalendarEventId', '==', googleCalendarEventId),
    where('active', '==', true)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/** Create multiple visits in parallel (much faster than sequential). */
export async function bulkCreateVisits(
  db: Firestore,
  visits: Array<Omit<ScheduledVisit, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<string[]> {
  return Promise.all(visits.map((v) => createVisit(db, v)));
}

/** Mark a visit as synced to Google Calendar. */
export async function markVisitSynced(
  db: Firestore,
  visitId: string,
  googleCalendarEventId: string
): Promise<void> {
  await updateVisit(db, visitId, {
    googleCalendarEventId,
  });
}
