import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { RESULT_LABELS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';
import { C, RESULT_COLORS, S } from '@/theme';
import type { Doctor } from '@/types/doctor';
import type { Interaction } from '@/types/interaction';

const interactionSchema = z.object({
  preVisitNotes: z.string(),
  resultCode: z.number().min(1).max(5),
  postVisitNotes: z.string(),
  // Extended detail fields
  isPrescriber: z.boolean().optional(),
  prescribedProducts: z.string().optional(),
  prescriptionType: z.enum(['rdc660', 'pharmacy']).optional(),
  reasonTherapeutic: z.boolean().optional(),
  reasonDelivery: z.boolean().optional(),
  reasonPracticality: z.boolean().optional(),
  reasonCost: z.boolean().optional(),
  reasonOther: z.string().optional(),
});

export type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  onSubmit: (data: InteractionFormValues) => void;
  isSubmitting?: boolean;
  doctor?: Doctor & { id: string };
  lastInteraction?: Interaction;
}

const RESULTS = Object.entries(RESULT_LABELS).map(([k, v]) => ({
  value: Number(k),
  label: v,
}));

export function InteractionForm({
  onSubmit,
  isSubmitting,
  doctor,
  lastInteraction,
}: InteractionFormProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      preVisitNotes: '',
      resultCode: 3,
      postVisitNotes: '',
      isPrescriber: false,
      prescribedProducts: '',
      prescriptionType: undefined,
      reasonTherapeutic: false,
      reasonDelivery: false,
      reasonPracticality: false,
      reasonCost: false,
      reasonOther: '',
    },
  });

  const isPrescriber = watch('isPrescriber');

  // Build talking-point suggestions for the dialogue box
  function buildHint(): { label: string; lines: string[] } | null {
    if (lastInteraction) {
      const dateStr = formatTimestamp(lastInteraction.createdAt, 'dd/MM/yyyy');
      const rc = lastInteraction.resultCode;
      const lines: string[] = [];

      // Talking points derived from the last result code
      if (rc >= 4) {
        lines.push('Já demonstrou interesse — pergunte como está a experiência com o produto.');
      } else if (rc === 3) {
        lines.push('Ainda está em aberto — traga dados clínicos e cases de sucesso.');
      } else {
        lines.push('Resistência anterior — escute as objeções e traga argumentos novos.');
      }

      // Surface what the rep wrote last time as context
      const prevNotes = lastInteraction.postVisitNotes || lastInteraction.notes;
      if (prevNotes) {
        lines.push(`Na última visita você anotou: "${prevNotes}"`);
      }

      // Doctor specialty as conversation anchor
      if (doctor?.mainSpecialty) {
        lines.push(`Especialidade: ${doctor.mainSpecialty} — adapte a abordagem ao perfil.`);
      }

      return { label: `Pontos de conversa · visita ${dateStr}`, lines };
    }

    if (doctor) {
      const lines: string[] = [];
      lines.push('Primeira visita — apresente-se e conheça a rotina do médico.');
      lines.push('Mapeie: prescreve cannabis? Quais patologias trata?');
      if (doctor.mainSpecialty) {
        lines.push(`Especialidade: ${doctor.mainSpecialty} — explore temas relevantes.`);
      }
      return { label: 'Pontos de conversa · primeiro contato', lines };
    }

    return null;
  }

  const hint = buildHint();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Talking-points dialogue box */}
      {hint ? (
        <View style={styles.hintBox}>
          <View style={styles.hintHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={C.teal} />
            <Text style={styles.hintLabel}>{hint.label}</Text>
          </View>
          {hint.lines.map((line, i) => (
            <View key={i} style={styles.hintRow}>
              <Text style={styles.hintBullet}>•</Text>
              <Text style={styles.hintBody}>{line}</Text>
            </View>
          ))}
        </View>
      ) : null}

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

      {/* Collapsible details section */}
      <Pressable
        style={styles.detailsToggle}
        onPress={() => setDetailsOpen((o) => !o)}
      >
        <Text style={styles.detailsToggleText}>Mais detalhes</Text>
        <Ionicons
          name={detailsOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={C.textMuted}
        />
      </Pressable>

      {detailsOpen ? (
        <View style={styles.detailsContent}>

          {/* isPrescriber toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescrição de Cannabis</Text>
            <View style={[styles.card, styles.rowCard]}>
              <Text style={styles.rowLabel}>Médico prescreve cannabis?</Text>
              <Controller
                control={control}
                name="isPrescriber"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={!!value}
                    onValueChange={onChange}
                    trackColor={{ false: C.border, true: C.teal }}
                    thumbColor={C.white}
                  />
                )}
              />
            </View>
          </View>

          {/* Products + prescription type — only if isPrescriber */}
          {isPrescriber ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Produtos prescritos</Text>
                <View style={styles.card}>
                  <Controller
                    control={control}
                    name="prescribedProducts"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={3}
                        placeholder="Quais produtos o médico indicou ou prescreveu..."
                        placeholderTextColor={C.textLight}
                        value={value}
                        onChangeText={onChange}
                        textAlignVertical="top"
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de receita</Text>
                <View style={styles.card}>
                  <Controller
                    control={control}
                    name="prescriptionType"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.chipRow}>
                        {(
                          [
                            { key: 'rdc660', label: 'RDC 660' },
                            { key: 'pharmacy', label: 'Farmácia' },
                          ] as const
                        ).map(({ key, label }) => (
                          <Pressable
                            key={key}
                            style={[
                              styles.typeChip,
                              value === key && styles.typeChipSelected,
                            ]}
                            onPress={() =>
                              onChange(value === key ? undefined : key)
                            }
                          >
                            <Text
                              style={[
                                styles.typeChipText,
                                value === key && styles.typeChipTextSelected,
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

              {/* Prescribing reasons */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Motivos da prescrição</Text>
                <View style={styles.card}>
                  {(
                    [
                      { name: 'reasonTherapeutic', label: 'Benefício terapêutico' },
                      { name: 'reasonDelivery', label: 'Facilidade de administração' },
                      { name: 'reasonPracticality', label: 'Praticidade' },
                      { name: 'reasonCost', label: 'Custo-benefício' },
                    ] as const
                  ).map(({ name, label }) => (
                    <Controller
                      key={name}
                      control={control}
                      name={name}
                      render={({ field: { onChange, value } }) => (
                        <Pressable
                          style={styles.checkRow}
                          onPress={() => onChange(!value)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              value && styles.checkboxChecked,
                            ]}
                          >
                            {value ? (
                              <Ionicons name="checkmark" size={12} color={C.white} />
                            ) : null}
                          </View>
                          <Text style={styles.checkLabel}>{label}</Text>
                        </Pressable>
                      )}
                    />
                  ))}

                  {/* "Other" reason with free text */}
                  <Controller
                    control={control}
                    name="reasonOther"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.reasonOtherRow}>
                        <Pressable
                          style={styles.checkRow}
                          onPress={() => onChange(value ? '' : ' ')}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              !!value?.trim() && styles.checkboxChecked,
                            ]}
                          >
                            {!!value?.trim() ? (
                              <Ionicons name="checkmark" size={12} color={C.white} />
                            ) : null}
                          </View>
                          <Text style={styles.checkLabel}>Outro motivo</Text>
                        </Pressable>
                        {!!value?.trim() ? (
                          <TextInput
                            style={styles.reasonOtherInput}
                            placeholder="Descreva..."
                            placeholderTextColor={C.textLight}
                            value={value}
                            onChangeText={onChange}
                          />
                        ) : null}
                      </View>
                    )}
                  />
                </View>
              </View>
            </>
          ) : null}
        </View>
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
  // Hint box
  hintBox: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f0fafa',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: C.teal,
    padding: 12,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hintLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  hintBullet: {
    fontSize: 13,
    color: C.teal,
    lineHeight: 18,
  },
  hintBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    flex: 1,
  },
  // Sections
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
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 14,
    color: C.text,
    flex: 1,
    marginRight: 12,
  },
  // Result chips
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
  // Text areas
  textArea: {
    fontSize: 14,
    color: C.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  // Submit button
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
  // Collapsible toggle
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
  },
  detailsToggleText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '600',
  },
  detailsContent: {
    // no extra wrapper needed; sections handle their own spacing
  },
  // Type chips (prescription type)
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  typeChipSelected: {
    borderColor: C.teal,
    backgroundColor: '#f0fafa',
  },
  typeChipText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: C.teal,
  },
  // Checkboxes
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  checkLabel: {
    fontSize: 14,
    color: C.text,
  },
  reasonOtherRow: {
    // wraps checkbox row + optional text input
  },
  reasonOtherInput: {
    marginLeft: 30,
    marginTop: 4,
    fontSize: 13,
    color: C.text,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 4,
  },
  error: {
    color: C.red,
    fontSize: 12,
    marginTop: 4,
  },
});
