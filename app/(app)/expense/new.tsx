import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';
import { useFirestore, useStorage, useUser } from '@/firebase/provider';
import { uploadReceipt, createExpense } from '@/services/expenses.service';
import {
  ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
} from '@/types/expense';
import { C } from '@/theme';

const CATEGORIES: ExpenseCategory[] = [
  'combustivel',
  'alimentacao',
  'estacionamento',
  'pedagio',
  'outro',
];

export default function NewExpenseScreen() {
  const db = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const router = useRouter();

  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Photo capture
  // ---------------------------------------------------------------------------

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      const msg = 'Permita o acesso à câmera para fotografar o comprovante.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Permissão necessária', msg);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const msg = 'Permita o acesso à galeria para selecionar um comprovante.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Permissão necessária', msg);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
      aspect: [3, 4],
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const amountValue = parseFloat(amount.replace(',', '.'));
  const canSubmit =
    receiptUri &&
    category !== null &&
    !isNaN(amountValue) &&
    amountValue > 0 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!db || !storage || !user || !receiptUri || !category) return;
    if (isNaN(amountValue) || amountValue <= 0) {
      const msg = 'Informe um valor válido.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Valor inválido', msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const { receiptUrl, receiptPath } = await uploadReceipt(
        storage,
        user.uid,
        receiptUri
      );

      await createExpense(db, {
        repId: user.uid,
        repName: user.displayName || user.email || '',
        amount: amountValue,
        category,
        notes: notes.trim() || undefined,
        receiptUrl,
        receiptPath,
        date: Timestamp.now(),
        active: true,
      });

      const msg = 'Despesa enviada para reembolso!';
      if (Platform.OS === 'web') {
        alert(msg);
        router.back();
      } else {
        Alert.alert('Enviado!', msg, [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      const msg = 'Não foi possível enviar a despesa. Tente novamente.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Erro', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova Despesa',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Receipt photo ─────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>COMPROVANTE</Text>
        {receiptUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: receiptUri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable style={styles.retakeButton} onPress={pickFromCamera}>
              <Ionicons name="camera" size={14} color={C.teal} />
              <Text style={styles.retakeText}>Nova foto</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoArea}>
            <Pressable style={styles.cameraButton} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={32} color={C.teal} />
              <Text style={styles.cameraLabel}>Fotografar comprovante</Text>
            </Pressable>
            <Pressable style={styles.libraryButton} onPress={pickFromLibrary}>
              <Ionicons name="image-outline" size={18} color={C.textMuted} />
              <Text style={styles.libraryLabel}>Escolher da galeria</Text>
            </Pressable>
          </View>
        )}

        {/* ── Amount ───────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>VALOR (R$)</Text>
        <View style={styles.amountWrap}>
          <Text style={styles.currencySign}>R$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={C.textLight}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

        {/* ── Category ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CATEGORIA</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Ionicons
                  name={EXPENSE_CATEGORY_ICONS[cat] as any}
                  size={16}
                  color={active ? C.white : C.textMuted}
                />
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Notes (optional) ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>OBSERVAÇÕES (opcional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex: Almoço com Dr. Silva após visita"
          placeholderTextColor={C.textLight}
          multiline
          numberOfLines={3}
          returnKeyType="done"
          blurOnSubmit
        />

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={C.white} />
              <Text style={styles.submitLabel}>ENVIAR PARA REEMBOLSO</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  // Photo area
  photoArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
    backgroundColor: C.card,
  },
  cameraButton: {
    alignItems: 'center',
    gap: 8,
  },
  cameraLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.teal,
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  libraryLabel: {
    fontSize: 13,
    color: C.textMuted,
  },
  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  previewImage: {
    width: '100%',
    height: 220,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  retakeText: {
    fontSize: 13,
    color: C.teal,
    fontWeight: '600',
  },
  // Amount
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
  },
  currencySign: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textMuted,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    paddingVertical: 14,
  },
  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  categoryChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  categoryLabelActive: {
    color: C.white,
  },
  // Notes
  notesInput: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    fontSize: 14,
    color: C.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.teal,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
});
