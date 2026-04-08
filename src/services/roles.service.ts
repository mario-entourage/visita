import {
  collection,
  doc,
  query,
  setDoc,
  Firestore,
  Query,
  serverTimestamp,
} from 'firebase/firestore';
import type { UserRole } from '@/types/roles';

export function getRolesRef(db: Firestore) {
  return collection(db, 'roles');
}

/** Query all role documents (admin only — enforced by Firestore rules). */
export function getAllRolesQuery(db: Firestore): Query {
  return query(getRolesRef(db));
}

/** Set a user's role. Creates the doc if it doesn't exist. */
export async function setUserRole(
  db: Firestore,
  userId: string,
  role: UserRole
): Promise<void> {
  await setDoc(doc(db, 'roles', userId), { role }, { merge: true });
}
