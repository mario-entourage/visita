import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser } from '@/firebase/provider';
import { C } from '@/theme';
import { TerritoriesPicker } from '@/components/TerritoriesPicker';
import { bulkReassignDoctorsInState, type TerritoriesMap } from '@/services/territories.service';

export default function TerritoriesScreen() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [reassignmentState, setReassignmentState] = useState<{
    state: string;
    repId: string;
    onlyUnassigned: boolean;
  } | null>(null);
  const [reassigning, setReassigning] = useState(false);

  const handleTerritoryChange = useCallback(
    async (territories: TerritoriesMap) => {
      // Prompt to bulk reassign doctors
      const states = Object.keys(territories);
      if (states.length === 0) {
        Alert.alert('Sucesso', 'Territórios salvos com sucesso');
        return;
      }

      // Ask user if they want to reassign doctors
      Alert.alert(
        'Reassociar Médicos?',
        'Deseja reassociar os médicos já existentes nos novos territórios?',
        [
          { text: 'Cancelar', onPress: () => {} },
          {
            text: 'Apenas não atribuídos',
            onPress: () => {
              // TODO: Implement bulk reassignment for unassigned doctors
              Alert.alert('Sucesso', 'Territórios salvos com sucesso');
            },
          },
          {
            text: 'Todos',
            onPress: () => {
              // TODO: Implement bulk reassignment for all doctors
              Alert.alert('Sucesso', 'Territórios salvos com sucesso');
            },
          },
        ]
      );
    },
    []
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={C.teal} />
        </Pressable>
        <Text style={styles.headerTitle}>Gestão de Territórios</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <TerritoriesPicker onSave={handleTerritoryChange} isEditing={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  headerSpacer: {
    width: 32,
  },
});
