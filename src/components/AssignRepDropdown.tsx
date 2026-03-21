import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';
import type { Representante } from '@/types/representante';
import type { Doctor } from '@/types/doctor';

interface AssignRepDropdownProps {
  reps: (Representante & { id: string })[];
  doctors: (Doctor & { id: string })[];
  currentDoctor: Doctor & { id: string };
  currentRepId?: string;
  onAssign: (repId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export function AssignRepDropdown({
  reps,
  doctors,
  currentDoctor,
  currentRepId,
  onAssign,
  expanded,
  onToggle,
}: AssignRepDropdownProps) {
  const currentRep = reps.find((r) => r.id === currentRepId);

  // Filter reps: those who have at least one doctor in the same state
  const filteredReps = useMemo(() => {
    if (!currentDoctor.state) return reps; // No state filter if doctor has no state

    const repIdsInState = new Set<string>();
    for (const doc of doctors) {
      if (doc.state === currentDoctor.state && doc.assignedRepId) {
        repIdsInState.add(doc.assignedRepId);
      }
    }

    // If no reps in this state, show all reps
    if (repIdsInState.size === 0) return reps;

    return reps.filter((r) => repIdsInState.has(r.id));
  }, [reps, doctors, currentDoctor.state]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>REPRESENTANTE ATRIBUÍDO</Text>

      <Pressable style={styles.selector} onPress={onToggle}>
        <Ionicons name="person-outline" size={16} color={C.teal} />
        <Text style={[styles.selectorText, !currentRep && styles.placeholder]}>
          {currentRep ? currentRep.name : 'Selecionar representante'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={C.textLight}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.dropdown}>
          {filteredReps.map((rep) => (
            <Pressable
              key={rep.id}
              style={[
                styles.option,
                rep.id === currentRepId && styles.optionActive,
              ]}
              onPress={() => onAssign(rep.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  rep.id === currentRepId && styles.optionTextActive,
                ]}
              >
                {rep.name}
              </Text>
              {rep.estado ? (
                <Text style={styles.optionState}>{rep.estado}</Text>
              ) : null}
            </Pressable>
          ))}
          {filteredReps.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum representante encontrado</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
  },
  placeholder: {
    color: C.textLight,
  },
  dropdown: {
    backgroundColor: C.card,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  optionActive: {
    backgroundColor: '#e6f4f4',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  optionTextActive: {
    color: C.teal,
    fontWeight: '600',
  },
  optionState: {
    fontSize: 12,
    color: C.textMuted,
  },
  emptyText: {
    padding: 14,
    fontSize: 13,
    color: C.textLight,
    textAlign: 'center',
  },
});
