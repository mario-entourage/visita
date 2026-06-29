import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { initializeAuth, getAuth, browserLocalPersistence, Persistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import { firebaseConfig } from './config';

let initialized = false;
let cachedServices: ReturnType<typeof createFirebaseServices> | null = null;

function createFirebaseServices() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  const firestore = initializeFirestore(app, {
    // Optional form fields are passed as `undefined`; without this the SDK
    // throws ("Unsupported field value: undefined") and the write fails.
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  let auth;
  if (Platform.OS === 'web') {
    // On web, use browser persistence (localStorage)
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    // On native (iOS/Android), use AsyncStorage persistence
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const { getReactNativePersistence } = require('@firebase/auth') as {
      getReactNativePersistence: (storage: any) => Persistence;
    };
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }

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
