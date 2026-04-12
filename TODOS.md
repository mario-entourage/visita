# TODOS

## P2 — Log lag metric per rep (analista dashboard)

**What:** Add a per-rep "avg log lag" column to the analista dashboard — the mean
number of days between `visitDate` and `createdAt` for each rep's recent interactions.

**Why:** A rep who consistently logs same-day has a lag near 0. A rep logging 5 days
later is a signal for the Gerente — either they're in the field without connectivity
(expected) or they're reconstructing visits from memory (coaching opportunity).

**Context:** The `visitDate` field is being added in the visit-backdate feature
(2026-04-08). Once that ships, the `effectiveDate()` helper in `src/lib/utils.ts`
and the `hasLag()` function are already in place. The analista dashboard
(`app/(app)/analytics/index.tsx`) already aggregates per-rep visit counts — the lag
metric is an additive column using the same data.

**Where to start:** `app/(app)/analytics/index.tsx` → `repStats` useMemo block.
For each rep, compute `avgLag = mean(interactions.filter(hasLag).map(i => i.createdAt.toMillis() - i.visitDate.toMillis())) / 86400000`.
Display as "X.X dias" next to the visit count. Only show if at least 1 backdated
interaction exists for that rep.

**Effort:** S (human: ~2h / CC: ~10min)
**Priority:** P2
**Depends on:** visit-backdate feature shipped

## P3 — Compliance review: unlimited backdating if data feeds regulatory reports

**What:** If visitDate data is ever used in field activity compliance reports (common in
pharma for HCP engagement tracking, Sunshine Act, or internal audit), evaluate whether
unlimited backdating + lag visibility is sufficient, or if an approval workflow and
max-backdate cap are required.

**Why:** Pharma CRMs often touch regulated reporting. Unlimited backdating with only a
visual lag indicator may not satisfy audit requirements for tamper-evident records.

**Context:** The unlimited backdating design was deliberate (CEO review, 2026-04-08):
hard limits create perverse incentives where reps skip logging old visits entirely.
The `createdAt` server timestamp is immutable and visible — it IS the audit trail.
The lag indicator shows managers exactly how stale a logged visit is. Re-evaluate only
if this data is pulled into compliance reports.

**Where to start:** Identify whether `interactions` collection data feeds any external
reporting tool. If yes, evaluate: does the external system see `visitDate` or `createdAt`?
If `visitDate`, an approval workflow would be needed. If `createdAt`, no change needed.

**Effort:** Investigation: S (human: ~2h / CC: ~30min). Implementation if needed: M/L
**Priority:** P3 (no action until compliance reporting is confirmed)
**Depends on:** Understanding of downstream data consumers

