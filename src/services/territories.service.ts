import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { Doctor } from '@/types/doctor';

export type TerritoriesMap = Record<string, string>; // stateCode -> repId

interface ManagerTerritories {
  managerId: string;
  territories: TerritoriesMap;
  updatedAt: any; // Timestamp
}

// ---------------------------------------------------------------------------
// Territories collection reference
// ---------------------------------------------------------------------------

function getManagerTerritoriesRef(db: Firestore, managerId: string) {
  return doc(db, 'manager_territories', managerId);
}

// ---------------------------------------------------------------------------
// Get territories for a manager
// ---------------------------------------------------------------------------

export async function getTerritories(
  db: Firestore,
  managerId: string
): Promise<TerritoriesMap> {
  const ref = getManagerTerritoriesRef(db, managerId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {};
  }

  return (snap.data() as ManagerTerritories).territories || {};
}

// ---------------------------------------------------------------------------
// Set/update territories for a manager
// ---------------------------------------------------------------------------

export async function setTerritories(
  db: Firestore,
  managerId: string,
  territories: TerritoriesMap
): Promise<void> {
  const ref = getManagerTerritoriesRef(db, managerId);
  await setDoc(
    ref,
    {
      territories,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ---------------------------------------------------------------------------
// Bulk reassign doctors in a state
// ---------------------------------------------------------------------------

export async function bulkReassignDoctorsInState(
  db: Firestore,
  state: string,
  newRepId: string,
  onlyUnassigned: boolean = false
): Promise<number> {
  // Query doctors in the state
  const constraints = [where('active', '==', true), where('state', '==', state)];

  if (onlyUnassigned) {
    // Match unassigned (empty string or missing assignedRepId)
    constraints.push(where('assignedRepId', 'in', ['', null]));
  }

  const q = query(collection(db, 'doctors'), ...constraints);
  const snap = await getDocs(q);

  // Update all matching doctors
  let count = 0;
  for (const docSnap of snap.docs) {
    await updateDoc(docSnap.ref, {
      assignedRepId: newRepId,
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  return count;
}

// ---------------------------------------------------------------------------
// Check if doctor has territory default (helper for auto-assign)
// ---------------------------------------------------------------------------

export async function getTerritoryDefaultForState(
  db: Firestore,
  managerId: string,
  state: string
): Promise<string | null> {
  const territories = await getTerritories(db, managerId);
  return territories[state] || null;
}
