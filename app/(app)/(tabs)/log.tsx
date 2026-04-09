import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GeoPoint, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import {
  getActiveDoctorsQuery,
  recordInteractionOnDoctor,
} from '@/services/doctors.service';
import {
  createInteraction,
  getInteractionsByDoctorQuery,
} from '@/services/interactions.service';
import {
  InteractionForm,
  type InteractionFormValues,
} from '@/components/InteractionForm';
import type { Doctor } from '@/types/doctor';
import type { Interaction } from '@/types/interaction';
import { C } from '@/theme';

export default function LogScreen() {
  const db = useFirestore();
  const { user } = useUser();
  const [selectedDoctor, setSelectedDoctor] = useState<(Doctor & { id: string }) | null>(null);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctorsQuery = useMemoFirebase(
    () => (db ? getActiveDoctorsQuery(db) : null),
    [db]
  );
  const { data: doctors, isLoading } = useCollection<Doctor>(doctorsQuery);

  // Load the last interaction for the selected doctor (for the hint box)
  const lastInteractionQuery = useMemoFirebase(
    () =>
      db && selectedDoctor
        ? getInteractionsByDoctorQuery(db, selectedDoctor.id, 1)
        : null,
    [db, selectedDoctor]
  );
  const { data: lastInteractions, isLoading: isHintLoading } = useCollection<Interaction>(lastInteractionQuery);
  const lastInteraction = lastInteractions?.[0] ?? undefined;

  const filtered = doctors?.filter((d) =>
    d.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (data: InteractionFormValues) => {
    if (!db || !user || !selectedDoctor) return;

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
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.fullName,
        repId: user.uid,
        repName: user.displayName || user.email || '',
        resultCode: data.resultCode,
        preVisitNotes: data.preVisitNotes || undefined,
        postVisitNotes: data.postVisitNotes || undefined,
        visitDate: data.visitDate ? Timestamp.fromDate(data.visitDate) : undefined,
        location,
        active: true,
        // Visit detail fields (optional)
        type: data.visitType ?? undefined,
        samplesDelivered: data.samplesDelivered ?? undefined,
        spokeFaceToFace: data.spokeFaceToFace ?? undefined,
        followUpScheduled: data.followUpScheduled ?? undefined,
        // Cannabis prescriber fields (optional)
        isPrescriber: data.isPrescriber ?? undefined,
        prescribedProducts: data.prescribedProducts || undefined,
        prescriptionType: data.prescriptionType ?? undefined,
        reasonTherapeutic: data.reasonTherapeutic ?? undefined,
        reasonDelivery: data.reasonDelivery ?? undefined,
        reasonPracticality: data.reasonPracticality ?? undefined,
        reasonCost: data.reasonCost ?? undefined,
        reasonOther: data.reasonOther || undefined,
      });

      await recordInteractionOnDoctor(db, selectedDoctor.id, data.resultCode);

      const msg = `Interação com ${selectedDoctor.fullName} registrada!`;
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Sucesso', msg);
      }

      setSelectedDoctor(null);
      setSearch('');
    } catch (err) {
      console.error('Error creating interaction:', err);
      const errMsg = 'Não foi possível registrar a interação.';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Erro', errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Interaction form for selected doctor
  if (selectedDoctor) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.selectedBar}
          onPress={() => setSelectedDoctor(null)}
        >
          <Ionicons name="arrow-back" size={18} color={C.teal} />
          <Text style={styles.selectedName} numberOfLines={1}>
            {selectedDoctor.fullName}
          </Text>
          <Text style={styles.changeText}>Trocar</Text>
        </Pressable>
        <InteractionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          doctor={selectedDoctor}
          lastInteraction={lastInteraction}
          isHintLoading={isHintLoading}
        />
      </View>
    );
  }

  // Step 1: Doctor picker
  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={C.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar médico..."
          placeholderTextColor={C.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.teal} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.doctorRow}
              onPress={() => setSelectedDoctor(item)}
            >
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.doctorSpec}>
                  {item.mainSpecialty || 'Sem especialidade'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {search ? 'Nenhum médico encontrado' : 'Selecione um médico para registrar'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    paddingVertical: 12,
  },
  list: {
    paddingBottom: 24,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 12,
    padding: 14,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  doctorSpec: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 13,
    color: C.textLight,
  },
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  selectedName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  changeText: {
    fontSize: 13,
    color: C.teal,
    fontWeight: '600',
  },
});
