/**
 * Firestore rule smoke test — runs against the local emulator.
 * Tests the visitDate <= request.time guard on create and update.
 *
 * Loads a stripped-down test rules file that removes the auth check so we can
 * isolate the Timestamp comparison logic. Real auth rules are tested in production.
 *
 * Run: node scripts/test-firestore-rules.mjs
 * Requires: firebase emulators:start --only firestore
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { readFileSync } from 'fs';

const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORT = 8080;
const PROJECT_ID = 'simple-login-fdcf7';

// ── Test rules: same visitDate guard, no auth requirement ────────────────────
// This lets us verify the Timestamp <= request.time comparison works in isolation.
const TEST_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /interactions/{id} {
      allow create: if (
        !('visitDate' in request.resource.data)
        || request.resource.data.visitDate <= request.time
      );
      allow update: if (
        !('visitDate' in request.resource.data)
        || request.resource.data.visitDate <= request.time
      );
      allow read, delete: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

// ── Load test rules ──────────────────────────────────────────────────────────
async function loadRules(rules) {
  const res = await fetch(
    `http://${EMULATOR_HOST}:${EMULATOR_PORT}/emulator/v1/projects/${PROJECT_ID}:securityRules`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: { files: [{ name: 'test.rules', content: rules }] } }),
    }
  );
  if (!res.ok) throw new Error(`Failed to load rules: ${res.status} ${await res.text()}`);
}

// ── Firebase client (no auth — intentional for this test) ────────────────────
const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORT);

const BASE = {
  repId: 'test-rep',
  doctorId: 'doc-1',
  resultCode: 3,
  active: true,
};

let passed = 0;
let failed = 0;

async function expect(label, fn, shouldSucceed) {
  try {
    await fn();
    if (shouldSucceed) {
      console.log(`  ✅  ${label}`);
      passed++;
    } else {
      console.error(`  ❌  ${label} — expected REJECTION but write SUCCEEDED`);
      failed++;
    }
  } catch (e) {
    const msg = e.code ?? e.message ?? String(e);
    if (!shouldSucceed) {
      console.log(`  ✅  ${label} — correctly rejected (${msg})`);
      passed++;
    } else {
      console.error(`  ❌  ${label} — unexpected error: ${msg}`);
      failed++;
    }
  }
}

// ── Run tests ────────────────────────────────────────────────────────────────

console.log('\nLoading test rules (auth-stripped visitDate guard)...');
await loadRules(TEST_RULES);
console.log('Rules loaded.\n');

const interactionsRef = collection(db, 'interactions');
const pastDate   = Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
const futureDate = Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

console.log('CREATE — visitDate guard:');
await expect('no visitDate → allowed',          () => addDoc(interactionsRef, { ...BASE }), true);
await expect('past visitDate → allowed',         () => addDoc(interactionsRef, { ...BASE, visitDate: pastDate }), true);
await expect('future visitDate → rejected',      () => addDoc(interactionsRef, { ...BASE, visitDate: futureDate }), false);

console.log('\nUPDATE — visitDate guard:');
const existingRef = await addDoc(interactionsRef, { ...BASE });
await expect('update without visitDate → allowed', () => updateDoc(existingRef, { resultCode: 4 }), true);
await expect('update with past visitDate → allowed',  () => updateDoc(existingRef, { visitDate: pastDate }), true);
await expect('update with future visitDate → rejected', () => updateDoc(existingRef, { visitDate: futureDate }), false);

// ── Restore real rules ───────────────────────────────────────────────────────
console.log('\nRestoring production rules...');
const realRules = readFileSync('firestore.rules', 'utf8');
await loadRules(realRules);
console.log('Production rules restored.\n');

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nFAIL — Timestamp comparison in Firestore rules is not working as expected.');
  process.exit(1);
} else {
  console.log('\nPASS — visitDate <= request.time works correctly in both create and update rules.');
}
