import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Firestore,
  Query,
} from 'firebase/firestore';
import type { Doctor } from '@/types/doctor';
import type { ReportReason } from '@/types/doctor-report';

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

export function getFlaggedDoctorsQuery(db: Firestore): Query {
  return query(
    getDoctorsRef(db),
    where('active', '==', true),
    where('flaggedForFollowUp', '==', true),
    orderBy('fullName', 'asc')
  );
}

/**
 * Active doctors filtered by state — used by the assign-rep dropdown so
 * managers don't have to load the full doctor catalogue.
 */
export function getActiveDoctorsByStateQuery(db: Firestore, state: string): Query {
  return query(
    getDoctorsRef(db),
    where('active', '==', true),
    where('state', '==', state),
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
// Rep assignment
// ---------------------------------------------------------------------------

/** Assign a rep to a doctor (manager action). */
export async function assignRepToDoctor(
  db: Firestore,
  doctorId: string,
  repId: string | null
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    assignedRepId: repId ?? '',
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Doctor creation (field entry / calendar sync)
// ---------------------------------------------------------------------------

/** Create a doctor from the field (rep quick-add or calendar sync). */
export async function createDoctor(
  db: Firestore,
  data: {
    fullName: string;
    firstName: string;
    lastName?: string;
    state?: string;
    mainSpecialty?: string;
    city?: string;
    phone?: string;
    mobilePhone?: string;
    crm?: string;
    createdByRepId: string;
  }
): Promise<string> {
  const ref = await addDoc(getDoctorsRef(db), {
    ...data,
    crm: data.crm ?? '',
    active: true,
    source: 'field_entry',
    totalTouches: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** One-time fetch of all active doctors (not real-time). For sync matching. */
export async function getAllActiveDoctors(
  db: Firestore
): Promise<(import('@/types/doctor').Doctor & { id: string })[]> {
  const q = getActiveDoctorsQuery(db);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (import('@/types/doctor').Doctor & { id: string })[];
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

/**
 * Unflag a doctor with a required note explaining why.
 * Sets flaggedForFollowUp=false and writes the audit trail fields.
 */
export async function unflagDoctorWithNote(
  db: Firestore,
  doctorId: string,
  repId: string,
  note: string
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    flaggedForFollowUp: false,
    unflaggedBy: repId,
    unflaggedAt: serverTimestamp(),
    unflagNote: note,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Doctor tags (Gerente/admin only)
// ---------------------------------------------------------------------------

import { VALID_TAG_KEYS } from '@/lib/constants';

/** Replace a doctor's tags with a validated set. */
export async function updateDoctorTags(
  db: Firestore,
  doctorId: string,
  tags: string[]
): Promise<void> {
  // Filter to valid keys before writing — defensive against stale UI
  const validTags = tags.filter((t) => VALID_TAG_KEYS.has(t));
  await updateDoc(getDoctorRef(db, doctorId), {
    tags: validTags,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Doctor-not-at-address reporting (rep field action)
// ---------------------------------------------------------------------------

/**
 * Report that a doctor was not found at their listed address.
 *
 * Creates a `doctor_reports` document (for analyst/admin follow-up) and
 * marks the doctor as reported so the manager can see it and credit the rep.
 */
export async function reportDoctor(
  db: Firestore,
  doctorId: string,
  data: {
    repId: string;
    repName?: string;
    doctorName: string;
    reason: ReportReason;
    notes?: string;
  }
): Promise<string> {
  // 1. Create the report document
  const reportRef = await addDoc(collection(db, 'doctor_reports'), {
    doctorId,
    doctorName: data.doctorName,
    repId: data.repId,
    repName: data.repName ?? '',
    reason: data.reason,
    notes: data.notes ?? '',
    status: 'pending',
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2. Flag the doctor as reported (manager visibility)
  await updateDoc(getDoctorRef(db, doctorId), {
    reported: true,
    reportedAt: serverTimestamp(),
    reportedBy: data.repId,
    reportedReason: data.reason,
    updatedAt: serverTimestamp(),
  });

  return reportRef.id;
}

/**
 * Atomically records that an interaction happened:
 * increments totalTouches by 1, stores lastInteractionAt and lastInteractionResult.
 * Called from interaction/new.tsx after a successful createInteraction().
 */
export async function recordInteractionOnDoctor(
  db: Firestore,
  doctorId: string,
  resultCode: number
): Promise<void> {
  await updateDoc(getDoctorRef(db, doctorId), {
    totalTouches: increment(1),
    lastInteractionAt: serverTimestamp(),
    lastInteractionResult: resultCode,
    updatedAt: serverTimestamp(),
  });
}
