import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Firestore,
  Query,
} from 'firebase/firestore';
import type { Interaction } from '@/types/interaction';

// ---------------------------------------------------------------------------
// Collection / document references
// ---------------------------------------------------------------------------

export function getInteractionsRef(db: Firestore) {
  return collection(db, 'interactions');
}

export function getInteractionRef(db: Firestore, interactionId: string) {
  return doc(db, 'interactions', interactionId);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createInteraction(
  db: Firestore,
  data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(getInteractionsRef(db), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateInteraction(
  db: Firestore,
  interactionId: string,
  data: Partial<Omit<Interaction, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(getInteractionRef(db, interactionId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteInteraction(
  db: Firestore,
  interactionId: string
): Promise<void> {
  await updateDoc(getInteractionRef(db, interactionId), {
    active: false,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Last N interactions for a doctor's timeline. Default cap: 20. */
export function getInteractionsByDoctorQuery(
  db: Firestore,
  doctorId: string,
  cap = 20
): Query {
  return query(
    getInteractionsRef(db),
    where('doctorId', '==', doctorId),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(cap)
  );
}

/** Last N interactions for a rep's activity history. Default cap: 30. */
export function getInteractionsByRepQuery(
  db: Firestore,
  repId: string,
  cap = 30
): Query {
  return query(
    getInteractionsRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(cap)
  );
}
