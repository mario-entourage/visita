import React from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getExpensesByRepQuery } from '@/services/expenses.service';
import { useMemoFirebase } from '@/firebase/provider';
import {
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
} from '@/types/expense';
import { C } from '@/theme';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatBRL(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(expense: Expense): string {
  const ts = expense.date;
  if (!ts) return '';
  const d = ts.toDate();
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExpenseListScreen() {
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const expensesQuery = useMemoFirebase(
    () => (db && user ? getExpensesByRepQuery(db, user.uid) : null),
    [db, user]
  );
  const { data: expenses, isLoading } = useCollection<Expense>(expensesQuery);

  const totalSubmitted = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Despesas',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/(app)/expense/new' as any)}
              style={{ marginRight: 4, padding: 8 }}
            >
              <Ionicons name="add" size={24} color={C.white} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Summary banner */}
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryLabel}>Total enviado para reembolso</Text>
          <Text style={styles.summaryAmount}>{formatBRL(totalSubmitted)}</Text>
          <Text style={styles.summaryCount}>
            {expenses?.length ?? 0}{' '}
            {(expenses?.length ?? 0) === 1 ? 'despesa' : 'despesas'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.teal} />
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <ExpenseRow expense={item} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="receipt-outline" size={48} color={C.border} />
                <Text style={styles.emptyTitle}>Sem despesas enviadas</Text>
                <Text style={styles.emptySubtitle}>
                  Toque em + para adicionar um comprovante
                </Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(app)/expense/new' as any)}
        >
          <Ionicons name="add" size={26} color={C.white} />
        </Pressable>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function ExpenseRow({ expense }: { expense: Expense }) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <View style={styles.row}>
      {/* Thumbnail */}
      <View style={styles.thumbnailWrap}>
        {!imageError ? (
          <Image
            source={{ uri: expense.receiptUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Ionicons name="receipt-outline" size={20} color={C.textLight} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <View style={styles.categoryPill}>
            <Ionicons
              name={EXPENSE_CATEGORY_ICONS[expense.category] as any}
              size={12}
              color={C.teal}
            />
            <Text style={styles.categoryText}>
              {EXPENSE_CATEGORY_LABELS[expense.category]}
            </Text>
          </View>
          <Text style={styles.rowAmount}>{formatBRL(expense.amount)}</Text>
        </View>
        <Text style={styles.rowDate}>{formatDate(expense)}</Text>
        {expense.notes ? (
          <Text style={styles.rowNotes} numberOfLines={1}>
            {expense.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  summaryBanner: {
    backgroundColor: C.tealDark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: C.white,
  },
  summaryCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  thumbnailWrap: {
    width: 80,
    height: 80,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  thumbnailFallback: {
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.teal + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.teal,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  rowDate: {
    fontSize: 12,
    color: C.textMuted,
  },
  rowNotes: {
    fontSize: 12,
    color: C.textLight,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: C.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
