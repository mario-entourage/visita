import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RESULT_LABELS } from '@/lib/constants';
import { C, RESULT_COLORS, S } from '@/theme';

const interactionSchema = z.object({
  preVisitNotes: z.string(),
  resultCode: z.number().min(1).max(5),
  postVisitNotes: z.string(),
});

export type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  onSubmit: (data: InteractionFormValues) => void;
  isSubmitting?: boolean;
}

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
      preVisitNotes: '',
      resultCode: 3,
      postVisitNotes: '',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Pre-visit notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Antes da visita</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="preVisitNotes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="O que você quer abordar nesta visita..."
                placeholderTextColor={C.textLight}
                value={value}
                onChangeText={onChange}
                textAlignVertical="top"
              />
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

      {/* Post-visit notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Após a visita</Text>
        <View style={styles.card}>
          <Controller
            control={control}
            name="postVisitNotes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Como foi? O que aconteceu na visita..."
                placeholderTextColor={C.textLight}
                value={value}
                onChangeText={onChange}
                textAlignVertical="top"
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
          {isSubmitting ? 'Salvando...' : 'Registrar Visita'}
        </Text>
      </Pressable>

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
    ...S.card,
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
