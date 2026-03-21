# VISITA - CRM Farmaceutico

A mobile-first pharmaceutical CRM for Entourage Lab. Built with React Native (Expo) + Firebase.

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npx expo`)
- Firebase project (`simple-login-fdcf7`)
- For iOS: Xcode 15+, Expo Go app

### Install & Run

```bash
# Install dependencies
npm install

# Start web dev server
npx expo start --web

# Start iOS (Expo Go)
npx expo start --ios

# Start iOS (development build)
npx expo run:ios
```

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=simple-login-fdcf7
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=471797457785-kmcpfoode8ek4etpa5ibbhucpveu18bo.apps.googleusercontent.com
```

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## Architecture

```
crm/
  app/                        # Expo Router screens
    (auth)/                   # Login flow
      login.tsx
    (app)/                    # Authenticated app
      (tabs)/                 # Bottom tab navigator
        index.tsx             # Home hub (role-based)
        schedule.tsx          # Upcoming visits
        log.tsx               # Quick interaction log
        profile.tsx           # User profile & sign out
      doctors.tsx             # Doctor list with filters
      doctor/[id].tsx         # Doctor detail + timeline
      interaction/new.tsx     # New interaction form
      visit/[id].tsx          # Visit detail
      manager/                # Manager-only screens
        team.tsx              # Rep list
        schedules.tsx         # Rep schedule viewer
        rep-detail.tsx        # Rep performance detail
  src/
    components/               # Reusable UI components
      DoctorCard.tsx
      InteractionForm.tsx
      PropensityBadge.tsx
      Timeline.tsx
    firebase/                 # Firebase setup & hooks
      init.ts                 # Firebase initialization
      provider.tsx            # Context, auth, roles
      auth-guard.tsx          # Route protection
      use-collection.ts       # Real-time collection hook
      use-doc.ts              # Real-time document hook
    services/                 # Firestore CRUD & queries
      doctors.service.ts
      interactions.service.ts
      visits.service.ts
      reps.service.ts
      action-items.service.ts
    types/                    # TypeScript interfaces
      doctor.ts
      interaction.ts
      scheduled-visit.ts
      representante.ts
      action-item.ts
      roles.ts
    lib/                      # Utilities
      constants.ts
      utils.ts
    theme.ts                  # Color palette & design tokens
```

---

## User Roles

The app supports four user roles with different permissions and UI experiences:

### Representante (Sales Rep)

- Register doctor interactions (visits, events, digital touchpoints)
- View own calendar and scheduled visits
- Search and browse doctors
- Track interaction history with each doctor

**Home hub:**
- Enviar Visita -> Doctor list -> Select doctor -> Interaction form
- Medicos -> Browse/search all doctors
- Atividade -> Own visit history

### Gerente (Manager)

- View all sales reps and their performance
- Browse rep schedules and visit history
- Search and filter doctors

**Home hub:**
- Equipe -> Rep list -> Rep detail with stats
- Agenda -> Select rep -> View their schedule
- Medicos -> Browse/search all doctors

### Analista (Analyst)

- Read-only access to all visit data
- Search and filter doctors
- Build reports and analyses

**Home hub:**
- Relatorios -> Data and analysis views
- Medicos -> Browse/search all doctors
- Atividade -> Full visit history

### Administracao (Admin)

- Full access to all features
- Manage users and role assignments
- **Impersonate any role** to see the app from their perspective

**Home hub:** All manager buttons plus impersonation bar at bottom. Tap any role chip (Representante, Gerente, Analista) to switch the UI to that role's view.

### Role Assignment

Roles are determined in this order:
1. **Super-admin emails** (hardcoded) -> `admin`
2. **Firestore `roles/{uid}`** document with `role` field -> assigned role
3. **Legacy `roles_admin/{uid}`** document exists -> `admin`
4. **Default** -> `representante`

To assign a role, create/update a document at `roles/{firebase-auth-uid}`:
```json
{ "role": "gerente" }
```

---

## Firestore Collections

| Collection | Description |
|---|---|
| `doctors` | Doctor profiles (name, specialty, CRM, location, propensity) |
| `interactions` | Rep-doctor interaction records with result codes 1-7 |
| `scheduled_visits` | Calendar entries for upcoming doctor visits |
| `representantes` | Sales rep profiles (name, email, state) |
| `action_items` | Follow-up tasks generated from interactions |
| `roles` | User role assignments (`{ role: "gerente" }`) |
| `roles_admin` | Legacy admin flag (document exists = admin) |

---

## Key Concepts

### Result Codes (1-7)

| Code | Label | Color |
|---|---|---|
| 1 | Nao Receptivo | Red |
| 2 | Resistente | Orange |
| 3 | Neutro | Yellow |
| 4 | Receptivo | Green |
| 5 | Muito Receptivo | Dark Green |
| 6 | Interessado | Dark Teal |
| 7 | Evangelizando | Teal |

### Propensity Score (1-5)

Computed CRM field on each doctor indicating likelihood to prescribe:
1. Muito Baixa -> 5. Muito Alta

### Interaction Types

| Type | Weight | Description |
|---|---|---|
| field_visit | 1.0 | In-person visit at doctor's office |
| clinical_event | 1.5 | Clinical event or presentation |
| congress | 0.5 | Medical congress attendance |
| digital | 0.25 | Digital/remote contact |

---

## Platform Notes

### Web
- Auth uses `signInWithPopup` with `browserPopupRedirectResolver`
- Auth persistence: `browserLocalPersistence`
- All conditional JSX uses ternary with `null` (not `&&`) to avoid React Native Web text node errors

### iOS
- Auth uses `expo-auth-session` with Google iOS OAuth client
- Auth persistence: `getReactNativePersistence(AsyncStorage)`
- Reversed client ID configured in `app.json` `CFBundleURLSchemes`

---

## Documentation

- **[requirements.md](./requirements.md)** - Full requirements with ASCII wireframes for every screen
- **[qa.md](./qa.md)** - QA test plan with test cases for all features and roles

---

## Tech Stack

- **Framework:** React Native with Expo SDK 55
- **Router:** Expo Router (file-based routing)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Language:** TypeScript
- **Icons:** @expo/vector-icons (Ionicons)
- **Forms:** react-hook-form + zod
- **Dates:** date-fns with pt-BR locale

---

## Claude Code / gstack

This project uses [gstack](https://github.com/garrytan/gstack) — a skill suite for Claude Code that provides a fast headless browser and engineering workflow automation.

### Setup

```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

Requires [Bun](https://bun.sh) (installed automatically if missing).

### Available Skills

| Skill | Purpose |
|---|---|
| `/browse` | Fast headless browser — navigate, interact, screenshot (~100ms/cmd) |
| `/qa` | Full QA loop: test → find bugs → fix → verify → commit |
| `/qa-only` | QA report only (no fixes) |
| `/review` | Pre-landing PR review (SQL safety, trust boundaries, structural issues) |
| `/ship` | Merge base, run tests, review diff, bump version, push, create PR |
| `/plan-ceo-review` | CEO-level plan critique — challenge premises, expand/reduce scope |
| `/plan-eng-review` | Eng manager review — architecture, data flow, edge cases, testing |
| `/plan-lazy-dev` | Lazy dev review — minimize code, interrogate intent, push complexity upstream |
| `/setup-browser-cookies` | Import real browser cookies for authenticated testing |
| `/retro` | Weekly engineering retrospective with trend tracking |
| `/document-release` | Post-ship docs update (README, CHANGELOG, etc.) |

### Configuration

The `CLAUDE.md` file at the project root configures Claude Code to:
- Use `/browse` from gstack for all web browsing
- Never use `mcp__Claude_in_Chrome__*` tools directly
