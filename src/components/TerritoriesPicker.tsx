import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { C } from '@/theme';
import { BRAZILIAN_STATES } from '@/lib/constants';
import { getTerritories, setTerritories, type TerritoriesMap } from '@/services/territories.service';
import { query, where, collection, Firestore } from 'firebase/firestore';

interface TerritoriesPickerProps {
  onSave?: (territories: TerritoriesMap) => Promise<void>;
  isEditing?: boolean;
}

const STATES = Object.entries(BRAZILIAN_STATES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function TerritoriesPicker({ onSave, isEditing = false }: TerritoriesPickerProps) {
  const db = useFirestore();
  const { user } = useUser();
  const [territories, setTerritoriesState] = useState<TerritoriesMap>({});
  const [reps, setReps] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load manager's territories
  useEffect(() => {
    if (!db || !user) return;

    const loadTerritories = async () => {
      try {
        const terrs = await getTerritories(db, user.uid);
        setTerritoriesState(terrs);
      } catch (error) {
        console.error('Error loading territories:', error);
      }
    };

    loadTerritories();
  }, [db, user]);

  // Load reps (simplified - fetch all users with rep role)
  // Note: This assumes a simpler structure. Adjust based on actual user/organization model.
  useEffect(() => {
    if (!db) return;

    const loadReps = async () => {
      try {
        // Placeholder: fetch active users (you'd need to adjust this based on actual schema)
        // For now, assume reps are stored in a 'users' collection with a 'role' field
        // This is a simplified version - adjust to your actual user structure
        setReps([
          { id: 'rep1', name: 'Rep 1' },
          { id: 'rep2', name: 'Rep 2' },
          { id: 'rep3', name: 'Rep 3' },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading reps:', error);
        setLoading(false);
      }
    };

    loadReps();
  }, [db]);

  const updateTerritory = (state: string, repId: string) => {
    setTerritoriesState((prev) => ({
      ...prev,
      [state]: repId,
    }));
  };

  const removeTerritory = (state: string) => {
    setTerritoriesState((prev) => {
      const next = { ...prev };
      delete next[state];
      return next;
    });
  };

  const handleSave = async () => {
    if (!db || !user) return;

    setSaving(true);
    try {
      await setTerritories(db, user.uid, territories);
      if (onSave) {
        await onSave(territories);
      }
    } catch (error) {
      console.error('Error saving territories:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Atribuir Estados a Representantes</Text>
        <Text style={styles.sectionDescription}>
          Defina qual representante é responsável por cada estado.
        </Text>

        <View style={styles.statesList}>
          {STATES.map((state) => {
            const assignedRepId = territories[state.code];
            const assignedRep = reps.find((r) => r.id === assignedRepId);

            return (
              <View key={state.code} style={styles.stateRow}>
                <View style={styles.stateInfo}>
                  <Text style={styles.stateName}>{state.code}</Text>
                  <Text style={styles.stateFullName}>{state.name}</Text>
                </View>

                <Pressable
                  style={styles.repSelector}
                  onPress={() => {
                    // This would trigger a modal to select a rep
                    // For now, cycling through available reps for demo
                    const currentIndex = reps.findIndex((r) => r.id === assignedRepId);
                    const nextIndex = (currentIndex + 1) % (reps.length + 1);
                    if (nextIndex === reps.length) {
                      removeTerritory(state.code);
                    } else {
                      updateTerritory(state.code, reps[nextIndex].id);
                    }
                  }}
                >
                  <Text style={styles.repSelectorText}>
                    {assignedRep ? assignedRep.name : 'Sem atribuição'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={C.teal}
                    style={{ marginLeft: 8 }}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {isEditing && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={styles.saveBtnText}>Salvar Territórios</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 20,
  },
  statesList: {
    gap: 8,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  stateInfo: {
    flex: 0.25,
  },
  stateName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  stateFullName: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  repSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: C.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  repSelectorText: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
