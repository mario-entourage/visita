import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { initializeAuth, Persistence } from 'firebase/auth';

// In Firebase v12+, getReactNativePersistence is available at runtime via the
// react-native conditional export in @firebase/auth, but is not surfaced in
// the public TypeScript types of `firebase/auth`. We import the runtime export
// directly from the package internals.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: any) => Persistence;
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let initialized = false;
let cachedServices: ReturnType<typeof createFirebaseServices> | null = null;

function createFirebaseServices() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  const firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  const storage = getStorage(app);

  return { firebaseApp: app, firestore, auth, storage };
}

export function initializeFirebase() {
  if (!initialized) {
    cachedServices = createFirebaseServices();
    initialized = true;
  }
  return cachedServices!;
}
