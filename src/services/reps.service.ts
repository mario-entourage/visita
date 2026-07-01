import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Firestore,
  Query,
  serverTimestamp,
} from 'firebase/firestore';

export function getRepsRef(db: Firestore) {
  return collection(db, 'representantes');
}

export function getActiveRepsQuery(db: Firestore): Query {
  return query(
    getRepsRef(db),
    where('active', '==', true),
    orderBy('name', 'asc')
  );
}

/**
 * Creates the signed-in user's own representantes/{uid} profile if it
 * doesn't exist yet. Without this, nothing ever provisions the doc a new
 * rep needs to show up in Equipe / Usuários — see firestore.rules
 * (representantes write: auth.uid == userId).
 */
export async function ensureRepProfile(
  db: Firestore,
  uid: string,
  name: string,
  email: string | null
): Promise<void> {
  const ref = doc(db, 'representantes', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    name,
    email: email ?? undefined,
    userId: uid,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
