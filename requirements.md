# VISITA CRM - Requirements Document

## Overview

VISITA is a pharmaceutical CRM mobile-first application built with React Native (Expo) and Firebase. It serves sales representatives, managers, analysts, and administrators at Entourage Lab to track doctor interactions, manage schedules, and analyze field activity.

**Platform:** iOS (primary), Web (secondary), Android (future)
**Auth:** Google OAuth restricted to `@entouragelab.com` accounts

---

## Goal

VISITA exists to give Entourage Lab's field team a single, fast place to record every doctor touchpoint, see who to visit next, and understand whether the work is moving the needle. The north star is **prescription lift** — every feature either makes it easier for reps to have the right conversation with the right doctor, or makes it easier for the team to measure and improve that process.

If a rep finishes a visit, they should be able to log it before they start the car. If a manager wonders how Tuesday went, the answer should be on their phone already. If an analyst needs to find patterns, the data should be clean enough to query without a spreadsheet detour. VISITA is the connective tissue between the field and the decisions that depend on it.

---

## Philosophy and Intent

### Design Philosophy

VISITA is a tool for people who spend most of their day in waiting rooms and hospital corridors, not at desks. Every design decision starts from that constraint.

- **Speed over decoration.** A rep logging a visit in a hospital parking lot cares about three taps to done, not card shadows. If it takes more than 15 seconds to log an interaction, the form is too long.
- **One path, not many.** Each screen has one primary action. The doctor list exists to find a doctor. The interaction form exists to record a result. Avoid Swiss-army-knife screens that try to do everything.
- **Show the work, not the system.** Reps should see doctor names, results, and dates — not Firestore document IDs, sync spinners, or loading skeletons that last more than a blink. If something is loading, the screen should feel useful before it finishes.
- **Offline-tolerant, not offline-first.** We assume connectivity most of the time but design so that a brief tunnel or elevator ride doesn't lose work. Firestore's built-in persistence handles most of this. We don't build a parallel offline queue unless real usage proves we need one.
- **Progressive complexity.** A rep on day one sees a search bar and a list of doctors. A manager three months in can drill into weekly grids and filter by specialty. The app doesn't front-load features that most users won't touch today.

### UX Philosophy

- **Portuguese first.** All user-facing text is in Brazilian Portuguese. Variable names and code comments stay in English. Error messages shown to users are in Portuguese; error messages logged to console are in English.
- **Teal, not rainbow.** The accent color is teal (`#0d9488`). Result codes get their own color scale (red to teal, 1-5) because color is the fastest way to read a result. Everything else is grayscale + teal. No blue links, no purple visited states, no red badges unless something is genuinely wrong.
- **Cards, not tables.** On mobile, information lives in rounded cards with generous padding. Tables are for exports and analyst views on web. If you're tempted to put a table on a phone screen, reconsider the information hierarchy.
- **Tap targets are generous.** Minimum 44pt touch targets. Chips and toggles should be easy to hit with a thumb on a 6-inch screen held in one hand.

### Branding and Identity

| Element            | Value                                                    |
|--------------------|----------------------------------------------------------|
| App name           | VISITAS                                                  |
| Tagline            | CRM Farmacêutico                                         |
| Primary color      | Teal `#0d9488` (C.teal)                                  |
| Dark accent        | `#134e4a` (C.tealDark)                                   |
| Light accent       | `#99f6e4` (C.tealLight)                                  |
| Background         | `#f9fafb` (C.bg)                                         |
| Card background    | `#ffffff` (C.card)                                       |
| Text               | `#111827` (C.text)                                       |
| Muted text         | `#6b7280` (C.textMuted)                                  |
| Light text         | `#9ca3af` (C.textLight)                                  |
| App name font      | Protest Strike (Google Fonts), 18pt, login screen only   |
| Body font          | System default (San Francisco on iOS, Roboto on Android) |
| Icon set           | Ionicons via `@expo/vector-icons`                        |
| Border radius      | 12px on cards, 20px on chips                             |

The logo is a placeholder. The brand should feel clinical-professional: clean lines, plenty of white space, no playful illustrations. Think "medical software," not "consumer app."

---

## Stakeholders

### The field rep (Representante)

The rep covers a territory — say, Minas Gerais. He drives between three or four hospitals a day, parks in structures with one bar of signal, and walks into waiting rooms where he might sit for forty minutes before a five-minute conversation with a doctor. He carries his phone, a bag of samples, and a laminated product card.

What the rep wants from VISITA is simple: after the conversation, he pulls out his phone, taps the doctor's name, taps a result number, toggles whether he left samples, and hits save. Done. He doesn't want to scroll through dropdowns or write paragraphs. He'll add a note if something interesting happened, but the default path should be three taps and a confirmation.

The rep also checks VISITA before walking into a hospital to remind himself: when was the last visit, what was the result, is this doctor flagged for follow-up. That lookup needs to be faster than scrolling through WhatsApp messages, which is his current system.

**What the rep brings:** Ground truth. Every interaction record in the system starts with a rep standing in front of a doctor. The data quality of VISITA is exactly as good as the effort it takes reps to log visits accurately.

**What the rep wants out:** Less paperwork, a personal record of his work, and credit when the numbers show his territory is improving.

### The manager (Gerente)

The manager oversees six reps across São Paulo and Minas Gerais. His job is to know which reps are hitting their visit targets, which doctors are being neglected, and where to focus coaching. He checks VISITA twice a day: once in the morning to see yesterday's activity, once in the afternoon to see how today is tracking.

The manager doesn't log interactions himself. He reads dashboards, drills into rep detail, and occasionally reassigns scheduled visits when someone is out sick. He cares about coverage (are all priority doctors being visited on cadence?) and quality (are result codes trending up over time?).

**What the manager brings:** Accountability and allocation. He decides which reps visit which doctors and sets the weekly targets that drive activity.

**What the manager wants out:** A daily snapshot that tells him, in under a minute, whether his team is on track — without calling each rep individually.

### The analyst (Analista)

The analyst works from the São Paulo office. She never visits a doctor, but she is the reason the doctor list is clean, the propensity scores make sense, and the quarterly board report has numbers in it. She imports doctor data from external sources, runs cohort analyses on interaction patterns, and builds the models that suggest which doctors a rep should prioritize.

The analyst needs VISITA's data to be queryable and consistent. She cares about field completeness (did the rep actually select the right interaction type?), timestamp accuracy (are visits logged same-day or backfilled a week later?), and export capability (can she pull a CSV of all interactions for the last quarter?).

**What the analyst brings:** Data rigor and strategic insight. She turns raw visit logs into signals that tell the business where to invest.

**What the analyst wants out:** Clean, timestamped, structured data that she can analyze without cleaning it first. Bonus: if the app itself surfaces the patterns she currently finds in spreadsheets.

### The admin (Administração)

The admin is the product owner and one of the founders. He set up the Firebase project, wrote the first Firestore rules, and is the person who gets a phone call when something breaks. His role in VISITA is part architect, part support desk: he assigns roles, troubleshoots auth issues, impersonates other roles to verify the experience, and decides what gets built next.

The admin needs his role to be a superset of everything. He should be able to see what any role sees, do what any role does, and undo what any role did. Impersonation exists because the admin needs to verify the rep experience without creating a fake rep account.

**What the admin brings:** System-level context. He knows how the data model works, why the security rules are shaped the way they are, and what the technical constraints are.

**What the admin wants out:** A system that runs without him — where roles are enforced, data is consistent, and he doesn't need to manually fix Firestore documents because the app let someone write bad data.

---

## 1. User Roles & Permissions

| Permission                | Representante | Gerente | Analista | Admin |
|---------------------------|:---:|:---:|:---:|:---:|
| Create visit records      | x   |     |     | x   |
| View own calendar/visits  | x   |     |     | x   |
| View all reps             |     | x   | x   | x   |
| Search/browse all doctors | x   | x   | x   | x   |
| View all visit data       |     | x   | x   | x   |
| Build/export reports      |     |     | x   | x   |
| Manage users & settings   |     |     |     | x   |
| Impersonate other roles   |     |     |     | x   |

### Role Resolution Order
1. Super-admin email list -> `admin`
2. Firestore `roles/{uid}.role` field -> assigned role
3. Legacy `roles_admin/{uid}` doc exists -> `admin`
4. Default -> `representante`

---

## 2. Screens & Wireframes

### 2.1 Login Screen

```
+----------------------------------+
|                                  |
|                                  |
|           V I S I T A            |
|        CRM Farmaceutico          |
|                                  |
|  +----------------------------+  |
|  |    Entrar com Google       |  |
|  +----------------------------+  |
|                                  |
|  Acesso restrito para contas     |
|  @entouragelab.com               |
|                                  |
+----------------------------------+
```

**Behavior:**
- Web: Firebase `signInWithPopup` (Google popup)
- iOS/Android: `expo-auth-session` with iOS client ID
- Domain check: non-`@entouragelab.com` emails are signed out immediately

---

### 2.2 Home Hub - Representante

```
+----------------------------------+
|                                  |
|           V I S I T A            |
|        CRM FARMACEUTICO          |
|                                  |
|  +----------------------------+  |
|  | [pen]  ENVIAR VISITA     > |  |
|  |        Registrar nova       |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [ppl]  MEDICOS           > |  |
|  |        Ver agenda e sinal.  |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ATIVIDADE         > |  |
|  |        Historico de visitas |  |
|  +----------------------------+  |
|                                  |
+------ TABS: Home Agenda + Prof --+
```

---

### 2.3 Home Hub - Admin (Administracao)

```
+----------------------------------+
|        [ADMINISTRACAO]           |
|           V I S I T A            |
|        CRM FARMACEUTICO          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  EQUIPE            > |  |
|  |        Ver desemp. dos reps |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  AGENDA            > |  |
|  |        Agendas dos reps     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Todos medicos/filtros|  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [bar]  ATIVIDADE         > |  |
|  |        Historico geral      |  |
|  +----------------------------+  |
|                                  |
|  Visualizar como:                |
|  (Admin) (Gerente) (Analista)    |
|          (Representante)         |
|  [x Parar simulacao]            |
+----------------------------------+
```

**Impersonation:** Admin can tap any role chip to switch the effective role. The entire home hub, buttons, and accent colors change to reflect the impersonated role. Tap "Parar simulacao" or tap the Admin chip to return.

---

### 2.4 Home Hub - Gerente

```
+----------------------------------+
|        [MODO GERENCIA]           |
|           V I S I T A            |
|        CRM FARMACEUTICO          |
|                                  |
|  +----------------------------+  |
|  | [ppl]  EQUIPE            > |  |
|  |        Ver desemp. dos reps |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [cal]  AGENDA            > |  |
|  |        Agendas dos reps     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Buscar e filtrar     |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

---

### 2.5 Home Hub - Analista

```
+----------------------------------+
|        [MODO ANALISTA]           |
|           V I S I T A            |
|        CRM FARMACEUTICO          |
|                                  |
|  +----------------------------+  |
|  | [bar]  RELATORIOS        > |  |
|  |        Dados e analises     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [med]  MEDICOS           > |  |
|  |        Buscar e filtrar     |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | [clk]  ATIVIDADE         > |  |
|  |        Historico geral      |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

---

### 2.6 Doctor List (All Roles)

```
+----------------------------------+
| < Medicos                        |
+----------------------------------+
| [Search: Buscar medico...]       |
+----------------------------------+
| (Agend.) (Sinal.) (IA) (Perto)  |
+----------------------------------+
|                                  |
| --- Agendados ---                |
| +------------------------------+ |
| | Dra. Sarah Walker      [5/5]| |
| | ortopedista                  | |
| | Hoje 10h - Hosp. Central    | |
| +------------------------------+ |
| +------------------------------+ |
| | Dr. Kevin Patel         [3/5]| |
| | pediatrico                   | |
| | Hoje 13h - Clin. Bem-Estar  | |
| +------------------------------+ |
|                                  |
| --- Sinalizados ---              |
| +------------------------------+ |
| | Dr. Eric Bermeyer   [flag]  | |
| | geriatric                    | |
| | Clinica Bem-Estar            | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

**Filter chips:**
- **Agend.** - Doctors with upcoming scheduled visits
- **Sinal.** - Doctors flagged for follow-up
- **IA** - AI-suggested priority doctors
- **Perto** - Nearby doctors (using device GPS)

---

### 2.7 Doctor Detail

```
+----------------------------------+
| < Dr. Sarah Walker               |
+----------------------------------+
| Sarah Walker                     |
| ortopedista                      |
| Sao Paulo, SP                   |
| [Propensity: 4/5]  12 toques   |
+----------------------------------+
| +------------------------------+ |
| |    Registrar Interacao       | |
| +------------------------------+ |
+----------------------------------+
| Historico de Interacoes          |
|                                  |
| o  Visita de Campo              |
| |  Resultado: 5 - Receptivo    |
| |  15/03/2026 14:30            |
| |  "Gostou da apresentacao..." |
| |                              |
| o  Evento Clinico               |
| |  Resultado: 6 - Interessado  |
| |  10/03/2026 09:00            |
| |                              |
| o  Digital                      |
|    Resultado: 3 - Neutro       |
|    01/03/2026 16:45            |
+----------------------------------+
```

**Left panel (mockup):** Doctor photo, summary of last visit, "Vai Prescrever" badge, notes
**Right panel (mockup):** Contact info (name, location, phone, email), inline interaction form

---

### 2.8 New Interaction Form

```
+----------------------------------+
| < Nova Interacao                 |
+----------------------------------+
|                                  |
| Tipo de Interacao                |
| (Visita) (Evento) (Congr) (Dig) |
|                                  |
| Resultado                        |
| [1] [2] [3] [4] [5]            |
| red  org yel grn tea            |
|                                  |
| Detalhes                         |
| Amostras entregues     [toggle] |
| Falou pessoalmente     [toggle] |
| Follow-up agendado     [toggle] |
|                                  |
| Anotacoes                        |
| +------------------------------+ |
| |                              | |
| |                              | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| |    Registrar Interacao       | |
| +------------------------------+ |
+----------------------------------+
```

**Result codes (1-5):**
1. Não (red)
2. Provavelmente Não (orange)
3. Aberto (yellow)
4. Vai Prescrever (green)
5. Prescrevendo (teal)

**On submit:**
- Captures GPS location (if permission granted)
- Creates interaction doc in Firestore
- Updates doctor's `totalTouches`, `lastInteractionAt`, `lastInteractionResult`

---

### 2.9 Schedule Tab (Rep View)

```
+----------------------------------+
| Agenda                           |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Dra. Sarah Walker            | |
| | dom., 15 de mar. 2026 10:00 | |
| +------------------------------+ |
| +------------------------------+ |
| | Dr. Kevin Patel              | |
| | seg., 16 de mar. 2026 13:00 | |
| +------------------------------+ |
|                                  |
| Nenhuma visita agendada          |
| (if empty)                       |
+----------------------------------+
```

---

### 2.10 Manager: Team Screen

```
+----------------------------------+
| < Equipe                         |
+----------------------------------+
|                                  |
| REPRESENTANTES                   |
| +------------------------------+ |
| | [L] Lamine                 > | |
| |     Minas Gerais             | |
| +------------------------------+ |
| +------------------------------+ |
| | [E] Erling                 > | |
| |     Sao Paulo                | |
| +------------------------------+ |
| +------------------------------+ |
| | [K] Kylian                 > | |
| |     Rio de Janeiro           | |
| +------------------------------+ |
|                                  |
+----------------------------------+
```

Each rep card shows first-letter avatar with a unique color, name, and state. Tapping navigates to rep detail.

---

### 2.11 Manager: Rep Detail

```
+----------------------------------+
| < Kylian                         |
+----------------------------------+
|                                  |
| +--------+ +--------+ +--------+|
| |  chat  | |  med   | |  cal   ||
| |   17   | |   8    | |   5    ||
| |Interac.| |Amostras| |Follow  ||
| +--------+ +--------+ +--------+|
|                                  |
| HISTORICO DE INTERACOES          |
|                                  |
| o  Visita de Campo              |
| |  Resultado: 5 - Receptivo    |
| |  15/03/2026 14:30            |
| |                              |
| o  Digital                      |
|    Resultado: 3 - Neutro       |
|    12/03/2026 10:00            |
+----------------------------------+
```

---

### 2.12 Manager: Schedules

```
+----------------------------------+
| < Agendas                        |
+----------------------------------+
| (Lamine) (Erling) [Kylian] ...  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Dra. Sarah Walker            | |
| | terca 10h - Hosp. Central  >| |
| +------------------------------+ |
| +------------------------------+ |
| | Dr. Kevin Patel              | |
| | terca 13h - Clin. Bem-Estar>| |
| +------------------------------+ |
|                                  |
| (or "Selecione um representante")|
+----------------------------------+
```

**Week filter:** Passada / Atual / Proxima (from mockup, to be implemented)

---

### 2.13 Manager: Doctor Filters (from mockup, to be implemented)

```
+----------------------------------+
|        Filtros              [^]  |
+----------------------------------+
| Estado:     [Minas Gerais    v]  |
| Cidade:     [Todos           v]  |
| Especializ: [Psiquiatria     v]  |
| Anos:       [1 - 10          v]  |
| SUS:        [Todos           v]  |
| Ambiente:   [Hospital publ.  v]  |
|              +-----------------+ |
|              | Hospital publ.  | |
|              | Consult. propr. | |
|              | Clinica privada | |
|              | Hospital privad.| |
|              +-----------------+ |
+----------------------------------+
```

---

### 2.14 Manager: Weekly Dashboard (from mockup, to be implemented)

```
+----------------------------------+
|        MODO GERENCIA             |
+----------------------------------+
| [semana atual] [passada] [prox.] |
| seg | ter | qua | qui | sex     |
+----------------------------------+
|                                  |
| [Lamine  ] 7/10  | 2 | 1 |     |
| [Erling  ] 9/12  | 1 | 4 | 2   |
| [Kylian  ] 17/12 | 2 | 2 | 2   |
| [Jamal   ] 5/10  |   |   |     |
| [Michael ] 9/11  |   | 1 | 1   |
|                                  |
| --- Atualizacoes ---             |
| +------------------------------+ |
| | Mensagem               [!]  | |
| +------------------------------+ |
| +------------------------------+ |
| | Algo                         | |
| +------------------------------+ |
+----------------------------------+
```

---

### 2.15 Profile Screen

```
+----------------------------------+
| Perfil                           |
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |          [M]               |  |
|  |     Mario Bonifacio       |  |
|  |  mario@entouragelab.com   |  |
|  |     [Administracao]       |  |
|  |  Simulando: Gerente       |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |      Sair da conta        |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

---

### 2.16 Visit Detail

```
+----------------------------------+
| < Visita                         |
+----------------------------------+
|                                  |
| Medico                           |
| Dra. Sarah Walker                |
|                                  |
| Agendado para                    |
| 15/03/2026 10:00                |
|                                  |
| Status                           |
| [scheduled]                      |
|                                  |
| Observacoes                      |
| Levar amostras do produto X     |
|                                  |
+----------------------------------+
```

---

## 3. Data Model

### 3.1 Firestore Collections

| Collection         | Purpose                                      |
|--------------------|----------------------------------------------|
| `doctors`          | Doctor profiles with CRM-computed fields     |
| `interactions`     | Rep-doctor interaction records               |
| `scheduled_visits` | Calendar entries for upcoming visits         |
| `representantes`   | Sales rep profiles                           |
| `action_items`     | Followup tasks generated from interactions   |
| `roles`            | User role assignments                        |
| `roles_admin`      | Legacy admin flag (exists = admin)           |

### 3.2 Doctor

| Field                  | Type       | Notes                        |
|------------------------|------------|------------------------------|
| `id`                   | string     | Auto-generated               |
| `firstName`            | string     |                              |
| `lastName`             | string     |                              |
| `fullName`             | string     | Denormalized                 |
| `crm`                  | string     | CRM registration number      |
| `mainSpecialty`        | string     |                              |
| `state`                | string     | UF code                      |
| `city`                 | string     |                              |
| `phone`                | string     |                              |
| `mobilePhone`          | string     |                              |
| `email`                | string     |                              |
| `active`               | boolean    |                              |
| `propensityScore`      | number?    | 1-5, CRM-computed            |
| `lastInteractionAt`    | Timestamp? | CRM-computed                 |
| `lastInteractionResult`| number?    | 1-5, CRM-computed            |
| `totalTouches`         | number?    | CRM-computed                 |
| `flaggedForFollowUp`   | boolean?   | CRM-computed                 |
| `createdAt`            | Timestamp  |                              |
| `updatedAt`            | Timestamp  |                              |
| `removedAt`            | Timestamp? | Soft delete                  |

### 3.3 Interaction

| Field               | Type           | Notes                       |
|----------------------|----------------|-----------------------------|
| `id`                 | string         | Auto-generated              |
| `doctorId`           | string         | FK to doctors               |
| `repId`              | string         | Firebase Auth UID           |
| `type`               | InteractionType| field_visit/clinical_event/congress/digital |
| `resultCode`         | number         | 1-5                         |
| `samplesDelivered`   | boolean        |                             |
| `spokeFaceToFace`    | boolean        |                             |
| `followUpScheduled`  | boolean        |                             |
| `notes`              | string         |                             |
| `location`           | GeoPoint?      | GPS at time of interaction  |
| `doctorName`         | string?        | Denormalized                |
| `repName`            | string?        | Denormalized                |
| `active`             | boolean        |                             |
| `createdAt`          | Timestamp      |                             |
| `updatedAt`          | Timestamp      |                             |

### 3.4 ScheduledVisit

| Field                   | Type        | Notes                      |
|-------------------------|-------------|----------------------------|
| `id`                    | string      | Auto-generated             |
| `doctorId`              | string      | FK to doctors              |
| `repId`                 | string      | FK to auth user            |
| `scheduledFor`          | Timestamp   |                            |
| `assignedBy`            | string      | userId of assigner         |
| `status`                | VisitStatus | scheduled/completed/cancelled/rescheduled |
| `completedInteractionId`| string?     | FK to interactions         |
| `notes`                 | string?     |                            |
| `doctorName`            | string?     | Denormalized               |
| `active`                | boolean     |                            |
| `createdAt`             | Timestamp   |                            |
| `updatedAt`             | Timestamp   |                            |

### 3.5 Representante

| Field       | Type       | Notes                         |
|-------------|------------|-------------------------------|
| `id`        | string     | Auto-generated                |
| `name`      | string     |                               |
| `email`     | string?    |                               |
| `phone`     | string?    |                               |
| `estado`    | string?    | State/UF                      |
| `userId`    | string?    | FK to Firebase Auth user      |
| `active`    | boolean    |                               |
| `createdAt` | Timestamp  |                               |
| `updatedAt` | Timestamp  |                               |
| `removedAt` | Timestamp? | Soft delete                   |

### 3.6 Roles

| Field  | Type     | Notes                                          |
|--------|----------|-------------------------------------------------|
| `role` | UserRole | representante / gerente / analista / admin      |

Document ID = Firebase Auth UID.

---

## 4. Interaction Types & Weights

| Type           | Label (PT)       | Weight |
|----------------|------------------|--------|
| field_visit    | Visita de Campo  | 1.0    |
| clinical_event | Evento Clinico   | 1.5    |
| congress       | Congresso        | 0.5    |
| digital        | Digital          | 0.25   |

---

## 5. Result Codes

| Code | Label (PT)         | Color    |
|------|--------------------|----------|
| 1    | Não                | Red      |
| 2    | Provavelmente Não  | Orange   |
| 3    | Aberto             | Yellow   |
| 4    | Vai Prescrever     | Green    |
| 5    | Prescrevendo       | Teal     |

---

## 6. Propensity Score

| Score | Label (PT)   |
|-------|--------------|
| 1     | Muito Baixa  |
| 2     | Baixa        |
| 3     | Media        |
| 4     | Alta         |
| 5     | Muito Alta   |

---

## 7. Security Rules Summary

- All access requires `@entouragelab.com` domain
- Reps can read all doctors, create own interactions
- Reps can only update CRM-computed fields on doctors
- Reps can read only their own scheduled visits
- Admins have full CRUD on all collections
- Role assignments controlled by admin/super-admin
- Soft deletes used throughout (active flag)

---

## 8. Non-Functional Requirements

| Requirement        | Target                                                        |
|--------------------|---------------------------------------------------------------|
| Interaction log    | < 15 seconds from opening form to saved record                |
| Cold start (web)   | < 3 seconds to interactive on a 4G connection                 |
| Auth               | Google OAuth only; `@entouragelab.com` domain enforced        |
| Data freshness     | Real-time via Firestore subscriptions (no polling)            |
| Offline tolerance  | Firestore persistence handles brief disconnections            |
| Accessibility      | Minimum 44pt touch targets; sufficient color contrast on results |
| Localization       | UI in pt-BR; code/logs in English                             |
| Soft deletes       | All collections use `active` flag; no hard deletes in app     |
| Supported platforms| iOS (primary), Web (secondary), Android (future)              |

---

## 9. Risks

### Data quality depends on rep discipline

The entire system's value chain starts with a rep tapping the right result code in a hospital parking lot. If reps backfill visits days later, enter the wrong doctor, or default to "Neutro" every time because it's the fastest, every downstream dashboard and analysis is polluted. There is no technical fix for this — it's a training and incentive problem. The app can help by making the right path fast (GPS timestamp proves same-day logging, pre-selected doctor from schedule reduces wrong-doctor errors), but ultimately the data is as honest as the people entering it.

### Single-tenant Firebase has scaling ceilings

VISITA is built on a single Firebase project with Firestore as the only database. This is the right choice for a team of 10-20 users. It is not the right choice for 500 users running complex aggregation queries. If Entourage Lab grows significantly or acquires another field team, the architecture will need to be revisited — likely adding a read-replica or analytics database that syncs from Firestore. For now, we accept this ceiling and don't over-engineer for a scale we may never reach.

### Google OAuth is a single point of failure

If Google's OAuth service is down, no one can log in. If Google changes the OAuth consent screen requirements (which they have done before, with rolling deadlines and confusing documentation), the app may stop working until someone navigates the Google Cloud Console. There is no fallback auth method. This is an acceptable risk for a team that already lives in Google Workspace, but it means the admin needs to keep the OAuth credentials and consent screen in a known-good state.

### Firestore rules are the only authorization layer

There is no backend server validating permissions. Firestore security rules are the authorization boundary. If a rule is misconfigured, a user with the Firebase SDK could write arbitrary data. The mitigation is to keep rules simple, test them with the Firebase emulator, and review them on every change. But it's worth noting that a determined technical user with an `@entouragelab.com` account could bypass the app UI and hit Firestore directly if the rules allow it.

### Location permission is fragile

GPS capture on interaction submit is best-effort. iOS aggressively limits background location, users can deny the permission prompt, and indoor hospital GPS accuracy is often poor. The app should never block a submission on failed location capture. Location is a nice-to-have audit trail, not a hard requirement.

---

## 10. Constraints

| Constraint                  | Implication                                                     |
|-----------------------------|-----------------------------------------------------------------|
| Expo managed workflow       | No native modules outside Expo's supported set                  |
| Firebase free/Blaze tier    | Firestore reads/writes have cost implications at scale          |
| No backend server           | All business logic runs client-side or in Firestore rules       |
| Team size (< 20 users)      | No need for pagination on most lists; can load full collections |
| `@entouragelab.com` only    | No public-facing features or anonymous access                   |
| Single Firebase project     | All environments (dev/prod) share config unless explicitly split|
| Portuguese UI / English code| All user-facing strings in pt-BR; all code/comments in English  |

---

## 11. Future / Planned Features

### From mockups (designed, not yet built)
- [ ] Weekly performance dashboard for managers (rep grid with daily stats)
- [ ] Doctor filter panel (state, city, specialty, years, SUS, environment)
- [ ] Week navigation on schedules (passada / atual / proxima)
- [ ] Notifications/updates feed on manager dashboard
- [ ] Doctor photos and star ratings
- [ ] Inline interaction form on doctor detail (contact + result in split view)
- [ ] Bottom tab bar with badge counts
- [ ] App logo in header

### Medium-term (next quarter)
- [ ] CSV/Excel export for analyst role
- [ ] Push notifications for scheduled visit reminders
- [ ] Propensity score model (currently placeholder, needs real algorithm)
- [ ] Batch doctor import from external data sources
- [ ] Interaction edit/delete with audit trail

### Long-term (exploratory)
- [ ] AI-suggested visit priorities based on interaction history and propensity
- [ ] Offline-first queue for areas with poor connectivity
- [ ] Android build and distribution
- [ ] Multi-tenant support if Entourage Lab expands to other teams
- [ ] Integration with external CRM or ERP systems
- [ ] Dark mode toggle — **Pros:** reduces eye strain for evening/indoor use, follows iOS system preference, modern UX expectation. **Cons:** requires a full theming system (ThemeContext, useTheme hook, dynamic color tokens across every screen), doubles visual QA surface, and the primary users (field reps) work outdoors in daylight where light mode is optimal. Revisit if user feedback indicates demand; the current light palette with teal accents was chosen for outdoor readability in Brazilian conditions.
