import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, S } from '@/theme';
import {
  getGoalForWeek,
  setGoalForWeek,
  getPriorWeekDefault,
  getCurrentWeekStart,
} from '@/services/goals.service';
import type { Firestore } from 'firebase/firestore';

interface WeeklyGoalEditorProps {
  db: Firestore;
  repId: string;
  managerId: string;
  visitCount: number; // Current week's visit count for display
}

export function WeeklyGoalEditor({
  db,
  repId,
  managerId,
  visitCount,
}: WeeklyGoalEditorProps) {
  const [target, setTarget] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const weekStart = getCurrentWeekStart();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const goal = await getGoalForWeek(db, repId, weekStart);
        if (cancelled) return;

        if (goal) {
          setTarget(goal.target);
        } else {
          setTarget(null);
        }
      } catch (err) {
        console.error('Error loading goal:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [db, repId]);

  const handleEdit = async () => {
    if (!editing) {
      // Entering edit mode — compute default
      if (target !== null) {
        setInputValue(String(target));
      } else {
        try {
          const defaultVal = await getPriorWeekDefault(db, repId, weekStart);
          setInputValue(String(defaultVal));
        } catch {
          setInputValue('10');
        }
      }
      setEditing(true);
      return;
    }

    // Saving
    const val = parseInt(inputValue, 10);
    if (isNaN(val) || val < 0) return;

    setIsSaving(true);
    try {
      await setGoalForWeek(db, repId, weekStart, val, managerId);
      setTarget(val);
      setEditing(false);
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={C.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="flag-outline" size={16} color={C.teal} />

        {editing ? (
          <View style={styles.editRow}>
            <Text style={styles.label}>Meta:</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.label}>visitas</Text>
          </View>
        ) : (
          <Text style={styles.text}>
            {target !== null
              ? `${visitCount} / ${target} visitas esta semana`
              : `${visitCount} visitas esta semana · sem meta`}
          </Text>
        )}

        <Pressable
          style={styles.editBtn}
          onPress={handleEdit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={C.teal} />
          ) : (
            <Ionicons
              name={editing ? 'checkmark' : 'create-outline'}
              size={18}
              color={C.teal}
            />
          )}
        </Pressable>

        {editing ? (
          <Pressable
            style={styles.editBtn}
            onPress={() => setEditing(false)}
          >
            <Ionicons name="close" size={18} color={C.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {target !== null && visitCount >= target ? (
        <View style={styles.achievedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#15803d" />
          <Text style={styles.achievedText}>Meta atingida!</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...S.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: C.text,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: C.teal,
    width: 50,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: C.teal,
  },
  editBtn: {
    padding: 4,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  achievedText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
});
