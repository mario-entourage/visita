import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { addHours } from 'date-fns';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import {
  getUpcomingVisitsQuery,
  createVisit,
  updateVisit,
  visitExistsForCalendarEvent,
  visitExistsForDoctorOnDate,
  getVisitsByWeekQuery,
} from '@/services/visits.service';
import { getInteractionsByRepQuery } from '@/services/interactions.service';
import {
  getAllActiveDoctors,
  createDoctor,
} from '@/services/doctors.service';
import {
  fetchGoogleEvents,
  createGoogleEvent,
  matchEventsToDb,
  getWeekRange,
  getEventStartDate,
} from '@/services/calendar.service';
import type {
  MatchedEvent,
  UnmatchedEvent,
} from '@/services/calendar.service';
import { useCalendarAuth } from '@/hooks/use-calendar-auth';
import { SyncModal, type SyncDirection, type SyncWeek } from '@/components/SyncModal';
import { SyncReviewList, type ReviewItem } from '@/components/SyncReviewList';
import { formatTimestamp } from '@/lib/utils';
import { C, RESULT_COLORS } from '@/theme';
import { RESULT_LABELS, INTERACTION_TYPE_LABELS } from '@/lib/constants';
import type { ScheduledVisit } from '@/types/scheduled-visit';
import type { Interaction } from '@/types/interaction';
import { getDocs } from 'firebase/firestore';

// ── State machine ──────────────────────────────────────────────────

type SyncState =
  | { step: 'idle' }
  | { step: 'syncing'; message: string }
  | { step: 'review'; matched: MatchedEvent[]; unmatched: UnmatchedEvent[] }
  | { step: 'done'; message: string };

// ── Component ──────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { requestAccess } = useCalendarAuth();

  const [showModal, setShowModal] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({ step: 'idle' });
  const [isImporting, setIsImporting] = useState(false);

  const visitsQuery = useMemoFirebase(
    () => (db && user ? getUpcomingVisitsQuery(db, user.uid) : null),
    [db, user?.uid]
  );
  const { data: visits, isLoading } = useCollection<ScheduledVisit>(visitsQuery);

  // History: rep's own past interactions (data visibility wall — only own data)
  const historyQuery = useMemoFirebase(
    () => (db && user ? getInteractionsByRepQuery(db, user.uid) : null),
    [db, user?.uid]
  );
  const { data: history } = useCollection<Interaction>(historyQuery);

  // ── Helpers ────────────────────────────────────────────────────────

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // ── Google → App sync ─────────────────────────────────────────────

  const syncGoogleToApp = async (week: SyncWeek) => {
    if (!db || !user) return;

    setSyncState({ step: 'syncing', message: 'Conectando ao Google Calendar...' });

    try {
      const accessToken = await requestAccess();

      setSyncState({ step: 'syncing', message: 'Buscando eventos...' });
      const { start, end } = getWeekRange(week === 'this' ? 0 : 1);
      const events = await fetchGoogleEvents(accessToken, start, end);

      if (events.length === 0) {
        setSyncState({ step: 'done', message: 'Nenhum evento encontrado para esta semana.' });
        return;
      }

      setSyncState({ step: 'syncing', message: 'Comparando com médicos...' });
      const doctors = await getAllActiveDoctors(db);
      const { matched, unmatched } = matchEventsToDb(events, doctors);

      // Auto-import matched events
      let imported = 0;
      for (const m of matched) {
        const eventId = m.event.id;
        const exists = await visitExistsForCalendarEvent(db, user.uid, eventId);
        if (exists) continue;

        const eventDate = getEventStartDate(m.event);
        const dupByDoctor = await visitExistsForDoctorOnDate(
          db, user.uid, m.doctor.id, eventDate
        );
        if (dupByDoctor) continue;

        await createVisit(db, {
          doctorId: m.doctor.id,
          doctorName: m.doctor.fullName,
          repId: user.uid,
          assignedBy: user.uid,
          scheduledFor: Timestamp.fromDate(eventDate),
          status: 'scheduled',
          active: true,
          googleCalendarEventId: eventId,
          source: 'google_sync',
        });
        imported++;
      }

      if (unmatched.length === 0) {
        const msg = imported > 0
          ? `${imported} visita(s) importada(s). Todos os eventos identificados!`
          : 'Todos os eventos já foram importados.';
        setSyncState({ step: 'done', message: msg });
      } else {
        setSyncState({ step: 'review', matched, unmatched });
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      if (err.message === 'TOKEN_EXPIRED') {
        showAlert('Erro', 'Sessão expirada. Tente sincronizar novamente.');
      } else if (err.message?.includes('cancelada')) {
        // User cancelled OAuth — just go back to idle
      } else {
        showAlert('Erro', err.message || 'Não foi possível sincronizar.');
      }
      setSyncState({ step: 'idle' });
    }
  };

  // ── App → Google sync ─────────────────────────────────────────────

  const syncAppToGoogle = async (week: SyncWeek) => {
    if (!db || !user) return;

    setSyncState({ step: 'syncing', message: 'Conectando ao Google Calendar...' });

    try {
      const accessToken = await requestAccess();

      setSyncState({ step: 'syncing', message: 'Buscando visitas...' });
      const { start, end } = getWeekRange(week === 'this' ? 0 : 1);
      const q = getVisitsByWeekQuery(db, user.uid, start, end);
      const snap = await getDocs(q);

      const visitsToSync = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ScheduledVisit))
        .filter((v) => !v.googleCalendarEventId); // Skip already-synced

      if (visitsToSync.length === 0) {
        setSyncState({ step: 'done', message: 'Todas as visitas já estão no Google Calendar.' });
        return;
      }

      setSyncState({ step: 'syncing', message: `Exportando ${visitsToSync.length} visita(s)...` });

      let exported = 0;
      for (const visit of visitsToSync) {
        const startTime = visit.scheduledFor.toDate();
        const eventId = await createGoogleEvent(accessToken, {
          summary: visit.doctorName ? `Dr. ${visit.doctorName}` : 'Visita médica',
          startTime,
          endTime: addHours(startTime, 1),
          description: visit.notes ?? '',
        });

        await updateVisit(db, visit.id, { googleCalendarEventId: eventId });
        exported++;
      }

      setSyncState({ step: 'done', message: `${exported} visita(s) exportada(s) para o Google Calendar.` });
    } catch (err: any) {
      console.error('Sync error:', err);
      showAlert('Erro', err.message || 'Não foi possível exportar.');
      setSyncState({ step: 'idle' });
    }
  };

  // ── Handle sync direction ─────────────────────────────────────────

  const handleSync = (direction: SyncDirection, week: SyncWeek) => {
    if (direction === 'google-to-app') {
      syncGoogleToApp(week);
    } else {
      syncAppToGoogle(week);
    }
  };

  // ── Handle review import ──────────────────────────────────────────

  const handleReviewImport = async (items: ReviewItem[]) => {
    if (!db || !user) return;
    setIsImporting(true);

    try {
      let importedCount = 0;

      for (const item of items) {
        const eventDate = getEventStartDate(item.event.event);
        let doctorId = '';
        let doctorName = item.doctorName;

        // If marked as doctor, create the doctor first
        if (item.isDoctor && item.doctorName.trim()) {
          const nameParts = item.doctorName.trim().split(/\s+/);
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

          doctorId = await createDoctor(db, {
            fullName: item.doctorName.trim(),
            firstName,
            lastName,
            mainSpecialty: item.specialty.trim() || undefined,
            createdByRepId: user.uid,
          });
          doctorName = item.doctorName.trim();
        }

        await createVisit(db, {
          doctorId,
          doctorName,
          repId: user.uid,
          assignedBy: user.uid,
          scheduledFor: Timestamp.fromDate(eventDate),
          status: 'scheduled',
          active: true,
          googleCalendarEventId: item.event.event.id,
          source: 'google_sync',
        });
        importedCount++;
      }

      setSyncState({
        step: 'done',
        message: `${importedCount} evento(s) importado(s).`,
      });
    } catch (err: any) {
      console.error('Import error:', err);
      showAlert('Erro', err.message || 'Não foi possível importar.');
    } finally {
      setIsImporting(false);
    }
  };

  // ── Render: review state ──────────────────────────────────────────

  if (syncState.step === 'review') {
    return (
      <SyncReviewList
        matched={syncState.matched}
        unmatched={syncState.unmatched}
        onImport={handleReviewImport}
        onCancel={() => setSyncState({ step: 'idle' })}
        isImporting={isImporting}
      />
    );
  }

  // ── Render: syncing state ─────────────────────────────────────────

  if (syncState.step === 'syncing') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
        <Text style={styles.syncingText}>{syncState.message}</Text>
      </View>
    );
  }

  // ── Render: done state ────────────────────────────────────────────

  if (syncState.step === 'done') {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle-outline" size={48} color={C.teal} />
        <Text style={styles.doneText}>{syncState.message}</Text>
        <Pressable
          style={styles.doneBtn}
          onPress={() => setSyncState({ step: 'idle' })}
        >
          <Text style={styles.doneBtnText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  // ── Render: idle state (main schedule view) ───────────────────────

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sync button */}
        <Pressable
          style={styles.syncBar}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="sync-outline" size={18} color={C.teal} />
          <Text style={styles.syncBarText}>Sincronizar com Google Calendar</Text>
          <Ionicons name="chevron-forward" size={16} color={C.textLight} />
        </Pressable>

        {/* ── Upcoming visits ─────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>PRÓXIMAS VISITAS</Text>

        {isLoading ? (
          <ActivityIndicator size="small" color={C.teal} style={{ marginVertical: 24 }} />
        ) : visits && visits.length > 0 ? (
          visits.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/visit/${item.id}`)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="calendar-outline" size={18} color={C.teal} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.doctorName}>
                  {item.doctorName || 'Médico'}
                </Text>
                <Text style={styles.date}>
                  {formatTimestamp(item.scheduledFor, "EEE, dd/MM 'às' HH:mm")}
                </Text>
                {item.notes ? (
                  <Text style={styles.notes} numberOfLines={1}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
              {item.source === 'google_sync' ? (
                <Ionicons name="logo-google" size={14} color={C.textLight} style={{ marginRight: 4 }} />
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={36} color={C.border} />
            <Text style={styles.emptyText}>Nenhuma visita agendada</Text>
          </View>
        )}

        {/* ── Interaction history (own data only) ──────────────────── */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>MEU HISTÓRICO</Text>

        {history && history.length > 0 ? (
          history.map((item) => {
            const colors = RESULT_COLORS[item.resultCode] ?? { bg: C.border, text: C.textMuted };
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => router.push({
                  pathname: '/(app)/doctor/[id]',
                  params: { id: item.doctorId },
                })}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.bg }]}>
                  <Ionicons name="checkmark-done-outline" size={18} color={colors.text} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.doctorName}>
                    {item.doctorName || 'Médico'}
                  </Text>
                  <Text style={[styles.date, { color: colors.text }]}>
                    {RESULT_LABELS[item.resultCode] ?? `Código ${item.resultCode}`}
                    {' · '}
                    {INTERACTION_TYPE_LABELS[item.type] ?? item.type}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.notes} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.historyDate}>
                  {formatTimestamp(item.createdAt, 'dd/MM')}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyWrap}>
            <Ionicons name="time-outline" size={36} color={C.border} />
            <Text style={styles.emptyText}>Nenhuma interação registrada</Text>
          </View>
        )}
      </ScrollView>

      <SyncModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSync={handleSync}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  historyDate: {
    fontSize: 12,
    color: C.textLight,
    marginLeft: 6,
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  syncBarText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.teal,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  date: {
    fontSize: 13,
    color: C.teal,
    marginTop: 2,
  },
  notes: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  syncingText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
  },
  doneText: {
    fontSize: 15,
    color: C.text,
    textAlign: 'center',
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
  emptyWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: C.textLight,
    fontSize: 14,
  },
});
