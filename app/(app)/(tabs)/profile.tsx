import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth, useUser } from '@/firebase/provider';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/roles';
import { C } from '@/theme';

export default function ProfileScreen() {
  const auth = useAuth();
  const { user, role, effectiveRole, isImpersonating } = useUser();

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      auth.signOut();
      return;
    }
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => auth.signOut(),
      },
    ]);
  };

  const roleColor = ROLE_COLORS[role];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>
            {user?.displayName?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.displayName || 'Usuário'}
        </Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {ROLE_LABELS[role]}
          </Text>
        </View>
        {isImpersonating ? (
          <Text style={styles.impersonateNote}>
            Simulando: {ROLE_LABELS[effectiveRole]}
          </Text>
        ) : null}
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: C.white,
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
  },
  email: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  impersonateNote: {
    marginTop: 6,
    fontSize: 11,
    color: C.amber,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 24,
    backgroundColor: C.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    color: C.red,
    fontSize: 16,
    fontWeight: '500',
  },
});
