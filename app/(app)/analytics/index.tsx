import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/use-collection';
import { getAllInteractionsQuery } from '@/services/interactions.service';
import { getActiveDoctorsQuery } from '@/services/doctors.service';
import { getActiveRepsQuery } from '@/services/reps.service';
import { RESULT_LABELS, PROPENSITY_LABELS } from '@/lib/constants';
import { C, S, RESULT_COLORS } from '@/theme';
import type { Interaction } from '@/types/interaction';
import type { Doctor } from '@/types/doctor';
import type { Representante } from '@/types/representante';

// ---------------------------------------------------------------------------
// Analytics Dashboard — analista / back-office view
// Aggregates interactions, doctors, and reps client-side.
// Acceptable at current scale (<20 reps, <500 interactions).
// ---------------------------------------------------------------------------

interface RepStats {
  repId: string;
  repName: string;
  totalVisits: number;
  prescribing: number; // doctors at resultCode=5
  conversionRate: number;
}

interface PipelineBucket {
  code: number;
  label: string;
  count: number;
  color: { bg: string; text: string };
}

export default function AnalyticsScreen() {
  const db = useFirestore();

  const interactionsQuery = useMemoFirebase(
    () => (db ? getAllInteractionsQuery(db) : null),
    [db]
  );
  const doctorsQuery = useMemoFirebase(
    () => (db ? getActiveDoctorsQuery(db) : null),
    [db]
  );
  const repsQuery = useMemoFirebase(
    () => (db ? getActiveRepsQuery(db) : null),
    [db]
  );

  const { data: interactions, isLoading: intLoading } =
    useCollection<Interaction>(interactionsQuery);
  const { data: doctors, isLoading: docLoading } =
    useCollection<Doctor>(doctorsQuery);
  const { data: reps, isLoading: repLoading } =
    useCollection<Representante>(repsQuery);

  const isLoading = intLoading || docLoading || repLoading;

  // ── Aggregation ─────────────────────────────────────────────────────
  const { repStats, pipeline, toplineStats } = useMemo(() => {
    if (!interactions || !doctors || !reps)
      return { repStats: [], pipeline: [], toplineStats: null };

    // Build a lookup: repId → repName
    const repNameMap = new Map<string, string>();
    reps.forEach((r) => repNameMap.set(r.userId || r.id, r.name));

    // Per-rep visit counts
    const repVisitCounts = new Map<string, number>();
    interactions.forEach((i) => {
      repVisitCounts.set(i.repId, (repVisitCounts.get(i.repId) ?? 0) + 1);
    });

    // Per-rep: how many doctors reached resultCode=5 (prescribing)
    // We use the doctor's lastInteractionResult as the "current" pipeline stage
    const repPrescribingMap = new Map<string, Set<string>>();
    doctors.forEach((d) => {
      if (d.assignedRepId && d.lastInteractionResult === 5) {
        if (!repPrescribingMap.has(d.assignedRepId))
          repPrescribingMap.set(d.assignedRepId, new Set());
        repPrescribingMap.get(d.assignedRepId)!.add(d.id);
      }
    });

    const repStatsList: RepStats[] = [];
    // Include every rep that has at least one visit OR exists in the rep list
    const allRepIds = new Set([
      ...repVisitCounts.keys(),
      ...reps.map((r) => r.userId || r.id),
    ]);
    allRepIds.forEach((repId) => {
      const totalVisits = repVisitCounts.get(repId) ?? 0;
      const prescribing = repPrescribingMap.get(repId)?.size ?? 0;
      repStatsList.push({
        repId,
        repName: repNameMap.get(repId) ?? repId.slice(0, 8),
        totalVisits,
        prescribing,
        conversionRate: totalVisits > 0 ? prescribing / totalVisits : 0,
      });
    });
    // Sort by total visits descending
    repStatsList.sort((a, b) => b.totalVisits - a.totalVisits);

    // Pipeline distribution (based on doctors' lastInteractionResult)
    const pipelineCounts = new Map<number, number>();
    let noResult = 0;
    doctors.forEach((d) => {
      const code = d.lastInteractionResult;
      if (code && code >= 1 && code <= 5) {
        pipelineCounts.set(code, (pipelineCounts.get(code) ?? 0) + 1);
      } else {
        noResult++;
      }
    });

    const pipelineList: PipelineBucket[] = [1, 2, 3, 4, 5].map((code) => ({
      code,
      label: RESULT_LABELS[code] ?? `Código ${code}`,
      count: pipelineCounts.get(code) ?? 0,
      color: RESULT_COLORS[code] ?? { bg: '#f3f4f6', text: '#374151' },
    }));

    const topline = {
      totalDoctors: doctors.length,
      totalInteractions: interactions.length,
      totalReps: reps.length,
      prescribing: pipelineCounts.get(5) ?? 0,
      noResult,
    };

    return { repStats: repStatsList, pipeline: pipelineList, toplineStats: topline };
  }, [interactions, doctors, reps]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  if (!toplineStats) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sem dados disponíveis</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Top-line KPIs ──────────────────────────────────────────── */}
      <View style={styles.kpiRow}>
        <KpiCard
          icon="people-outline"
          label="Médicos"
          value={toplineStats.totalDoctors}
          color={C.teal}
        />
        <KpiCard
          icon="create-outline"
          label="Interações"
          value={toplineStats.totalInteractions}
          color="#3b82f6"
        />
        <KpiCard
          icon="checkmark-circle-outline"
          label="Prescrevendo"
          value={toplineStats.prescribing}
          color="#22c55e"
        />
      </View>

      {/* ── Pipeline Distribution ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pipeline de Médicos</Text>
        <View style={styles.pipelineCard}>
          {pipeline.map((bucket) => {
            const pct =
              toplineStats.totalDoctors > 0
                ? ((bucket.count / toplineStats.totalDoctors) * 100).toFixed(0)
                : '0';
            return (
              <View key={bucket.code} style={styles.pipelineRow}>
                <View style={[styles.pipelineDot, { backgroundColor: bucket.color.text }]} />
                <Text style={styles.pipelineLabel}>{bucket.label}</Text>
                <View style={styles.pipelineBarWrap}>
                  <View
                    style={[
                      styles.pipelineBar,
                      {
                        backgroundColor: bucket.color.bg,
                        width: `${Math.max(Number(pct), 2)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.pipelineCount}>{bucket.count}</Text>
                <Text style={styles.pipelinePct}>{pct}%</Text>
              </View>
            );
          })}
          {toplineStats.noResult > 0 ? (
            <View style={styles.pipelineRow}>
              <View style={[styles.pipelineDot, { backgroundColor: '#d1d5db' }]} />
              <Text style={[styles.pipelineLabel, { color: C.textLight }]}>
                Sem resultado
              </Text>
              <View style={styles.pipelineBarWrap}>
                <View
                  style={[
                    styles.pipelineBar,
                    {
                      backgroundColor: '#f3f4f6',
                      width: `${Math.max(
                        (toplineStats.noResult / toplineStats.totalDoctors) * 100,
                        2
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.pipelineCount}>{toplineStats.noResult}</Text>
              <Text style={styles.pipelinePct}>
                {((toplineStats.noResult / toplineStats.totalDoctors) * 100).toFixed(0)}%
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Per-rep Stats ──────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visitas por Representante</Text>
        {repStats.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum representante encontrado</Text>
        ) : (
          repStats.map((rep) => (
            <View key={rep.repId} style={styles.repRow}>
              <View style={styles.repInfo}>
                <Text style={styles.repName}>{rep.repName}</Text>
                <Text style={styles.repSub}>
                  {rep.prescribing} prescrevendo
                </Text>
              </View>
              <View style={styles.repNumbers}>
                <Text style={styles.repVisits}>{rep.totalVisits}</Text>
                <Text style={styles.repVisitsLabel}>visitas</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// KPI Card component
// ---------------------------------------------------------------------------
function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
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
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: C.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  // ── KPI Row ────────────────────────────────────────────────────────
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    ...S.card,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    marginTop: 6,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ── Section ────────────────────────────────────────────────────────
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  // ── Pipeline ───────────────────────────────────────────────────────
  pipelineCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    ...S.card,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pipelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pipelineLabel: {
    width: 110,
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
  },
  pipelineBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  pipelineBar: {
    height: 8,
    borderRadius: 4,
  },
  pipelineCount: {
    width: 30,
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    textAlign: 'right',
  },
  pipelinePct: {
    width: 36,
    fontSize: 12,
    color: C.textMuted,
    textAlign: 'right',
  },
  // ── Rep Stats ──────────────────────────────────────────────────────
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    ...S.card,
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
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  repNumbers: {
    alignItems: 'flex-end',
  },
  repVisits: {
    fontSize: 22,
    fontWeight: '800',
    color: C.teal,
  },
  repVisitsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
  },
});
