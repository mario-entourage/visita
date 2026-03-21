import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { INTERACTION_TYPE_LABELS, RESULT_LABELS } from '@/lib/constants';
import { C, RESULT_COLORS } from '@/theme';
import type { InteractionType } from '@/types/interaction';

const interactionSchema = z.object({
  type: z.enum(['field_visit', 'clinical_event', 'congress', 'digital']),
  resultCode: z.number().min(1).max(5),
  samplesDelivered: z.boolean(),
  spokeFaceToFace: z.boolean(),
  followUpScheduled: z.boolean(),
  notes: z.string(),
});

export type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  onSubmit: (data: InteractionFormValues) => void;
  isSubmitting?: boolean;
}

const TYPES = Object.entries(INTERACTION_TYPE_LABELS) as [InteractionType, string][];
const RESULTS = Object.entries(RESULT_LABELS).map(([k, v]) => ({
  value: Number(k),
  label: v,
}));

export function InteractionForm({ onSubmit, isSubmitting }: InteractionFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: 'field_visit',
      resultCode: 2,
      samplesDelivered: false,
      spokeFaceToFace: true,
      followUpScheduled: false,
      notes: '',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Interação</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipRow}>
                {TYPES.map(([key, label]) => (
                  <Pressable
                    key={key}
                    style={[styles.typeChip, value === key && styles.typeChipActive]}
                    onPress={() => onChange(key)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        value === key && styles.typeChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>
      </View>

      {/* Result */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resultado</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="resultCode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.resultGrid}>
                {RESULTS.map(({ value: v, label }) => {
                  const colors = RESULT_COLORS[v];
                  const selected = value === v;
                  return (
                    <Pressable
                      key={v}
                      style={[
                        styles.resultChip,
                        { backgroundColor: colors.bg, borderColor: colors.text },
                        selected && styles.resultChipSelected,
                      ]}
                      onPress={() => onChange(v)}
                    >
                      <Text
                        style={[
                          styles.resultChipText,
                          { color: colors.text },
                          selected && styles.resultChipTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.resultCode ? (
            <Text style={styles.error}>{errors.resultCode.message}</Text>
          ) : null}
        </View>
      </View>

      {/* Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="samplesDelivered"
            render={({ field: { onChange, value } }) => (
              <SwitchRow label="Amostras entregues" value={value} onChange={onChange} isLast={false} />
            )}
          />
          <Controller
            control={control}
            name="spokeFaceToFace"
            render={({ field: { onChange, value } }) => (
              <SwitchRow label="Conversa presencial" value={value} onChange={onChange} isLast={false} />
            )}
          />
          <Controller
            control={control}
            name="followUpScheduled"
            render={({ field: { onChange, value } }) => (
              <SwitchRow label="Follow-up agendado" value={value} onChange={onChange} isLast />
            )}
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anotações</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Notas sobre a interação..."
                placeholderTextColor={C.textLight}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Salvando...' : 'Registrar Interação'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
  isLast,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast: boolean;
}) {
  return (
    <View style={[styles.switchRow, !isLast && styles.switchRowBorder]}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.border, true: C.tealLight }}
        thumbColor={C.white}
      />
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  typeChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  typeChipText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: C.white,
    fontWeight: '600',
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  resultChipSelected: {
    borderWidth: 2.5,
  },
  resultChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultChipTextSelected: {
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  switchRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  switchLabel: {
    fontSize: 14,
    color: C.text,
  },
  textArea: {
    fontSize: 14,
    color: C.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: C.teal,
    marginHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: C.red,
    fontSize: 12,
    marginTop: 4,
  },
});
