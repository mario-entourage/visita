import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';
import type { UnmatchedEvent, MatchedEvent } from '@/services/calendar.service';
import { formatEventTime } from '@/services/calendar.service';

interface ReviewItem {
  event: UnmatchedEvent;
  keep: boolean;
  isDoctor: boolean;
  doctorName: string;
  specialty: string;
}

interface SyncReviewListProps {
  matched: MatchedEvent[];
  unmatched: UnmatchedEvent[];
  onImport: (items: ReviewItem[]) => void;
  onCancel: () => void;
  isImporting: boolean;
}

export type { ReviewItem };

export function SyncReviewList({
  matched,
  unmatched,
  onImport,
  onCancel,
  isImporting,
}: SyncReviewListProps) {
  const [items, setItems] = useState<ReviewItem[]>(
    unmatched.map((u) => ({
      event: u,
      keep: false,
      isDoctor: false,
      doctorName: u.suggestedName,
      specialty: '',
    }))
  );

  const updateItem = (index: number, updates: Partial<ReviewItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const itemsToImport = items.filter((i) => i.keep || i.isDoctor);

  return (
    <View style={styles.container}>
      {/* Summary header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onCancel}>
          <Ionicons name="arrow-back" size={20} color={C.teal} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Revisar Eventos</Text>
          <Text style={styles.subtitle}>
            {matched.length} importados automaticamente
          </Text>
        </View>
      </View>

      {unmatched.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={40} color={C.teal} />
          <Text style={styles.emptyText}>
            Todos os eventos foram identificados!
          </Text>
          <Pressable style={styles.doneBtn} onPress={onCancel}>
            <Text style={styles.doneBtnText}>Concluir</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>
            {unmatched.length} evento(s) não identificado(s)
          </Text>

          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {item.event.event.summary || '(Sem título)'}
                </Text>
                <Text style={styles.eventTime}>
                  {formatEventTime(item.event.event)}
                </Text>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>É médico?</Text>
                  <Switch
                    value={item.isDoctor}
                    onValueChange={(v) => {
                      updateItem(index, { isDoctor: v, keep: v ? true : item.keep });
                    }}
                    trackColor={{ false: C.border, true: C.tealLight }}
                    thumbColor={C.white}
                  />
                </View>

                {item.isDoctor ? (
                  <View style={styles.doctorForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nome do médico"
                      placeholderTextColor={C.textLight}
                      value={item.doctorName}
                      onChangeText={(v) => updateItem(index, { doctorName: v })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Especialidade"
                      placeholderTextColor={C.textLight}
                      value={item.specialty}
                      onChangeText={(v) => updateItem(index, { specialty: v })}
                    />
                  </View>
                ) : (
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Manter</Text>
                    <Switch
                      value={item.keep}
                      onValueChange={(v) => updateItem(index, { keep: v })}
                      trackColor={{ false: C.border, true: C.tealLight }}
                      thumbColor={C.white}
                    />
                  </View>
                )}
              </View>
            )}
          />

          <Pressable
            style={[
              styles.importBtn,
              (itemsToImport.length === 0 || isImporting) && styles.importBtnDisabled,
            ]}
            onPress={() => onImport(itemsToImport)}
            disabled={itemsToImport.length === 0 || isImporting}
          >
            {isImporting ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <Text style={styles.importBtnText}>
                Importar ({itemsToImport.length})
              </Text>
            )}
          </Pressable>
        </>
      )}
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
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: 13,
    color: C.teal,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  eventTime: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    color: C.text,
  },
  doctorForm: {
    marginTop: 8,
    gap: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  importBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: C.teal,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  importBtnDisabled: {
    opacity: 0.5,
  },
  importBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 15,
    color: C.textMuted,
  },
  doneBtn: {
    backgroundColor: C.teal,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  doneBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
