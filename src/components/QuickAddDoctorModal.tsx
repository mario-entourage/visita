import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';
import { BRAZILIAN_STATES } from '@/lib/constants';

interface QuickAddDoctorFormValues {
  firstName: string;
  lastName: string;
  state: string;
  mainSpecialty: string;
  city: string;
  phone: string;
  mobilePhone: string;
  crm: string;
}

const quickAddDoctorSchema = z.object({
  firstName: z.string().min(1, 'Primeiro nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  state: z.string().min(2, 'Estado é obrigatório').max(2),
  mainSpecialty: z.string().default(''),
  city: z.string().default(''),
  phone: z.string().default(''),
  mobilePhone: z.string().default(''),
  crm: z.string().default(''),
}) as any as z.ZodType<QuickAddDoctorFormValues>;

export type { QuickAddDoctorFormValues };

interface QuickAddDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: QuickAddDoctorFormValues) => Promise<void>;
}

const STATES = Object.entries(BRAZILIAN_STATES).map(([code, name]) => ({
  code,
  name,
}));

export function QuickAddDoctorModal({
  visible,
  onClose,
  onSubmit,
}: QuickAddDoctorModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    // @ts-ignore - Zod schema type inference
    resolver: zodResolver(quickAddDoctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      state: '',
      mainSpecialty: '',
      city: '',
      phone: '',
      mobilePhone: '',
      crm: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: QuickAddDoctorFormValues) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Adicionar Médico</Text>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* First Name */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Primeiro Nome *</Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError,
                    ]}
                    placeholder="Ex: João"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.firstName && (
                // @ts-ignore
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Sobrenome *</Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.lastName && styles.inputError,
                    ]}
                    placeholder="Ex: Silva"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                )}
              />
              {errors.lastName && (
                // @ts-ignore
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
              )}
            </View>

            {/* State */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Estado *</Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.stateGrid}>
                    {STATES.map((s) => (
                      <Pressable
                        key={s.code}
                        style={[
                          styles.stateButton,
                          value === s.code && styles.stateButtonActive,
                        ]}
                        onPress={() => onChange(s.code)}
                        disabled={isSubmitting}
                      >
                        <Text
                          style={[
                            styles.stateButtonText,
                            value === s.code && styles.stateButtonTextActive,
                          ]}
                        >
                          {s.code}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />
              {errors.state && (
                // @ts-ignore
                <Text style={styles.errorText}>{errors.state.message}</Text>
              )}
            </View>

            {/* Specialty */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Especialidade Principal</Text>
              <Controller
                control={control}
                name="mainSpecialty"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Cardiologia"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            {/* City */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Cidade</Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: São Paulo"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            {/* Phone */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Telefone Comercial</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: (11) 3000-0000"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            {/* Mobile Phone */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>Telefone Celular</Text>
              <Controller
                control={control}
                name="mobilePhone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: (11) 98000-0000"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>

            {/* CRM */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>CRM</Text>
              <Controller
                control={control}
                name="crm"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 123456"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                )}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={styles.submitText}>Adicionar Médico</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  fieldSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.white,
  },
  inputError: {
    borderColor: C.red,
  },
  errorText: {
    fontSize: 12,
    color: C.red,
    marginTop: 4,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stateButton: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
  },
  stateButtonActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  stateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
  stateButtonTextActive: {
    color: C.white,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 10,
  },
  submitBtn: {
    backgroundColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
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
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
  },
});
