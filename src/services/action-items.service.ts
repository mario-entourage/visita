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
import type { ActionItem } from '@/types/action-item';

// ---------------------------------------------------------------------------
// Collection / document references
// ---------------------------------------------------------------------------

export function getActionItemsRef(db: Firestore) {
  return collection(db, 'action_items');
}

export function getActionItemRef(db: Firestore, itemId: string) {
  return doc(db, 'action_items', itemId);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createActionItem(
  db: Firestore,
  data: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(getActionItemsRef(db), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateActionItem(
  db: Firestore,
  itemId: string,
  data: Partial<Omit<ActionItem, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(getActionItemRef(db, itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function resolveActionItem(
  db: Firestore,
  itemId: string,
  resolvedByUserId: string
): Promise<void> {
  await updateDoc(getActionItemRef(db, itemId), {
    status: 'resolved',
    resolvedBy: resolvedByUserId,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getOpenActionItemsQuery(db: Firestore): Query {
  return query(
    getActionItemsRef(db),
    where('active', '==', true),
    where('status', 'in', ['open', 'in_progress']),
    orderBy('createdAt', 'desc')
  );
}

export function getActionItemsByDoctorQuery(
  db: Firestore,
  doctorId: string
): Query {
  return query(
    getActionItemsRef(db),
    where('doctorId', '==', doctorId),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
}
