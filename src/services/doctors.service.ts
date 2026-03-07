import {
  collection,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore,
  Query,
} from 'firebase/firestore';
import type { Doctor } from '@/types/doctor';

// ---------------------------------------------------------------------------
// Collection / document references
// ---------------------------------------------------------------------------

export function getDoctorsRef(db: Firestore) {
  return collection(db, 'doctors');
}

export function getDoctorRef(db: Firestore, doctorId: string) {
  return doc(db, 'doctors', doctorId);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getActiveDoctorsQuery(db: Firestore): Query {
  return query(
    getDoctorsRef(db),
    where('active', '==', true),
    orderBy('fullName', 'asc')
  );
}

export function getDoctorById(
  db: Firestore,
  doctorId: string
): Promise<(Doctor & { id: string }) | null> {
  return getDoc(getDoctorRef(db, doctorId)).then((snap) => {
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Doctor & { id: string };
  });
}

// ---------------------------------------------------------------------------
// CRM-specific operations
// ---------------------------------------------------------------------------

export async function updateDoctorPropensity(
  db: Firestore,
  doctorId: string,
  score: number,
  lastResult: number
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    propensityScore: score,
    lastInteractionResult: lastResult,
    lastInteractionAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function incrementDoctorTouches(
  db: Firestore,
  doctorId: string,
  currentTouches: number
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    totalTouches: currentTouches + 1,
    updatedAt: serverTimestamp(),
  });
}

export async function flagDoctorForFollowUp(
  db: Firestore,
  doctorId: string,
  flagged: boolean
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    flaggedForFollowUp: flagged,
    updatedAt: serverTimestamp(),
  });
}
