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

export function getInteractionsByDoctorQuery(
  db: Firestore,
  doctorId: string
): Query {
  return query(
    getInteractionsRef(db),
    where('doctorId', '==', doctorId),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
}

export function getInteractionsByRepQuery(
  db: Firestore,
  repId: string
): Query {
  return query(
    getInteractionsRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
}
