import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getActiveRepsQuery } from '@/services/reps.service';
import { C, S } from '@/theme';
import type { Representante } from '@/types/representante';

// Assign a color to each rep based on index
const REP_COLORS = ['#ef4444', '#f97316', '#22c55e', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

export default function TeamScreen() {
  const db = useFirestore();
  const router = useRouter();

  const repsQuery = useMemoFirebase(
    () => (db ? getActiveRepsQuery(db) : null),
    [db]
  );

  const { data: reps, isLoading } = useCollection<Representante>(repsQuery);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Equipe',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.teal} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            <Text style={styles.sectionTitle}>Representantes</Text>
            {reps && reps.length > 0 ? (
              reps.map((rep, i) => (
                <Pressable
                  key={rep.id}
                  style={styles.repCard}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/manager/rep-detail',
                      params: { repId: rep.id, repName: rep.name },
                    })
                  }
                >
                  <View
                    style={[
                      styles.repBadge,
                      { backgroundColor: REP_COLORS[i % REP_COLORS.length] },
                    ]}
                  >
                    <Text style={styles.repInitial}>
                      {rep.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.repInfo}>
                    <Text style={styles.repName}>{rep.name}</Text>
                    {rep.estado ? (
                      <Text style={styles.repSub}>{rep.estado}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textLight} />
                </Pressable>
              ))
            ) : (
              <Text style={styles.empty}>Nenhum representante cadastrado</Text>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 12,
    padding: 14,
    ...S.card,
  },
  repBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  repInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  repSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  empty: {
    fontSize: 13,
    color: C.textLight,
    paddingHorizontal: 16,
  },
});
