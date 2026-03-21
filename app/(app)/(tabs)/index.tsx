import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/firebase/provider';
import {
  UserRole,
  ROLE_LABELS,
  ROLE_COLORS,
} from '@/types/roles';
import { C } from '@/theme';

// ---------------------------------------------------------------------------
// Hub button definitions per effective role
// ---------------------------------------------------------------------------
type HubButton = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  route: string;
};

const BUTTONS_BY_ROLE: Record<UserRole, HubButton[]> = {
  representante: [
    {
      icon: 'create-outline',
      label: 'ENVIAR VISITA',
      sub: 'Registrar nova interação',
      route: '/(app)/doctors',
    },
    {
      icon: 'people-outline',
      label: 'MÉDICOS',
      sub: 'Ver agenda e sinalizados',
      route: '/(app)/doctors',
    },
    {
      icon: 'time-outline',
      label: 'ATIVIDADE',
      sub: 'Histórico de visitas',
      route: '/(app)/(tabs)/schedule',
    },
  ],
  gerente: [
    {
      icon: 'people-outline',
      label: 'EQUIPE',
      sub: 'Ver desempenho dos reps',
      route: '/(app)/manager/team',
    },
    {
      icon: 'calendar-outline',
      label: 'AGENDA',
      sub: 'Agendas dos representantes',
      route: '/(app)/manager/schedules',
    },
    {
      icon: 'medkit-outline',
      label: 'MÉDICOS',
      sub: 'Buscar e filtrar médicos',
      route: '/(app)/doctors',
    },
  ],
  analista: [
    {
      icon: 'bar-chart-outline',
      label: 'RELATÓRIOS',
      sub: 'Dados e análises',
      route: '/(app)/(tabs)/schedule',
    },
    {
      icon: 'medkit-outline',
      label: 'MÉDICOS',
      sub: 'Buscar e filtrar médicos',
      route: '/(app)/doctors',
    },
    {
      icon: 'time-outline',
      label: 'ATIVIDADE',
      sub: 'Histórico geral de visitas',
      route: '/(app)/(tabs)/schedule',
    },
  ],
  admin: [
    {
      icon: 'people-outline',
      label: 'EQUIPE',
      sub: 'Ver desempenho dos reps',
      route: '/(app)/manager/team',
    },
    {
      icon: 'calendar-outline',
      label: 'AGENDA',
      sub: 'Agendas dos representantes',
      route: '/(app)/manager/schedules',
    },
    {
      icon: 'medkit-outline',
      label: 'MÉDICOS',
      sub: 'Todos os médicos e filtros',
      route: '/(app)/doctors',
    },
    {
      icon: 'stats-chart-outline',
      label: 'ATIVIDADE',
      sub: 'Histórico geral de visitas',
      route: '/(app)/(tabs)/schedule',
    },
  ],
};

// The four roles an admin can impersonate (including their own)
const ALL_ROLES: UserRole[] = ['admin', 'gerente', 'analista', 'representante'];

// ---------------------------------------------------------------------------
// Mode label per effective role
// ---------------------------------------------------------------------------
const MODE_LABELS: Record<UserRole, string> = {
  representante: 'REPRESENTANTE',
  gerente: 'MODO GERÊNCIA',
  analista: 'MODO ANALISTA',
  admin: 'ADMINISTRAÇÃO',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const router = useRouter();
  const {
    role,
    effectiveRole,
    roleLoading,
    isImpersonating,
    impersonate,
  } = useUser();

  if (roleLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color={C.tealLight} />
        </SafeAreaView>
      </View>
    );
  }

  const buttons = BUTTONS_BY_ROLE[effectiveRole];
  const accentColor = ROLE_COLORS[effectiveRole];
  const showModeBadge = effectiveRole !== 'representante';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            {showModeBadge ? (
              <View style={[styles.modeBadge, { backgroundColor: accentColor + '22' }]}>
                <Text style={[styles.modeBadgeText, { color: accentColor }]}>
                  {MODE_LABELS[effectiveRole]}
                </Text>
              </View>
            ) : null}
            <Text style={styles.logoText}>VISITA</Text>
            <Text style={styles.logoSub}>CRM Farmacêutico</Text>
          </View>

          {/* Hub buttons */}
          <View style={styles.buttonArea}>
            {buttons.map(({ icon, label, sub, route }) => (
              <Pressable
                key={label}
                style={({ pressed }) => [
                  styles.hubButton,
                  pressed ? styles.hubButtonPressed : null,
                ]}
                onPress={() => router.push(route as any)}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: accentColor + '18' },
                  ]}
                >
                  <Ionicons name={icon} size={26} color={accentColor} />
                </View>
                <View style={styles.hubTextWrap}>
                  <Text style={styles.hubLabel}>{label}</Text>
                  <Text style={styles.hubSub}>{sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textLight} />
              </Pressable>
            ))}
          </View>

          {/* Impersonation bar (admin only) */}
          {role === 'admin' ? (
            <View style={styles.impersonateArea}>
              <Text style={styles.impersonateLabel}>Visualizar como:</Text>
              <View style={styles.impersonateRow}>
                {ALL_ROLES.map((r) => {
                  const active = effectiveRole === r;
                  const color = ROLE_COLORS[r];
                  return (
                    <Pressable
                      key={r}
                      style={[
                        styles.roleChip,
                        {
                          backgroundColor: active ? color : 'transparent',
                          borderColor: color,
                        },
                      ]}
                      onPress={() => impersonate(r === role ? null : r)}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          { color: active ? '#fff' : color },
                        ]}
                      >
                        {ROLE_LABELS[r]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {isImpersonating ? (
                <Pressable
                  onPress={() => impersonate(null)}
                  style={styles.stopImpersonate}
                >
                  <Ionicons name="close-circle" size={14} color={C.red} />
                  <Text style={styles.stopImpersonateText}>
                    Parar simulação
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.tealDark,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  modeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 8,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  buttonArea: {
    gap: 12,
  },
  hubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  hubButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  hubTextWrap: {
    flex: 1,
  },
  hubLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.5,
  },
  hubSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  // Impersonation
  impersonateArea: {
    marginTop: 32,
    alignItems: 'center',
  },
  impersonateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  impersonateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
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
    letterSpacing: 0.5,
  },
  stopImpersonate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  stopImpersonateText: {
    fontSize: 11,
    color: C.red,
    fontWeight: '600',
  },
});
