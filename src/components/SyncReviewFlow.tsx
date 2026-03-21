import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';
import type { GoogleCalendarEvent, MatchedEvent, UnmatchedEvent } from '@/services/calendar.service';
import { QuickAddDoctorModal, type QuickAddDoctorFormValues } from './QuickAddDoctorModal';

interface SyncReviewFlowProps {
  visible: boolean;
  matched: MatchedEvent[];
  unmatched: UnmatchedEvent[];
  onConfirm: (confirmedUnmatched: UnmatchedEvent[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SyncReviewFlow({
  visible,
  matched,
  unmatched,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: SyncReviewFlowProps) {
  const [checkedUnmatched, setCheckedUnmatched] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleUnmatched = (eventId: string) => {
    setCheckedUnmatched((prev) => {
      const next = new Set(prev);
      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
      return next;
    });
  };

  const handleAddDoctor = useCallback(async (data: QuickAddDoctorFormValues) => {
    // Just close the modal, user can manually match after adding doctor
    setShowAddModal(false);
  }, []);

  const handleConfirm = async () => {
    const confirmedList = unmatched.filter((u) => checkedUnmatched.has(u.event.id));
    setSubmitting(true);
    try {
      await onConfirm(confirmedList);
    } catch (error) {
      console.error('Error confirming sync:', error);
      Alert.alert('Erro', 'Erro ao sincronizar eventos');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onCancel} disabled={submitting}>
            <Ionicons name="close" size={24} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Revisar Sincronização</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Matched Section */}
          {matched.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={16} color={C.teal} />
                <Text style={styles.sectionTitle}>Encontrados ({matched.length})</Text>
              </View>
              {matched.map((m) => (
                <View key={m.event.id} style={styles.matchedItem}>
                  <Text style={styles.matchedItemName}>{m.event.summary}</Text>
                  <Text style={styles.matchedItemDoctor}>→ {m.doctor.fullName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Unmatched Section */}
          {unmatched.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="help-circle" size={16} color={C.amber} />
                <Text style={styles.sectionTitle}>Não Encontrados ({unmatched.length})</Text>
              </View>

              <View style={styles.unmatchedList}>
                {unmatched.map((u) => {
                  const isChecked = checkedUnmatched.has(u.event.id);
                  return (
                    <Pressable
                      key={u.event.id}
                      style={[styles.unmatchedItem, isChecked && styles.unmatchedItemChecked]}
                      onPress={() => toggleUnmatched(u.event.id)}
                      disabled={submitting}
                    >
                      <View style={styles.checkbox}>
                        {isChecked && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={C.white}
                          />
                        )}
                      </View>

                      <View style={styles.unmatchedContent}>
                        <Text style={styles.unmatchedEventName}>
                          {u.event.summary}
                        </Text>
                        <Text style={styles.unmatchedSuggestion}>
                          {u.suggestedName || 'Sem informação de nome'}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={C.textLight}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={styles.addDoctorBtn}
                onPress={() => setShowAddModal(true)}
                disabled={submitting}
              >
                <Ionicons name="add-circle-outline" size={16} color={C.teal} />
                <Text style={styles.addDoctorText}>
                  Adicionar Médico Não Encontrado
                </Text>
              </Pressable>
            </View>
          )}

          {matched.length === 0 && unmatched.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={C.textMuted} />
              <Text style={styles.emptyStateText}>
                Nenhum evento encontrado no intervalo selecionado
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={submitting || (matched.length === 0 && checkedUnmatched.size === 0)}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={styles.confirmBtnText}>
                Sincronizar {matched.length + checkedUnmatched.size} Eventos
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancelBtn}
            onPress={onCancel}
            disabled={submitting}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>

      {/* Add Doctor Modal */}
      <QuickAddDoctorModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDoctor}
      />
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  matchedItem: {
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.teal,
  },
  matchedItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  matchedItemDoctor: {
    fontSize: 12,
    color: C.teal,
    marginTop: 4,
    fontWeight: '500',
  },
  unmatchedList: {
    gap: 8,
    marginBottom: 12,
  },
  unmatchedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  unmatchedItemChecked: {
    borderColor: C.teal,
    backgroundColor: '#e6f4f4',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  unmatchedItemChecked_checkbox: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  unmatchedContent: {
    flex: 1,
  },
  unmatchedEventName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  unmatchedSuggestion: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  addDoctorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.teal,
    gap: 8,
  },
  addDoctorText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.teal,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 12,
    textAlign: 'center',
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
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.white,
  },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
  },
});
