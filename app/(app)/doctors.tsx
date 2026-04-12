import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getUpcomingVisitsQuery } from '@/services/visits.service';
import { getFlaggedDoctorsQuery, createDoctor } from '@/services/doctors.service';
import { formatTimestamp } from '@/lib/utils';
import { C, S } from '@/theme';
import { QuickAddDoctorModal, type QuickAddDoctorFormValues } from '@/components/QuickAddDoctorModal';
import type { ScheduledVisit } from '@/types/scheduled-visit';
import type { Doctor } from '@/types/doctor';

type Filter = 'agend' | 'sinal' | 'ia' | 'perto';

const FILTERS: { key: Filter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'agend', label: 'Agend.', icon: 'calendar-outline' },
  { key: 'sinal', label: 'Sinal.', icon: 'flag-outline' },
  { key: 'ia', label: 'IA', icon: 'sparkles-outline' },
  { key: 'perto', label: 'Perto', icon: 'location-outline' },
];

export default function DoctorsScreen() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const visitsQuery = useMemoFirebase(
    () => (db && user ? getUpcomingVisitsQuery(db, user.uid) : null),
    [db, user?.uid]
  );
  const flaggedQuery = useMemoFirebase(
    () => (db ? getFlaggedDoctorsQuery(db) : null),
    [db]
  );

  const { data: visits, isLoading: visitsLoading } = useCollection<ScheduledVisit>(visitsQuery);
  const { data: flagged, isLoading: flaggedLoading } = useCollection<Doctor>(flaggedQuery);

  const isLoading = visitsLoading || flaggedLoading;

  const toggleFilter = (key: Filter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleAddDoctor = useCallback(async (data: QuickAddDoctorFormValues) => {
    if (!db || !user) {
      Alert.alert('Erro', 'Não foi possível conectar ao banco de dados');
      return;
    }

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      await createDoctor(db, {
        fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        state: data.state,
        mainSpecialty: data.mainSpecialty || undefined,
        city: data.city || undefined,
        phone: data.phone || undefined,
        mobilePhone: data.mobilePhone || undefined,
        crm: data.crm || undefined,
        createdByRepId: user.uid,
      });
      
      Alert.alert('Sucesso', 'Médico adicionado com sucesso');
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error adding doctor:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o médico');
    }
  }, [db, user]);

  const noFilter = activeFilters.size === 0;
  const showAgend = noFilter || activeFilters.has('agend');
  const showSinal = noFilter || activeFilters.has('sinal');

  return (
    <View style={styles.container}>
      {/* Filter chips and Add button */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map(({ key, label, icon }) => {
            const active = activeFilters.has(key);
            return (
              <Pressable
                key={key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleFilter(key)}
              >
                <Ionicons
                  name={icon}
                  size={12}
                  color={active ? C.white : C.teal}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color={C.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.teal} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {showAgend ? (
            <View>
              <SectionHeader title="Agendados" />
              {visits && visits.length > 0 ? (
                visits.map((visit) => (
                  <Pressable
                    key={visit.id}
                    style={styles.card}
                    onPress={() => router.push(`/(app)/doctor/${visit.doctorId}`)}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.doctorName}>
                        {visit.doctorName || 'Médico'}
                      </Text>
                      <Text style={styles.visitTime}>
                        {formatTimestamp(visit.scheduledFor, "EEE d'h' HH:mm")}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.textLight} />
                  </Pressable>
                ))
              ) : (
                <Text style={styles.emptySection}>Nenhuma visita agendada</Text>
              )}
            </View>
          ) : null}

          {showSinal ? (
            <View>
              <SectionHeader title="Sinalizados" />
              {flagged && flagged.length > 0 ? (
                flagged.map((doctor) => (
                  <Pressable
                    key={doctor.id}
                    style={styles.card}
                    onPress={() => router.push(`/(app)/doctor/${doctor.id}`)}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.doctorName}>{doctor.fullName}</Text>
                      <Text style={styles.doctorSub}>
                        {[doctor.mainSpecialty, doctor.city]
                          .filter(Boolean)
                          .join(' — ')}
                      </Text>
                    </View>
                    <Ionicons name="flag" size={15} color={C.red} />
                  </Pressable>
                ))
              ) : (
                <Text style={styles.emptySection}>Nenhum médico sinalizado</Text>
              )}
            </View>
          ) : null}
        </ScrollView>
      )}

      <QuickAddDoctorModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDoctor}
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  filterScroll: {
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.teal,
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: C.teal,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.teal,
  },
  chipTextActive: {
    color: C.white,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginRight: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 12,
    padding: 14,
    ...S.card,
  },
  cardContent: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  visitTime: {
    fontSize: 13,
    color: C.teal,
    marginTop: 2,
  },
  doctorSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  emptySection: {
    fontSize: 13,
    color: C.textLight,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
