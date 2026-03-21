# VISITA CRM - QA Test Plan

## Overview

This document defines the quality assurance test cases for the VISITA CRM application. Tests are organized by feature area and user role. Each test case includes preconditions, steps, and expected results.

**Environments:** iOS (Expo Go / EAS build), Web (localhost:8081)

---

## 1. Authentication

### 1.1 Google Sign-In (Web)

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| AUTH-01 | Sign in with @entouragelab.com account              | 1. Open app in browser 2. Tap "Entrar com Google" 3. Select entouragelab account | Google popup opens, user signs in, redirected to home hub |
| AUTH-02 | Reject non-entouragelab email                       | 1. Tap "Entrar com Google" 2. Select personal Gmail | User is signed out immediately, error shown |
| AUTH-03 | Persist session across reload                       | 1. Sign in 2. Reload browser tab | User remains signed in, lands on home hub |
| AUTH-04 | Sign out                                            | 1. Go to Profile tab 2. Tap "Sair da conta" | User is signed out, redirected to login |

### 1.2 Google Sign-In (iOS)

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| AUTH-05 | Sign in via expo-auth-session                       | 1. Open app in Expo Go 2. Tap "Entrar com Google" 3. Complete Google OAuth flow | User signs in, redirected to home hub |
| AUTH-06 | iOS URL scheme redirect works                       | 1. Check `CFBundleURLSchemes` matches reversed client ID 2. Sign in | OAuth callback handled correctly |
| AUTH-07 | Session persists with AsyncStorage                  | 1. Sign in 2. Kill and reopen app | User remains signed in |

---

## 2. Role System

### 2.1 Role Resolution

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| ROLE-01 | Super-admin email resolves to admin                 | 1. Sign in as mario@entouragelab.com | Role = admin, home shows "ADMINISTRACAO" badge |
| ROLE-02 | Firestore roles/{uid} with role field               | 1. Set `roles/{uid}.role = "gerente"` in Firestore 2. Sign in with that user | Role = gerente, home shows "MODO GERENCIA" |
| ROLE-03 | Legacy roles_admin doc fallback                     | 1. Create doc at `roles_admin/{uid}` 2. No `roles/{uid}` doc 3. Sign in | Role = admin (legacy fallback) |
| ROLE-04 | Default to representante                            | 1. Sign in with user that has no role doc | Role = representante, home shows rep buttons |
| ROLE-05 | Role loading state                                  | 1. Sign in | Loading spinner shown while role resolves, then correct hub appears |

### 2.2 Impersonation (Admin Only)

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| IMP-01 | Switch to Representante view                        | 1. Sign in as admin 2. Tap "Representante" chip | Hub shows rep buttons (Enviar Visita, Medicos, Atividade) |
| IMP-02 | Switch to Gerente view                              | 1. Sign in as admin 2. Tap "Gerente" chip | Hub shows manager buttons, accent color changes to amber |
| IMP-03 | Switch to Analista view                             | 1. Sign in as admin 2. Tap "Analista" chip | Hub shows analyst buttons, accent color changes to purple |
| IMP-04 | Stop impersonation                                  | 1. Impersonate a role 2. Tap "Parar simulacao" | Returns to admin view |
| IMP-05 | Non-admin cannot impersonate                        | 1. Sign in as representante 2. Check home screen | No impersonation UI visible |
| IMP-06 | Profile shows impersonation status                  | 1. Impersonate gerente 2. Go to Profile tab | Badge shows "Administracao", note shows "Simulando: Gerente" |

---

## 3. Home Hub

### 3.1 Role-Based Button Layout

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| HUB-01 | Rep sees 3 buttons                                  | 1. Sign in as representante | Enviar Visita, Medicos, Atividade buttons shown |
| HUB-02 | Manager sees 3 buttons                              | 1. Sign in as gerente | Equipe, Agenda, Medicos buttons shown |
| HUB-03 | Analyst sees 3 buttons                              | 1. Sign in as analista | Relatorios, Medicos, Atividade buttons shown |
| HUB-04 | Admin sees 4 buttons                                | 1. Sign in as admin | Equipe, Agenda, Medicos, Atividade buttons shown |
| HUB-05 | Each button navigates to correct screen              | 1. Tap each button | Navigation works without crash |

---

## 4. Doctor List

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| DOC-01 | Doctors load from Firestore                         | 1. Navigate to Medicos | Active doctors displayed in list |
| DOC-02 | Search filters by name                              | 1. Type in search box | List filters to matching doctors |
| DOC-03 | Empty state                                         | 1. Search for nonexistent name | "Nenhum medico encontrado" shown |
| DOC-04 | Tap doctor navigates to detail                       | 1. Tap a doctor card | Doctor detail screen opens |
| DOC-05 | Propensity badge shows correct color                | 1. Doctor with propensityScore = 4 | Badge shows "Alta" in green |
| DOC-06 | Filter chips work                                    | 1. Tap "Sinal." chip | Only flagged doctors shown |

---

## 5. Doctor Detail

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| DET-01 | Doctor info displays correctly                      | 1. Open doctor detail | Name, specialty, location, propensity, touches shown |
| DET-02 | Interaction timeline loads                           | 1. Open doctor with interactions | Timeline shows interactions chronologically |
| DET-03 | Empty timeline                                      | 1. Open doctor with no interactions | "Nenhuma interacao registrada" or empty state |
| DET-04 | "Registrar Interacao" navigates to form              | 1. Tap button | Interaction form opens with doctorId pre-filled |
| DET-05 | Conditional fields render without crash (web)        | 1. Open doctor missing city/state | No "text node" error, fields gracefully hidden |

---

## 6. Interaction Form

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| INT-01 | All form fields render                              | 1. Open new interaction | Type chips, result grid, toggles, notes field visible |
| INT-02 | Type selection works                                 | 1. Tap "Evento Clinico" chip | Chip becomes selected, others deselect |
| INT-03 | Result code selection works                          | 1. Tap result code 5 | Code 5 highlighted with correct color |
| INT-04 | Validation requires result code                      | 1. Leave result code empty 2. Tap submit | Error shown under result section |
| INT-05 | Toggle switches work                                 | 1. Toggle "Amostras entregues" | Switch state changes |
| INT-06 | Submit creates interaction                           | 1. Fill all fields 2. Tap "Registrar Interacao" | Success alert, interaction created in Firestore |
| INT-07 | Doctor fields updated on submit                      | 1. Submit interaction for doctor | Doctor's totalTouches incremented, lastInteractionAt updated |
| INT-08 | GPS location captured                                | 1. Grant location permission 2. Submit | Interaction has location GeoPoint |
| INT-09 | Location optional                                    | 1. Deny location permission 2. Submit | Interaction created without location field |

---

## 7. Schedule Tab

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| SCH-01 | Rep sees own upcoming visits                         | 1. Sign in as rep 2. Go to Agenda tab | Only own scheduled visits shown |
| SCH-02 | Visits ordered by date ascending                     | 1. Check visit order | Earliest visit first |
| SCH-03 | Tap visit navigates to detail                        | 1. Tap a visit card | Visit detail screen opens |
| SCH-04 | Empty state                                          | 1. Rep with no visits | "Nenhuma visita agendada" shown |

---

## 8. Manager Screens

### 8.1 Team Screen

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| MGR-01 | Active reps listed                                   | 1. Navigate to Equipe | All active representantes shown |
| MGR-02 | Rep cards show name and state                        | 1. Check rep cards | Name and estado displayed |
| MGR-03 | Tap rep navigates to detail                          | 1. Tap a rep card | Rep detail screen opens |
| MGR-04 | Empty state                                          | 1. No representantes in Firestore | "Nenhum representante cadastrado" shown |

### 8.2 Manager Schedules

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| MGR-05 | Rep selector chips shown                             | 1. Navigate to Agendas | Horizontal row of rep name chips |
| MGR-06 | Select rep shows their visits                        | 1. Tap a rep chip | That rep's upcoming visits shown |
| MGR-07 | Deselect rep                                         | 1. Tap active rep chip again | Returns to "Selecione um representante" state |
| MGR-08 | Tap visit navigates to doctor                        | 1. Tap a visit card | Doctor detail screen opens |

### 8.3 Rep Detail

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| MGR-09 | Stats cards show correct counts                      | 1. Open rep detail | Interacoes, Amostras, Follow-ups counts match Firestore data |
| MGR-10 | Timeline shows rep's interactions                    | 1. Check timeline | All interactions by this rep shown |

---

## 9. Profile Screen

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| PRO-01 | User info displayed                                  | 1. Go to Profile tab | Avatar, name, email shown correctly |
| PRO-02 | Role badge shows correct role                        | 1. Check badge | Badge text and color match user's role |
| PRO-03 | Sign out works (web)                                 | 1. Tap "Sair da conta" | User signed out immediately (no alert on web) |
| PRO-04 | Sign out works (iOS)                                 | 1. Tap "Sair da conta" 2. Confirm in alert | User signed out after confirmation |

---

## 10. Cross-Platform (Web)

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| WEB-01 | No "text node" errors                                | 1. Navigate through all screens on web | No "Unexpected text node" console errors |
| WEB-02 | Icons render (Ionicons)                              | 1. Check all tabs and buttons | All Ionicons render correctly |
| WEB-03 | Firebase auth persistence (browserLocalPersistence)  | 1. Sign in 2. Reload | Session persists |
| WEB-04 | Firestore real-time updates                          | 1. Add a doctor in Firestore console 2. Check app | New doctor appears without reload |

---

## 11. Firestore Security Rules

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| SEC-01 | Non-entouragelab user blocked                        | 1. Try Firestore access with non-entouragelab token | Permission denied |
| SEC-02 | Rep can read all doctors                             | 1. Query doctors collection as rep | Success |
| SEC-03 | Rep cannot create doctors                            | 1. Try creating doctor as rep | Permission denied |
| SEC-04 | Rep can create own interaction                       | 1. Create interaction with own repId | Success |
| SEC-05 | Rep cannot create interaction for other rep           | 1. Create interaction with different repId | Permission denied |
| SEC-06 | Rep can only read own scheduled visits               | 1. Query scheduled_visits as rep | Only own visits returned |
| SEC-07 | Admin can read/write all collections                  | 1. CRUD operations as admin | All succeed |
| SEC-08 | Rep can update CRM fields on doctors                  | 1. Update propensityScore as rep | Success |
| SEC-09 | Rep cannot update non-CRM fields on doctors           | 1. Try updating fullName as rep | Permission denied |
| SEC-10 | Role doc readable only by own user                    | 1. Try reading other user's roles/{uid} | Permission denied |
| SEC-11 | Only admin can write role docs                        | 1. Try writing to roles/{uid} as rep | Permission denied |

---

## 12. Edge Cases & Error Handling

| ID     | Test Case                                          | Steps | Expected Result |
|--------|-----------------------------------------------------|-------|-----------------|
| EDG-01 | Network offline                                      | 1. Disable network 2. Open app | Cached data shown (Firestore offline persistence) |
| EDG-02 | Doctor with missing optional fields                   | 1. Doctor without city, state, propensity | Renders without crash, fields gracefully omitted |
| EDG-03 | Very long doctor name                                 | 1. Doctor with 100+ char name | Text truncates or wraps properly |
| EDG-04 | Rapid navigation between screens                      | 1. Quickly tap back/forward through screens | No crash or duplicate rendering |
| EDG-05 | Concurrent Firestore writes                           | 1. Two reps submit interaction for same doctor simultaneously | Both interactions created, doctor touches updated correctly |
| EDG-06 | Empty Firestore collections                           | 1. No doctors in database | Empty state messages shown |

---

## Test Execution Checklist

### Pre-Release Checklist

- [ ] All AUTH tests pass on web
- [ ] All AUTH tests pass on iOS
- [ ] All ROLE tests pass
- [ ] All IMP tests pass (admin impersonation)
- [ ] All HUB tests pass per role
- [ ] All DOC tests pass
- [ ] All DET tests pass
- [ ] All INT tests pass
- [ ] All SCH tests pass
- [ ] All MGR tests pass
- [ ] All PRO tests pass
- [ ] All WEB tests pass
- [ ] All SEC tests pass (Firestore rules)
- [ ] All EDG edge case tests pass
- [ ] No TypeScript compilation errors
- [ ] No console errors on any screen
- [ ] App works on iOS 16+ (Expo Go)
- [ ] App works on Chrome, Safari, Firefox (web)

### Regression Test Triggers

Run full regression when:
- Firebase rules change
- Auth flow changes
- Role system changes
- New screens added
- Provider/context changes
- Firestore schema changes
