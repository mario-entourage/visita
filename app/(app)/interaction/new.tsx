import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { GeoPoint } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { createInteraction } from '@/services/interactions.service';
import {
  InteractionForm,
  type InteractionFormValues,
} from '@/components/InteractionForm';

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
        // Location is optional
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

      Alert.alert('Sucesso', 'Interação registrada!');
      router.back();
    } catch (err) {
      console.error('Error creating interaction:', err);
      Alert.alert('Erro', 'Não foi possível registrar a interação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <InteractionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
