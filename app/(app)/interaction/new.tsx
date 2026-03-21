import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Location from 'expo-location';
import { GeoPoint } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { createInteraction } from '@/services/interactions.service';
import { recordInteractionOnDoctor } from '@/services/doctors.service';
import {
  InteractionForm,
  type InteractionFormValues,
} from '@/components/InteractionForm';
import { C } from '@/theme';

export default function NewInteractionScreen() {
  const { doctorId, doctorName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
  }>();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: InteractionFormValues) => {
    if (!db || !user || !doctorId) return;

    setIsSubmitting(true);
    try {
      let location: GeoPoint | undefined;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          location = new GeoPoint(loc.coords.latitude, loc.coords.longitude);
        }
      } catch {
        // Location is optional — continue without it
      }

      await createInteraction(db, {
        ...data,
        doctorId,
        doctorName: doctorName || '',
        repId: user.uid,
        repName: user.displayName || user.email || '',
        location,
        active: true,
      });

      // Update doctor stats atomically
      await recordInteractionOnDoctor(db, doctorId, data.resultCode);

      router.back();
    } catch (err) {
      console.error('Error creating interaction:', err);
      // Re-throw so InteractionForm can surface to user if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: doctorName ? `Interação – ${doctorName}` : 'Registrar Interação',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <View style={styles.container}>
        <InteractionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
});
