import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/use-doc';
import { useCollection } from '@/firebase/use-collection';
import { getInteractionsByDoctorQuery } from '@/services/interactions.service';
import {
  getActiveDoctorsQuery,
  getActiveDoctorsByStateQuery,
  assignRepToDoctor,
  reportDoctor,
  unflagDoctorWithNote,
  updateDoctorTags,
  flagDoctorForFollowUp,
} from '@/services/doctors.service';
import {
  type ReportReason,
  REPORT_REASON_LABELS,
  REPORT_REASONS,
} from '@/types/doctor-report';
import { getActiveRepsQuery } from '@/services/reps.service';
import { AssignRepDropdown } from '@/components/AssignRepDropdown';
import { PropensityBadge } from '@/components/PropensityBadge';
import { Timeline } from '@/components/Timeline';
import { C, S } from '@/theme';
import { RESULT_LABELS, DOCTOR_TAGS, DOCTOR_TAG_MAP } from '@/lib/constants';
import type { Doctor } from '@/types/doctor';
import type { Interaction } from '@/types/interaction';
import type { Representante } from '@/types/representante';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useFirestore();
  const { user, effectiveRole } = useUser();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isManager = effectiveRole === 'gerente' || effectiveRole === 'admin';
  const isRep = effectiveRole === 'representante';

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  // Unflag-with-note state
  const [unflagModalVisible, setUnflagModalVisible] = useState(false);
  const [unflagNote, setUnflagNote] = useState('');
  const [isUnflagging, setIsUnflagging] = useState(false);

  // Tag picker state (Gerente/admin only)
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [pendingTags, setPendingTags] = useState<Set<string>>(new Set());
  const [isSavingTags, setIsSavingTags] = useState(false);

  // Load the doctor document first — other queries depend on it
  const doctorRef = useMemoFirebase(
    () => (db && id ? doc(db, 'doctors', id) : null),
    [db, id]
  );
  const { data: doctor, isLoading: doctorLoading } = useDoc<Doctor>(doctorRef);

  const interactionsQuery = useMemoFirebase(
    () => (db && id ? getInteractionsByDoctorQuery(db, id) : null),
    [db, id]
  );
  const { data: interactions, isLoading: interactionsLoading } =
    useCollection<Interaction>(interactionsQuery);

  // Load reps for the assignment dropdown (manager only)
  const repsQuery = useMemoFirebase(
    () => (db && isManager ? getActiveRepsQuery(db) : null),
    [db, isManager]
  );
  const { data: reps } = useCollection<Representante>(repsQuery);

  // Narrow to the doctor's state when available — avoids loading the full catalogue.
  // Falls back to all doctors only if the doctor has no state set.
  const allDoctorsQuery = useMemoFirebase(
    () => {
      if (!db || !isManager) return null;
      if (doctor?.state) return getActiveDoctorsByStateQuery(db, doctor.state);
      return getActiveDoctorsQuery(db);
    },
    [db, isManager, doctor?.state]
  );
  const { data: allDoctors } = useCollection<Doctor>(allDoctorsQuery);

  const handleAssignRep = useCallback(async (repId: string) => {
    if (!db || !id) return;
    try {
      await assignRepToDoctor(db, id, repId);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Error assigning rep:', err);
    }
  }, [db, id]);

  const handleScheduleMeeting = useCallback((repId: string, repName: string) => {
    if (!id || !doctor) return;
    router.push({
      pathname: '/(app)/manager/schedule-meeting',
      params: {
        doctorId: id,
        doctorName: doctor.fullName,
        repId,
        repName,
      },
    });
  }, [id, router, doctor]);

  const handleReport = useCallback(async () => {
    if (!db || !id || !user || !doctor || !selectedReason) return;
    setIsReporting(true);
    try {
      await reportDoctor(db, id, {
        repId: user.uid,
        repName: user.displayName || user.email || '',
        doctorName: doctor.fullName,
        reason: selectedReason,
      });
      setReportModalVisible(false);
      setSelectedReason(null);
      const msg = 'Relatório enviado. O gerente será notificado.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Enviado', msg);
      }
    } catch (err) {
      console.error('Error reporting doctor:', err);
      const errMsg = 'Não foi possível enviar o relatório. Tente novamente.';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Erro', errMsg);
      }
    } finally {
      setIsReporting(false);
    }
  }, [db, id, user, doctor, selectedReason]);

  // ── Flag / Unflag handlers ──────────────────────────────────────────
  const handleFlagDoctor = useCallback(async () => {
    if (!db || !id) return;
    try {
      await flagDoctorForFollowUp(db, id, true);
    } catch (err) {
      console.error('Error flagging doctor:', err);
    }
  }, [db, id]);

  const handleUnflag = useCallback(async () => {
    if (!db || !id || !user || !unflagNote.trim()) return;
    setIsUnflagging(true);
    try {
      await unflagDoctorWithNote(db, id, user.uid, unflagNote.trim());
      setUnflagModalVisible(false);
      setUnflagNote('');
      const msg = 'Flag removido com sucesso.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Pronto', msg);
    } catch (err) {
      console.error('Error unflagging doctor:', err);
      const errMsg = 'Não foi possível remover o flag.';
      Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Erro', errMsg);
    } finally {
      setIsUnflagging(false);
    }
  }, [db, id, user, unflagNote]);

  // ── Tag picker handlers ─────────────────────────────────────────────
  const openTagPicker = useCallback(() => {
    setPendingTags(new Set(doctor?.tags ?? []));
    setTagModalVisible(true);
  }, [doctor?.tags]);

  const toggleTag = (key: string) => {
    setPendingTags((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSaveTags = useCallback(async () => {
    if (!db || !id) return;
    setIsSavingTags(true);
    try {
      await updateDoctorTags(db, id, Array.from(pendingTags));
      setTagModalVisible(false);
    } catch (err) {
      console.error('Error saving tags:', err);
    } finally {
      setIsSavingTags(false);
    }
  }, [db, id, pendingTags]);

  if (doctorLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Médico não encontrado</Text>
      </View>
    );
  }

  const initials = doctor.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const lastInteraction = interactions?.[0];

  return (
    <>
      <Stack.Screen
        options={{
          title: doctor.fullName,
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{doctor.fullName}</Text>
            <Text style={styles.specialty}>
              {doctor.mainSpecialty || 'Sem especialidade'}
            </Text>
            {doctor.city && doctor.state ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={C.textLight} />
                <Text style={styles.location}>
                  {doctor.city}, {doctor.state}
                </Text>
              </View>
            ) : null}
            <View style={styles.badgeRow}>
              <PropensityBadge score={doctor.propensityScore} />
              {doctor.totalTouches != null ? (
                <Text style={styles.touches}>
                  {doctor.totalTouches}{' '}
                  {doctor.totalTouches === 1 ? 'toque' : 'toques'}
                </Text>
              ) : null}
            </View>

            {/* Pipeline stage label */}
            {doctor.lastInteractionResult ? (
              <View style={[styles.pipelineLabel, {
                backgroundColor: (doctor.lastInteractionResult >= 4 ? C.greenLight : doctor.lastInteractionResult === 3 ? C.amberLight : C.redLight),
              }]}>
                <Text style={[styles.pipelineLabelText, {
                  color: doctor.lastInteractionResult >= 4 ? '#15803d' : doctor.lastInteractionResult === 3 ? '#854d0e' : '#b91c1c',
                }]}>
                  {RESULT_LABELS[doctor.lastInteractionResult]}
                </Text>
              </View>
            ) : null}

            {/* Doctor tags */}
            {(doctor.tags ?? []).length > 0 ? (
              <View style={styles.tagRow}>
                {(doctor.tags ?? []).map((key) => {
                  const tag = DOCTOR_TAG_MAP[key];
                  if (!tag) return null;
                  return (
                    <View key={key} style={[styles.tagChip, { backgroundColor: tag.color + '22' }]}>
                      <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.abbr}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* Flag / Unflag button */}
            <View style={styles.flagActionRow}>
              {doctor.flaggedForFollowUp ? (
                <Pressable
                  style={styles.unflagBtn}
                  onPress={() => setUnflagModalVisible(true)}
                >
                  <Ionicons name="flag" size={14} color={C.red} />
                  <Text style={styles.unflagBtnText}>Remover Flag</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.flagBtn} onPress={handleFlagDoctor}>
                  <Ionicons name="flag-outline" size={14} color={C.teal} />
                  <Text style={styles.flagBtnText}>Sinalizar</Text>
                </Pressable>
              )}

              {/* Tag edit button (manager/admin only) */}
              {isManager ? (
                <Pressable style={styles.tagEditBtn} onPress={openTagPicker}>
                  <Ionicons name="pricetag-outline" size={14} color={C.teal} />
                  <Text style={styles.tagEditBtnText}>Tags</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {/* Last visit summary */}
        {lastInteraction ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo da Última Visita</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Resultado</Text>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>
                    {RESULT_LABELS[lastInteraction.resultCode] ?? `Código ${lastInteraction.resultCode}`}
                  </Text>
                </View>
              </View>
              {lastInteraction.notes ? (
                <Text style={styles.summaryNotes} numberOfLines={4}>
                  {lastInteraction.notes}
                </Text>
              ) : null}
              <View style={styles.flagRow}>
                {lastInteraction.samplesDelivered ? (
                  <View style={styles.flag}>
                    <Ionicons name="checkmark-circle" size={14} color={C.green} />
                    <Text style={styles.flagText}>Amostras</Text>
                  </View>
                ) : null}
                {lastInteraction.followUpScheduled ? (
                  <View style={styles.flag}>
                    <Ionicons name="calendar" size={14} color={C.teal} />
                    <Text style={styles.flagText}>Follow-up</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Contact info */}
        {(doctor.mobilePhone || doctor.phone || doctor.email) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <View style={styles.contactCard}>
              {doctor.mobilePhone ? (
                <ContactRow icon="call-outline" label="Celular" value={doctor.mobilePhone} />
              ) : null}
              {doctor.phone ? (
                <ContactRow icon="call-outline" label="Telefone" value={doctor.phone} />
              ) : null}
              {doctor.email ? (
                <ContactRow icon="mail-outline" label="Email" value={doctor.email} />
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Action button */}
        <View style={styles.actionArea}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: '/(app)/interaction/new',
                params: { doctorId: id, doctorName: doctor.fullName },
              })
            }
          >
            <Ionicons name="create-outline" size={20} color={C.white} style={{ marginRight: 8 }} />
            <Text style={styles.actionText}>Registrar Interação</Text>
          </Pressable>

          {/* "Doctor not at address" button — reps only */}
          {isRep ? (
            doctor.reported ? (
              <View style={styles.reportedBanner}>
                <Ionicons name="alert-circle" size={16} color={C.amber} />
                <Text style={styles.reportedBannerText}>
                  Endereço reportado como desatualizado
                </Text>
              </View>
            ) : (
              <Pressable
                style={styles.reportButton}
                onPress={() => setReportModalVisible(true)}
              >
                <Ionicons name="location-outline" size={18} color={C.amber} style={{ marginRight: 8 }} />
                <Text style={styles.reportButtonText}>Médico Não Localizado</Text>
              </Pressable>
            )
          ) : null}

          {/* Reported banner visible to managers/admins too */}
          {!isRep && doctor.reported ? (
            <View style={styles.reportedBanner}>
              <Ionicons name="alert-circle" size={16} color={C.amber} />
              <Text style={styles.reportedBannerText}>
                Endereço reportado como desatualizado
              </Text>
            </View>
          ) : null}
        </View>

        {/* Manager: assign rep + schedule meeting */}
        {isManager && reps && allDoctors ? (
          <View style={styles.section}>
            <AssignRepDropdown
              reps={reps}
              doctors={allDoctors}
              currentDoctor={{ ...doctor, id: id! }}
              currentRepId={doctor.assignedRepId}
              onAssign={handleAssignRep}
              expanded={dropdownOpen}
              onToggle={() => setDropdownOpen((v) => !v)}
            />

            {/* Schedule meeting button */}
            {doctor.assignedRepId ? (
              <Pressable
                style={styles.meetingBtn}
                onPress={() => {
                  const rep = reps.find((r) => r.id === doctor.assignedRepId);
                  if (rep) {
                    handleScheduleMeeting(rep.userId || rep.id, rep.name);
                  }
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={C.teal} />
                <Text style={styles.meetingBtnText}>Agendar Reunião</Text>
              </Pressable>
            ) : (
              <Text style={styles.meetingHint}>
                Atribua um representante para agendar reunião
              </Text>
            )}
          </View>
        ) : null}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Interações</Text>
          {interactionsLoading ? (
            <ActivityIndicator size="small" color={C.teal} style={{ marginTop: 16 }} />
          ) : (
            <Timeline interactions={interactions ?? []} />
          )}
        </View>
      </ScrollView>

      {/* ── Report Modal ───────────────────────────────────────── */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Ionicons name="location-outline" size={22} color={C.amber} />
              <Text style={styles.modalTitle}>Médico Não Localizado</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Selecione o motivo pelo qual o médico não foi encontrado no
              endereço cadastrado:
            </Text>

            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                style={[
                  styles.reasonRow,
                  selectedReason === reason && styles.reasonRowSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={[
                  styles.radioCircle,
                  selectedReason === reason && styles.radioCircleFilled,
                ]} />
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextSelected,
                ]}>
                  {REPORT_REASON_LABELS[reason]}
                </Text>
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setReportModalVisible(false);
                  setSelectedReason(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmBtn,
                  (!selectedReason || isReporting) && styles.confirmBtnDisabled,
                ]}
                onPress={handleReport}
                disabled={!selectedReason || isReporting}
              >
                {isReporting ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>Enviar Relatório</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Unflag-with-note Modal ──────────────────────────────── */}
      <Modal
        visible={unflagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUnflagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Ionicons name="flag" size={22} color={C.red} />
              <Text style={styles.modalTitle}>Remover Sinalização</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Explique por que está removendo o flag deste médico. Essa informação
              será visível para o gerente.
            </Text>

            <TextInput
              style={styles.unflagInput}
              placeholder="Motivo da remoção do flag..."
              placeholderTextColor={C.textLight}
              value={unflagNote}
              onChangeText={setUnflagNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setUnflagModalVisible(false);
                  setUnflagNote('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmBtn,
                  { backgroundColor: C.red },
                  (!unflagNote.trim() || isUnflagging) && styles.confirmBtnDisabled,
                ]}
                onPress={handleUnflag}
                disabled={!unflagNote.trim() || isUnflagging}
              >
                {isUnflagging ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>Remover Flag</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Tag Picker Modal (Manager/Admin) ───────────────────── */}
      <Modal
        visible={tagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Ionicons name="pricetags-outline" size={22} color={C.teal} />
              <Text style={styles.modalTitle}>Tags do Médico</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Selecione as tags que se aplicam a este médico.
            </Text>

            {DOCTOR_TAGS.map((tag) => {
              const selected = pendingTags.has(tag.key);
              return (
                <Pressable
                  key={tag.key}
                  style={[
                    styles.reasonRow,
                    selected && { borderColor: tag.color, backgroundColor: tag.color + '15' },
                  ]}
                  onPress={() => toggleTag(tag.key)}
                >
                  <View style={[
                    styles.checkBox,
                    selected && { backgroundColor: tag.color, borderColor: tag.color },
                  ]}>
                    {selected ? (
                      <Ionicons name="checkmark" size={13} color={C.white} />
                    ) : null}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selected && { color: tag.color, fontWeight: '600' },
                  ]}>
                    {tag.label}
                  </Text>
                </Pressable>
              );
            })}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setTagModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmBtn,
                  { backgroundColor: C.teal },
                  isSavingTags && styles.confirmBtnDisabled,
                ]}
                onPress={handleSaveTags}
                disabled={isSavingTags}
              >
                {isSavingTags ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>Salvar Tags</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.contactRow}>
      <Ionicons name={icon} size={15} color={C.teal} style={{ marginRight: 10 }} />
      <Text style={styles.contactLabel}>{label}: </Text>
      <Text style={styles.contactValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: C.red,
    fontSize: 14,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.white,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text,
  },
  specialty: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: C.textLight,
    marginLeft: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  touches: {
    fontSize: 12,
    color: C.textMuted,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    ...S.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  resultBadge: {
    backgroundColor: C.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  summaryNotes: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 20,
  },
  flagRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagText: {
    fontSize: 12,
    color: C.textMuted,
  },
  contactCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 4,
    ...S.card,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  contactLabel: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },
  contactValue: {
    flex: 1,
    fontSize: 13,
    color: C.text,
  },
  meetingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  meetingBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.teal,
  },
  meetingHint: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  actionArea: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.teal,
    paddingVertical: 15,
    borderRadius: 12,
  },
  actionText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  reportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.amberLight,
    borderWidth: 1.5,
    borderColor: C.amber,
    paddingVertical: 13,
    borderRadius: 12,
  },
  reportButtonText: {
    color: C.amber,
    fontSize: 15,
    fontWeight: '600',
  },
  reportedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.amberLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  reportedBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  // ── Report modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 8,
    backgroundColor: C.card,
  },
  reasonRowSelected: {
    borderColor: C.amber,
    backgroundColor: C.amberLight,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.border,
    marginTop: 1,
    flexShrink: 0,
  },
  radioCircleFilled: {
    borderColor: C.amber,
    backgroundColor: C.amber,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
  },
  reasonTextSelected: {
    color: '#92400e',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: C.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  // ── Pipeline label ────────────────────────────────────────────────
  pipelineLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  pipelineLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // ── Tag chips ─────────────────────────────────────────────────────
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Flag / Tag action row ─────────────────────────────────────────
  flagActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  flagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.teal,
  },
  flagBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.teal,
  },
  unflagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.red,
    backgroundColor: C.redLight,
  },
  unflagBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.red,
  },
  tagEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.teal,
  },
  tagEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.teal,
  },
  // ── Unflag input ──────────────────────────────────────────────────
  unflagInput: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: C.text,
    minHeight: 80,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  // ── Tag picker checkbox ───────────────────────────────────────────
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
});
