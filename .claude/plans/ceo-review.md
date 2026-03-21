# Perguntas de Pesquisa — Representantes e Gerente de Vendas

## Context (internal — do not share with interviewees)

VISITA has been built as scaffolding. Everything below covers **the visit report form** (the core of the app) **and** workflow, information needs, and daily operations.

**Priority logic:** P1 = the feature DOES NOT EXIST in the app — there is no way to click to it. P2 = the feature EXISTS but may be wrong or suboptimal. P1s block implementation. P2s refine what's already built.

**Language:** All "Perguntar" sections are in Brazilian Portuguese, ready to read aloud. Internal notes stay in English.

## Decisions already made (by admin/product owner)

These questions have been answered by the product owner. They are NOT open for interview — the decision is final. They are listed here so the interviewer knows the context and doesn't re-ask.

| # | Topic | Decision | Impact |
|---|-------|----------|--------|
| P1-1 (rep) | Schedule / visit creation | Build Google Calendar sync (2-way, current week + next week). Rep can also add visits manually. After sync, system auto-matches doctor names; unmatched events get `[ ] Is doctor? [ ] Keep` confirmation. | New feature: Calendar API integration, sync UI, doctor matching |
| P1-2 (rep) | Edit interactions | Reps can edit their own visit reports until Friday close of business that week. After Friday, locked permanently. | New feature: edit UI with weekly deadline. `editableUntil` field on interactions. |
| P1-3 (rep) | Data visibility | Wall between reps. Reps CANNOT see each other's schedules or reports. Managers/admins see everything. | Firestore security rules change. Filter interactions and scheduled_visits by `repId` for rep role. |
| P1-4 (rep) | Doctors not in system | Reps CAN add doctors — both manually (quick-add form) and from Calendar sync (when a synced event has an unrecognized doctor). | New feature: quick-add doctor flow. `source: 'field_entry'` flag on doctor record. |
| old P1-5 (rep) | Post-submission flow | Demoted to P2. Not a priority. Current toast + back-to-list is acceptable for now. | No change. |
| P1-1 (mgr) | Create/assign visits + goals | Manager can: (1) From doctor profile, if doctor has assigned rep → "Agendar Reunião" button → goes to rep's calendar → pick date/time. (2) If no rep assigned → dropdown of reps with doctors in that state → select → calendar → pick date/time. (3) Assign rep dropdown on doctor profile. (4) Set weekly goals from rep calendar view — defaults to prior week's goal, or prior week's actual total if no goal was set. | Partially built: schedule-meeting.tsx exists, AssignRepDropdown exists, WeeklyGoalEditor exists. Need to wire the flows together. |
| P1-2 (mgr) | Daily activity view | Build daily activity summary on manager home: rep list with today's count, sorted least-active first. | New feature: activity summary component on manager home hub. |
| P1-4 (mgr) | Territory + doctor assignment | Territory management screen: manager picks a default rep per state. On assignment, prompt with 3 options: (a) reassign ALL doctors in state, (b) reassign only unassigned doctors, (c) don't reassign existing. Auto-assign on new doctor creation if state has a default rep. | New feature: `settings/territories` doc, territory screen, bulk reassign, auto-assign hook in `createDoctor()`. |
| old P1-5 (mgr) | What's broken today | Demoted to P2. Will surface naturally during beta testing. | No change. |
| old P1-3 (mgr) | Define "on track" metrics | Demoted to P2. Weekly goals + rep detail stats already exist. Refinement can wait. | No change. |
| P1-C1 | Doctor database quality | Add "Reportar Médico" button on visit screen. Rep enters free text note. Visit stays in rep's history. Doctor is flagged (`reported: true`) and removed from reappearing in rep lists. Back office handles details. | New feature: `reported`, `reportedAt`, `reportNote`, `reportedByRepId` fields on doctor. Filter in queries. |
| P1-C2 | Dealbreaker / stop using app | Demoted to P2. Complaints will come during beta testing. | No change. |

---

## Perguntas para os Representantes

### P1-6. O formulário de visita — o que registrar depois de ver um médico

This is the most important question in the entire interview. The visit report form is the core of the app — everything else (calendars, dashboards, territories) exists to support and analyze what gets entered here. We built the form with assumed fields. We need to validate every field with the people who will fill it out 10+ times a day.

**What the form currently collects:**
1. **Tipo de Interação** — chips: Visita de Campo, Evento Clínico, Congresso, Digital
2. **Resultado** — 1-5 scale: Não, Provavelmente Não, Aberto, Vai Prescrever, Prescrevendo
3. **Amostras entregues** — toggle (yes/no)
4. **Falou pessoalmente** — toggle (yes/no)
5. **Follow-up agendado** — toggle (yes/no)
6. **Anotações** — free text
7. **GPS location** — captured automatically on submit (silent)

**Perguntar (parte 1 — campos atuais):** "Vou te mostrar o formulário que a gente montou pra registrar uma visita. Depois de conversar com um médico, você preencheria isso. Me diz pra cada campo: faz sentido, é desnecessário, ou tá faltando algo?"

*Walk through each field:*

- "**Tipo de interação** — Visita de Campo, Evento Clínico, Congresso, Digital. Esses quatro cobrem tudo? Falta algum tipo? Tem algum que nunca acontece?"
- "**Resultado** — de 1 a 5: Não, Provavelmente Não, Aberto, Vai Prescrever, Prescrevendo. Esses cinco níveis fazem sentido pra você? Você consegue escolher um número rápido depois de cada conversa, ou fica na dúvida entre dois? Teria algum resultado que você descreveria diferente?"
- "**Amostras entregues** — sim ou não. Isso basta, ou você precisa registrar QUAIS amostras e QUANTAS?"
- "**Falou pessoalmente** — sim ou não. Quando isso seria 'não'? Faz sentido ter esse campo?"
- "**Follow-up agendado** — sim ou não. Se sim, o app deveria perguntar a data do follow-up?"
- "**Anotações** — texto livre. Você usaria? Todo dia ou só quando algo especial acontece?"

**Perguntar (parte 2 — o que falta):** "Agora, pensa na sua última visita real. Você saiu do consultório, puxou o celular, e vai registrar. O que mais você precisaria anotar que não tá nesse formulário? Por exemplo: produto discutido? Duração da conversa? Quem mais estava presente? Próximo passo? Alguma coisa que seu gerente sempre pergunta e que seria bom já ter registrado?"

**Why it matters:** Every unnecessary field costs 2-3 seconds per visit × 10 visits/day × 250 days/year = hours of wasted rep time. Every missing field means the data is incomplete and the manager/analyst can't answer their questions. This form must be exactly right — not too much, not too little.

**Decision tree:**

- "Os campos estão certos" → Current form is validated. No changes. Ship it.
- "Resultado precisa de mais/menos níveis" → Change the scale. This changes the `resultCode` field, `RESULT_LABELS`, color mapping, and all dashboards that display results. **Schema change.**
- "Preciso registrar QUAIS amostras" → Change from boolean to array/multi-select. Need a samples list (maybe configurable by admin). **Schema change.**
- "Falta campo de produto" → Add `product` field. Need a product list. **Schema change + new reference data.**
- "Falta duração" → Add `durationMinutes` field. Simple number input.
- "Falou pessoalmente não faz sentido" → Remove the toggle. Simplifies the form.
- "Follow-up precisa de data" → When toggle is ON, show date picker. Links to scheduling system.
- "Nunca vou escrever anotações" → Make notes less prominent or collapse by default.
- "Preciso de X que não imaginamos" → Add it. This is why we're asking.

**For the manager too:** After the rep interview, ask the manager: "Dos dados que o representante registra, o que você REALMENTE olha? O que você ignora? O que está faltando pra você tomar decisões melhores?"

---

### P2-1. Google Calendar sync: como funciona a sua agenda hoje

We're building a Google Calendar sync. But we need to understand how reps currently use their calendar so the sync works with their actual workflow — not against it.

**Perguntar:** "Você usa o Google Agenda da Entourage pra marcar suas visitas a médicos? Cada visita é um evento separado no calendário, ou você organiza de outro jeito? O nome do médico aparece no título do evento? Você também marca outras coisas no calendário — reuniões internas, almoço, deslocamento — ou só visitas?"

**Why it matters:** The sync needs to distinguish doctor visits from other calendar events. If reps don't put doctor names in event titles, the auto-matching won't work and we'll need a different approach (e.g., match by location, or always ask).

**Expected answer:** They probably use Google Calendar but inconsistently. Some put doctor names in titles, some put hospital names, some just put "visita."

**Decision tree:**
- "Cada visita é um evento com o nome do médico" → Auto-matching against doctors collection will work well. Fuzzy name match on event title.
- "Coloco o nome do hospital, não do médico" → Need to match by location/hospital, not doctor name. Or always show confirmation UI.
- "Não uso o calendário pra visitas" → Calendar sync is less useful. Manual visit creation becomes the primary flow. Still build sync but expect low adoption.
- "Misturo visitas com reuniões internas" → The `[ ] Is doctor? [ ] Keep` confirmation flow is essential. Can't auto-import everything.

---

### P2-2. Edição de visitas: que tipo de erro acontece

We're building edit capability (editable until Friday COB). But we need to know what kinds of mistakes happen so we build the right edit flow.

**Perguntar:** "Quando você erra no registro de uma visita, que tipo de erro é? Selecionar o médico errado? Marcar o resultado errado? Esquecer de anotar algo? Você percebe na hora ou só depois? Faria diferença poder corrigir até sexta-feira à noite?"

**Why it matters:** If the most common error is "wrong doctor," the edit flow needs to allow changing the doctor (which means moving the interaction record). If it's "wrong result code," a simpler inline edit works.

**Expected answer:** Mostly wrong result code tapped in a hurry. Noticed within a few hours.

**Decision tree:**
- "Resultado errado" → Simple inline edit: tap the interaction, change the result code. Straightforward.
- "Médico errado" → More complex: need to move the interaction to a different doctor, update both doctors' stats (decrement old, increment new).
- "Esqueci de anotar algo" → Just need to edit the notes field. Simplest case.
- "Percebo só dias depois" → Weekly edit window (until Friday) is the right call. Confirms the decision.

---

### P2-3. Médicos que não estão no sistema: quando e como

We're building quick-add doctor. But we need to know the frequency and context to design the right flow.

**Perguntar:** "Com que frequência você encontra um médico que não está no sistema? Acontece mais em congressos, em hospitais novos, ou em visitas do dia a dia? Quando isso acontece, que informação você teria na mão pra cadastrar — só o nome, ou também especialidade, CRM, telefone?"

**Why it matters:** If it's rare (conferences only), a minimal form (name + specialty) is fine. If it's frequent (new hospitals), we need a more complete form and maybe bulk import.

**Expected answer:** Occasional, mostly at conferences or new territories. They'd have name and specialty, maybe CRM number.

**Decision tree:**
- "Raramente, em congressos" → Minimal form: nome, especialidade, local do evento. Mark as `source: 'field_entry'`, admin reviews later.
- "Frequente, hospitais novos" → Fuller form: nome, especialidade, CRM, hospital, telefone. Consider bulk add capability.
- "Só quando o calendário traz alguém novo" → Calendar sync confirmation flow handles this. "Médico não encontrado — cadastrar agora?"

---

### P2-4. Como você encontra o médico que vai visitar

The doctor search EXISTS — there's a name search with a full list. But it may not match how reps actually think about finding a doctor.

**Perguntar:** "Quando você chega no hospital, como você encontra o médico pra registrar a visita? Pelo nome? Pelo lugar? Pela sua agenda do dia? Você ia preferir ver só os médicos de hoje primeiro?"

**Expected answer:** Reps probably know who they're visiting before they arrive.

**Decision tree:**
- "Olho minha agenda" → Log screen defaults to today's synced visits, with "outro médico" as secondary. Changes `log.tsx` entry flow.
- "Busco pelo nome" → Current flow is correct. No change.
- "Pelo lugar / hospital" → Need location-based grouping. Requires `hospital` field on doctors. **Schema change.**
- "Já sei quem é, só preciso achar rápido" → Add recent-doctors shortlist at top.

---

### P2-5. O que você confere antes de entrar na conversa

The doctor detail screen EXISTS with propensity score, total touches, and interaction history. But we assumed those are the right fields.

**Perguntar:** "Antes de entrar no consultório, o que você quer saber? O último resultado? Que amostras você deixou? O que o médico disse? Alguma coisa de fora do sistema?"

**Note:** With the visibility wall (decision P1-3), reps will only see their OWN interaction history on doctor detail. They won't see other reps' visits. Frame the question accordingly.

**Expected answer:** Last visit date, last result, their own notes.

**Decision tree:**
- "Último resultado e minhas anotações" → Make notes more prominent on doctor detail. Surface last note at top.
- "Que amostras deixei" → Need to track sample types, not just boolean. **Changes interaction form schema.**
- "Histórico de prescrição / dados externos" → Out of scope for MVP.

---

### P2-6. O que acontece depois de registrar uma visita

The post-submission flow EXISTS (success toast + back to list). It works but could be better.

**Perguntar:** "Depois de registrar uma visita, o que você faz em seguida? Vai pro próximo médico da lista? Precisa registrar mais alguma coisa? Seria útil ter um botão 'próxima visita', ou prefere voltar pra lista?"

**Expected answer:** They probably move to the next doctor.

**Decision tree:**
- "Vou pro próximo" → After submission, show "próxima visita" card from today's synced calendar. One-tap navigation.
- "Volto pro carro" → Current flow is fine. Maybe add "progresso de hoje" counter.
- "Agenda um follow-up" → Add "agendar follow-up" as post-submission action.

---

### P2-7. Situação do celular em campo

The app EXISTS and loads on phones. But we assumed good connectivity and modern hardware.

**Perguntar:** "Que celular você usa? É da empresa ou pessoal? Como é o sinal nos hospitais que você visita — pega bem ou tem zona morta? Você registra as visitas na hora ou no final do dia de casa?"

**Expected answer:** Personal phones, spotty hospital signal, mix of real-time and end-of-day.

**Decision tree:**
- "Registro na hora, mas o sinal é ruim" → Firestore offline persistence should handle this. Verify.
- "Registro no final do dia de casa" → GPS is unreliable. Consider "registrado na hora" vs. "registrado depois" indicator.
- "Celular antigo / Android da empresa" → Test on low-spec Android. May need performance optimization.

---

### P2-8. O que você usa hoje no lugar desse app

The app EXISTS as an alternative. But we need to know the bar we're competing against.

**Perguntar:** "Como você registra suas visitas hoje? Mensagem no WhatsApp pro gerente? Planilha compartilhada? Caderno? Você reporta todo dia ou toda semana? Que informação seu gerente pede?"

**Expected answer:** WhatsApp messages and/or shared spreadsheet.

**Decision tree:**
- "WhatsApp pro gerente" → App must be faster than typing a WhatsApp message. Target: 3 toques + enviar < 10 segundos.
- "Planilha do Google" → App already wins here on mobile.
- "Nada — falo com o gerente pessoalmente" → Adoption risk is higher.

---

## Perguntas para o Gerente de Vendas

> **Nota para o entrevistador:** O gerente trabalhou como representante por muitos anos antes de se tornar gerente. Ele pode responder tanto pela perspectiva de gestão quanto pela perspectiva de quem fez visitas a médicos. Use isso — quando uma pergunta toca no trabalho do rep, peça explicitamente que ele responda pelos dois ângulos.

### ~~P1-1. Criar e atribuir visitas / definir metas~~ — DECIDED

**Decision:** Manager can create visits from doctor profile (routed through assigned rep's calendar), assign reps via dropdown, and set weekly goals from rep calendar view. See Decisions table above. **No interview needed.**

---

### ~~P1-2. Visão diária de atividade da equipe~~ — DECIDED (content TBD in interview)

**Decision:** Build daily activity summary on manager home hub. *What exactly to show* is still open — answered by question #2 below.

---

### P1-6 (mgr). O formulário de visita — o gerente recebe os dados certos?

Companion to the rep's P1-6. The rep fills out the form; the manager consumes the data. Both sides must agree on what's captured.

**Perguntar:** "Quando você revisa as visitas de um representante, que informação você REALMENTE olha? O resultado numérico? As anotações? Se entregou amostras? Tem alguma coisa que você sempre pergunta pro rep que poderia já estar no formulário? Por exemplo: qual produto foi discutido, quanto tempo durou a conversa, se o médico pediu mais informação, se tinha outro profissional presente?"

**Why it matters:** If the manager needs data that the form doesn't capture, they'll call the rep to ask — defeating the purpose of the app. If the form captures data the manager never looks at, it's wasted rep time.

**Decision tree:**
- "Olho resultado + anotações" → Current form may be sufficient. Validate with the rep's answers.
- "Preciso saber o produto" → Add product field (aligns with rep P1-6 if they also mention it).
- "Quero saber duração" → Add duration field.
- "Nunca olho amostras" → Consider removing or de-emphasizing the toggle.
- "Preciso de X pra montar meu relatório" → Whatever X is, it goes in the form.

---

### MGR-2. O painel da manhã — o que você quer ver nos primeiros 30 segundos (P2 — content of decided feature)

The daily activity summary was decided (P1-2). But WHAT it shows wasn't specified. This question fills that gap.

**Perguntar:** "Quando você abre o app de manhã pra ver como a equipe está, o que você precisa ver nos primeiros 30 segundos pra saber se está tudo bem? Número de visitas de ontem por rep? Quais médicos foram visitados? Resultados? Quem ainda não registrou nada hoje? Me descreve a tela perfeita pra essa situação."

**Expected answer:** Rep list with yesterday's count + alert for who's behind.

**Decision tree:**
- "Só o número de visitas" → Rep list + daily count. Simple.
- "Quero ver os resultados" → Add result breakdown (color-coded) per rep.
- "Quero saber quem não registrou nada" → Add "last seen" timestamp + alert for reps with 0 today.
- "Quero ver quais médicos" → Too granular for a morning summary. Suggest drilling into rep detail instead.

---

### MGR-3. Agenda do rep — só ver ou também mexer? (P2 — scope of decided feature)

The ability to create visits was decided (P1-1). But can the manager also EDIT or CANCEL existing visits? That distinction changes the architecture.

**Perguntar:** "Quando você abre a agenda de um representante no app, além de criar novas visitas, você precisaria mover ou cancelar visitas que já estão marcadas? Por exemplo, se um rep ficou doente na segunda, você precisaria redistribuir as visitas dele no app, ou isso você resolve pelo WhatsApp e deixa o rep atualizar?"

**Expected answer:** Manager probably just creates new ones; reps move/cancel their own.

**Decision tree:**
- "Só crio, o rep mexe nas dele" → Manager is write-only on new visits. Rep owns edits. Simpler security rules.
- "Às vezes preciso cancelar pra ele" → Manager can cancel any visit assigned to his reps. Additional Firestore rule.
- "Preciso redistribuir quando alguém está doente" → Full reassignment flow needed: pick visits, pick new rep, move. Complex. Flag as future feature.

---

### MGR-4. Antes da visita — o que o rep precisa saber (proxy do rep, P2)

The manager was a rep for years. His answer here stands in for the rep interview until we can reach the reps. The doctor detail screen EXISTS but was built with assumed fields.

**Perguntar:** "Pensa na época que você era representante, no estacionamento do hospital, prestes a entrar. Você abre o app pra se preparar. O que você precisava saber sobre esse médico? Último resultado? Suas próprias anotações da última visita? Que amostras você deixou? Alguma coisa que o médico pediu? Me descreve o que te daria confiança pra entrar na sala."

**Expected answer:** Last result + own notes from last visit. Maybe what samples were left.

**Decision tree:**
- "Último resultado e minhas anotações" → Make last note prominent on doctor detail. Current screen is close.
- "Que amostras deixei" → Need to track sample types, not just boolean. **Schema change.**
- "O que o médico pediu" → Follow-up notes field. Could live in the interaction notes or be a separate field.
- "Dados externos — CRM, histórico de prescrição" → Out of scope for MVP.

---

### MGR-5. Pergunta aberta — o que faria você usar o app todo dia (P2)

**Perguntar:** "Se esse app só pudesse fazer UMA coisa muito bem — uma coisa que te faria abrir ele toda manhã sem falta — o que seria? E: tem alguma coisa que, se não estiver no app, vai fazer você continuar usando o WhatsApp ou a planilha de qualquer jeito?"

**Why it matters:** Forces prioritization. Whatever he names first is what we protect above everything else.

---

### P2-3. Definir o que significa "no caminho certo"

The rep detail screen EXISTS with interaction count, samples, and follow-ups. Weekly goals have been built (WeeklyGoalEditor). This question refines which metrics matter most — it doesn't unblock a missing feature.

**Perguntar:** "Como você mede se um representante está indo bem? Número de visitas por semana? Qualidade dos resultados? Cobertura dos médicos prioritários? Distribuição de amostras? Tempo entre visitas pro mesmo médico? O que faz você dizer 'esse rep tá mandando bem' vs. 'esse rep precisa de coaching'?"

**Expected answer:** Combination of visit count and coverage.

**Decision tree:**
- "Número de visitas por semana" → Current interaction count works. Add weekly view + target line. **Target line does not exist.**
- "Cobertura dos médicos prioritários" → Need priority/target list per rep. **Feature does not exist.**
- "Tendência dos resultados" → Add trend chart. Minor UI.
- "Tempo entre visitas pro mesmo médico" → Add "dias desde última visita." Moderate UI.

---

### ~~P1-4. Território e atribuição de médicos~~ — DECIDED

**Decision:** Territory management screen where manager picks default rep per state. Bulk reassignment prompt with 3 options. Auto-assign on new doctor creation. See Decisions table above. **No interview needed.**

---

### ~~P1-5. O que está quebrado hoje~~ — DEMOTED TO P2

**Decision:** Will surface naturally during beta testing. Not a priority for pre-launch interviews.

---

### P2-6. O que fazer quando um rep está abaixo do esperado

The team list and rep detail EXIST. But there are no alerts, reassignment tools, or intervention features.

**Perguntar:** "Quando você vê que um rep não tá batendo as metas, o que você faz? Liga pra ele? Reatribui os médicos? Faz visita junto? Ajusta a agenda? Precisa documentar essas intervenções?"

**Expected answer:** Probably calls them first.

**Decision tree:**
- "Ligo pra ele" → App just needs clear problem surfacing.
- "Reatribuo os médicos/visitas" → Need reassignment flow. Depends on territory model (P1-4).
- "Preciso documentar" → Need manager notes on rep profiles. Minor addition.

---

### P2-7. Detalhes individuais ou padrões

The rep detail screen EXISTS with an interaction timeline. But it may be too granular or not aggregated enough.

**Perguntar:** "Quando você revisa o trabalho de um rep, você lê cada visita individual? Ou se interessa mais por resumos — quantas essa semana, resultado médio, quais médicos foram cobertos? Quando você vai nos detalhes?"

**Expected answer:** Mostly summaries, drilling in when something looks off.

**Decision tree:**
- "Mais resumos" → Redesign rep detail: summary stats at top, timeline collapsed.
- "Leio cada visita" → Current timeline is correct. Add more detail per entry.
- "Só quando algo parece errado" → Add anomaly highlights: flag visits with result 1-2.

---

### P2-8. Relatórios que você faz hoje

The manager dashboard EXISTS but there is no export capability.

**Perguntar:** "Você produz relatórios? Pra quem? Com que frequência? Em que formato — slides, planilha, verbal? Que números eles sempre pedem?"

**Expected answer:** Weekly verbal updates, occasional spreadsheet.

**Decision tree:**
- "Planilha semanal pro meu chefe" → Build CSV export. **Feature does not exist** (lower priority since dashboards exist).
- "Slides mensais pra diretoria" → Out of scope for MVP.
- "Só checo o app e falo verbalmente" → Dashboards are sufficient.

---

## Perguntas para ambos os grupos

### ~~P1-C1. A base de dados de médicos~~ — DECIDED

**Decision:** Add "Reportar Médico" button on visit screen with free text note. Doctor gets flagged and removed from rep lists. Back office handles cleanup. See Decisions table above. **No interview needed.**

---

### ~~P1-C2. O que faria você parar de usar o app~~ — DEMOTED TO P2

**Decision:** Will come naturally during beta testing. Not a priority for pre-launch interviews.

---

### P2-C3. Notificações

Push notifications DO NOT EXIST, but the app works without them.

**Perguntar:** "Como o app deveria avisar vocês das coisas? Notificações push pra visitas agendadas? Um resumo diário? Alertas quando algo está atrasado? Ou nada — vocês abrem quando querem?"

**Expected answer:** Reps want minimal. Managers might want daily summary.

**Decision tree:**
- "Push pra visitas agendadas" → Implement push via Expo Notifications.
- "Resumo diário" → Build daily digest.
- "Nada" → Defer entirely.

---

## Registro de Decisões Pós-Entrevista

Preencher imediatamente após cada entrevista.

### Entrevista com Representantes

| # | Pergunta | O que disseram (citação) | Status | Impacto no Código | Prioridade |
|---|----------|--------------------------|--------|-------------------|------------|
| **P1-6** | **Formulário de visita — campos** | | **OPEN — P1** | **Possible schema change** | **P1** |
| P2-1 | Calendar sync: como usa a agenda | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-2 | Edição: que tipo de erro | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-3 | Médicos fora do sistema: quando | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-4 | Encontrar o médico | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-5 | O que confere antes | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-6 | Depois de registrar | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-7 | Celular em campo | | CONFIRMADO / MUDOU / INCERTO | | |
| P2-8 | Ferramenta atual | | CONFIRMADO / MUDOU / INCERTO | | |

### Entrevista com Gerente

| # | Pergunta | O que disseram (citação) | Status | Impacto no Código | Prioridade |
|---|----------|--------------------------|--------|-------------------|------------|
| ~~P1-1~~ | Criar/atribuir visitas | Decided by product owner | DECIDED | Schedule + assign + goals wiring | P1 — DONE |
| ~~P1-2~~ | Visão diária da equipe | Decided by product owner (content open) | DECIDED | Activity summary — content TBD | P1 — DONE |
| **P1-6** | **Formulário de visita — dados que o gerente precisa** | | **OPEN — P1** | **Depends on rep P1-6** | **P1** |
| MGR-2 | Painel da manhã — o que mostrar | | CONFIRMADO / MUDOU / INCERTO | Content of daily summary | P2 |
| MGR-3 | Agenda do rep — só ver ou também mexer | | CONFIRMADO / MUDOU / INCERTO | Security rules scope | P2 |
| MGR-4 | Antes da visita — proxy do rep | | CONFIRMADO / MUDOU / INCERTO | Doctor detail screen | P2 |
| MGR-5 | Pergunta aberta — o que faria usar todo dia | | CONFIRMADO / MUDOU / INCERTO | Prioritization signal | P2 |
| P2-3 | Definir "no caminho certo" | | CONFIRMADO / MUDOU / INCERTO | | P2 |
| ~~P1-4~~ | Território e atribuição | Decided by product owner | DECIDED | Territory screen + bulk reassign + auto-assign | P1 — DONE |
| ~~P1-5~~ | O que está quebrado | Demoted to P2 — beta feedback | DEMOTED | No change | P2 |
| P2-6 | Rep abaixo do esperado | | CONFIRMADO / MUDOU / INCERTO | | P2 |
| P2-7 | Detalhes vs. padrões | | CONFIRMADO / MUDOU / INCERTO | | P2 |
| P2-8 | Relatórios | | CONFIRMADO / MUDOU / INCERTO | | P2 |

### Ambos os Grupos

| # | Pergunta | O que disseram | Status | Impacto no Código | Prioridade |
|---|----------|----------------|--------|-------------------|------------|
| ~~P1-C1~~ | Base de médicos | Decided: "Reportar Médico" button | DECIDED | Report button + doctor flagging | P1 — DONE |
| ~~P1-C2~~ | Dealbreaker | Demoted to P2 — beta feedback | DEMOTED | No change | P2 |
| P2-C3 | Notificações | | CONFIRMADO / MUDOU / INCERTO | | P2 |

### Resumo

- Total de premissas: ___
- CONFIRMADO: ___
- MUDOU: ___
- INCERTO: ___
- Mudanças de schema necessárias: ___
- Mudanças só de UI: ___
- Sem mudança necessária: ___
