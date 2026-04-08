import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getActiveRepsQuery } from '@/services/reps.service';
import { getAllRolesQuery, setUserRole } from '@/services/roles.service';
import { C, S } from '@/theme';
import {
  UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
} from '@/types/roles';
import type { Representante } from '@/types/representante';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RoleDoc {
  id: string; // userId
  role?: UserRole;
}

const ALL_ROLES: UserRole[] = ['representante', 'gerente', 'analista', 'admin'];

// Super-admin emails (mirrors provider.tsx — these always resolve to admin)
const SUPER_ADMIN_EMAILS = [
  'caio@entouragelab.com',
  'mario@entouragelab.com',
  'marcos.freitas@entouragelab.com',
  'tiago.fonseca@entouragelab.com',
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function UserManagementScreen() {
  const db = useFirestore();
  const { role: myRole } = useUser();

  const repsQuery = useMemoFirebase(
    () => (db ? getActiveRepsQuery(db) : null),
    [db]
  );
  const rolesQuery = useMemoFirebase(
    () => (db && myRole === 'admin' ? getAllRolesQuery(db) : null),
    [db, myRole]
  );

  const { data: reps, isLoading: repsLoading } =
    useCollection<Representante>(repsQuery);
  const { data: roleDocs, isLoading: rolesLoading } =
    useCollection<RoleDoc>(rolesQuery);

  const isLoading = repsLoading || rolesLoading;

  // Build a map: userId → role from Firestore
  const roleMap = useMemo(() => {
    const map = new Map<string, UserRole>();
    (roleDocs ?? []).forEach((d) => {
      if (d.role) map.set(d.id, d.role);
    });
    return map;
  }, [roleDocs]);

  // Merge reps with their roles
  const users = useMemo(() => {
    if (!reps) return [];
    return reps.map((rep) => {
      const uid = rep.userId || rep.id;
      const isSuperAdmin = rep.email
        ? SUPER_ADMIN_EMAILS.includes(rep.email)
        : false;
      const currentRole: UserRole = isSuperAdmin
        ? 'admin'
        : roleMap.get(uid) ?? 'representante';
      return {
        ...rep,
        uid,
        currentRole,
        isSuperAdmin,
      };
    });
  }, [reps, roleMap]);

  // State for the role-edit picker
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChangeRole = useCallback(
    async (uid: string, newRole: UserRole) => {
      if (!db) return;
      setSaving(true);
      try {
        await setUserRole(db, uid, newRole);
        setEditingUid(null);
        const msg = 'Perfil atualizado com sucesso.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Pronto', msg);
      } catch (err) {
        console.error('Error setting role:', err);
        const errMsg = 'Nao foi possivel atualizar o perfil.';
        Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Erro', errMsg);
      } finally {
        setSaving(false);
      }
    },
    [db]
  );

  if (myRole !== 'admin') {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={C.textLight} />
        <Text style={styles.emptyText}>Acesso restrito a administradores</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gerenciar Usuarios',
          headerStyle: { backgroundColor: C.tealDark },
          headerTitleStyle: { color: C.white, fontWeight: '700' },
          headerTintColor: C.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Ionicons name="people" size={20} color={C.teal} />
          <Text style={styles.headerText}>
            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
          </Text>
        </View>

        {users.map((u) => {
          const isEditing = editingUid === u.uid;
          const color = ROLE_COLORS[u.currentRole];
          return (
            <View key={u.uid} style={styles.userCard}>
              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
                <Text style={[styles.avatarText, { color }]}>
                  {u.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                {u.email ? (
                  <Text style={styles.userEmail}>{u.email}</Text>
                ) : null}
                {u.estado ? (
                  <Text style={styles.userState}>{u.estado}</Text>
                ) : null}

                {/* Current role badge */}
                <View style={styles.roleBadgeRow}>
                  <View
                    style={[styles.roleBadge, { backgroundColor: color + '22' }]}
                  >
                    <Text style={[styles.roleBadgeText, { color }]}>
                      {ROLE_LABELS[u.currentRole]}
                    </Text>
                  </View>
                  {u.isSuperAdmin ? (
                    <View style={styles.superBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={C.red} />
                      <Text style={styles.superBadgeText}>Super</Text>
                    </View>
                  ) : null}
                </View>

                {/* Role picker (expanded) */}
                {isEditing ? (
                  <View style={styles.rolePicker}>
                    {ALL_ROLES.map((r) => {
                      const active = u.currentRole === r;
                      const rColor = ROLE_COLORS[r];
                      return (
                        <Pressable
                          key={r}
                          style={[
                            styles.roleChip,
                            {
                              backgroundColor: active ? rColor : 'transparent',
                              borderColor: rColor,
                            },
                          ]}
                          onPress={() => {
                            if (!active && !saving) {
                              handleChangeRole(u.uid, r);
                            }
                          }}
                          disabled={saving}
                        >
                          {saving && !active ? null : (
                            <Text
                              style={[
                                styles.roleChipText,
                                { color: active ? '#fff' : rColor },
                              ]}
                            >
                              {ROLE_LABELS[r]}
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}
                    <Pressable
                      style={styles.cancelEditBtn}
                      onPress={() => setEditingUid(null)}
                    >
                      <Ionicons name="close" size={16} color={C.textMuted} />
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {/* Edit button */}
              {!u.isSuperAdmin && !isEditing ? (
                <Pressable
                  style={styles.editBtn}
                  onPress={() => setEditingUid(u.uid)}
                >
                  <Ionicons name="create-outline" size={18} color={C.teal} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </>
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
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: C.textLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ── User card ──────────────────────────────────────────────
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    ...S.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  userEmail: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 1,
  },
  userState: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 1,
  },
  // ── Role badge ─────────────────────────────────────────────
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  superBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: C.redLight,
  },
  superBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.red,
  },
  // ── Role picker ────────────────────────────────────────────
  rolePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Edit button ────────────────────────────────────────────
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
