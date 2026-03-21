import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { format, addDays, startOfWeek, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFirestore, useUser } from '@/firebase/provider';
import { createVisit } from '@/services/visits.service';
import { C } from '@/theme';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7:00 - 17:00
const MINUTES = [0, 15, 30, 45];

export default function ScheduleMeetingScreen() {
  const { doctorId, doctorName, repId, repName } = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
    repId: string;
    repName: string;
  }>();

  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate next 14 days for date picker
  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const handleSubmit = async () => {
    if (!db || !user || !selectedDate || !doctorId || !repId) return;

    setIsSubmitting(true);
    try {
      const scheduledFor = setMinutes(
        setHours(selectedDate, selectedHour),
        selectedMinute
      );

      await createVisit(db, {
        doctorId,
        doctorName: doctorName || '',
        repId,
        assignedBy: user.uid,
        scheduledFor: Timestamp.fromDate(scheduledFor),
        status: 'scheduled',
        notes: notes.trim() || undefined,
        active: true,
        source: 'manager_assigned',
      });

      const msg = `Reunião com ${doctorName} agendada para ${format(scheduledFor, "dd/MM 'às' HH:mm")}`;
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Sucesso', msg);
      }

      router.back();
    } catch (err: any) {
      console.error('Error creating visit:', err);
      const errMsg = 'Não foi possível agendar a reunião.';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Erro', errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={C.teal} />
          <Text style={styles.infoLabel}>Médico:</Text>
          <Text style={styles.infoValue}>{doctorName || 'Médico'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="briefcase-outline" size={16} color={C.teal} />
          <Text style={styles.infoLabel}>Representante:</Text>
          <Text style={styles.infoValue}>{repName || 'Rep'}</Text>
        </View>
      </View>

      {/* Date picker */}
      <Text style={styles.sectionTitle}>DATA</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {dates.map((date) => {
          const isSelected =
            selectedDate?.toDateString() === date.toDateString();
          const dayName = format(date, 'EEE', { locale: ptBR });
          const dayNum = format(date, 'dd');
          const monthName = format(date, 'MMM', { locale: ptBR });

          return (
            <Pressable
              key={date.toISOString()}
              style={[styles.dateChip, isSelected && styles.dateChipActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateDayName,
                  isSelected && styles.dateTextActive,
                ]}
              >
                {dayName}
              </Text>
              <Text
                style={[
                  styles.dateDayNum,
                  isSelected && styles.dateTextActive,
                ]}
              >
                {dayNum}
              </Text>
              <Text
                style={[
                  styles.dateMonth,
                  isSelected && styles.dateTextActive,
                ]}
              >
                {monthName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Time picker */}
      {selectedDate ? (
        <>
          <Text style={styles.sectionTitle}>HORÁRIO</Text>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Hora</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeRow}
            >
              {HOURS.map((h) => (
                <Pressable
                  key={h}
                  style={[
                    styles.timeChip,
                    selectedHour === h && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      selectedHour === h && styles.timeChipTextActive,
                    ]}
                  >
                    {String(h).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.timeLabel, { marginTop: 12 }]}>Minutos</Text>
            <View style={styles.timeRow}>
              {MINUTES.map((m) => (
                <Pressable
                  key={m}
                  style={[
                    styles.timeChip,
                    selectedMinute === m && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedMinute(m)}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      selectedMinute === m && styles.timeChipTextActive,
                    ]}
                  >
                    :{String(m).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      ) : null}

      {/* Notes */}
      {selectedDate ? (
        <>
          <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
          <View style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="Notas sobre a reunião (opcional)"
              placeholderTextColor={C.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </>
      ) : null}

      {/* Submit */}
      {selectedDate ? (
        <Pressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              Agendar para{' '}
              {format(
                setMinutes(setHours(selectedDate, selectedHour), selectedMinute),
                "dd/MM 'às' HH:mm"
              )}
            </Text>
          )}
        </Pressable>
      ) : null}
    </ScrollView>
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
  infoCard: {
    backgroundColor: C.card,
    margin: 16,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  dateRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateChip: {
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    minWidth: 60,
  },
  dateChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  dateDayName: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'capitalize',
  },
  dateDayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'capitalize',
  },
  dateTextActive: {
    color: C.white,
  },
  timeCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
  },
  timeLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  timeChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  timeChipTextActive: {
    color: C.white,
  },
  notesCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
  },
  notesInput: {
    fontSize: 14,
    color: C.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: C.teal,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
