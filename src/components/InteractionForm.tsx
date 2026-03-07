import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { INTERACTION_TYPE_LABELS, RESULT_LABELS } from '@/lib/constants';
import type { InteractionType } from '@/types/interaction';

const interactionSchema = z.object({
  type: z.enum(['field_visit', 'clinical_event', 'congress', 'digital']),
  resultCode: z.number().min(1).max(7),
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

const TYPES = Object.entries(INTERACTION_TYPE_LABELS) as [
  InteractionType,
  string,
][];
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
    <ScrollView style={styles.container}>
      {/* Interaction Type */}
      <Text style={styles.label}>Tipo de Interação</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {TYPES.map(([key, label]) => (
              <Pressable
                key={key}
                style={[styles.chip, value === key && styles.chipActive]}
                onPress={() => onChange(key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    value === key && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />

      {/* Result Code */}
      <Text style={styles.label}>Resultado</Text>
      <Controller
        control={control}
        name="resultCode"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chipRow}>
            {RESULTS.map(({ value: v, label }) => (
              <Pressable
                key={v}
                style={[styles.chip, value === v && styles.chipActive]}
                onPress={() => onChange(v)}
              >
                <Text
                  style={[
                    styles.chipText,
                    value === v && styles.chipTextActive,
                  ]}
                >
                  {v}. {label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      {errors.resultCode && (
        <Text style={styles.error}>{errors.resultCode.message}</Text>
      )}

      {/* Boolean toggles */}
      <Controller
        control={control}
        name="samplesDelivered"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Amostras entregues</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="spokeFaceToFace"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Conversa presencial</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="followUpScheduled"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Follow-up agendado</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      {/* Notes */}
      <Text style={styles.label}>Observações</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Notas sobre a interação..."
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Submit */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
