import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Firestore,
  Query,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * An admin-approved external user (contractor / marketplace rep on a
 * personal Google account, not @entouragelab.com). Doc ID is the
 * lowercased email — see isMember() in firestore.rules.
 */
export interface AllowedUser {
  id: string; // lowercased email
  email: string;
  name: string;
  addedBy: string;
  addedAt: Timestamp;
  active: boolean;
}

export function getAllowedUsersRef(db: Firestore) {
  return collection(db, 'allowed_users');
}

export function getAllowedUsersQuery(db: Firestore): Query {
  return query(getAllowedUsersRef(db), orderBy('addedAt', 'desc'));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Invite an external user by email. Admin-only (enforced by Firestore rules). */
export async function inviteUser(
  db: Firestore,
  email: string,
  name: string,
  addedBy: string
): Promise<void> {
  const id = normalizeEmail(email);
  await setDoc(doc(db, 'allowed_users', id), {
    email: id,
    name: name.trim(),
    addedBy,
    addedAt: serverTimestamp(),
    active: true,
  });
}

/** Revoke (deactivate) an invited user's access. Admin-only. */
export async function revokeUser(db: Firestore, email: string): Promise<void> {
  await updateDoc(doc(db, 'allowed_users', normalizeEmail(email)), {
    active: false,
  });
}

/** Re-enable a previously revoked user. Admin-only. */
export async function reactivateUser(db: Firestore, email: string): Promise<void> {
  await updateDoc(doc(db, 'allowed_users', normalizeEmail(email)), {
    active: true,
  });
}

/** Check whether an email is on the allowlist and active. Self-readable per rules. */
export async function checkAllowed(
  db: Firestore,
  email: string
): Promise<AllowedUser | null> {
  const snap = await getDoc(doc(db, 'allowed_users', normalizeEmail(email)));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<AllowedUser, 'id'>), id: snap.id };
}
