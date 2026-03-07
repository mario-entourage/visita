import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase/init';

export default function RootLayout() {
  const [services, setServices] = useState<ReturnType<
    typeof initializeFirebase
  > | null>(null);

  useEffect(() => {
    const s = initializeFirebase();
    setServices(s);
  }, []);

  if (!services) return null;

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      firestore={services.firestore}
      auth={services.auth}
      storage={services.storage}
    >
      <Slot />
    </FirebaseProvider>
  );
}
