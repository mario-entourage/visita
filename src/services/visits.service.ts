import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
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
