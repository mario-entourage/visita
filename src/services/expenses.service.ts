import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import type { Expense, ExpenseCategory } from '@/types/expense';

// ---------------------------------------------------------------------------
// Collection reference
// ---------------------------------------------------------------------------

export function getExpensesRef(db: Firestore) {
  return collection(db, 'expenses');
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** All expenses for a given rep, newest first */
export function getExpensesByRepQuery(db: Firestore, repId: string) {
  return query(
    getExpensesRef(db),
    where('repId', '==', repId),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
}

// ---------------------------------------------------------------------------
// Upload helper
// ---------------------------------------------------------------------------

/**
 * Uploads a receipt image (given as a local URI) to Firebase Storage
 * and returns { receiptUrl, receiptPath }.
 */
export async function uploadReceipt(
  storage: FirebaseStorage,
  repId: string,
  localUri: string
): Promise<{ receiptUrl: string; receiptPath: string }> {
  // Convert local URI to blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  const ext = localUri.split('.').pop() ?? 'jpg';
  const path = `expenses/${repId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);
  const receiptUrl = await getDownloadURL(storageRef);

  return { receiptUrl, receiptPath: path };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createExpense(
  db: Firestore,
  data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(getExpensesRef(db), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
