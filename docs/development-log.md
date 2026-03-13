# SmartPlanning — Journal de développement

Historique détaillé du développement de SmartPlanning V2, organisé par phases et tickets Jira (préfixe `SP-`).

> Ce document complète le [README.md](../README.md) qui contient la vue d'ensemble du projet.

---

## Table des matières

- [Composants UI production-ready](#composants-ui-production-ready)
- [Architecture CSS & Design System](#architecture-css--design-system)
- [Landing Page & Pages publiques](#landing-page--pages-publiques)
- [Stripe & Billing](#stripe--billing)
- [Phases de développement](#phases-de-développement)
- [Modèle de données détaillé](#modèle-de-données-détaillé)
- [Tests détaillés](#tests-détaillés)
- [SEO & Optimisation LLMs](#seo--optimisation-llms)
- [Performance & Analytics](#performance--analytics)
- [Monitoring & Admin](#monitoring--admin)
- [Accessibilité WCAG 2.1](#accessibilité-wcag-21)

---

## Composants UI production-ready

- **Auth System** (SP-109) : LoginForm, RegisterForm avec React Hook Form + Zod, Server Actions, auto-login, création automatique Employee + LeaveBalance à l'inscription, champ téléphone optionnel + **Système d'invitation** : lors de la création d'un employé avec email, création automatique d'un compte User avec rôle choisi (EMPLOYEE/MANAGER/DIRECTOR), envoi d'email d'invitation avec token 48h, page `/activate-account` pour choix du mot de passe, notification SSE temps réel aux directeurs à l'activation, renvoi d'invitation si lien expiré, RBAC (MANAGER ne peut inviter que des EMPLOYEE)
- **DataTable avancée** (SP-120) : Composant de tableau avec tri multi-colonnes, pagination, recherche fuzzy, sélection multi-rows, actions par ligne, responsive (table desktop / cards mobile)
- **Form System** (SP-119) : 7 composants formulaire avec React Hook Form + Zod, 23 schémas de validation
- **Toast System** (SP-122) : Notifications avec Sonner, hook useToast()
- **Modal System** (SP-121) : Modals et loading states
- **Composants métier** (SP-123) : UserCard, TeamCard, AvatarStack
- **Dashboard Components** (SP-142) : StatCard, TrendIndicator, StatsGrid avec types par rôle
- **Charts Recharts** (SP-143) : AreaChartWidget, BarChartWidget, PieChartWidget avec tooltips Shadcn et dark mode
- **Dashboard Services Prisma** (SP-144) : Services data layer par rôle (Employee, Manager, Director, Admin) avec architecture multi-tenant
- **Dashboard Employee** (SP-145) : Page dashboard complète avec Server Components, redirection par rôle, 5 composants métier (Welcome, Stats, Schedule, LeaveBalance donut, QuickActions) + LeaveBalanceCard détaillée CP/RTT avec progress bars
- **Dashboard Director** (SP-147) : Page dashboard directeur avec Server Components, RBAC, 5 composants métier (Welcome, Stats 3 KPIs, TeamsChart, PendingLeaves, QuickActions), liens corrigés vers routes /app/
- **Dashboard Manager** (SP-316) : Page dashboard manager avec Server Components, RBAC, 5 composants métier (ManagerWelcome, ManagerStats, ManagerTeamChart, ManagerPendingLeaves, ManagerQuickActions)
- **Dashboard Super Admin** (SP-148) : Page dashboard admin SaaS avec Server Components, protection SYSTEM_ADMIN, 7 composants (Welcome, Stats, MrrChart, SignupsChart, PlansChart, RecentCompanies, QuickActions)
- **Animations Dashboards** (SP-431) : Animations Framer Motion sur 15 composants (4 dashboards), variants fadeSlideUp/stagger, support prefers-reduced-motion
- **Leave Management UI** (SP-411/SP-412/SP-413/SP-414/SP-415) : 16 composants congés + pages (LeaveTypeBadge, LeaveStatusBadge, LeaveBalanceCard, LeaveBalanceEditDialog, LeaveRequestCard, LeaveRequestForm, LeaveReviewDialog, LeaveConflictWarning, LeaveFilters, LeavesList, LeavesListMobile, LeaveCalendar, LeaveCalendarDay, LeaveStatsBar, LeaveDetailCard, LeaveTimeline) + pages orchestrateur, détail [id], balances + email notification manager + overlay congés Schedule-X
- **Profile Page** (SP-270 à SP-278) : Page profil utilisateur avec Server Components, 7 composants UI, Server Action getProfile, design Cyber Glass 3D avec AnimatedContainer, skeleton loading + Edit Profile Page avec React Hook Form + Zod + Avatar Upload Cloudinary (drag & drop, preview, crop/resize, API route `/api/avatar`) + Change Password Page (indicateur de force 5 critères, 4 niveaux) + Delete Account Page (RGPD Article 17, double confirmation, transaction Prisma cascade) + Export Data Page (RGPD Article 20, JSON)
- **Notifications System** (SP-321 à SP-327) : Système complet avec modèle enrichi (types métier PLANNING/LEAVE/TASK/INCIDENT, priorités LOW/MEDIUM/HIGH/URGENT), factory functions, hooks SWR, composants UI (NotificationBell animé, NotificationList, page historique avec filtres/pagination/actions masse), **SSE temps réel** (NotificationSSEManager singleton, API route /api/notifications/stream, reconnexion auto, NotificationToast sonner, NotificationsProvider global)
- **User Preferences** (SP-433) : Système de préférences avec champ JSON Prisma, types TypeScript, schémas Zod (thème, format date/heure, langue, préférences notifications par canal/type)
- **Settings Hub Page** (SP-274) : Page `/app/settings` avec 5 sections, filtrage RBAC, cards navigables, design Cyber Glass 3D
- **Display Preferences** (SP-276) : Sélection thème, format date/heure, prévisualisation temps réel, architecture Cookie + DB pour persistence SSR, 9 helpers date-fns
- **Notification Preferences** (SP-275) : Gestion par catégorie (Planning, Congés, Tâches, Système) et canal (Email, In-App), optimistic UI
- **Company Settings** (SP-435) : Configuration entreprise (nom, adresse, jours travaillés, horaires, pause déjeuner), validations Zod cross-field, RBAC DIRECTOR/SYSTEM_ADMIN
- **Audit System** (SP-442 à SP-446) : Journal d'audit complet avec modèle Prisma AuditLog (9 actions, 10 types d'entités), service fire-and-forget, page admin avec DataTable TanStack + filtres + export CSV + modal détail JSON, protection anti-injection
- **User Activity Page** (SP-463) : Timeline relative française (`Intl.RelativeTimeFormat`), Server Action filtrant par userId JWT
- **Impersonation Mode** (SP-453, SP-454, SP-456) : Mode support SYSTEM_ADMIN "Voir espace client" avec cookie HttpOnly TTL 3600s, API REST, bannière orange, impersonation guard middleware, subscription guard bypass, audit trail
- **Admin Améliorations** (SP-469 à SP-477) : Service MRR unifié, /api/health sécurisé 3 niveaux, bouton rafraîchir, page utilisateurs cross-entreprises + export CSV, widget essais à risque (3 niveaux urgence), email contact admin, statistiques globales + export PDF (7 indicateurs), notifications SSE admin (4 types + 9 intégrations), broadcast email (Promise.allSettled batch/10, 4 catégories)
- **Solde congés fiche employé** : Affichage CP/RTT sur fiche détail employé avec édition par DIRECTOR/MANAGER/SYSTEM_ADMIN, validation Zod (used ≤ total)
- **Monitoring System** (SP-464, SP-465) : Page admin avec Suspense + skeleton, health check DB (4 checks), KPIs SaaS, répartition abonnements, 4 graphiques Recharts (activité audit 7j, distribution abonnements, top 5 actions, croissance entreprises 30j)

---

## Architecture CSS & Design System

### Direction esthétique "Cyber Glass 3D" (SP-379, SP-259)

- **Design Tokens** (`src/styles/tokens/`) :
  - `colors.ts` : Palettes primitives, sémantiques, glowColors (6 couleurs × 4 intensités), gradients (7 types)
  - `typography.ts` : Fonts, tailles, styles de texte
  - `spacing.ts` : Échelle d'espacement, breakpoints, containers
  - `shadows.ts` : Box shadows, drop shadows, glows, shadow3D (float, inset, cardPremium, stat), neonGlow, textNeon
  - `radius.ts` : Border radius, ring, outline
  - `index.ts` : Export centralisé `tokens` + `tailwindTheme`

- **Animations Framer Motion** (`src/lib/animations/`) :
  - `variants.ts` : Variants d'animation centralisés
  - `presets.ts` : Configurations prédéfinies
  - `config.ts` : Durées, easings, breakpoints motion
  - `hooks/` : `useReducedMotion`, `useScrollAnimation`
  - `AnimatedContainer` / `AnimatedItem` : Composants avec variants fadeInUp/Down/Left/Right, scaleIn, stagger

- **Styles globaux** (`src/app/globals.css`) :
  - CSS Variables theming (HSL), Cyber Glass 3D (`.glass`, `.card-3d`, `.hover-lift`), effets Glow, texte Neon, bordures animées, shimmer-premium, support dark mode

- **Tailwind Config** : Design tokens intégrés, keyframes Radix + custom + Cyber Glass, BoxShadow Cyber Glass, plugin `tailwindcss-animate`

- **Import unifié** :
```typescript
import { motion, fadeInUp, staggerContainer, floatAnimation } from '@/lib/animations'
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container'
import { tokens, colors, glowColors, gradients, shadow3D } from '@/styles/tokens'
```

---

## Landing Page & Pages publiques

### Landing Page (refonte 13 janvier 2026)

Architecture modulaire avec composants réutilisables :
- Hero avec parallaxe, vidéo YouTube embed, 12 cartes fonctionnalités (Lottie), 3 étapes "Comment ça marche", 6 bénéfices, 4 KPIs animés, tarif per-seat 2,90€ avec simulateur interactif (SP-358), FAQ accordion, footer

### Composants Pricing (SP-355)

- `PricingSimulator` : Slider 1-250 employés, calcul temps réel, modes compact/full
- `PricingCard` : Carte tarif per-seat avec features, CTA inscription
- `src/lib/config/pricing.ts` : Source unique de vérité

### Page À propos (15 janvier 2026)

- `/a-propos` : ValueCards (Simplicité, Proximité, Fiabilité), TargetCards (TPE, PME, Grandes entreprises), JSON-LD SEO + LLMs

### Page Tarifs (SP-359 — 6 février 2026)

- `/tarifs` : Hero + Simulateur + 10 fonctionnalités + FAQ 8 questions + CTA
- JSON-LD combiné @graph (SoftwareApplication + FAQPage + WebPage)
- Metadata complète (title, description, keywords, canonical, OG, Twitter Cards)

### Contact

- Formulaire React Hook Form + Zod, animations Framer Motion, infos contact (email, localisation)

---

## Stripe & Billing

### Migration Per-Seat (SP-350 — 9 février 2026)

Migration complète multi-plans → per-seat unique :
- **Phase 1 Backend** : Migration PostgreSQL (SubscriptionPlan simplifié FREE/PER_SEAT, SubscriptionStatus +INCOMPLETE), modèle Subscription 1:1 Company, modèle Payment, seed data, validations Zod, service admin-stats MRR
- **Phase 2 UI** : CompanyCard badges dynamiques, CompanyForm mis à jour, colonnes TanStack Table, 169 tests

### Service Stripe & Webhooks (SP-351)

- `stripe.service.ts` : createCheckoutSession, updateSubscriptionQuantity, cancelSubscription (email + notification), createBillingPortalSession, handleWebhookEvent (8 événements, 5 handlers)
- Route Webhook : Vérification signature HMAC, raw body Next.js 15
- Types TypeScript : 7 interfaces
- 50 tests unitaires

### Server Actions Stripe (SP-352)

5 Server Actions : createCheckoutAction, createBillingPortalAction, getSubscriptionStatusAction, updateSubscriptionQuantityAction, cancelSubscriptionAction

### Billing Pages (SP-356, SP-357)

- `/app/dashboard/billing` : Vue abonnement, portail Stripe, historique paiements
- `/app/dashboard/billing/checkout` : Formulaire souscription avec simulateur, gestion retour Stripe

### Sync Employés → Stripe (SP-439)

Fire-and-forget `syncEmployeeCountToStripe` après CRUD employés (6 intégrations)

### Subscription Guard Middleware (SP-440)

Guard Edge Runtime bloquant les plans FREE expirés (redirect `/app/dashboard/billing`)

### Bannières Trial/PAST_DUE (SP-441)

Bannières progressives avec calcul urgence et CTA contextuels

---

## Phases de développement

### Phase 1 : Infrastructure (04/11/2025)

- SP-1 : Configuration Docker
- SP-2 : Schéma Prisma
- SP-3 : Migration init

### Phase 2 : Architecture

- SP-4 : Architecture src/
- SP-5 : NextAuth v5
- SP-6 : Shadcn/ui
- SP-107 : Composants UI base (Sidebar, Breadcrumb)
- SP-118 : Système de layout
- SP-120 : DataTable avancée production-ready

### Phase 3 : Composants UI (2 décembre 2025)

- SP-119 : Form System (7 composants + 23 schémas Zod)
- SP-121 : Modals et Loading States
- SP-122 : Toast System (Sonner)
- SP-123 : Composants métier (UserCard, TeamCard, AvatarStack)

### Phase 3.5 : Qualité & Déploiement (3 décembre 2025)

- SP-127 : Configuration VPS OVH
- SP-128 : Pipeline CI/CD GitHub Actions
- SP-129 : Page Coming Soon + Premier déploiement

### Phase 3.6 : Tests (5 décembre 2025)

- SP-125 : Configuration Vitest + MSW + Playwright
- SP-126 : Tests unitaires composants UI (474 tests, 83.83% coverage)

### Phase 4 : Authentification (9 décembre 2025)

- SP-109 : Pages d'authentification complètes (SP-136 à SP-141)
- SP-110 : Middleware RBAC & Protection routes (62 tests permissions, 27 tests E2E)

### Phase 5 : Dashboard & CRUD

- SP-142 : Infrastructure Dashboard (StatCard, TrendIndicator, StatsGrid — 186 tests)
- SP-143 : Charts Recharts (4 composants — 88 tests)
- SP-144 : Services Prisma Dashboard par rôle (119 tests)
- SP-145 : Dashboard Employee (91 tests)
- SP-147 : Dashboard Director (87 tests)
- SP-148 : Dashboard Super Admin (115 tests)
- SP-149 : Tests E2E Dashboards (106 tests)
- SP-113 : CRUD Users/Companies/Teams
  - SP-150 : Infrastructure CRUD (types génériques, Zod, hooks)
  - SP-151 : CRUD Companies (SYSTEM_ADMIN)
  - SP-152 : CRUD Employees (DIRECTOR, MANAGER)
  - SP-153 : CRUD Teams (DIRECTOR)
  - SP-154 : Navigation Integration
  - SP-155 : Tests unitaires CRUD (296 tests)
  - SP-156 : Tests E2E CRUD (59 tests)

### Phase 6 : Planning & Congés (janvier 2026)

- SP-392 : Fondations Prisma (Schedule, Availability, enums)
- SP-393 : Validations Zod plannings (47 tests)
- SP-394 : Server Actions CRUD plannings (30 tests)
- SP-395 : Page liste plannings
- SP-396 : Calendrier Schedule-X (desktop + mobile, 18 tests)
- SP-397 : ShiftModal création/édition (30 tests)
- SP-398 : Drag & drop + resize (19 tests)
- SP-399 : Récurrence shifts (36 tests)
- SP-400 : Détection conflits horaires (25 tests)
- SP-401 : CRUD Indisponibilités (54 tests)
- SP-402 : Overlay indisponibilités calendrier (47 tests)
- SP-403 : Export PDF planning (6 tests)
- SP-404 : Export Excel planning (7 tests)
- SP-406 : Panneau heures hebdomadaires + Tests E2E plannings (16 tests) + Type REST + Simplification statuts + Corrections React 19 + Refonte CSS Schedule-X

### Phase 7 : Gestion des Congés (Sprint 13 — janvier 2026)

- SP-407 : Epic Gestion des Congés
- SP-408 : Fondations Prisma (LeaveBalance, halfDay/halfDayPeriod, FAMILY_EVENT, seed)
- SP-409 : Validations Zod + utilitaires (45 tests)
- SP-410 : Server Actions CRUD + Workflow Validation (48 tests)
- SP-411 : Composants UI Leave Management (50 tests)
- SP-412 : Composants Liste & Calendrier (39 tests)
- SP-413 : Page Congés + Orchestrateur (18 tests)
- SP-414 : Pages Détail et Balances (48 tests)
- SP-416 : Tests E2E Leaves (21 tests)

### Phase 8+ : Fonctionnalités avancées (à venir)

- Notifications push et email
- Mode hors-ligne (PWA)
- Application mobile (React Native)
- IA pour optimisation des plannings
- Intégration calendrier (Google/Outlook)
- API publique pour intégrations tierces

---

## Modèle de données détaillé

### 18 modèles Prisma (14 core + 4 NextAuth)

| # | Modèle | Description |
|---|--------|-------------|
| 1 | User | Utilisateurs de la plateforme |
| 2 | Company | Entreprises (multi-tenant) |
| 3 | Employee | Employés liés aux utilisateurs |
| 4 | Team | Équipes par entreprise |
| 5 | Schedule | Plannings/shifts |
| 6 | Availability | Indisponibilités |
| 7 | LeaveRequest | Demandes de congés (halfDay/halfDayPeriod) |
| 8 | LeaveBalance | Soldes congés par employé/année |
| 9 | PersonalTask | Tâches personnelles |
| 10 | IncidentNote | Notes d'incidents (RBAC visibility) |
| 11 | Notification | Notifications (types métier, priorités) |
| 12 | Subscription | Abonnements per-seat 1:1 Company |
| 13 | Payment | Historique paiements Stripe |
| 14 | AuditLog | Journal d'audit |
| 15-18 | Account, Session, VerificationToken, Authenticator | NextAuth v5 |

### 14 enums

1. **UserRole** : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE
2. **SubscriptionPlan** : FREE, PER_SEAT
3. **SubscriptionStatus** : TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE
4. **ScheduleType** : WORK, MEETING, BREAK, TRAINING, REMOTE, ON_CALL, OVERTIME, REST
5. **LeaveType** : PAID_LEAVE, RTT, SICK_LEAVE, UNPAID_LEAVE, PARENTAL_LEAVE, FAMILY_EVENT, OTHER
6. **LeaveStatus** : PENDING, APPROVED, REJECTED, CANCELLED
7. **HalfDayPeriod** : MORNING, AFTERNOON
8. **NotificationType** : INFO, SUCCESS, WARNING, ERROR, SYSTEM, PLANNING, LEAVE, TASK, INCIDENT
9. **NotificationStatus** : UNREAD, READ, ARCHIVED
10. **PaymentStatus** : SUCCEEDED, FAILED, PENDING, REFUNDED
11. **PaymentMethod** : CARD, SEPA, OTHER
12. **IncidentNoteVisibility** : DIRECTOR_ONLY, MANAGER_ONLY, MANAGER_DIRECTOR, ALL
13. **AuditAction** : CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT, STATUS_CHANGE, PERMISSION_CHANGE
14. **AuditEntityType** : USER, COMPANY, EMPLOYEE, TEAM, SCHEDULE, LEAVE, NOTIFICATION, SUBSCRIPTION, PAYMENT, SYSTEM

---

## Tests détaillés

### Couverture Vitest (156 fichiers — 2 814 tests)

> Rationalisation mars 2026 : suppression de tous les tests cosmétiques (rendu pur, attributs SVG, props passthrough). Chaque test restant est justifiable en soutenance CDA.

| Catégorie | Tests |
|-----------|-------|
| RBAC & permissions | 62 |
| Validations Zod (schedules, leaves, stripe, company, audit, availability, profile) | ~185 |
| Server Actions (CRUD complet, exports, monitoring, broadcast) | ~540 |
| Stripe (service, config, sync, webhooks, guard, banner, validations) | ~275 |
| Billing (composants, emails, cron) | ~120 |
| Congés (composants, workflow, overlay, soldes) | ~180 |
| Plannings (actions, récurrence, conflits, export PDF/Excel) | ~90 |
| Audit System (schema, service, injection, actions) | ~105 |
| CRUD composants (companies, employees, teams) | ~280 |
| Dashboard services (base, admin, director, manager, employee) | ~125 |
| Auth (login, register, forgot/reset password, activate) | ~70 |
| Monitoring (actions, health, charts) | ~28 |
| Admin (MRR, health, users, broadcast, contact, trials) | ~45 |
| Hooks (notifications, SSE, conflits, disponibilités, formulaires) | ~115 |
| Composants métier (forms, settings, incidents, tâches, profil) | ~295 |

| Priorité | Fichiers | Tests | Description |
|----------|----------|-------|-------------|
| **A — CRITIQUE** | ~96 | ~1 822 | Logique métier, sécurité, RBAC, Zod, accès données, API |
| **B — UTILE** | ~60 | ~992 | Composants UI complexes, hooks, interactions |
| **C — COSMÉTIQUE** | 0 | 0 | Tous supprimés |

### Tests E2E Playwright (13 fichiers — 189 tests)

| Suite | Tests |
|-------|-------|
| Auth (login/register) | 20 |
| Auth (forgot/reset password) | 16 |
| CRUD Companies | 18 |
| CRUD Employees | 18 |
| CRUD Teams | 14 |
| Leaves (create request) | 4 |
| Leaves (review request) | 5 |
| Billing Subscription (SP-373) | 7 |
| Billing Alerts | 8 |
| Audit Logs (SP-446) | 26 |
| Impersonation (SP-456) | 9 |
| Cookies RGPD | 18 |
| Middleware RBAC | 26 |

Tests desktop sur Chromium. Tous les tests E2E couvrent des workflows critiques.

---

## SEO & Optimisation LLMs

### Optimisations (SP-462)

- Meta tags dynamiques (Next.js 15 Metadata API)
- Open Graph et Twitter Cards
- `src/app/sitemap.ts` — 8 pages publiques avec priorités hiérarchisées
- `src/app/robots.ts` — Bloque /app/, /api/ et pages auth
- Favicon convention Next.js 15
- Schema.org JSON-LD @graph (WebSite, Organization avec logo, SoftwareApplication, FAQPage)
- Canonical URLs, Keywords long-tail français, noindex dashboard

### Pages optimisées SEO

| Page | Meta | Canonical | Structured Data |
|------|------|-----------|-----------------|
| Landing | ✅ | ✅ | WebSite + Organization + SoftwareApplication + FAQPage |
| À propos | ✅ | ✅ | AboutPage + Organization + SoftwareApplication + FAQ |
| Tarifs | ✅ | ✅ | SoftwareApplication + FAQPage + WebPage |
| CGU/CGV/Confidentialité/Mentions/Cookies | ✅ | ✅ | — |

### Optimisation LLMs

- `public/llms.txt` — Résumé structuré (convention llmstxt.org)
- `public/llms-full.txt` — Version détaillée
- JSON-LD @graph 4 schemas sur homepage
- FAQ structurée FAQPage sur homepage et tarifs

---

## Performance & Analytics

### Optimisations

- Code splitting, lazy loading, images Next.js, compression gzip
- Cache Redis, indexes database, React.memo, Suspense boundaries

### Umami Analytics (SP-345 — janvier 2026)

- Self-hosted sur VPS OVH (Docker + PostgreSQL dédié)
- Dashboard : `https://analytics.smartplanning.fr`
- Tracking conditionnel (consentement analytics RGPD)
- Hook `useUmamiTrack()` pour events custom
- `UmamiAnalyticsWrapper` (Server Component) + `UmamiAnalytics` (Client Component)

---

## Monitoring & Admin

### Page Monitoring (SP-464, SP-465)

- `/app/admin/monitoring` SYSTEM_ADMIN avec Suspense + skeleton
- Health Check DB : connexion, latence, pool Prisma, migrations
- KPIs SaaS : entreprises, utilisateurs, MRR, churn
- 4 graphiques Recharts : activité audit 7j, distribution abonnements, top 5 actions, croissance 30j

### Améliorations Admin (SP-468 Epic — février 2026)

- **SP-469** : Service MRR unifié (`mrr.service.ts`) — source de vérité unique
- **SP-470** : Sécurisation /api/health — 3 niveaux d'accès (OWASP A05:2021)
- **SP-471** : RefreshButton avec `router.refresh()` + `useTransition`
- **SP-472** : Page utilisateurs cross-entreprises + export CSV BOM UTF-8
- **SP-473** : Widget essais à risque — classification urgence 3 niveaux
- **SP-474** : Email contact admin → entreprise (React Email + EmailLog)
- **SP-475** : Statistiques globales + export PDF (7 indicateurs `Promise.all`)
- **SP-476** : Notifications SSE SYSTEM_ADMIN (4 types + 9 intégrations fire-and-forget)
- **SP-477** : Broadcast email (`Promise.allSettled` batch/10, 4 catégories)

---

## Accessibilité WCAG 2.1

### Conformité AA (SP-269 — 25 janvier 2026)

- **Skip to Main Content** (WCAG 2.4.1) : Composant `SkipLink`, pattern sr-only + focus visible
- **Tests E2E axe-core** : 14 tests (pages publiques, skip link, keyboard, contrast, forms, ARIA)
- **Lighthouse Audit Script** : Seuil 90%, rapport Markdown
- **Score moyen** : 100%

```bash
npm run test:a11y     # Tests E2E accessibilité
npm run a11y:audit    # Audit Lighthouse
```

---

## CRUD Opérationnels

- **Entreprises** (SYSTEM_ADMIN) : Vue responsive Table desktop / Cards mobile (SP-462)
- **Collaborateurs** (DIRECTOR, MANAGER) : Gestion complète avec permissions RBAC
- **Équipes** (DIRECTOR) : CRUD + gestion des membres

---

*Dernière mise à jour : 13 mars 2026*
