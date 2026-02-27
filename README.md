# SmartPlanning

[![CI - Lint, Test & Build](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml)
[![CD - Build & Deploy](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml)

Plateforme SaaS moderne de gestion intelligente des plannings et équipes d'entreprise (multi-tenant).

## Informations projet

- **Version** : 2.0 (Refonte complète)
- **Statut** : En développement actif
- **Date de démarrage** : 04/11/2025
- **Préfixe Jira** : `SP`
- **URL Production** : https://smartplanning.fr ✅
- **Dernière mise à jour** : 27 février 2026 (Notifications résiliation admin + email directeur, seed Stripe réel, améliorations billing/director/CSV)
- **Déploiement** : SP-158 Phase 4 complété - Nouveau VPS sécurisé avec déploiement automatisé ✅

## Stack technique

### Frontend

- **Framework** : Next.js 15.5.9 (App Router)
- **UI Library** : React 19.0.0
- **Language** : TypeScript 5.7.2
- **Styling** : Tailwind CSS + Shadcn/ui
- **Tables** : TanStack Table v8 + match-sorter-utils
- **State Management** : Zustand (à venir)
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts

### Backend

- **Runtime** : Node.js 20+
- **API** : Next.js API Routes
- **Authentication** : NextAuth v5 (Auth.js)
- **ORM** : Prisma 6.18.0
- **Validation** : Zod
- **Paiement** : Stripe v20.3.1 (per-seat billing)
- **Media Storage** : Cloudinary (avatars)

### Base de données

- **Database** : PostgreSQL 16
- **Cache** : Redis 7
- **Admin** : Adminer

### DevOps

- **Containerization** : Docker + Docker Compose
- **CI/CD** : GitHub Actions ✅ (CI optimisé ~10min, nightly complet, E2E en mode production)
- **Hosting** : VPS OVH (Ubuntu 24.04 LTS) ✅
- **SSL** : Let's Encrypt (auto-renew) ✅
- **Reverse Proxy** : Nginx
- **Monitoring** : Error Boundary React + À définir (Sentry/LogRocket)

## Fonctionnalités principales

### Composants UI production-ready

- **Auth System** (SP-109) : LoginForm, RegisterForm avec React Hook Form + Zod, Server Actions, auto-login, création automatique Employee + LeaveBalance à l'inscription, champ téléphone optionnel
- **DataTable avancée** (SP-120) : Composant de tableau avec tri multi-colonnes, pagination, recherche fuzzy, sélection multi-rows, actions par ligne, responsive (table desktop / cards mobile)
- **Form System** (SP-119) : 7 composants formulaire avec React Hook Form + Zod, 23 schémas de validation
- **Toast System** (SP-122) : Notifications avec Sonner, hook useToast()
- **Modal System** (SP-121) : Modals et loading states
- **Composants métier** (SP-123) : UserCard, TeamCard, AvatarStack
- **Dashboard Components** (SP-142) : StatCard, TrendIndicator, StatsGrid avec types par rôle
- **Charts Recharts** (SP-143) : AreaChartWidget, BarChartWidget, PieChartWidget avec tooltips Shadcn et dark mode
- **Dashboard Services Prisma** (SP-144) : Services data layer par rôle (Employee, Manager, Director, Admin) avec architecture multi-tenant
- **Dashboard Employee** (SP-145) : Page dashboard complète avec Server Components, redirection par rôle, 5 composants métier (Welcome, Stats, Schedule, LeaveBalance, QuickActions)
- **Dashboard Director** (SP-147) : Page dashboard directeur avec Server Components, RBAC, 5 composants métier (Welcome, Stats 3 KPIs, TeamsChart, PendingLeaves, QuickActions), liens corrigés vers routes /app/
- **Dashboard Manager** (SP-316) : Page dashboard manager avec Server Components, RBAC, 5 composants métier (ManagerWelcome, ManagerStats, ManagerTeamChart, ManagerPendingLeaves, ManagerQuickActions)
- **Dashboard Super Admin** (SP-148) : Page dashboard admin SaaS avec Server Components, protection SYSTEM_ADMIN, 7 composants (Welcome, Stats, MrrChart, SignupsChart, PlansChart, RecentCompanies, QuickActions)
- **Animations Dashboards** (SP-431) : Animations Framer Motion sur 15 composants (4 dashboards), variants fadeSlideUp/stagger, support prefers-reduced-motion
- **Leave Management UI** (SP-411/SP-412/SP-413/SP-414/SP-415) : 16 composants congés + pages (LeaveTypeBadge, LeaveStatusBadge, LeaveBalanceCard, LeaveBalanceEditDialog, LeaveRequestCard, LeaveRequestForm, LeaveReviewDialog, LeaveConflictWarning, LeaveFilters, LeavesList, LeavesListMobile, LeaveCalendar, LeaveCalendarDay, LeaveStatsBar, LeaveDetailCard, LeaveTimeline) + pages orchestrateur, détail [id], balances + email notification manager + overlay congés Schedule-X
- **Profile Page** (SP-270, SP-271, SP-272, SP-273, SP-277, SP-278) : Page profil utilisateur avec Server Components, 7 composants UI (ProfileHeader, PersonalInfoCard, ProfessionalInfoCard, AccountInfoCard, ProfileActions, ProfilePageContent, InfoRow), Server Action getProfile, design Cyber Glass 3D avec AnimatedContainer, skeleton loading + **Edit Profile Page** avec React Hook Form + Zod validation, champs modifiables (prénom, nom, téléphone, poste, date d'embauche), date picker Calendar avec locale FR, Server Action updateProfile, gestion SYSTEM_ADMIN sans Employee + **Avatar Upload Cloudinary** (SP-272) avec drag & drop, preview en temps réel, crop/resize automatique, API route `/api/avatar` (POST upload, DELETE suppression), stockage Cloudinary CDN, affichage dans navbar, plannings mobiles, liste et calendrier des congés + **Change Password Page** avec indicateur de force en temps réel (5 critères, 4 niveaux), 3 toggles visibilité indépendants, Server Action changePassword sécurisée (bcrypt) + **Delete Account Page** (RGPD Article 17) avec double confirmation (email + password), checkbox consentement, transaction Prisma cascade, logs traçabilité, déconnexion automatique après suppression + **Export Data Page** (RGPD Article 20) avec téléchargement JSON de toutes les données personnelles (compte, profil, plannings, congés, disponibilités, tâches, notifications), exclusion données sensibles (mots de passe, tokens), 273 tests unitaires + 78 tests E2E
- **Notifications System** (SP-321, SP-322, SP-323, SP-324, SP-325, SP-326, SP-327) : Système de notifications complet avec modèle enrichi (types métier PLANNING/LEAVE/TASK/INCIDENT, priorités LOW/MEDIUM/HIGH/URGENT), factory functions par domaine, hooks SWR (useNotificationsCount, useNotifications, useNotificationsPaginated avec optimistic updates), composants UI (NotificationBell avec badge animé Framer Motion, NotificationList dropdown, page historique /app/dashboard/notifications avec filtres type/statut, pagination, actions en masse mark all read/delete all read), **notifications temps réel SSE** (Server-Sent Events avec NotificationSSEManager singleton, API route /api/notifications/stream, useNotificationsStream hook avec reconnexion auto, NotificationToast avec sonner, NotificationsProvider global), 187 tests unitaires
- **User Preferences** (SP-433) : Système de préférences utilisateur avec champ JSON Prisma (User.preferences), types TypeScript complets (UserPreferences, DisplayPreferences, NotificationPreferences), schémas Zod pour validation (thème light/dark/system, format date DD/MM/YYYY|MM/DD/YYYY|YYYY-MM-DD, format heure 24h/12h, langue fr/en, préférences notifications par canal email/inApp et type planning/leaves/tasks/system), helpers parsing/serialization avec deep merge des valeurs par défaut, 62 tests unitaires
- **Settings Hub Page** (SP-274) : Page centrale des paramètres `/app/settings` avec Server Component, 5 sections (Profil, Apparence, Notifications, Sécurité, Entreprise), filtrage RBAC (section Entreprise visible uniquement DIRECTOR/SYSTEM_ADMIN), cards navigables avec badges "Bientôt" pour sections futures, design Cyber Glass 3D avec AnimatedContainer stagger, skeleton loading, 25 tests unitaires + 15 tests E2E
- **Display Preferences** (SP-276) : Page préférences d'affichage `/app/settings/appearance` avec sélection thème (Système/Clair/Sombre via next-themes), format de date (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD), format d'heure (24h, 12h), prévisualisation en temps réel. Architecture Cookie + DB pour persistence SSR sans flash. Server Actions (getDisplayPreferences, updateDisplayPreferences, syncPreferencesFromCookie, resetDisplayPreferences). Helpers date-fns (9 fonctions : formatDate, formatTime, formatDateTime, formatRelativeDate, formatShortDate, formatLongDate, formatWeekday, formatMonthYear, createFormatter). 43 tests unitaires + 18 tests E2E
- **Notification Preferences** (SP-275) : Page préférences de notifications `/app/settings/notifications` avec gestion par catégorie (Planning, Congés, Tâches, Système) et par canal (Email, In-App). Switches toggle pour chaque combinaison catégorie/canal. Architecture optimistic UI avec useTransition. Server Actions (getNotificationPreferences, updateNotificationPreferences, resetNotificationPreferences). Helper notification-categories.ts pour mapping NotificationType → catégorie. Intégration factory functions notifications (vérification préférences avant création). 27 tests unitaires + 14 tests E2E. Badge "Bientôt" retiré de section Notifications
- **Company Settings** (SP-435) : Page paramètres entreprise `/app/settings/company` pour DIRECTOR et SYSTEM_ADMIN. Configuration du nom et adresse de l'entreprise, jours travaillés (7 checkboxes + 3 presets Lun-Ven, Lun-Sam, Tous), horaires de travail (ouverture/fermeture), pause déjeuner (toggle + horaires). Types TypeScript (DayOfWeek, CompanySettings, LunchBreakSettings), validations Zod avec cross-field validation, Server Actions (getCompanySettings, updateCompanySettings, resetCompanySettings) avec RBAC strict. Architecture optimistic UI avec rollback. Stockage Prisma (Company.workingDays, Company.workingHoursStart/End, Company.defaultOpeningHours JSON pour lunch break). 19 tests unitaires + 21 tests E2E. Badge "Bientôt" retiré de section Entreprise
- **Audit System** (SP-442, SP-443, SP-444, SP-445, SP-446) : Journal d'audit complet avec modèle Prisma AuditLog (9 actions, 10 types d'entités), service `logAuditAction` fire-and-forget, Server Actions RBAC (`getAuditLogs` paginé avec filtres, `exportAuditLogsCsv`), page admin `/app/admin/logs` avec DataTable TanStack, filtres action/entité/utilisateur/date, export CSV, modal détail JSON. Protection anti-injection (sanitization HTML/SQL/NoSQL). 122 tests unitaires + 26 tests E2E
- **User Activity Page** (SP-463) : Page activité utilisateur `/app/profile/activity` avec timeline relative française (`Intl.RelativeTimeFormat`). Server Action `getUserActivity` filtrant par userId JWT avec isolation RBAC. Accès depuis Header dropdown "Mon activité" et ProfileActions. 17 tests unitaires
- **Impersonation Mode** (SP-453, SP-454, SP-456) : Mode support SYSTEM_ADMIN "Voir espace client" avec cookie `sp-impersonation` (HttpOnly, TTL 3600s). API REST `/api/admin/impersonate` (POST start, DELETE stop), bannière orange avec nom entreprise et bouton quitter, impersonation guard middleware (blocage routes admin/billing), subscription guard bypass en mode impersonation (évite boucle redirect infinie), fallback cookie dans layout.tsx (résilience updateSession NextAuth v5), audit trail start/stop. Page Object Model Playwright (ImpersonationPage). 10 tests unitaires + 9 tests E2E
- **Admin SYSTEM_ADMIN Améliorations** (SP-469 à SP-477) : Service MRR unifié (source de vérité unique), sécurisation endpoint /api/health (3 niveaux d'accès, OWASP A05), bouton rafraîchir monitoring (router.refresh + useTransition), page utilisateurs cross-entreprises avec export CSV (jointure cross-tenant contrôlée), widget essais à risque (classification urgence 3 niveaux, MRR potentiel), email contact admin vers entreprise (template React Email, EmailLog), statistiques globales avec export PDF (7 indicateurs Promise.all, @react-pdf/renderer), notifications SSE temps réel SYSTEM_ADMIN (4 types, fire-and-forget), broadcast email global (Promise.allSettled batch/10, 4 catégories). 75 tests unitaires
- **Monitoring System** (SP-464, SP-465) : Page monitoring admin `/app/admin/monitoring` avec Suspense + skeleton loading. **SP-464 MVP** : Server Action `getMonitoringSnapshot` RBAC SYSTEM_ADMIN (health check DB, quick stats SaaS, répartition abonnements), 8 composants (HealthStatusBadge, DatabaseHealthPanel avec ProgressBar pool, MonitoringKpisGrid 4 KPIs glass cards, SubscriptionBreakdownPanel badges colorés par statut), service `checkDatabaseHealth` (4 checks : connexion, latence, pool, migrations), 30 tests unitaires. **SP-465 Charts** : Server Action `getMonitoringChartData` (auditActivity 7j, subscriptionDistribution, topActions top 5, companyGrowth 30j), 4 composants Recharts (ActivityChart AreaChartWidget, SubscriptionPieChart donut avec STATUS_COLORS sémantiques, TopActionsChart BarChartWidget horizontal avec ACTION_LABELS FR, CompanyGrowthChart AreaChartWidget), helper `generateEmptyDays` pour zero-fill, 22 tests unitaires. Total : 52 tests unitaires

### MVP (Phases 1-4)

- Authentification multi-rôles (4 rôles : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE)
- Gestion multi-tenant (isolation complète par entreprise)
- Dashboard personnalisé par rôle avec KPIs
- Gestion des employés et départements
- Planning avec calendrier Schedule-X (vues jour/semaine/mois, responsive mobile, drag & drop)
- Gestion des shifts et affectations (8 types dont REST)
- Panneau heures hebdomadaires (planifié vs contrat, code couleur)
- Détection de conflits horaires temps réel
- Gestion des indisponibilités avec overlay calendrier
- Récurrence des shifts (quotidien, hebdomadaire, bi-hebdomadaire, mensuel)
- Export PDF/Excel/CSV des plannings (avec filtres actifs et compteur heures)
- Export CSV employés enrichi (équipe, rôle, ancienneté, contrat, tri par équipe, nom fichier dynamique) et congés avec RBAC
- Suppression en masse employés avec cascade sécurisée
- Nom d'entreprise dynamique dans le layout
- Demandes de congés avec workflow validation
- Système de notifications temps réel
- Analytics et rapports

### CRUD Opérationnels

- **Entreprises** (SYSTEM_ADMIN) : Liste avec vue responsive (Table desktop / Cards mobile SP-462), création, édition, suppression avec filtres
- **Collaborateurs** (DIRECTOR, MANAGER) : Gestion complète avec permissions RBAC
- **Équipes** (DIRECTOR) : CRUD + gestion des membres

### Architecture CSS & Animations (SP-379, SP-259 - 31 janvier 2026)

Système de design unifié et centralisé avec direction esthétique **"Cyber Glass 3D"** :

- **Design Tokens** (`src/styles/tokens/`) :
  - `colors.ts` : Palettes primitives, sémantiques, **glowColors** (6 couleurs × 4 intensités), **gradients** (7 types)
  - `typography.ts` : Fonts, tailles, styles de texte
  - `spacing.ts` : Échelle d'espacement, breakpoints, containers
  - `shadows.ts` : Box shadows, drop shadows, glows, **shadow3D** (float, inset, cardPremium, stat), **neonGlow**, **textNeon**
  - `radius.ts` : Border radius, ring, outline
  - `index.ts` : Export centralisé `tokens` + `tailwindTheme`
  - Tests complets : 129 tests unitaires

- **Animations Framer Motion** (`src/lib/animations/` + `src/components/ui/animated-container.tsx`) :
  - `variants.ts` : Tous les variants d'animation centralisés
  - `presets.ts` : Configurations d'animation prédéfinies
  - `config.ts` : Durées, easings, breakpoints motion
  - `hooks/` : `useReducedMotion`, `useScrollAnimation`
  - `AnimatedContainer` : Composant avec variants fadeInUp/Down/Left/Right, scaleIn, stagger
  - `AnimatedItem` : Élément enfant pour animations stagger
  - Tests complets : 102 tests unitaires

- **Styles globaux** (`src/app/globals.css`) :
  - CSS Variables pour le theming (couleurs HSL, radius, sidebar)
  - **Cyber Glass 3D** : `.glass`, `.glass-strong`, `.card-3d`, `.hover-lift`, `.hover-lift-glow`
  - **Effets Glow** : `.glow-primary`, `.glow-accent`, `.glow-cyan`
  - **Texte Neon** : `.text-neon-primary`, `.text-neon-accent`, `.text-neon-cyan`
  - **Bordures animées** : `.border-gradient-primary`, `.border-gradient-animated`
  - **Animations** : `.shimmer-premium`, `.pulse-glow`, `.float`, `.bg-mesh`
  - Support dark mode préparé (variables `.dark`)
  - Scrollbar personnalisée (Webkit)

- **Tailwind Config** (`tailwind.config.ts`) :
  - Intègre les design tokens TypeScript
  - Keyframes Radix : `accordion-down`, `accordion-up`
  - Keyframes custom : `fade-in`, `scale-in`, `slide-up/down/left/right`
  - **Keyframes Cyber Glass** : `shimmer-slide`, `pulse-glow`, `float`, `gradient-rotate`, `border-pulse`
  - **BoxShadow Cyber Glass** : `float-*`, `glow-*`, `card-premium`, `stat-*`, `glass-*`
  - Plugin `tailwindcss-animate` pour Shadcn/ui

- **CSS Modules** (`landing.module.css`) : Styles spécifiques landing (glassmorphism, gradients)

- **Page Démo** (`/app/dev/design-system`) : Référentiel visuel interactif de tous les effets Cyber Glass 3D

**Import unifié** :

```typescript
// Animation system - import unique
import {
  motion,
  fadeInUp,
  staggerContainer,
  floatAnimation,
} from '@/lib/animations'

// AnimatedContainer pour les pages
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'

// Design tokens - import unique
import {
  tokens,
  colors,
  glowColors,
  gradients,
  shadow3D,
} from '@/styles/tokens'
```

> **Note** : L'ancien répertoire `src/app/(landing)/animations/` a été supprimé. Tous les composants utilisent maintenant `@/lib/animations`.

### Landing Page (Refonte complète - 13 janvier 2026)

- **Architecture modulaire** : Composants réutilisables avec séparation des préoccupations
- **SectionHeader** : Composant unifié pour tous les headers de section (6 variantes de couleurs)
- **Animations Framer Motion** : Variants centralisés (fadeInUp, staggerContainer, float, glow)
- **Données centralisées** : `data/index.ts` avec types TypeScript (features, benefits, pricing, FAQs)
- **Sections** :
  - Hero : Animation parallaxe au scroll, logo animé, CTA responsive
  - Vidéo YouTube : Embed avec miniature custom, badge animé
  - Fonctionnalités : 12 cartes avec animation Lottie, badge "À venir" pour IA
  - Comment ça marche : 3 étapes avec connecteurs animés
  - Avantages : Grille 6 bénéfices + image avant/après
  - Statistiques : 4 KPIs avec compteurs animés
  - Tarification : Tarif unique per-seat (2,90 €/employé/mois) avec simulateur interactif et carte tarif (SP-358)
  - FAQ : Accordion avec sticky sidebar
  - CTA : Section finale avec gradient
  - Footer : Liens, newsletter, réseaux sociaux (LinkedIn, Instagram, TikTok)
- **Contact** : Formulaire avec React Hook Form + Zod, animations Framer Motion
- **Navigation** : 7 liens avec scroll smooth, menu mobile fullscreen animé, lien /tarifs dédié
- **SEO** : Meta tags, Open Graph, sémantique HTML5
- **Composants Pricing réutilisables** (SP-355) :
  - `PricingSimulator` : Simulateur interactif slider 1-250 employés, calcul temps réel, modes compact/full
  - `PricingCard` : Carte tarif per-seat avec features incluses, CTA vers inscription
  - `src/lib/config/pricing.ts` : Source unique de vérité (prix, constantes, fonctions calcul)
  - 55 tests unitaires (23 config + 20 simulateur + 12 carte)
- **Performance** : Dynamic imports (Lottie), images optimisées Next.js

### Page À propos (15 janvier 2026)

- **URL** : `/a-propos`
- **Architecture** : Route group `(about)` avec composants dédiés
- **Composants** :
  - `AboutContent` : Contenu principal avec sections animées
  - `ValueCard` : Cartes valeurs (Simplicité, Proximité, Fiabilité)
  - `TargetCard` : Cartes cibles (TPE, PME, Grandes entreprises)
  - `StructuredData` : JSON-LD pour SEO et LLMs
- **SEO avancé** : Optimisation pour moteurs de recherche ET LLMs (ChatGPT, Claude, Perplexity)
- **Design** : Cohérent avec la landing page (dark theme, animations Framer Motion)

### Page Tarifs (SP-359 - 6 février 2026)

- **URL** : `/tarifs`
- **Architecture** : Route group `(about)` avec Server Component (metadata) + Client Component (contenu animé)
- **Composants** :
  - `PricingPageContent` : Client Component avec 5 sections (Hero, Simulateur, Fonctionnalités, FAQ, CTA)
  - `StructuredData` : JSON-LD combiné `@graph` (SoftwareApplication + FAQPage + WebPage)
- **Sections** :
  - **Hero** : Badge, titre h1 SEO, description déclarative avec prix 2,90 €
  - **Simulateur** : `PricingSimulator` mode full avec message contact dynamique (>50 employés)
  - **Fonctionnalités** : 10 features incluses + `PricingCard` avec CTA
  - **FAQ** : 8 questions/réponses avec accordéon animé (Framer Motion AnimatePresence)
  - **CTA** : Bouton inscription avec texte de réassurance
- **SEO avancé** : Metadata complète (title, description, keywords, canonical, Open Graph, Twitter Cards)
- **Données structurées** : SoftwareApplication (prix, features, limites), FAQPage (8 questions), WebPage (breadcrumbs)
- **Optimisation LLMs** : JSON-LD riche pour ChatGPT, Claude, Perplexity, Gemini
- **Navigation** : Liens mis à jour dans LandingHeader, LandingFooter, PricingSection, NotFoundPage (`/#pricing` → `/tarifs`)
- **Tests** : 34 tests unitaires (22 PricingPageContent + 12 StructuredData)

### Migration Per-Seat Subscription Model (SP-350 - 9 février 2026)

Migration complète du modèle d'abonnement multi-plans vers un modèle per-seat unique :

- **Phase 1 : Backend & Prisma** :
  - Migration PostgreSQL : `SubscriptionPlan` simplifié (FREE, PER_SEAT), `SubscriptionStatus` enrichi (+INCOMPLETE pour 3D Secure Stripe)
  - Modèle `Subscription` avec relation 1:1 Company (plan, status, quantity, pricePerEmployee en centimes)
  - Modèle `Payment` pour historique paiements Stripe
  - Seed data mis à jour (2 plans au lieu de 4, statuts réalistes, vrais clients Stripe Test avec fallback faux IDs si Stripe indisponible, cleanup automatique des anciens clients seed via metadata)
  - Validations Zod (company.ts) : labels FR, couleurs, descriptions pour 2 plans + 6 statuts
  - Service `admin-stats` : calcul MRR basé sur quantity × pricePerEmployee depuis table Subscription
  - Actions companies : types `CompanySubscription`, `CompanyWithCounts`, `CompanyDetail` avec relation subscription dans tous les selects Prisma

- **Phase 2 : UI & Tests** :
  - `CompanyCard` : badges dynamiques avec labels/couleurs importés depuis validations
  - `CompanyForm` : schéma Zod mis à jour (FREE/PER_SEAT + INCOMPLETE)
  - `columns.tsx` : colonnes TanStack Table en mode `id` (colonnes virtuelles) pour lecture relation subscription
  - `[id]/page.tsx` : badges édition avec fallback `company.subscription?.plan ?? 'FREE'`
  - 169 tests mis à jour couvrant 9 fichiers de test (validations, actions, composants UI, services)

- **Suppression complète** : Plans STARTER, BUSINESS, ENTERPRISE supprimés du codebase (0 occurrence dans src/)

### Stripe Service & Webhooks (SP-351 - 9 février 2026)

Service Stripe complet pour la gestion des abonnements per-seat et le traitement des webhooks :

- **Service Stripe** (`src/lib/services/stripe/stripe.service.ts`) :
  - `createCheckoutSession` : Création session Checkout avec customer Stripe, prix per-seat, metadata SmartPlanning
  - `updateSubscriptionQuantity` : Mise à jour quantité sièges (ajout/retrait employés)
  - `cancelSubscription` : Annulation immédiate ou à fin de période, email confirmation au directeur (template pro `SubscriptionCanceledEmail`), notification in-app + email aux SYSTEM_ADMIN (fire-and-forget)
  - `createBillingPortalSession` : Accès au portail de facturation client
  - `handleWebhookEvent` : Dispatcher d'événements webhook (8 événements gérés)
  - 5 handlers internes : checkout completed, subscription updated/deleted, invoice paid/failed
  - Compatibilité Stripe SDK v20.3.1 (API `2026-01-28.clover`) avec types natifs

- **Route Webhook** (`src/app/api/webhooks/stripe/route.ts`) :
  - Vérification signature HMAC via `stripe.webhooks.constructEvent()`
  - Lecture raw body via `request.text()` (Next.js 15 App Router)
  - Gestion erreurs structurée (400 signature invalide, 500 erreur interne)

- **Types TypeScript** (`src/types/stripe.ts`) :
  - 7 interfaces : `CreateCheckoutSessionInput`, `UpdateSubscriptionQuantityInput`, `CancelSubscriptionInput`, `CreateBillingPortalInput`, `CheckoutSessionResult`, `BillingPortalResult`, `WebhookHandlerResult`
  - Exports centralisés dans `src/types/index.ts`

- **Tests** : 50 tests unitaires (40 service + 10 route webhook)

### Server Actions Stripe (SP-352 - 9 février 2026)

5 Server Actions connectant le service Stripe (SP-351) au frontend avec authentification RBAC, validation Zod et conversion ServiceResult → CrudActionResult :

- **Actions** (`src/lib/actions/stripe.ts`) :
  - `createCheckoutAction` : Crée une session Stripe Checkout pour souscrire à un abonnement per-seat. Récupère l'email via `auth()` (non disponible dans AuthenticatedUser) et le nom d'entreprise via Prisma. Retourne l'URL de redirection Stripe.
  - `createBillingPortalAction` : Crée une session Billing Portal pour gérer l'abonnement existant. Récupère le `stripeCustomerId` depuis la table Subscription.
  - `updateSubscriptionQuantityAction` : Met à jour la quantité de sièges d'un abonnement (ajout/retrait employés). Déclenche un prorata automatique côté Stripe. Revalidation du path billing.
  - `cancelSubscriptionAction` : Annule un abonnement en fin de période (défaut) ou immédiatement. Revalidation du path billing.
  - `getBillingDataAction` : Récupère les données de facturation pour le dashboard billing (subscription, 5 derniers paiements, nombre d'employés actifs, montant mensuel calculé, trialEndsAt). Requêtes Prisma parallèles via `Promise.all` (subscription + payments + employeeCount + company).

- **Patterns techniques** :
  - RBAC strict : toutes les actions réservées au rôle `DIRECTOR` via `checkPermission('DIRECTOR')`
  - Validation Zod via `validateData(schema, input)` avec schémas `checkoutSessionSchema`, `updateSubscriptionQuantitySchema`, `customerPortalSchema`
  - Conversion `ServiceResult<T>` → `CrudActionResult<T>` (discriminated union)
  - Retour URL au lieu de `redirect()` — le client gère le loading state et la redirection navigateur
  - `revalidatePath()` uniquement pour les mutations (updateQuantity, cancel)
  - Guard `companyId` — SYSTEM_ADMIN gère via admin panel, pas via billing

- **Types** (`src/types/stripe.ts`) :
  - Interface `BillingData` enrichie (subscription avec currentPeriodStart, canceledAt, createdAt, stripeCustomerId ; payments avec stripeInvoiceId, paymentMethod ; trialEndsAt au niveau racine)
  - Export centralisé dans `src/types/index.ts`

- **Tests** : 32 tests unitaires couvrant auth denied, RBAC denied, companyId null, validation Zod, missing subscription/customer, erreurs service Stripe, happy paths, revalidatePath, calcul monthlyAmount, erreurs Prisma

### Dashboard Billing (SP-360 - 9 février 2026)

Page dashboard facturation complète avec 3 sous-composants, accessible aux DIRECTOR uniquement :

- **Page** (`src/app/app/dashboard/billing/page.tsx`) :
  - Server Component avec auth check + RBAC DIRECTOR
  - Fetch `getBillingDataAction` + sérialisation des dates (Date → ISO string pour transfer Server→Client)
  - Metadata SEO : `title: "Facturation | SmartPlanning"`
  - Loading skeleton (`loading.tsx`) avec 3 cartes skeleton

- **Composants** (`src/app/app/dashboard/billing/_components/`) :
  - `BillingPageContent` : Orchestrateur Client Component, gestion des Server Actions (portail Stripe, annulation), AlertDialog confirmation, gestion erreurs
  - `SubscriptionStatus` : Statut abonnement avec 6 badges (TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE), countdown essai gratuit, alerte annulation programmée, EmptyState si pas d'abonnement
  - `UsageIndicator` : Jauge utilisation sièges (ProgressBar colorée : vert <80%, orange 80-99%, rouge ≥100%), prix unitaire/total, info prorata tooltip
  - `InvoiceHistory` : Historique 5 dernières factures (Table avec badges statut Payé/Échoué/En attente, liens invoiceUrl Stripe directes, EmptyState)
  - `index.ts` : Barrel export composants + types

- **Navigation** :
  - Entrée "Facturation" ajoutée dans `src/lib/navigation/menu-items.ts` avec icône CreditCard, rôle DIRECTOR, raccourci `G B`

- **Sérialisation** :
  - Types `SerializedBillingData`, `SerializedSubscription`, `SerializedPayment` (dates en ISO strings)
  - Fonction `serializeBillingData()` dans page.tsx pour conversion Date → string

- **Design** :
  - Glassmorphism (glass-strong, bg-gradient-to-r, text-neon-primary)
  - Framer Motion avec `useReducedMotion()` fallback
  - Layout responsive : SubscriptionStatus pleine largeur, UsageIndicator + InvoiceHistory en grille 2 colonnes

- **Tests** : 41 tests unitaires (4 fichiers) :
  - `SubscriptionStatus.test.tsx` (16 tests) : 6 badges statut, countdown essai, alerte annulation, EmptyState, callbacks
  - `UsageIndicator.test.tsx` (8 tests) : compteur employés, sièges, % utilisation, plafond 100%, prix
  - `InvoiceHistory.test.tsx` (11 tests) : table, badges statut, liens Stripe, état vide, callback portail
  - `BillingPageContent.test.tsx` (6 tests) : rendu 3 sous-composants, gestion null, action portail

### Synchronisation Employés → Stripe Quantity (SP-439 - 9 février 2026)

Synchronisation automatique du nombre d'employés actifs vers la quantité de l'abonnement Stripe avec prorata :

- **Service `syncEmployeeCountToStripe(companyId)`** :
  - Compte les employés actifs (`isActive: true`) de la company
  - Compare avec la quantité actuelle de l'abonnement Stripe
  - Met à jour via `stripe.subscriptions.update()` avec `proration_behavior: 'create_prorations'`
  - Synchronise `quantity` et `planPrice` en base Prisma
  - Ne throw jamais : retourne un `SyncResult` typé (synced, previousQuantity, newQuantity, reason)
  - Skip intelligent : pas de subscription, pas de stripeSubscriptionId, statuts TRIAL/CANCELED/EXPIRED/INCOMPLETE, quantité inchangée
  - `Math.max(1, employeeCount)` — Stripe exige quantity >= 1
  - Logging structuré `[StripeSync]` avec action, companyId, quantities, timestamp

- **Intégration Server Actions employés** :
  - `createEmployee` → sync fire-and-forget après création
  - `deleteEmployee` → sync fire-and-forget après suppression
  - `toggleEmployeeStatus` → sync fire-and-forget après toggle isActive
  - `bulkDeleteEmployees` → sync fire-and-forget par companyId unique (Set)
  - Pattern `.catch()` pour ne jamais bloquer la réponse CRUD

- **Fichiers** :
  - `src/lib/services/stripe/subscription-sync.service.ts` (nouveau) : service de synchronisation
  - `src/lib/services/stripe/index.ts` : barrel export mis à jour
  - `src/lib/actions/employees.ts` : intégration sync dans 4 actions CRUD

- **Tests** : 33 tests unitaires (subscription-sync: 27, employees SP-439: 6)

### Bannières Progressives Subscription (SP-441 - 9 février 2026)

Bannières d'avertissement progressives affichées globalement sur toutes les pages `/app/*` avant l'expiration du trial ou pendant la période de grâce PAST_DUE :

- **Fonction pure `getSubscriptionBannerConfig()`** :
  - Même pattern que `checkSubscriptionAccess()` (SP-440) : pure, Edge-compatible, 0 dépendance React
  - Calcul du palier selon `subscriptionStatus`, `trialEndsAt`, `currentPeriodEnd`
  - Constantes `TRIAL_BANNER_THRESHOLDS` exportées (INFO: 14j, WARNING: 6j, URGENT: 3j)

- **Paliers progressifs trial** :
  - `info` (bleu, 7-14 jours) : "Essai gratuit : X jours restants" — dismissable
  - `warning` (orange, 4-6 jours) : "Plus que X jours — Abonnez-vous" — dismissable
  - `urgent` (rouge, 1-3 jours) : "Expire dans X jour(s) !" — NON dismissable

- **Bannière PAST_DUE** : warning orange pendant les 7 jours de grâce, non dismissable

- **Composant `SubscriptionBanner`** :
  - Client Component dans `components/layout/`, inséré entre Header et main
  - Dismiss par palier via `localStorage` (réapparaît au changement de tier)
  - Exclusion page billing (alertes SP-440 déjà présentes)
  - Accessibilité : `role="alert"` (urgent) / `role="status"` (info/warning)
  - Design tokens CSS existants : `--info`, `--warning`, `--destructive`

- **Intégration layout** :
  - Props `subscriptionData` passées depuis Server Component `layout.tsx` via `session.user`
  - Pattern Server→Client props (pas de `useSession`/`SessionProvider`)

- **Héro conversion page billing** :
  - Section CTA proéminente quand `reason=trial_expired` ou `no_subscription`
  - Icône contextuelle, prix dynamique via `PRICING.PRICE_PER_EMPLOYEE`, scroll anchor

- **Fichiers** :
  - `src/lib/subscription-banner.ts` (nouveau) : fonction pure + types + constantes
  - `src/components/layout/SubscriptionBanner.tsx` (nouveau) : composant bannière
  - `src/app/app/layout.tsx` : ajout `subscriptionData` props
  - `src/components/layout/DashboardLayout.tsx` : insertion bannière
  - `src/app/.../BillingPageContent.tsx` : héro conversion

- **Tests** : 73 tests unitaires (44 logique paliers + 29 composant)

### Subscription Guard Middleware (SP-440 - 9 février 2026)

Middleware de vérification d'abonnement actif dans le Edge Runtime Next.js 15. Architecture Defense in Depth en 3 couches :

- **Couche 1 — JWT enrichi (Edge Runtime)** :
  - Token JWT enrichi avec `subscriptionStatus`, `trialEndsAt`, `currentPeriodEnd`, `subscriptionCheckedAt`
  - Le middleware lit ces champs pour décider l'accès → 0ms de latence ajoutée
  - Fonction pure `checkSubscriptionAccess()` dans `src/lib/subscription-guard.ts` (Edge-compatible, 0 dépendance Node.js)

- **Couche 2 — Rafraîchissement périodique (Node.js)** :
  - Le callback `jwt()` rafraîchit les données toutes les 5 min via `import('@/lib/prisma')` dynamique
  - En Edge Runtime, l'import échoue silencieusement (catch) — le token garde ses valeurs
  - Côté serveur (Server Components via `auth()`), l'import réussit et les données sont rafraîchies

- **Couche 3 — Webhook Stripe** :
  - Les webhooks (SP-351) mettent déjà à jour la DB
  - Le prochain appel `auth()` côté serveur déclenche la couche 2

- **Matrice des statuts** :
  - `ACTIVE` → autorisé
  - `TRIAL` + `trialEndsAt` futur → autorisé ; passé → bloqué (`trial_expired`)
  - `PAST_DUE` < 7 jours → autorisé (grâce) ; ≥ 7 jours → bloqué (`payment_overdue`)
  - `CANCELED` → bloqué (`subscription_canceled`)
  - `EXPIRED` → bloqué (`subscription_expired`)
  - `INCOMPLETE` → bloqué (`payment_incomplete`)
  - `null` → bloqué (`no_subscription`)

- **Bypass** :
  - `SYSTEM_ADMIN` : pas lié à une company
  - Routes exemptées : `/app/dashboard/billing`, `/app/profile`, `/app/settings`

- **Page billing enrichie** :
  - Alerte contextuelle selon le query param `?reason=XXX` (6 motifs, 2 variantes warning/destructive)
  - `data-testid="subscription-blocking-alert"` pour les tests

- **Fichiers** :
  - `src/lib/subscription-guard.ts` (nouveau) : fonction pure + types + constante `PAST_DUE_GRACE_DAYS`
  - `src/types/auth.ts` : interfaces JWT/Session/User étendues + `SUBSCRIPTION_EXEMPT_ROUTES`
  - `src/lib/auth.config.ts` : callbacks jwt/session/authorized enrichis (étape 7)
  - `src/lib/auth.ts` : `authorize()` enrichi avec données subscription Prisma

- **Tests** : 31 tests unitaires couvrant la matrice complète (bypass SYSTEM_ADMIN, routes exemptées, ACTIVE, TRIAL valide/expiré, PAST_DUE grâce/dépassé, CANCELED, EXPIRED, INCOMPLETE, null, statut inconnu, tous les rôles)

### Mode Impersonation — Tests & Corrections (SP-456 - 19 février 2026)

Tests E2E Playwright + tests unitaires Vitest pour le mode impersonation SYSTEM_ADMIN ("Voir espace client"). Inclut 2 corrections applicatives découvertes pendant le développement des tests.

- **Tests unitaires API** (10 tests) :
  - POST `/api/admin/impersonate` : 401 non authentifié, 403 non SYSTEM_ADMIN, 400 body vide, 404 aucun utilisateur actif, 400 cible SYSTEM_ADMIN, 400 cible désactivée, succès avec companyId (cookie + audit log), succès avec targetUserId
  - DELETE `/api/admin/impersonate` : 400 aucune impersonation active, succès (supprime cookie + audit log stop)
  - Mocks : `vi.hoisted()` pour auth, prisma, cookies, logAuditAction

- **Tests E2E** (9 tests, 4 suites) :
  - **Parcours nominal** (2) : start → bannière visible → dashboard lecture seule → stop → bannière disparue → retour admin ; bannière affiche "Mode support" + nom entreprise
  - **Restrictions sécurité** (3) : routes admin bloquées (redirect), route billing bloquée, bannière affiche bon tenant (isolation)
  - **Cas limites** (3) : bannière persiste après reload (cookie persistant), suppression cookie désactive impersonation, auto-impersonation SYSTEM_ADMIN bloquée
  - **Audit trail** (1) : POST start capturé via page.on('response'), DELETE stop vérifié implicitement

- **Page Object Model** (`e2e/pages/impersonation.page.ts`) :
  - `startImpersonation(companyName)` : navigation → table → dropdown "Menu actions" → menuitem "Voir espace client" → interception API POST via `Promise.all([waitForResponse, click])` → navigation dashboard → reload (fallback cookie)
  - `stopImpersonation()` : `page.request.delete()` API → suppression sélective cookies (sp-impersonation, authjs.session-token, csrf-token) → re-login admin → navigation companies

- **Correction 1 — Subscription Guard Bypass** (`src/lib/auth.config.ts`) :
  - **Problème** : boucle de redirection infinie (`ERR_TOO_MANY_REDIRECTS`) — en impersonation le JWT SYSTEM_ADMIN n'a pas de données subscription → subscription guard redirige vers `/billing` → impersonation guard bloque `/billing` → redirect `/dashboard` → boucle ∞
  - **Fix** : lecture du cookie `sp-impersonation` avant le subscription guard — si `originalAdminId` présent, skip la vérification subscription

- **Correction 2 — Layout Cookie Fallback** (`src/app/app/layout.tsx`) :
  - **Problème** : `updateSession()` NextAuth v5 échoue avec `ClientFetchError: Failed to fetch` → JWT non mis à jour avec `isImpersonating: true` → bannière invisible
  - **Fix** : fallback lecture directe du cookie `sp-impersonation` dans le Server Component layout quand `session.user.isImpersonating` est false, avec vérification expiration (3600s) et validité

- **Fichiers** :
  - `e2e/pages/impersonation.page.ts` (nouveau) : Page Object Model
  - `e2e/pages/index.ts` (modifié) : barrel export
  - `e2e/specs/impersonation/impersonation-flow.spec.ts` (nouveau) : 9 tests E2E
  - `src/app/api/admin/impersonate/__tests__/route.test.ts` (nouveau) : 10 tests unitaires
  - `src/lib/auth.config.ts` (modifié) : bypass subscription guard en impersonation
  - `src/app/app/layout.tsx` (modifié) : fallback cookie bannière impersonation

### Modèle EmailLog & Service (SP-368 - 10 février 2026)

Table de suivi des emails transactionnels avec service d'envoi robuste :

- **Migration Prisma** (`20260210_add_email_log`) :
  - Table `EmailLog` : id, to, subject, template, status (PENDING/SENT/FAILED/BOUNCED), sentAt, error, metadata (JSON), createdAt
  - Index sur `(template, status)` et `(createdAt)` pour requêtes analytiques

- **Service Email** (`src/lib/services/email/email-log.service.ts`) :
  - `sendAndLog()` : Envoi Nodemailer + logging automatique en base (statut SENT/FAILED)
  - `getEmailLogs()` : Liste paginée avec filtres (template, status, date range)
  - `getEmailStats()` : Statistiques agrégées (total, sent, failed, taux de réussite)
  - `retryFailedEmail()` : Relance d'un email échoué avec mise à jour du log
  - Fire-and-forget pattern pour ne pas bloquer les actions utilisateur

- **Intégration existante** : Remplace les appels directs `sendEmail()` dans les Server Actions (register, forgot-password, leave-request, etc.)

- **Tests** : 16 tests unitaires (sendAndLog succès/échec, getEmailLogs pagination/filtres, getEmailStats agrégation, retryFailedEmail)

### Templates Emails Billing (SP-369 - 10 février 2026)

7 templates React Email pour le cycle de vie des abonnements Stripe :

- **Templates** (`src/emails/`) :
  - `TrialWelcomeEmail` : Bienvenue + jours restants trial + CTA dashboard
  - `TrialExpiringEmail` : Alerte expiration trial (3/7 jours avant) + CTA abonnement
  - `TrialExpiredEmail` : Trial expiré + CTA réactivation
  - `SubscriptionConfirmedEmail` : Confirmation abonnement per-seat + récapitulatif prix
  - `PaymentFailedEmail` : Échec paiement + CTA mise à jour moyen de paiement
  - `SubscriptionCanceledEmail` : Confirmation annulation + date de fin + CTA réabonnement
  - `InvoiceEmail` : Facture avec montant, période, nombre de sièges, lien PDF

- **Design** : Design tokens centralisés, layout responsive, header/footer SmartPlanning, boutons CTA gradient bleu-cyan

- **Tests** : 27 tests unitaires (rendering, props dynamiques, liens, formatage prix, dates, contenu conditionnel par template)

### Cron Trial Expiration & Webhook Emails (SP-370 - 10 février 2026)

Automatisation des emails billing via cron job et intégration webhooks Stripe :

- **Cron API** (`/api/cron/trial-expiration`) :
  - Endpoint sécurisé par `CRON_SECRET` header
  - Détecte les trials expirant dans 3 jours et 7 jours → envoie `TrialExpiringEmail`
  - Détecte les trials expirés depuis 24h → envoie `TrialExpiredEmail`
  - Logging via `EmailLog` pour traçabilité et déduplication
  - Exécution recommandée : toutes les 24h via cron externe

- **Webhooks Stripe enrichis** (`/api/webhooks/stripe`) :
  - `checkout.session.completed` → `SubscriptionConfirmedEmail`
  - `invoice.payment_failed` → `PaymentFailedEmail` + notification in-app SYSTEM_ADMIN
  - `customer.subscription.deleted` → `SubscriptionCanceledEmail`
  - `invoice.paid` → `InvoiceEmail` avec détails facture

- **Notifications résiliation** (`cancelSubscription`) :
  - Email pro au directeur : template `SubscriptionCanceledEmail` (logo, date fin accès, CTA réabonnement)
  - Notification in-app SYSTEM_ADMIN : type WARNING, priorité HIGH
  - Email aux admins : `[SmartPlanning] Résiliation — {companyName}`
  - Pattern fire-and-forget identique aux webhooks

- **Service d'envoi** (`src/lib/services/stripe/subscription-sync.service.ts`) :
  - `sendBillingEmail()` : Envoi fire-and-forget avec logging EmailLog
  - Résolution automatique du director de l'entreprise pour le destinataire

- **Tests** : 25 tests unitaires (cron auth, détection trials, envoi emails, webhooks enrichis, gestion erreurs, edge cases)

### Tests E2E Billing (SP-373 - 10 février 2026)

30 tests Playwright E2E couvrant l'intégralité du parcours billing :

- **Page Objects** :
  - `BillingPage` (`e2e/pages/billing.page.ts`) : 25+ locators `data-testid`, méthodes goto/gotoWithReason, assertions par statut (trial, active, past_due, canceled)
  - `PricingPage` (`e2e/pages/pricing.page.ts`) : Hero, simulateur, features, CTA, méthodes d'interaction slider

- **6 suites de tests** (`e2e/specs/billing/`) :
  - `trial-flow.spec.ts` (5 tests) : Accès dashboard billing, titre, card subscription, bouton gestion, description
  - `checkout-flow.spec.ts` (5 tests) : Statut ACTIVE, montant mensuel, nombre de sièges, absence bannière trial, calcul per-seat
  - `subscription-management.spec.ts` (5 tests) : Détails abonnement, usage indicator, prix unitaire/total, prorata, historique factures
  - `payment-failure.spec.ts` (5 tests) : Alertes payment_overdue/payment_incomplete, style destructive, mention mise à jour, absence sans reason
  - `trial-expiry.spec.ts` (5 tests) : Alerte trial expiré, hero conversion, prix/employé, CTA abonnement, hero no_subscription
  - `cancellation-flow.spec.ts` (5 tests) : Alertes canceled/expired, texte réabonnement, bouton annulation, dialog confirmation

- **Fixtures** (`e2e/helpers/billing-fixtures.ts`) : 7 mock data generators (trial, active, past_due, canceled, expired, trial_expired, no_subscription)

- **Stratégie** : Tests basés sur le seed TechCorp (ACTIVE, 10 employés) + query params `?reason=` pour simuler les différents états de subscription

### Tests E2E en mode production (15 février 2026)

Migration des tests E2E CI et nightly de `npm run dev` vers `npm run start` pour des résultats représentatifs de la production :

- **Problème résolu** : `ERR_TOO_MANY_REDIRECTS` causé par 3 facteurs en mode production sur HTTP localhost
- **Cause 1** : NextAuth v5 active les cookies `secure: true` en production → refusés par le navigateur sur HTTP
- **Cause 2** : `AUTH_URL` manquant → `trustHost` désactivé, requêtes rejetées
- **Cause 3** : CSP `upgrade-insecure-requests` force le navigateur à upgrader HTTP → HTTPS sur localhost
- **Fix CSP** (`next.config.ts`) : `upgrade-insecure-requests` conditionnel selon le protocole de `AUTH_URL`/`NEXTAUTH_URL`
- **Fix Playwright** : `playwright.ci.config.ts` et `playwright.nightly.config.ts` → `command: 'npm run start'`
- **Fix CI** : Ajout `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST` + étape `npm run build` dans `ci.yml` et `nightly-e2e.yml`
- **Gains** : Tests plus rapides (pas de HMR/Turbopack), plus fiables (pas de React Strict Mode double mount), représentatifs de la prod

### Déploiement Stripe Production (SP-461 - 10 février 2026)

Mise en production complète de l'intégration Stripe per-seat billing :

- **Audit pré-déploiement** :
  - 5 283 tests unitaires (Vitest) + 30 E2E billing (Playwright) — 100% pass
  - Vérification webhook best practices via Context7
  - Audit infrastructure VPS (containers, SSL, migrations, env vars)

- **Corrections CI/CD bloquantes** :
  - Fix 3 erreurs `@typescript-eslint/no-misused-promises` dans `BillingPageContent.tsx` (handlers async en onClick)
  - Fix Prettier warnings sur 7 fichiers Billing
  - Lazy init client Stripe via Proxy pour éviter crash CI sans `STRIPE_SECRET_KEY`
  - Tests `stripe.test.ts` adaptés au pattern lazy (11 tests, import sans crash, getStripe() throw si absent)

- **Fix Docker** :
  - Ajout `mkdir -p /app/.next/cache` dans Dockerfile runner (erreur ENOENT image optimization)
  - Correction chemin tmpfs docker-compose.prod.yml (`/.next/cache` → `/app/.next/cache`)
  - Ajout `STRIPE_PRICE_ID` et `CRON_SECRET` dans docker-compose.prod.yml

- **Fix Checkout flow** :
  - Le bouton "S'abonner" (sans subscription existante) appelle désormais `createCheckoutAction` → Stripe Checkout Session
  - Avant : appelait `createBillingPortalAction` qui échouait silencieusement (nécessite un customer existant)
  - Nouvelle prop `onSubscribe` sur `SubscriptionStatus` pour distinguer checkout vs portail

- **Configuration production VPS** :
  - Variables Stripe live configurées dans `/var/www/smartplanning/.env` (sk_live_, pk_live_, whsec_, price_)
  - `CRON_SECRET` configuré pour sécuriser l'endpoint `/api/cron/trial-emails`
  - 2 migrations Prisma appliquées (`sp350_per_seat_model`, `add_email_log`)
  - Cron job trial-emails : `0 8 * * *` (9h Paris) sur user deploy
  - Webhook endpoint vérifié : `https://smartplanning.fr/api/webhooks/stripe`

### Pages Légales RGPD (14-15 janvier 2026)

- **Architecture** : Route group `(legal)` avec composants réutilisables
- **5 pages complètes** :
  - `/mentions-legales` : Mentions légales obligatoires
  - `/cgu` : Conditions Générales d'Utilisation
  - `/cgv` : Conditions Générales de Vente
  - `/confidentialite` : Politique de Confidentialité RGPD
  - `/cookies` : Politique Cookies détaillée
- **Composants réutilisables** :
  - `LegalPageLayout` : Layout unifié avec table des matières sticky
  - `LegalSection` : Sections numérotées avec ancres
  - `LegalParagraph`, `LegalList`, `LegalHighlight`, `LegalDivider`, `LegalContact`
- **Design** : Dark theme cohérent, glassmorphism, animations Framer Motion
- **SEO** : Metadata Next.js, Open Graph, balises sémantiques
- **Tickets Jira** : SP-279 à SP-285

### Bannière Cookies RGPD ✅ (SP-283 - 16 janvier 2026)

- **Bannière de consentement** : Design glassmorphism fixe en bas de page
- **Modal de préférences** : Choix granulaire par catégorie (essentiels, analytics, marketing)
- **3 catégories de cookies** :
  - Essentiels : Toujours actifs (authentification, sécurité)
  - Analytics : Google Analytics, suivi anonyme
  - Marketing : Publicités ciblées, réseaux sociaux
- **Persistance** : Cookie HTTP `cookie-consent` (365 jours, SameSite=Lax)
- **Bouton d'accès** : `CookieSettingsButton` intégré au footer
- **Context React** : État partagé via `CookieConsentProvider`
- **Hook** : `useCookieConsent()` pour utilisation standalone
- **Intégration** : Lien vers la page `/cookies` pour détails
- **Tests** : 7 tests unitaires + 18 tests E2E

### Pages d'authentification (Refonte - 14 janvier 2026)

- **Design dark unifié** : Background #030712 avec animations identiques à la landing
- **Composants partagés** : LandingHeader et LandingFooter réutilisés (DRY)
- **Glassmorphism** : Cards avec bg-white/5, border-white/10, backdrop-blur-xl
- **Inputs dark mode** : Bordures white/20, fond white/5, texte blanc
- **Boutons gradient** : from-blue-500 to-cyan-400 avec shadow glow
- **Support variant** : LoginForm et RegisterForm acceptent variant="dark" | "light"
- **Tests** : 34 tests unitaires + 20 tests E2E passent

### Gestion des Plannings - Validations Zod (SP-393 - 26 janvier 2026)

Schémas de validation Zod pour le module de gestion des plannings :

- **Schedule Schemas** (`src/lib/validations/schedule.ts`) :
  - `createScheduleSchema` : Création de shifts avec validation date/heure
  - `updateScheduleSchema` : Modification partielle avec ID requis
  - `scheduleFiltersSchema` : Pagination, tri et filtres
  - `recurrenceRuleSchema` : DAILY/WEEKLY/BIWEEKLY/MONTHLY avec endDate OU occurrences
  - Support multi-employés via `employeeIds`
  - Labels français, couleurs et icônes pour l'UI

- **Availability Schemas** (`src/lib/validations/availability.ts`) :
  - `createAvailabilitySchema` : Périodes d'indisponibilité avec horaires optionnels
  - `updateAvailabilitySchema` : Modification partielle avec ID requis
  - `availabilityFiltersSchema` : Filtres par type, employé, période

- **Tests** : 81 tests unitaires (47 schedule + 34 availability)

### Gestion des Plannings - Server Actions (SP-394 - 26 janvier 2026)

Server Actions CRUD complets avec RBAC pour le module de gestion des plannings :

- **10 Server Actions** (`src/lib/actions/schedules.ts`) :
  - `getSchedules` : Liste avec filtres, pagination et tri
  - `getScheduleById` : Lecture unitaire avec contrôle d'accès
  - `createSchedule` : Création mono/multi-employé via `employeeIds`
  - `updateSchedule` : Modification partielle avec validation
  - `deleteSchedule` : Suppression unitaire avec RBAC
  - `deleteScheduleGroup` : Suppression batch par `scheduleGroupId`
  - `duplicateSchedule` : Duplication avec décalage de date
  - `updateScheduleStatus` : Changement rapide de statut
  - `getEmployeeSchedules` : Schedules d'un employé spécifique
  - `getTeamSchedules` : Schedules d'une équipe

- **Permissions RBAC** :
  - `SYSTEM_ADMIN` : Lecture seule cross-tenant
  - `DIRECTOR` : CRUD complet sur l'entreprise
  - `MANAGER` : CRUD scopé aux équipes gérées
  - `EMPLOYEE` : Lecture de ses propres schedules uniquement

- **Tests** : 30 tests unitaires couvrant tous les cas RBAC

### Gestion des Plannings - Page Liste (SP-395 - 26 janvier 2026)

Page Next.js complète pour la gestion des plannings :

- **Route** : `/app/dashboard/schedules`
- **Layout** : Metadata SEO (title, description, OpenGraph)
- **Loading** : Skeleton UI responsive avec grille semaine

- **SchedulesPageContent** :
  - Navigation date (précédent/suivant/aujourd'hui)
  - 3 modes de vue : Jour, Semaine, Mois
  - Filtres collapsibles (recherche, statut, type)
  - Stats rapides : shifts, employés planifiés, confirmés, brouillons
  - Bouton "Nouveau shift" (DIRECTOR/MANAGER uniquement)

- **SchedulesList** :
  - Vue grille semaine avec colonnes par jour
  - Shifts colorés par type (WORK, MEETING, TRAINING, etc.)
  - Vue liste pour jour/mois
  - Empty state avec icône

- **SchedulesFilters** :
  - Recherche par nom/prénom/titre
  - Filtre par statut (brouillon, confirmé, annulé, terminé)
  - Filtre par type (travail, pause, réunion, formation, etc.)

- **Correction Sidebar** : URL `/schedules` → `/app/dashboard/schedules`

### Calendrier Schedule-X (SP-396 - 26 janvier 2026)

Composant calendrier interactif avec Schedule-X pour la visualisation des plannings :

- **ScheduleCalendar** : Wrapper responsive avec détection automatique desktop/mobile
  - Breakpoint 768px avec `useMediaQuery` hook
  - Skeleton loading pendant la détection

- **ScheduleCalendarDesktop** : Calendrier Schedule-X complet
  - Vues jour, semaine, mois (`createViewDay`, `createViewWeek`, `createViewMonthGrid`)
  - Drag & drop natif (`createDragAndDropPlugin`)
  - Support 8 types de shift (WORK, MEETING, BREAK, TRAINING, REMOTE, ON_CALL, OVERTIME, REST)
  - **REST** : Événements all-day via `Temporal.PlainDate` avec emoji 🛌
  - Variants DRAFT : opacité réduite + bordure pointillée
  - Palettes light/dark par type de calendrier
  - Events synchronisés via `createEventsServicePlugin`
  - Temporal API polyfill pour dates
  - Couleurs par type de schedule (8 types avec palettes light/dark)
  - Légende des couleurs intégrée
  - Callbacks : `onScheduleClick`, `onScheduleUpdate`

- **ScheduleCalendarMobile** : Vue cards pour mobile
  - Cards avec informations condensées
  - Badges colorés par type
  - Scroll vertical natif (pas de scroll horizontal)
  - Empty state dédié

- **CSS Theme** : Personnalisation Schedule-X
  - Variables CSS intégrées au design system Shadcn/ui
  - Support dark mode automatique
  - Responsive adjustments

- **Tests** : 18 tests unitaires (responsive behavior, props transmission)

### ShiftModal - Création/Édition de créneaux (SP-397 - 26 janvier 2026)

Modal complet pour la création et modification de créneaux :

- **ShiftModal** : Modal avec modes création et édition
  - Sélection multi-employés avec recherche et filtrage par équipe
  - Date/time pickers avec locale française (date-fns)
  - Sélecteur de type (Travail, Pause, Réunion, Formation, Télétravail, Astreinte, Heures sup., Repos)
  - Sélecteur de statut (Brouillon, Confirmé)
  - Support type **REST** (Repos) : masquage automatique des champs horaires, forçage 00:00-23:59, bannière "Journée entière (repos)"
  - Bouton **Supprimer** en mode édition avec confirmation
  - Champs optionnels : titre, description, lieu
  - Validation Zod complète avec message d'erreur FR
  - Intégration Server Actions (`createSchedule`, `updateSchedule`, `deleteSchedule`)

- **useShiftFormData** : Hook pour charger les données du formulaire
  - Chargement parallèle employés et équipes
  - RBAC automatique via Server Actions
  - Gestion états loading/error
  - Fonction `refetch` pour rafraîchissement

- **Intégration SchedulesPageContent** :
  - Bouton "Nouveau créneau" ouvre le modal en mode création
  - Clic sur un créneau ouvre le modal en mode édition
  - Rechargement automatique après succès

- **Terminologie française** : "Créneau" (singulier) / "Créneaux" (pluriel) dans toute l'UI

- **Tests** : 30 tests unitaires (17 ShiftModal + 13 useShiftFormData)

### Drag & Drop Calendrier (SP-398 - 26 janvier 2026)

Fonctionnalités interactives pour le calendrier Schedule-X :

- **Drag & Drop** : Déplacer un créneau vers une autre date/heure
  - Plugin `@schedule-x/drag-and-drop` activé
  - Persistance automatique via Server Action `updateSchedule`
  - Rollback visuel en cas d'erreur de sauvegarde

- **Resize** : Redimensionner un créneau (modifier l'heure de fin)
  - Plugin `@schedule-x/resize` ajouté
  - Tirer sur le bord inférieur pour ajuster la durée

- **Feedback utilisateur** :
  - Indicateur de chargement pendant la mise à jour
  - Toast de succès après modification réussie
  - Toast d'erreur avec message explicite en cas d'échec

- **Permissions RBAC** :
  - DIRECTOR et MANAGER peuvent drag/drop et resize
  - EMPLOYEE voit le calendrier en lecture seule
  - Message d'aide affiché pour les utilisateurs autorisés

- **Tests** : 19 tests unitaires (rendering, plugins, RBAC, callbacks)

### Récurrence des Shifts (SP-399 - 26 janvier 2026)

Système complet de récurrence pour les créneaux horaires :

- **Fréquences supportées** :
  - DAILY : Quotidien (tous les X jours)
  - WEEKLY : Hebdomadaire avec sélection des jours
  - BIWEEKLY : Toutes les 2 semaines avec sélection des jours
  - MONTHLY : Mensuel (même jour du mois)

- **Configuration UI** (`RecurrenceConfig`) :
  - Switch pour activer/désactiver la récurrence
  - Sélecteur de fréquence
  - Boutons de sélection des jours (Lun-Dim) pour WEEKLY/BIWEEKLY
  - Mode de fin : nombre d'occurrences OU date de fin
  - Aperçu du nombre de créneaux qui seront créés
  - Warning si dépassement des limites (200 créneaux max)

- **Limites de sécurité** :
  - Maximum 52 occurrences par série
  - Maximum 200 créneaux créés en une fois (occurrences × employés)

- **Génération backend** :
  - Utilitaire `generateOccurrences()` pour calculer toutes les dates
  - `recurrenceGroupId` pour regrouper les créneaux d'une même série
  - Création en batch dans la base de données

- **Server Actions pour opérations groupées** :
  - `getRecurrenceGroupCounts` : Compte les créneaux d'un groupe
  - `deleteRecurringSchedules` : Suppression avec scope (single/future/all)
  - `updateRecurringSchedules` : Modification avec scope (single/future/all)

- **Dialog d'édition groupée** (`RecurrenceEditDialog`) :
  - 3 options de scope : Ce créneau uniquement, Ce créneau et les suivants, Tous les créneaux de la série
  - Confirmation avant action

- **Tests** : 24 tests utilitaire recurrence + 12 tests RecurrenceConfig

### Export Excel Planning (SP-404 - 27 janvier 2026)

Export du planning en fichier .xlsx via `SheetJS (xlsx)` :

- **API Route `GET /api/schedules/export/excel`** :
  - Authentification via `auth()` (NextAuth v5)
  - RBAC : MANAGER et DIRECTOR uniquement
  - Query params : startDate, endDate, teamId, employeeId, status, type, search
  - **Respect des filtres actifs** de la vue planning (équipe, employé, statut, type, recherche)
  - Isolation multi-tenant par `companyId`
  - Réponse binaire .xlsx avec Content-Disposition attachment

- **Générateur `generateScheduleExcel`** :
  - Feuille 1 "Planning" : colonnes Employé, Date, Jour, Début, Fin, Durée (h), Type, Statut, Équipe, Lieu, Description
  - Feuille 2 "Résumé" : heures contrat, heures totales, différence, nombre de shifts, ventilation par type (incluant Repos)
  - Feuille 3 "Statistiques" : totaux globaux (shifts, heures, employés, moyenne)
  - Largeurs de colonnes adaptées, dates FR, types/statuts traduits
  - **REST exclu** du comptage heures travaillées

- **`ExportDropdown` mis à jour** :
  - Export Excel fonctionnel (remplace le placeholder toast)
  - **Passe les filtres actifs** (teamId, employeeId, status, type, search) en query params
  - État de chargement distinct PDF/Excel via `isExporting`
  - Helpers partagés `downloadBlob` et `buildParams`

- **Tests** : 7 tests unitaires (buffer valide, 3 feuilles, colonnes, durées, liste vide, statistiques, résumé par employé)

### Export PDF Planning (SP-403 - 27 janvier 2026)

Export du planning en PDF via `@react-pdf/renderer` :

- **API Route `GET /api/schedules/export/pdf`** :
  - Authentification via `auth()` (NextAuth v5)
  - RBAC : MANAGER et DIRECTOR uniquement
  - Query params : startDate, endDate, teamId, employeeId, status, type, search, view (week|month)
  - **Respect des filtres actifs** de la vue planning (équipe, employé, statut, type, recherche)
  - Isolation multi-tenant par `companyId`
  - Réponse binaire PDF avec Content-Disposition attachment

- **Composant React PDF `SchedulePdfDocument`** :
  - Document A4 paysage avec header (entreprise, période, date génération)
  - Tableau employés × jours avec badges horaires colorés par type
  - **Colonne "Heures"** : heures planifiées / heures contrat + différence colorée (+Xh rouge, -Xh orange, 0h vert)
  - **REST affiché "Repos"** au lieu de "00:00-23:59"
  - REST exclu du comptage heures travaillées
  - Légende des 8 types : Travail, Réunion, Pause, Formation, Télétravail, Astreinte, Heures sup., Repos
  - Helpers : groupByEmployee, getDaysInPeriod, getSchedulesForDay, computeDuration

- **Composant `ExportDropdown`** :
  - Dropdown Shadcn/ui avec icône Download
  - Export PDF fonctionnel (fetch → blob → download)
  - Export Excel fonctionnel (ajouté en SP-404)
  - Loading state avec spinner Loader2

- **Tests** : 6 tests unitaires (buffer valide, header %PDF-, liste vide, vue mois, multi-employés, 7 types)

### Panneau Heures Hebdomadaires (SP-406 - 27 janvier 2026)

Panneau latéral affichant les heures planifiées vs contractuelles par employé :

- **`WeeklyHoursPanel`** : Composant panneau latéral desktop + Sheet mobile
  - Calcul automatique des heures planifiées par employé pour la période affichée
  - Comparaison avec les heures contractuelles (`weeklyHours`)
  - Barre de progression colorée : vert (<90%), orange (90-100%), rouge (>100%)
  - Différentiel affiché : `+Xh` (rouge), `-Xh` (orange), `0h` (vert)
  - Tri par différentiel croissant (sous-staffés en premier)
  - Exclusion des jours de repos (`REST`) du comptage
  - État vide : "Aucun employé planifié"

- **Intégration `SchedulesPageContent`** :
  - Bouton toggle Clock dans les contrôles (desktop)
  - Layout flex : calendrier (`flex-1`) + panneau (`w-80`)
  - Mobile : bouton flottant ouvrant un Sheet avec le même contenu

- **`getEmployeesForSelect`** : Nouvelle Server Action
  - Retourne `{ id, firstName, lastName, weeklyHours }` pour chaque employé
  - RBAC : SYSTEM_ADMIN (tous), DIRECTOR (entreprise), MANAGER (équipes gérées)

### Type de Planning REST - Repos (SP-406 - 27 janvier 2026)

Nouveau type de planning "Repos" pour les journées de repos complètes :

- **Schema Prisma** : Ajout `REST` à l'enum `ScheduleType` (migration `20260127154930`)
- **Validations** : Label "Repos", couleur `#6B7280` (gris)
- **ShiftModal** : Masquage automatique des champs horaires, forçage 00:00-23:59, bannière "Journée entière (repos)"
- **Calendrier Desktop** : Événement all-day via `Temporal.PlainDate` (au lieu de `ZonedDateTime`), emoji 🛌
- **Calendrier Mobile** : Affiche "Journée entière" au lieu des horaires
- **Filtres** : Option "Repos" ajoutée au filtre par type
- **Export PDF** : Affiche "Repos" au lieu de "00:00-23:59"
- **Comptage heures** : REST exclu du total dans le panneau, le PDF et l'Excel

### Simplification Statuts Planning (SP-406 - 27 janvier 2026)

Simplification du cycle de vie des plannings :

- **Migration Prisma** (`20260127140000_simplify_schedule_status`) :
  - Suppression des statuts `CANCELLED` et `COMPLETED` de l'enum `ScheduleStatus`
  - Conversion automatique des plannings existants vers `CONFIRMED`
  - Enum simplifiée : `DRAFT` | `CONFIRMED`
- **Filtres mis à jour** : Suppression des options "Annulé" et "Terminé"
- **Calendrier Desktop** : Variants DRAFT visuels (opacité réduite, bordure pointillée)

### Suppression en Masse Employés (SP-406 - 27 janvier 2026)

Fonctionnalité de suppression groupée d'employés :

- **`BulkDeleteDialog`** : Dialog de confirmation avec comptage dynamique
  - Warning cascade : suppression des plannings + congés associés
  - Gestion des suppressions partielles (employés ignorés par RBAC)
  - Messages toast différenciés (succès, warning, erreur)

- **`bulkDeleteEmployees` Server Action** :
  - RBAC strict : DIRECTOR et SYSTEM_ADMIN uniquement (MANAGER bloqué)
  - Vérification accès par employé individuellement
  - Suppression cascade en transaction Prisma (teams.managerId, leaveRequests, schedules, employees)
  - Retour différencié : `deletedCount` + `skippedNames`

- **`EmployeesDataTable`** :
  - Sélection multiple avec checkboxes
  - Bouton "Supprimer (X)" apparaît quand sélection active
  - Vue responsive : Table desktop / Cards mobile (`EmployeeCard`)

- **`EmployeeCard`** : Carte employé mobile responsive
  - Avatar, badge statut, menu actions dropdown
  - Email, téléphone, équipe, date embauche, heures hebdomadaires

### Nom d'Entreprise dans le Layout (SP-406 - 27 janvier 2026)

Affichage dynamique du nom de l'entreprise dans la sidebar :

- **`src/app/app/layout.tsx`** : Fetch du nom via Prisma (`company.name`) à partir de `session.user.companyId`
- **Sidebar** : Affiche le nom de l'entreprise (fallback "SmartPlanning")
- **Header** : Conserve "SmartPlanning" à côté de l'animation Lottie (branding)

### Corrections React 19 — Boucles Infinies (SP-406 - 27 janvier 2026)

Corrections critiques des boucles infinies de re-renders avec React 19 :

- **Patches npm** (via `patch-package`) :
  - `@radix-ui/react-presence@1.1.5` : Ajout ref guard pour éviter les re-renders infinis
  - `@radix-ui/react-compose-refs@1.1.2` : Stabilisation des refs composées avec `useRef`
- **Composants Shadcn/ui** (7 fichiers) : Remplacement animations Radix par transitions CSS simples
  - Dialog, AlertDialog, Sheet, Popover, Select, Tooltip, DropdownMenu
- **SchedulesPageContent** : Stabilisation dépendances `useEffect` (objets Date → timestamps primitifs)
- **Tests E2E stabilité** : Détection automatique des boucles infinies dans la console

### Refonte CSS Calendrier Schedule-X (SP-406 - 27 janvier 2026)

Refonte complète du thème CSS du calendrier (706 lignes) :

- **Design "Precision Engineering"** : Grille quasi-invisible, events dominants
- **Typography** : Rajdhani (display) + Plus Jakarta Sans (body)
- **3 niveaux d'élévation** : Grille (0), Panel (1), Events (2)
- **Events** : Cards flottantes avec bord-gauche coloré, ombres subtiles
- **Today** : Highlight avec glow bleu et badge circulaire
- **DRAFT** : Opacité réduite + bordure pointillée
- **Dark mode** : Glassmorphism léger, fond subtle, contrastes ajustés
- **Animations** : Transitions hover smooth, micro-interactions

### Overlay Indisponibilités Calendrier (SP-402 - 27 janvier 2026)

Affichage visuel des indisponibilités directement sur le calendrier des plannings :

- **Server Action `getAvailabilitiesForCalendar`** :
  - Requête optimisée avec filtres date range, équipe, employés
  - RBAC : EMPLOYEE voit les siennes, MANAGER son équipe, DIRECTOR toute l'entreprise

- **Hook `useCalendarAvailabilities`** :
  - Chargement avec debounce (200ms) et cache local (10 entrées max)
  - Annulation des requêtes obsolètes
  - Rechargement automatique au changement de période
  - Méthode refetch() manuelle

- **Composants UI** :
  - `AvailabilityOverlay` : Transformation des indisponibilités en events Schedule-X avec couleurs RGBA par type
  - `AvailabilityBadge` : Badge compact avec emoji par type (🏖️ Vacances, 🤒 Maladie, 📚 Formation, ⛔ Indisponible, ⭐ Préférence, 📝 Autre)
  - `AvailabilityPopover` : Popover de détails au clic (employé, type, dates, heures, raison)

- **Intégrations** :
  - `ScheduleCalendarDesktop` : Events colorés Schedule-X avec calendrier configs par type
  - `ScheduleCalendarMobile` : Badges d'indisponibilité par jour
  - `SchedulesPageContent` : Toggle Eye/EyeOff pour afficher/masquer

- **Tests** : 47 tests unitaires (10 useCalendarAvailabilities + 20 AvailabilityBadge + 17 AvailabilityOverlay)

### Détection de Conflits Horaires (SP-400 - 26 janvier 2026)

Système de détection et affichage des conflits entre plannings et indisponibilités :

- **Server Action `checkAvailabilityConflicts`** :
  - Détection des chevauchements entre créneaux et indisponibilités
  - Support multi-employés en un seul appel
  - Classification automatique hard/soft conflicts
  - Exclusion optionnelle d'une availability (pour édition)

- **Classification des conflits** :
  - **Hard conflicts (rouge)** : VACATION, SICK, UNAVAILABLE - Bloquants
  - **Soft conflicts (jaune)** : PREFERRED, TRAINING, OTHER - Avertissements

- **Composants UI** :
  - `ConflictAlert` : Alerte visuelle avec détails des conflits (employé, type, dates, raison)
  - `ConflictConfirmDialog` : Dialog de confirmation pour drag & drop avec conflits

- **Hook `useConflictDetection`** :
  - Détection temps réel avec debounce (300ms par défaut)
  - Support multi-employés
  - États : isChecking, hasConflict, hasHardConflict, hasSoftConflict
  - Méthodes : refetch(), reset()

- **Intégrations** :
  - `ShiftModal` : Affichage temps réel des conflits lors de la création/édition
  - `ScheduleCalendarDesktop` : Vérification avant sauvegarde du drag & drop

- **Tests** : 25 tests unitaires (12 useConflictDetection + 13 ConflictAlert)

### CRUD Availabilities (SP-401 - 26 janvier 2026)

Système complet de gestion des indisponibilités employés :

- **Server Actions avec RBAC** :
  - `getAvailabilities` : Liste paginée avec filtres (type, dates)
  - `getAvailabilityById` : Récupération unitaire
  - `createAvailability` : Création avec permissions
  - `updateAvailability` : Modification avec permissions
  - `deleteAvailability` : Suppression avec permissions
  - `getEmployeeAvailabilities` : Indisponibilités d'un employé sur une période
  - `getTeamAvailabilities` : Indisponibilités d'une équipe
  - `getAvailabilitiesStats` : Statistiques par type

- **Permissions RBAC** :
  - SYSTEM_ADMIN : Lecture seule (supervision)
  - DIRECTOR : CRUD complet sur toute l'entreprise
  - MANAGER : CRUD sur les membres de ses équipes
  - EMPLOYEE : CRUD sur ses propres indisponibilités

- **Composants UI** :
  - `AvailabilityCard` : Carte d'affichage avec icône et couleur par type
  - `AvailabilityModal` : Modal création/édition avec React Hook Form + Zod
  - `AvailabilitiesList` : Liste paginée avec filtres (type, période)

- **Types d'indisponibilité** :
  - UNAVAILABLE (Indisponible) - Rouge
  - PREFERRED (Préférence horaire) - Jaune
  - VACATION (Congés/Vacances) - Bleu
  - SICK (Maladie) - Orange
  - TRAINING (Formation) - Violet
  - OTHER (Autre) - Gris

- **Tests** : 54 tests unitaires (22 Server Actions + 18 AvailabilityCard + 14 AvailabilityModal)

### Gestion des Plannings - Base de données (SP-392 - 26 janvier 2026)

Fondations Prisma pour le module de gestion des plannings :

- **Modèle Availability** : Gestion des disponibilités/indisponibilités employés
  - Périodes avec dates de début/fin et horaires optionnels
  - Types : UNAVAILABLE, PREFERRED, VACATION, SICK, TRAINING, OTHER
  - Support récurrence (isRecurring, recurrenceRule en JSON)
  - Relations Employee et Company avec onDelete: Cascade
  - Index optimisés pour les requêtes par employé et période

- **Enrichissement modèle Schedule** :
  - `isRecurring` : Flag pour les créneaux récurrents
  - `recurrenceRule` : Règle de récurrence (JSON)
  - `recurrenceGroupId` : Regroupe les occurrences d'une série récurrente
  - `scheduleGroupId` : Regroupe les créneaux créés simultanément pour plusieurs employés
  - Index ajoutés pour recurrenceGroupId et scheduleGroupId

- **Migration** : `20260126113942_add_availability_model_and_schedule_recurrence`

### Upload Photo de Profil - Cloudinary (SP-272 - 4 février 2026)

Système complet d'upload et gestion de photo de profil avec Cloudinary :

- **API Route `/api/avatar`** :
  - `POST` : Upload avec validation (5MB max, types image/\*), transformation Cloudinary (crop, resize 400x400), stockage CDN
  - `DELETE` : Suppression de l'avatar Cloudinary et mise à null en base
  - Authentification requise via `auth()`
  - Revalidation automatique des paths (`/app/profile`, `/app`, `/app/schedules`)

- **Intégration Cloudinary** :
  - SDK `cloudinary` v2 avec configuration via variables d'environnement
  - Transformation automatique : `width: 400, height: 400, crop: 'fill', gravity: 'face'`
  - Format optimisé : `quality: 'auto', fetch_format: 'auto'`
  - Folder organisé : `smartplanning/avatars/`
  - Public ID unique : `user-{userId}`

- **Affichage Avatar dans l'application** :
  - **Navbar (Header)** : Avatar utilisateur avec fallback initiales
  - **Planning Mobile** : Avatars employés dans `ScheduleCalendarMobile` et `WeeklyHoursPanel`
  - **Liste Congés** : Avatars employés dans `LeavesList` (DataTable TanStack)
  - **Calendrier Congés** : Avatars employés dans `LeaveCalendar` (grille mensuelle)
  - **Cartes Congés Mobile** : Avatars dans `LeaveRequestCard`

- **Architecture données** :
  - Champ `User.image` stocke l'URL Cloudinary
  - Propagation via relations Prisma : `Employee.user.image`
  - Types TypeScript mis à jour : `LeaveRequestWithEmployee`, `ScheduleWithRelations`, `Employee`
  - Fetch DB direct dans layout pour image fraîche (vs JWT token)

- **Composant Avatar** (Shadcn/ui) :
  - `AvatarImage` : Affichage conditionnel si URL présente
  - `AvatarFallback` : Initiales en fallback (prénom + nom)
  - Tailles : 6x6 (calendrier), 8x8 (listes), configurable

### Réinitialisation du mot de passe (SP-263 - 25 janvier 2026)

Système complet de réinitialisation de mot de passe avec sécurité anti-énumération :

- **ForgotPasswordForm** : Formulaire de demande de réinitialisation
  - React Hook Form + Zod pour validation email
  - Appel Server Action `forgotPasswordAction`
  - **Sécurité anti-énumération** : message de succès identique que l'email existe ou non
  - État de succès avec message de confirmation
  - Bouton "Réessayer" pour renvoyer un email
  - Support variant dark/light
  - 14 tests unitaires

- **ResetPasswordForm** : Formulaire de nouveau mot de passe
  - Validation mot de passe fort (8 caractères minimum)
  - Vérification de correspondance des mots de passe
  - Token de réinitialisation passé via props
  - Appel Server Action `resetPasswordAction`
  - Toggle visibilité mot de passe (Eye/EyeOff)
  - Countdown de redirection après succès (5s)
  - Bouton "Se connecter maintenant" pour redirection immédiate
  - Support variant dark/light
  - 17 tests unitaires

- **Pages Next.js App Router** :
  - `/forgot-password` : Page de demande avec ForgotPasswordForm
  - `/reset-password?token=xxx` : Page de réinitialisation avec ResetPasswordForm
  - Gestion du token manquant avec message d'erreur et lien vers /forgot-password
  - Design dark cohérent avec la landing page

- **Server Actions** (dans `src/lib/actions/password-actions.ts`) :
  - `forgotPasswordAction` : Génère token, envoie email (protégé contre l'énumération)
  - `resetPasswordAction` : Vérifie token, met à jour le mot de passe

- **Tests** : 39 tests unitaires (14 ForgotPasswordForm + 17 ResetPasswordForm + 8 ResetPasswordPage)

### Emails Transactionnels (Sprint 9 - Janvier 2026)

Système complet d'envoi d'emails transactionnels avec React Email et Nodemailer :

- **SP-295 : Configuration Email** ✅
  - Nodemailer avec SMTP Hostinger (smtp.hostinger.com:587)
  - Pattern singleton pour le transporter
  - Retry logic avec exponential backoff

- **SP-296 : Templates React Email** ✅
  - Design tokens centralisés (couleurs, typographie, spacing)
  - Composants réutilisables : Layout, Header, Footer, Button
  - Preview dev avec `npm run email:dev` (localhost:3001)

- **SP-297 : Email de Bienvenue** ✅
  - Template `WelcomeEmail.tsx` personnalisé
  - Intégration non-bloquante dans `registerAction`
  - 18 tests unitaires

- **SP-298 : Email Reset Password** ✅
  - Template `ResetPasswordEmail.tsx` avec durée de validité
  - Server Actions `forgotPasswordAction` et `resetPasswordAction`
  - Schémas Zod pour validation
  - 9 tests unitaires

- **SP-299 : Email Vérification** ✅
  - Template `VerificationEmail.tsx` avec message de bienvenue et avantages
  - Server Actions `sendVerificationEmailAction`, `verifyEmailAction`, `resendVerificationEmailAction`
  - Préfixe token `verify_` pour distinguer des tokens de reset
  - Expiration 24h (vs 1h pour reset password)
  - Transaction atomique Prisma pour validation
  - Protection contre l'énumération de comptes
  - 10 tests unitaires

- **SP-300 : Email Congé Validé/Refusé** ✅
  - Templates `LeaveApprovedEmail.tsx` et `LeaveRejectedEmail.tsx`
  - Types `LeaveType`, `LeaveEmailData`, `LeaveRejectedEmailData` dans `src/types/leave.ts`
  - 7 types de congés supportés (PAID_LEAVE, RTT, SICK_LEAVE, UNPAID_LEAVE, PARENTAL_LEAVE, FAMILY_EVENT, OTHER)
  - Fonctions `sendLeaveApprovedEmail`, `sendLeaveRejectedEmail` dans `src/lib/email/templates/leave-decision.ts`
  - Helpers `formatDateFr` (dates en français) et `getLeaveTypeLabel` (traduction types)
  - 48 tests unitaires (16 + 19 + 13)

- **SP-301 : Email Contact** ✅
  - Templates `ContactConfirmationEmail.tsx` (confirmation à l'expéditeur) et `ContactNotificationEmail.tsx` (notification admin)
  - Fonctions `sendContactConfirmation`, `sendContactNotification`, `sendContactEmails` (envoi parallèle)
  - Intégration API route `/api/contact` avec rate limiting (5 req/min)
  - Reply-To configuré pour réponse directe à l'expéditeur
  - Horodatage en français dans l'email admin
  - 52 tests unitaires (18 + 22 + 12 fonctions)

### Error Boundary React (SP-304 - 20 janvier 2026)

Système complet de gestion des erreurs React côté client :

- **ErrorBoundary** : Wrapper utilisant `react-error-boundary` v5.0.0
  - Capture les erreurs de rendu React
  - Logging structuré (timestamp, message, stack, componentStack, URL)
  - Support de fallback personnalisé et resetKeys
  - Callback onReset pour intégration analytics

- **ErrorFallback** : UI de secours élégante
  - Design Shadcn/ui (Card, Button) cohérent avec l'app
  - Bouton "Réessayer" pour reset de l'error boundary
  - Bouton "Accueil" pour navigation sécurisée
  - Stack trace dépliable en mode développement
  - Code erreur (digest) affiché en production

- **Next.js Error Pages** :
  - `error.tsx` : Error boundary par segment de route
  - `global-error.tsx` : Error boundary racine (remplace le layout, inclut `<html>` et `<body>`)
  - Styles inline pour `global-error.tsx` (CSS peut ne pas être chargé)

- **Accessibilité WCAG 2.1 AA** :
  - `role="alert"` et `aria-live="assertive"`
  - `aria-labelledby` et `aria-describedby`
  - `aria-label` sur les boutons d'action
  - `aria-hidden` sur les icônes décoratives

- **Tests** : 22 tests unitaires + 5 tests E2E

### Page 404 personnalisée (SP-302 - 20 janvier 2026)

Page 404 personnalisée avec animations Framer Motion et accessibilité WCAG 2.1 AA :

- **NotFoundIllustration** : Illustration animée décorative
  - Animation flottante sur l'icône principale (FileQuestion)
  - Icônes décoratives orbitantes (Search, ArrowRight)
  - Points décoratifs avec animation pulse
  - Tailles responsives (h-32 sm:h-40 md:h-48)
  - `aria-hidden="true"` pour accessibilité

- **NotFoundPage** : Page 404 complète
  - "404" en grand avec gradient text (from-primary to-primary/60)
  - Titre "Page non trouvée" en français
  - Description explicative
  - Bouton "Accueil" (primary) et "Dashboard" (outline)
  - Liens rapides : Fonctionnalités, Tarifs, Contact

- **Next.js App Router** :
  - `not-found.tsx` pour affichage automatique 404
  - Intégration seamless avec le routing Next.js 15

- **Accessibilité WCAG 2.1 AA** :
  - `role="main"` sur le conteneur principal
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-hidden="true"` sur éléments décoratifs
  - `aria-label="Liens rapides"` sur la navigation
  - Focus visible sur les liens

- **Tests** : 40 tests unitaires + 8 tests E2E

### Page 500 personnalisée (SP-303 - 20 janvier 2026)

Page d'erreur serveur personnalisée avec animations Framer Motion et accessibilité WCAG 2.1 AA :

- **error-logger.ts** : Utilitaire de logging serveur
  - Extraction sécurisée des erreurs (Error, string, unknown)
  - Logging structuré (JSON en production, formaté en dev)
  - Support des digests Next.js
  - Hooks préparés pour Sentry/LogRocket

- **ServerErrorPage** : Page 500 complète
  - "500" en grand avec gradient text destructive
  - Icône ServerCrash avec style destructive
  - Titre et description en français
  - Bouton "Réessayer" (reload), "Accueil", "Signaler le problème"
  - Props personnalisables : errorCode, errorMessage, digest, showReportButton

- **Next.js App Router** :
  - `/server-error` pour tests manuels
  - Intégration avec error.tsx et global-error.tsx

- **Accessibilité WCAG 2.1 AA** :
  - `role="region"` sur le conteneur (évite les duplicates `<main>` avec le layout)
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-hidden="true"` sur éléments décoratifs
  - Labels accessibles sur tous les boutons
  - Navigation clavier complète (Tab, Enter)

- **Tests** : 74 tests unitaires + 22 tests E2E

### Command Palette Cmd+K (SP-264 - 22 janvier 2026)

Système de palette de commandes accessible via `Cmd+K` (Mac) ou `Ctrl+K` (Windows/Linux) :

- **Package cmdk** : Librairie `cmdk` v1.1.1 pour l'interface command palette
- **useKeyboardShortcuts** : Hook centralisé pour les raccourcis clavier
  - Support modifiers : `mod+k`, `ctrl+k`, `shift+mod+k`, `alt+k`
  - Support séquences : `g h` (go home), `g e` (go employees)
  - Ignore automatique dans les inputs/textarea
  - Option `enableInInputs` pour forcer l'activation
  - Détection plateforme (Mac vs Windows)

- **CommandPalette** : Composant principal avec animations Framer Motion
  - **Navigation** : Dashboard, Plannings, Congés, Équipes, Statistiques, Paramètres
  - **Actions rapides** : Nouveau planning, Nouvelle demande de congé, Nouvelle équipe
  - **Thème** : Mode clair / Mode sombre / Thème système
  - **Aide** : Raccourcis clavier, Documentation, Centre d'aide
  - Recherche fuzzy avec filtrage en temps réel
  - Filtrage RBAC selon le rôle utilisateur (SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE)
  - Shortcuts affichés sur chaque item (ex: `G H` pour Dashboard)

- **CommandPaletteProvider** : Context React pour état global
  - Hook `useCommandPalette()` : `{ open, setOpen, toggle }`
  - Intégration automatique du raccourci Cmd+K
  - Wrapping dans DashboardLayout

- **Intégration Header** :
  - Bouton "Rechercher..." avec badge `⌘K` (desktop)
  - Icône loupe (mobile)
  - ThemeToggle adjacent

- **Tests** : 55 tests unitaires (25 hook + 23 component + 7 provider)

**Import** :

```typescript
// Hook raccourcis clavier
import { useKeyboardShortcuts, useKeyboardShortcut } from '@/hooks'

// Provider et hook command palette
import {
  CommandPaletteProvider,
  useCommandPalette,
} from '@/components/providers'
```

### Dynamic Breadcrumbs (SP-264 - 22 janvier 2026)

Fil d'Ariane dynamique avec résolution automatique des IDs vers des noms lisibles :

- **DynamicBreadcrumbs** : Composant principal avec résolution API
  - Détection automatique des IDs (UUID, CUID, numeric 3+ digits)
  - Skeleton loading pendant la résolution
  - Schema.org BreadcrumbList pour SEO
  - Accessibilité ARIA complète
  - Support thème dark/light

- **API Route** : `/api/entities/[type]/[id]`
  - Types supportés : employees, teams, companies, schedules, leave-requests
  - Validation des formats d'ID (UUID, CUID, numeric)
  - Requêtes Prisma optimisées avec select minimal
  - Cache HTTP (s-maxage=60, stale-while-revalidate=300)

- **useBreadcrumbResolver** : Hook avec SWR
  - Cache SWR avec déduplication (60s)
  - États loading/error/success
  - Fonctions utilitaires : `isIdSegment()`, `getEntityTypeFromPreviousSegment()`

- **Mapping segments** :
  - `employees`, `employee` → Employés
  - `teams`, `team` → Équipes
  - `companies`, `organizations` → Entreprises
  - `schedules`, `planning` → Plannings
  - `leaves`, `leave-requests`, `conges` → Demandes de congés

- **Tests** : 43 tests unitaires (8 API + 12 hook + 23 component)

**Import** :

```typescript
// Composant breadcrumbs
import { DynamicBreadcrumbs } from '@/components/ui/dynamic-breadcrumbs'

// Hook et utilitaires
import {
  useBreadcrumbResolver,
  isIdSegment,
  getEntityTypeFromPreviousSegment,
} from '@/hooks'
```

### Navigation Shortcuts & Keyboard Shortcuts Modal (SP-264 Phase 3 - 22 janvier 2026)

Système de raccourcis clavier Vim-style pour la navigation rapide + modal d'aide accessible via `?` :

- **useNavigationShortcuts** : Hook pour les séquences de navigation Vim-style
  - Séquences supportées (2 touches) :
    | Séquence | Action | Description |
    |----------|--------|-------------|
    | `g h` | Go Home | Aller au Dashboard |
    | `g e` | Go Employees | Aller aux Employés |
    | `g t` | Go Teams | Aller aux Équipes |
    | `g p` | Go Plannings | Aller aux Plannings |
    | `g l` | Go Leaves | Aller aux Congés |
    | `g s` | Go Settings | Aller aux Paramètres |
    | `g c` | Go Company | Aller à l'Entreprise |
  - Timeout configurable (1000ms par défaut)
  - Désactivation automatique dans les inputs/textarea/contenteditable
  - Ignore les modificateurs (Ctrl, Alt, Meta)

- **KeyboardShortcutsModal** : Modal accessible avec tous les raccourcis
  - Ouverture via `?` (touche question)
  - Design Radix Dialog + Framer Motion AnimatePresence
  - Groupes par catégorie : Navigation, Actions, Aide
  - Détection OS : `⌘` sur Mac, `Ctrl` sur Windows/Linux
  - Accessibilité ARIA complète (focus trap, Escape to close)
  - Support `prefers-reduced-motion`

- **KeyboardShortcutsProvider** : Context React pour gestion centralisée
  - Hook `useKeyboardShortcutsContext()` : `{ isOpen, openModal, closeModal, toggleModal }`
  - Intégré dans DashboardLayout
  - Connecté à CommandPalette via callback `onShowShortcuts`

- **Intégration Command Palette** :
  - Item "Raccourcis clavier" dans groupe Aide ouvre la modal
  - Callback `onShowShortcuts` propagé via CommandPaletteProvider

- **Tests** : 35 tests unitaires (15 hook + 10 modal + 10 provider)

**Import** :

```typescript
// Provider et hook
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
} from '@/providers'

// Hook navigation Vim-style
import { useNavigationShortcuts, DEFAULT_NAVIGATION_SHORTCUTS } from '@/hooks'

// Modal (usage interne via provider)
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal'
```

### Navigation Mobile - SwipeableDrawer (SP-383/SP-384 - 23 janvier 2026)

Système de navigation mobile avec drawer swipeable et gestes tactiles Framer Motion :

- **SwipeableDrawer** : Composant drawer mobile avec gestes tactiles
  - Swipe horizontal pour fermer (seuil 100px ou vélocité 500px/s)
  - Animation spring fluide (damping: 30, stiffness: 400)
  - Support iOS safe-area (env(safe-area-inset-\*))
  - Body scroll lock quand ouvert
  - Focus trap et accessibilité (aria-modal, role="dialog")
  - Portal rendering (z-index correct)
  - Respect `prefers-reduced-motion`
  - Props : `side` (left/right), `width`, `swipeToClose`, `swipeThreshold`, `velocityThreshold`

- **Hooks personnalisés** :
  - `useBodyScrollLock(locked)` : Verrouillage scroll body avec compensation scrollbar
  - `usePrefersReducedMotion()` : Détection préférence animation réduite
  - `useFocusTrap(containerRef, isActive)` : Focus trap basique pour accessibilité

- **Intégration Sidebar** :
  - Sidebar utilise SwipeableDrawer sur mobile (< 768px)
  - Feature flag `USE_SWIPEABLE_DRAWER` pour rollback facile
  - Gestes natifs au lieu de Sheet Radix sur mobile
  - Desktop : comportement Sidebar classique inchangé

- **Tests** : 21 tests unitaires (100% coverage)
  - Rendering conditionnel (open/closed)
  - Props side left/right
  - Swipe gesture detection
  - Accessibility (focus trap, Escape, aria)
  - Body scroll lock
  - Overlay click to close
  - Close button
  - Custom width et className
  - Callbacks (onOpen, onClose)
  - Swipe indicator visibility
  - Drag configuration

**Import** :

```typescript
// Composant drawer mobile
import { SwipeableDrawer, type SwipeableDrawerProps } from '@/components/mobile'
```

### Mobile UI Components (SP-268 Phase 3 - 23 janvier 2026)

Adaptations mobiles des composants UI principaux avec zones tactiles WCAG 2.5.5 (44px minimum) :

- **SP-385 : TouchableButton** - Boutons adaptatifs mobile/desktop
  - Hook `useIsMobile()` : Détection viewport < 768px avec matchMedia
  - Variants tactiles : `touch`, `touch-sm`, `touch-icon`, `touch-lg` (44-48px)
  - Mapping automatique : `default` → `touch`, `sm` → `touch-sm`, `icon` → `touch-icon`
  - Feedback tactile : `active:scale-95 active:opacity-90`
  - Prop `forceTouchMode` pour forcer le mode tactile sur desktop
  - 31 tests unitaires

- **SP-386 : CommandPalette Mobile** - Adaptation modale plein écran sur mobile
  - Layout full-screen avec hauteur dynamique (Visual Viewport API)
  - Bouton close explicite avec `×` (44x44px touch target)
  - Safe-area insets iOS (`env(safe-area-inset-*)`)
  - Input `text-base` (16px) pour éviter le zoom iOS
  - Badge `ESC` remplacé par `×` sur mobile
  - Placeholder adaptatif : "Tapez pour rechercher..." vs "Rechercher ou tapez une commande..."
  - Footer masqué sur mobile (raccourcis clavier non pertinents)
  - 32 tests unitaires

- **SP-387 : DataTablePagination Responsive** - Pagination adaptative
  - Layout vertical empilé sur mobile, inline sur desktop
  - Boutons First/Last masqués sur mobile (économie d'espace)
  - Format page compact : "3/5" (mobile) vs "Page 3 sur 5" (desktop)
  - Labels abrégés : "Par page" vs "Lignes par page"
  - Options réduites sur mobile : [10, 25, 50] vs [10, 20, 50, 100]
  - SelectTrigger avec `min-h-[44px]` sur mobile
  - Total compact : "45 résultat(s)" vs "45 ligne(s) au total"
  - 22 tests unitaires

- **SP-388 : ResponsiveBreadcrumb** - Fil d'Ariane avec scroll horizontal mobile
  - Scroll horizontal avec masquage de la scrollbar (`scrollbar-none`)
  - Scroll-snap (`snap-x snap-mandatory`, `snap-center` sur items)
  - Auto-scroll vers la page courante à droite
  - Indicateurs de fade aux bords (`bg-gradient-to-r/l from-background`)
  - Touch behavior optimisé (`touch-pan-x`)
  - 25 tests unitaires

**Import** :

```typescript
// Boutons adaptatifs
import { TouchableButton, useIsMobile } from '@/components/ui/button'

// Breadcrumb responsive
import { ResponsiveBreadcrumb } from '@/components/ui/breadcrumb'

// Pagination responsive (utilisée automatiquement dans DataTable)
import { DataTablePagination } from '@/components/ui/data-table'
```

### Recent Pages avec localStorage (SP-264 Phase 4 - 22 janvier 2026)

Système de pages récentes stockées en localStorage avec affichage dans la Command Palette :

- **recentPagesStore** : Store externe compatible `useSyncExternalStore`
  - API : `getSnapshot()`, `getServerSnapshot()`, `subscribe()`, `addPage()`, `clear()`
  - Limite FIFO de 5 pages maximum
  - Déduplication automatique par path (revisite = mise à jour timestamp + remontée en tête)
  - Validation stricte des entrées (path, title, visitedAt obligatoires)
  - Gestion robuste des erreurs JSON parsing
  - SSR-safe : `getServerSnapshot()` retourne toujours `[]` pour éviter les erreurs d'hydratation

- **useRecentPages** : Hook React pour accès au store
  - Utilise `useSyncExternalStore` pour synchronisation réactive
  - États : `recentPages`, `isLoading`
  - Actions : `addPage({ path, title, icon? })`, `clearHistory()`
  - Fonctions memoizées avec `useCallback` pour stabilité des références

- **formatRelativeTime** : Utilitaire de formatage temporel en français
  - Granularité adaptative : "À l'instant" (< 30s) → "Il y a X min" → "Il y a Xh" → "Il y a Xj"
  - Au-delà d'une semaine : date formatée (ex: "15 janv.")
  - Version longue `formatRelativeTimeLong` pour tooltips
  - Gestion des cas limites (timestamps invalides, futur)

- **PageTracker** : Composant invisible de tracking automatique
  - Détection changements de route via `usePathname`
  - Mapping pathname → titre + icône via `ROUTE_INFO_MAP` et `navigationItems`
  - Exclusion des routes non-dashboard (/auth, /api, /login, etc.)
  - Support des pages de détail dynamiques (IDs UUID/CUID/numeric)
  - Protection contre le tracking en double (`lastTrackedPath` ref)
  - RGPD compliant : stocke uniquement path, title, icon, timestamp

- **Intégration Command Palette** :
  - Groupe "Pages récentes" affiché en tête si `recentPages.length > 0`
  - Icônes dynamiques via `getIconByName()` (lookup dans LucideIcons)
  - Temps relatif affiché à droite de chaque item
  - Navigation au clic comme les autres items

- **Tests** : 53 tests unitaires (27 format-relative-time + 18 recent-pages-store + 8 use-recent-pages)

**Import** :

```typescript
// Store et types
import {
  recentPagesStore,
  type RecentPage,
} from '@/lib/storage/recent-pages-store'

// Hook React
import { useRecentPages } from '@/hooks/use-recent-pages'

// Formatage temps relatif
import {
  formatRelativeTime,
  formatRelativeTimeLong,
} from '@/lib/utils/format-relative-time'

// Tracking automatique (à placer dans le layout)
import { PageTracker } from '@/components/layout/PageTracker'
```

### Loading States avancés (SP-266 - 21 janvier 2026)

Système complet de composants et hooks pour la gestion des états de chargement avec animations Framer Motion :

- **ProgressBar** : Barre de progression horizontale
  - Modes : déterminé (0-100%) et indéterminé (animation infinie)
  - Tailles : sm (4px), md (8px), lg (12px)
  - Couleurs : primary, success, warning, destructive, info
  - Props : `showLabel`, `customLabel`, `onComplete`
  - Animation : transitions fluides avec Framer Motion
  - Accessibilité : `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

- **ProgressCircle** : Indicateur circulaire de progression
  - Modes : déterminé (0-100%) et indéterminé (rotation infinie)
  - Tailles : sm (32px), md (48px), lg (64px)
  - Couleurs : primary, success, warning, destructive, info
  - Props : `showValue`, `centerLabel`, `strokeWidth`, `onComplete`
  - Animation : stroke-dashoffset animé avec Framer Motion
  - Accessibilité : `role="progressbar"`, ARIA complet

- **useLoading** : Hook de gestion d'état de chargement
  - `startLoading()`, `stopLoading()`, `toggleLoading()`, `reset()`
  - `withLoading(asyncFn)` : wrapper pour fonctions async
  - Options : `initialState`, `minDuration`, `onStart`, `onEnd`
  - Callbacks memoizés pour stabilité des références

- **useProgressLoading** : Hook de progression avec valeur
  - Étend `useLoading` avec gestion de pourcentage (0-100)
  - `setProgress(value)`, `incrementProgress(amount)`, `resetProgress()`
  - Détection automatique de complétion à 100%
  - Callback `onProgressComplete`

- **withLoading** : HOC pour composants avec état loading
  - Injection automatique de `isLoading` et méthodes
  - Props additionnelles typées avec génériques TypeScript
  - Support ref forwarding

- **Tests** : 131 tests unitaires (100% coverage)
  - ProgressBar : 45 tests
  - ProgressCircle : 42 tests
  - useLoading : 27 tests
  - useProgressLoading : 17 tests

### Dark/Light Mode (SP-265 - 21 janvier 2026)

Système complet de thème clair/sombre avec détection automatique des préférences système :

- **ThemeProvider** : Wrapper next-themes configuré pour SmartPlanning
  - `attribute="class"` : Compatible Tailwind CSS darkMode
  - `defaultTheme="dark"` : Dark mode par défaut pour SmartPlanning
  - `enableSystem` : Détection prefers-color-scheme après choix utilisateur
  - Persistance localStorage automatique

- **ThemeToggle** : Bouton de bascule avec cycle intelligent
  - Cycle : system → light → dark → system
  - Icônes animées (Sun/Moon/Monitor) avec Framer Motion
  - Gestion hydratation SSR (mounted state)
  - Support `prefers-reduced-motion`

- **ThemeDropdown** : Menu dropdown avec 3 options explicites
  - Options : Clair, Sombre, Système
  - Descriptions explicatives pour chaque option
  - Animations Framer Motion (AnimatePresence)
  - Fermeture au clic extérieur et touche Escape
  - Accessibilité : aria-expanded, aria-haspopup, role="listbox"

- **Intégration Headers** :
  - `LandingHeader` : ThemeToggle dans la navigation desktop
  - `Header` (Dashboard) : ThemeToggle dans les actions utilisateur

- **CSS Variables** : Support complet light/dark dans globals.css
  - Variables HSL pour toutes les couleurs sémantiques
  - Classe `.dark` pour le mode sombre
  - Transitions fluides entre thèmes

- **Tests** : 30 tests unitaires (4 ThemeProvider + 12 ThemeToggle + 14 ThemeDropdown)

### Page 403 personnalisée (SP-305 - 20 janvier 2026)

Page d'accès refusé personnalisée avec animations Framer Motion et accessibilité WCAG 2.1 AA :

- **ForbiddenPage** : Page 403 complète
  - "403" en grand avec gradient text orange
  - Icône ShieldAlert avec animation pulse
  - Titre "Accès non autorisé" et description en français
  - Bouton "Dashboard" (orange), "Accueil" (outline), "Contacter l'administrateur"
  - Props personnalisables : reason, requiredRole, currentRole, showContactAdmin
  - Affichage optionnel des informations de rôle (requis vs actuel)

- **Next.js 15 App Router** :
  - `forbidden.tsx` : Convention native pour forbidden() (requires experimental.authInterrupts)
  - `/access-denied` : Route de test accessible directement
  - Intégration avec Server Components, Server Actions, Route Handlers

- **Accessibilité WCAG 2.1 AA** :
  - `role="region"` sur le conteneur principal (évite conflit avec `<main>` du layout)
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-hidden="true"` sur éléments décoratifs
  - Labels accessibles sur tous les boutons
  - Navigation clavier complète (skip-link → boutons)

- **Tests** : 47 tests unitaires + 24 tests E2E (tous passants)

### Formulaire de Contact (SP-287, SP-289 - 19 janvier 2026)

- **Composant ContactForm** : Formulaire complet avec React Hook Form + Zod
- **Validation** : Schéma Zod pour nom, email, sujet, message (messages FR)
- **Accessibilité** : aria-labels, aria-required, aria-invalid, aria-describedby, role="alert", role="status"
- **UX États animés (SP-289)** :
  - Machine d'état : idle → submitting → success/error
  - `ContactSuccessState` : Checkmark SVG animé (pathLength), message personnalisé, bouton reset
  - `ContactErrorState` : Animation shake, bouton retry, conservation données formulaire
  - `useContactForm` hook : Gestion état, retry automatique, mock mode
  - Animations Framer Motion (variants centralisés dans `lib/animations/contact.ts`)
- **Design** : Glassmorphism, animations Framer Motion, responsive
- **ContactSection** : Intégration landing page avec infos contact (email, localisation, disponibilité 24/24)
- **Tests** : 95 tests unitaires (20 validation + 21 form + 54 UX states)

### Fonctionnalités avancées (Post-MVP)

- Notifications push et email
- Mode hors-ligne (PWA)
- Application mobile (React Native)
- IA pour optimisation des plannings
- Intégration calendrier (Google/Outlook)
- API publique pour intégrations tierces

## Architecture

```
SmartplanningAI/
├── src/
│   ├── app/              # Next.js 15 App Router
│   │   ├── (auth)/       # Routes publiques (login, register)
│   │   ├── (about)/      # Pages À propos et Tarifs
│   │   │   ├── a-propos/         # Page principale + AboutContent + StructuredData
│   │   │   ├── tarifs/           # Page tarifs + PricingPageContent + StructuredData (SP-359)
│   │   │   ├── components/       # ValueCard, TargetCard
│   │   │   └── data.ts           # Données valeurs et cibles
│   │   ├── (landing)/    # Landing page et composants
│   │   │   ├── components/       # Composants sections
│   │   │   ├── data/             # Features, benefits, pricing, FAQs
│   │   │   └── styles/           # CSS modules
│   │   ├── (legal)/      # Pages légales RGPD
│   │   │   ├── mentions-legales/ # Mentions légales
│   │   │   ├── cgu/              # CGU
│   │   │   ├── cgv/              # CGV
│   │   │   ├── confidentialite/  # Politique confidentialité
│   │   │   ├── cookies/          # Politique cookies
│   │   │   └── components/       # LegalPageLayout, LegalSection...
│   │   ├── (dashboard)/  # Route group dashboards
│   │   │   └── dashboard/        # /dashboard (redirect par rôle)
│   │   │       ├── employee/     # /dashboard/employee (page + composants)
│   │   │       ├── director/     # /dashboard/director (page + composants)
│   │   │       └── admin/        # /dashboard/admin (page + composants Super Admin)
│   │   ├── app/          # Routes protégées par rôle (legacy)
│   │   │   ├── dashboard/        # Dashboard EMPLOYEE (tous rôles)
│   │   │   ├── manager/dashboard/  # Dashboard MANAGER+
│   │   │   ├── director/dashboard/ # Dashboard DIRECTOR+
│   │   │   └── admin/dashboard/    # Dashboard SYSTEM_ADMIN
│   │   ├── api/          # API Routes
│   │   │   ├── avatar/           # Upload/Delete avatar Cloudinary (SP-272)
│   │   └── layout.tsx
│   ├── components/       # Composants React réutilisables
│   │   ├── ui/           # Shadcn components (button, form, label...)
│   │   ├── mobile/       # Composants mobile (SP-383)
│   │   │   ├── swipeable-drawer.tsx  # Drawer avec gestes Framer Motion
│   │   │   ├── __tests__/            # 21 tests unitaires
│   │   │   └── index.ts              # Barrel export
│   │   ├── auth/         # LoginForm, RegisterForm (variant dark/light)
│   │   ├── cards/        # UserCard, TeamCard, AvatarStack
│   │   ├── error/        # ErrorBoundary, ErrorFallback (SP-304), NotFoundPage (SP-302), ServerErrorPage (SP-303), ForbiddenPage (SP-305)
│   │   ├── charts/       # AreaChartWidget, BarChartWidget, PieChartWidget
│   │   ├── cookies/      # CookieBanner, CookiePreferencesModal, CookieSettingsButton, CookieConsentProvider
│   │   ├── providers/    # ThemeProvider (SP-265), CommandPaletteProvider (SP-264), KeyboardShortcutsProvider (SP-264)
│   │   ├── dashboard/    # StatCard, TrendIndicator, StatsGrid
│   │   ├── forms/        # FormField, FormInput, FormSelect...
│   │   ├── pricing/      # PricingSimulator, PricingCard (SP-355)
│   │   ├── admin/        # Employees (BulkDeleteDialog, EmployeeCard, EmployeesDataTable, EmployeeForm, columns)
│   │   ├── schedules/    # ScheduleCalendar, ScheduleCalendarDesktop, ScheduleCalendarMobile, ShiftModal, WeeklyHoursPanel, ExportDropdown, AvailabilityOverlay/Badge/Popover
│   │   ├── layout/       # LandingHeader, LandingFooter, Sidebar, Header, DashboardLayout, PageTracker
│   │   ├── loading/      # Spinner, Skeleton, LoadingOverlay
│   │   ├── modals/       # ConfirmDialog, FormDialog
│   │   ├── toast/        # Toast system (Sonner)
│   │   └── ui/           # Shadcn + ThemeToggle, ThemeDropdown (SP-265), ProgressBar, ProgressCircle (SP-266), CommandPalette, KeyboardShortcutsModal, DynamicBreadcrumbs (SP-264)
│   ├── lib/              # Utilitaires et helpers
│   │   ├── prisma.ts     # Client Prisma
│   │   ├── auth.ts       # Configuration NextAuth
│   │   ├── auth.config.ts # Config middleware + callbacks RBAC
│   │   ├── permissions.ts # Système de permissions centralisé
│   │   ├── animations/   # Système d'animation centralisé (SP-379)
│   │   │   ├── variants.ts       # Tous les variants Framer Motion
│   │   │   ├── presets.ts        # Presets d'animation
│   │   │   ├── config.ts         # Configuration (durées, easings)
│   │   │   ├── hooks/            # useReducedMotion, useScrollAnimation
│   │   │   └── index.ts          # Export centralisé (motion + variants)
│   │   ├── navigation/   # Navigation centralisée (SP-264)
│   │   │   └── menu-items.ts     # Items navigation (Sidebar + CommandPalette)
│   │   ├── storage/       # Stores localStorage (SP-264)
│   │   │   └── recent-pages-store.ts # Store pages récentes (useSyncExternalStore)
│   │   ├── utils/         # Utilitaires divers
│   │   │   └── format-relative-time.ts # Formatage temps relatif FR
│   │   ├── actions/      # Server Actions
│   │   │   ├── auth-actions.ts      # Actions authentification (inscription)
│   │   │   ├── password-actions.ts  # Actions reset password (SP-298)
│   │   │   ├── verification-actions.ts # Actions vérification email (SP-299)
│   │   │   └── crud-utils.ts        # Utilitaires CRUD génériques (SP-150)
│   │   ├── email/        # Système d'emails (Sprint 9)
│   │   │   ├── index.ts          # Export principal
│   │   │   ├── config.ts         # Configuration SMTP
│   │   │   ├── send.ts           # Fonction sendEmail avec retry
│   │   │   └── templates/        # Fonctions d'envoi par type
│   │   ├── services/     # Services métier
│   │   │   ├── dashboard/  # Services stats par rôle (SP-144)
│   │   │   └── stripe/     # Service abonnements & webhooks (SP-351)
│   │   ├── config/       # pricing.ts (constantes et calculs tarifs SP-355)
│   │   ├── stripe/       # Client Stripe singleton, config centralisée, barrel export (SP-349/SP-350)
│   │   ├── validations/  # Schémas Zod (auth, user, employee, company, team, schedule, availability, stripe...)
│   │   ├── pdf/          # SchedulePdfDocument, styles (SP-403)
│   │   ├── excel/        # generateScheduleExcel (SP-404)
│   │   └── utils.ts      # Fonctions utilitaires
│   ├── types/            # Types TypeScript globaux (+ crud.ts SP-150)
│   ├── hooks/            # Custom React hooks
│   │   ├── useCrudMutation.ts    # Hook mutations CRUD (SP-150)
│   │   ├── useCookieConsent.ts   # Hook consentement cookies (SP-283)
│   │   ├── useUmamiTrack.ts      # Hook tracking analytics (SP-345)
│   │   ├── useContactForm.ts     # Hook machine d'état contact (SP-289)
│   │   ├── use-loading.ts        # Hook état chargement (SP-266)
│   │   ├── use-progress-loading.ts # Hook progression avec valeur (SP-266)
│   │   ├── use-keyboard-shortcuts.ts # Hook raccourcis clavier (SP-264)
│   │   ├── use-navigation-shortcuts.ts # Hook navigation Vim-style (SP-264)
│   │   └── use-recent-pages.ts    # Hook pages récentes (SP-264 Phase 4)
│   ├── providers/        # Context providers centralisés
│   │   ├── index.ts              # Export centralisé
│   │   └── keyboard-shortcuts-provider.tsx # Provider modal raccourcis (SP-264)
│   └── middleware.ts     # Middleware NextAuth (protection routes)
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── migrations/       # Migrations Prisma
├── emails/               # Templates React Email (Sprint 9)
│   ├── components/       # Layout, Header, Footer, Button
│   ├── styles/           # Design tokens (colors, typography)
│   └── templates/        # WelcomeEmail, ResetPasswordEmail, VerificationEmail, LeaveApprovedEmail, LeaveRejectedEmail, ContactConfirmationEmail, ContactNotificationEmail
├── docs/                 # Documentation complète
│   ├── project-overview.md
│   ├── database-schema.md
│   ├── docker-setup.md
│   ├── JIRA-SETUP.md
│   └── ISSUES-TRACKING.md
├── e2e/                  # Tests E2E Playwright
│   ├── fixtures/         # Fixtures auth par rôle (SP-149) + mobile (SP-389)
│   ├── pages/            # Page Objects dashboards (SP-149) + schedules (SP-406)
│   ├── utils/            # Utilitaires (touch-gestures.ts pour mobile SP-389)
│   └── specs/            # middleware-rbac.spec.ts, auth.spec.ts, dashboard/*.spec.ts, mobile/*.spec.ts, schedules/*.spec.ts
├── __tests__/            # Tests unitaires Vitest
│   └── lib/              # permissions.test.ts, stripe/ (SP-349)
├── patches/              # Patches npm (patch-package) pour React 19 compat
│   ├── @radix-ui+react-presence+1.1.5.patch
│   └── @radix-ui+react-compose-refs+1.1.2.patch
├── docker-compose.yml    # Configuration Docker
└── README.md             # Ce fichier
```

## Installation et démarrage

### Prérequis

- Node.js 20+
- Docker Desktop
- Git
- PostgreSQL (via Docker ou local)

### Installation

```bash
# Cloner le repository
git clone https://github.com/krismos64/SmartplanningAI.git
cd SmartplanningAI

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Éditer .env.local avec vos valeurs

# Démarrer Docker (PostgreSQL + Redis + Adminer)
docker-compose up -d

# Exécuter les migrations Prisma
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate

# Démarrer le serveur de développement
npm run dev
```

### Accès aux services

- **Application** : http://localhost:3000
- **Adminer** : http://localhost:8081
  - Serveur : postgres
  - Utilisateur : smartplanning
  - Mot de passe : smartplanning_password
  - Base : smartplanning_db
- **PostgreSQL** : localhost:5433
- **Redis** : localhost:6380

## Scripts NPM disponibles

```bash
# Développement
npm run dev              # Démarrer Next.js en mode dev
npm run build            # Build production
npm run start            # Démarrer en mode production
npm run lint             # Linter ESLint

# Base de données
npm run db:migrate       # Exécuter les migrations
npm run db:push          # Push le schéma sans migration
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Seed la base (à créer)
npm run db:reset         # Reset complet de la DB

# Docker
npm run docker:up        # Démarrer les containers
npm run docker:down      # Arrêter les containers
npm run docker:logs      # Voir les logs

# Tests (à venir)
npm run test             # Tests unitaires
npm run test:e2e         # Tests E2E
npm run test:coverage    # Couverture de code
```

## Modèle de données

### Modèles principaux (13 modèles)

1. **User** : Utilisateurs de la plateforme
2. **Company** : Entreprises (multi-tenant)
3. **Department** : Départements par entreprise
4. **Employee** : Employés liés aux utilisateurs
5. **Planning** : Plannings par département
6. **Shift** : Créneaux de travail (templates)
7. **ShiftAssignment** : Affectations shifts → employés
8. **LeaveRequest** : Demandes de congés (avec halfDay/halfDayPeriod)
9. **LeaveBalance** : Soldes de congés par employé et par année (@@unique employeeId+year)
10. **Notification** : Système de notifications avec priority et actionUrl (SP-321)
11. **ActivityLog** : Logs d'activité (audit)
12. **CompanySettings** : Paramètres par entreprise
13. **Subscription** : Abonnements per-seat par entreprise (plan, statut, quantity, pricePerEmployee) (SP-350)
14. **Payment** : Historique des paiements Stripe (SP-350)

### Enums (13 enums)

1. **Role** : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE
2. **NotificationType** : INFO, SUCCESS, WARNING, ERROR, SYSTEM + PLANNING, LEAVE, TASK, INCIDENT (SP-321)
3. **NotificationPriority** : LOW, MEDIUM, HIGH, URGENT (SP-321)
4. **LeaveStatus** : PENDING, APPROVED, REJECTED, CANCELLED
5. **LeaveType** : PAID_LEAVE, RTT, SICK_LEAVE, UNPAID_LEAVE, PARENTAL_LEAVE, FAMILY_EVENT, OTHER
6. **ShiftStatus** : DRAFT, PUBLISHED, ARCHIVED
7. **DayOfWeek** : MONDAY, TUESDAY, ..., SUNDAY
8. **EmploymentType** : FULL_TIME, PART_TIME, TEMPORARY, INTERN
9. **ContractType** : CDI, CDD, INTERIM, FREELANCE, APPRENTICE, INTERN
10. **ScheduleType** : WORK, MEETING, BREAK, TRAINING, REMOTE, ON_CALL, OVERTIME, REST
11. **ScheduleStatus** : DRAFT, CONFIRMED
12. **SubscriptionPlan** : FREE, PER_SEAT (SP-350)
13. **SubscriptionStatus** : TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE (SP-350)

Voir `/docs/database-schema.md` pour le détail complet.

## Gestion de projet

### Jira

- **Préfixe** : `SP` (SmartPlanning)
- **Epic principal** : SP-0 "SmartPlanning V2 - Projet CDA"
- **Board** : Kanban (To Do → In Progress → Review → Testing → Done)
- **Configuration** : Voir `/docs/JIRA-SETUP.md`
- **Suivi** : Voir `/docs/ISSUES-TRACKING.md`

### Phases de développement

#### Phase 1 : Infrastructure ✅ (Terminée - 04/11/2025)

- SP-1 : Configuration Docker
- SP-2 : Schéma Prisma
- SP-3 : Migration init

#### Phase 2 : Architecture ✅ (Terminée)

- SP-4 : Architecture src/
- SP-5 : NextAuth v5
- SP-6 : Shadcn/ui
- SP-107 : Composants UI base (Sidebar, Breadcrumb)
- SP-118 : Système de layout
- SP-120 : DataTable avancée production-ready ✅

#### Phase 3 : Composants UI ✅ (Terminée - 2 décembre 2025)

- SP-119 : Form System (7 composants + 23 schémas Zod) ✅
- SP-121 : Modals et Loading States ✅
- SP-122 : Toast System (Sonner) ✅
- SP-123 : Composants métier (UserCard, TeamCard, AvatarStack) ✅

#### Phase 3.5 : Qualité & Déploiement ✅ (Terminée - 3 décembre 2025)

- SP-127 : Configuration VPS OVH ✅
- SP-128 : Pipeline CI/CD GitHub Actions ✅
- SP-129 : Page Coming Soon + Premier déploiement ✅

#### Phase 3.6 : Tests ✅ (Terminée - 5 décembre 2025)

- SP-125 : Configuration Vitest + MSW + Playwright ✅
- SP-126 : Tests unitaires composants UI (474 tests, 83.83% coverage) ✅

#### Phase 4 : Authentification ✅ (Terminée - 9 décembre 2025)

- SP-109 : Pages d'authentification complètes ✅
  - SP-136 : signupSchema Zod validation ✅
  - SP-137 : LoginForm component ✅
  - SP-138 : registerAction Server Action ✅
  - SP-139 : RegisterForm component ✅
  - SP-140 : Tests unitaires auth (34 tests) ✅
  - SP-141 : Tests E2E auth (18 tests) ✅
- SP-110 : Middleware RBAC & Protection routes ✅
  - Middleware NextAuth v5 avec protection automatique ✅
  - Hiérarchie 4 rôles : SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE ✅
  - Dashboards par rôle : `/app/dashboard`, `/app/manager/dashboard`, `/app/director/dashboard`, `/app/admin/dashboard` ✅
  - Redirections automatiques selon rôle ✅
  - Système de permissions centralisé (`hasMinimumRole`, `canAccessRoute`) ✅
  - 62 tests unitaires permissions ✅
  - 27 tests E2E middleware RBAC ✅

#### Phase 5 : Dashboard & CRUD 🚧 (En cours)

- SP-142 : Infrastructure Dashboard ✅
  - StatCard, TrendIndicator, StatsGrid (3 composants)
  - Types TypeScript dashboard
  - 186 tests unitaires
- SP-143 : Composants Charts Recharts ✅
  - ChartContainer (wrapper responsive + loading/empty states)
  - AreaChartWidget (graphiques d'aire avec gradients)
  - BarChartWidget (barres verticales/horizontales, stacked)
  - PieChartWidget (pie/donut avec labels pourcentage)
  - 88 tests unitaires
- SP-144 : Services Prisma Dashboard ✅
  - base-stats.service.ts (utilitaires partagés)
  - employee-stats.service.ts (heures, congés, tendances)
  - manager-stats.service.ts (équipe, couverture, demandes)
  - director-stats.service.ts (métriques entreprise)
  - admin-stats.service.ts (KPIs plateforme, MRR, churn)
  - types.ts + index.ts (typage ServiceResult<T>)
  - 119 tests unitaires avec vitest-mock-extended
- SP-145 : Dashboard Employee Page ✅
  - /dashboard : Redirection automatique par rôle
  - /dashboard/employee : Page complète Server Component
  - EmployeeWelcome : Message contextuel + prochain shift
  - EmployeeStats : 4 KPIs via StatsGrid
  - EmployeeSchedule : BarChartWidget heures hebdomadaires
  - EmployeeLeaveBalance : PieChartWidget solde congés
  - EmployeeQuickActions : Boutons actions rapides
  - Loading skeletons (global + employee)
  - 91 tests unitaires
- SP-147 : Dashboard Director Page ✅
  - /dashboard/director : Page complète Server Component avec RBAC
  - DirectorWelcome : Message contextuel + indicateur santé entreprise + alertes
  - DirectorStats : 6 KPIs via StatsGrid (employés, équipes, congés, heures, présence, absences)
  - DirectorTeamsChart : PieChartWidget répartition équipes avec légende
  - DirectorTrendsChart : AreaChartWidget évolution effectifs 6 mois
  - DirectorPendingLeaves : Liste congés en attente avec formatage dates FR
  - DirectorQuickActions : 4 boutons actions rapides avec badge compteur
  - Loading skeleton avec thème violet
  - 87 tests unitaires
- SP-148 : Dashboard Super Admin Page ✅
  - /dashboard/admin : Page complète Server Component avec protection SYSTEM_ADMIN
  - AdminWelcome : Message personnalisé + indicateur santé plateforme (MRR + churn)
  - AdminStats : 6 KPIs SaaS via StatsGrid (entreprises, utilisateurs, MRR, abonnements, conversion, churn)
  - AdminMrrChart : AreaChartWidget évolution entreprises avec % croissance
  - AdminSignupsChart : BarChartWidget inscriptions mensuelles (calcul deltas)
  - AdminPlansChart : PieChartWidget répartition plans avec légende détaillée
  - AdminRecentCompanies : Server Component async Prisma (5 dernières inscriptions)
  - AdminQuickActions : 4 boutons actions rapides avec badges compteurs
  - Loading skeleton avec thème rose
  - 115 tests unitaires
- SP-149 : Tests E2E complets Dashboards ✅
  - Fixtures d'authentification par rôle (e2e/fixtures/auth.fixture.ts)
  - Page Objects pour 4 dashboards (e2e/pages/)
  - 106 tests E2E répartis en 5 fichiers :
    - employee.spec.ts (15 tests) : accès, bienvenue, stats, planning, actions
    - manager.spec.ts (1 actif, 22 skipped) : UI non finalisée, tests en attente
    - director.spec.ts (22 tests) : KPIs, graphiques, congés en attente
    - super-admin.spec.ts (25 tests) : KPIs SaaS, MRR, entreprises
    - rbac-protection.spec.ts (21 tests) : protection routes par rôle
  - Navigateur unique : Chromium (Firefox/WebKit supprimés pour stabilité)
  - Tests responsivité : mobile (375px), tablette (768px)
  - Tests accessibilité : titres, hiérarchie, sémantique
- SP-113 : CRUD Users/Companies/Teams ✅
  - SP-150 : Infrastructure CRUD ✅
    - Types génériques (`CrudActionResult<T>`, `PaginatedResult<T>`, `ListQueryParams`)
    - Schémas Zod Company (create, update, filters) avec labels FR
    - Schémas Zod Team (create, update, members, palette couleurs)
    - Server Actions utilities (`withRoleCheck`, `validateData`, `handlePrismaError`)
    - Helpers pagination et contrôle accès multi-tenant
    - Hooks React (`useCrudMutation`, `useDeleteMutation`, `useRefreshList`)
    - 8 fichiers, 1377 lignes de code
  - SP-151 : CRUD Companies (SYSTEM_ADMIN) ✅
    - `/app/admin/companies` : Liste paginée avec DataTable
    - `/app/admin/companies/new` : Formulaire création
    - `/app/admin/companies/[id]` : Vue détail + édition
    - Server Actions : listCompanies, createCompany, updateCompany, deleteCompany
    - Filtres : statut, plan, recherche
  - SP-152 : CRUD Employees (DIRECTOR, MANAGER) ✅
    - `/app/dashboard/employees` : Liste paginée avec DataTable + filtres
    - `/app/dashboard/employees/new` : Formulaire création
    - `/app/dashboard/employees/[id]` : Vue détail
    - `/app/dashboard/employees/[id]/edit` : Édition
    - Server Actions : listEmployees, createEmployee, updateEmployee, deleteEmployee, toggleStatus
    - RBAC : DIRECTOR peut supprimer, MANAGER peut désactiver uniquement
  - SP-153 : CRUD Teams (DIRECTOR) ✅
    - `/app/director/teams` : Liste avec cartes équipes
    - `/app/director/teams/new` : Formulaire création
    - `/app/director/teams/[id]` : Vue détail équipe
    - `/app/director/teams/[id]/edit` : Édition équipe
    - `/app/director/teams/[id]/members` : Gestion des membres
    - Server Actions : listTeams, createTeam, updateTeam, deleteTeam, addMember, removeMember
  - SP-154 : Navigation Integration ✅
    - Configuration navigation par rôle
    - Sidebar dynamique avec liens CRUD
    - Breadcrumbs avec détection d'ID (CUID, UUID, numeric)
    - Empty States components (EmptyCompanies, EmptyEmployees, EmptyTeams)
  - SP-155 : Tests unitaires CRUD ✅ (296 tests)
  - SP-156 : Tests E2E CRUD ✅ (59 tests - 177 avec 3 navigateurs)
    - Page Objects : CompanyListPage, CompanyFormPage, EmployeeListPage, EmployeeFormPage, TeamListPage, TeamFormPage, TeamMembersPage
    - companies.spec.ts (18 tests) : CRUD + RBAC restrictions
    - employees.spec.ts (18 tests) : CRUD + permissions MANAGER/EMPLOYEE
    - teams.spec.ts (15 tests) : CRUD + gestion membres
    - empty-states.spec.ts (8 tests) : États vides + accessibilité
- SP-10 : Layout dashboard + sidebar
- SP-11 : Pages dashboard Manager

#### Phase 6 : Planning & Congés ✅ (En cours - Janvier 2026)

- SP-392 : Fondations Prisma (modèles Schedule, Availability, enums) ✅
- SP-393 : Validations Zod plannings (47 tests) ✅
- SP-394 : Server Actions CRUD plannings (30 tests) ✅
- SP-395 : Page liste plannings ✅
- SP-396 : Calendrier Schedule-X (desktop + mobile, 18 tests) ✅
- SP-397 : ShiftModal création/édition (30 tests) ✅
- SP-398 : Drag & drop + resize (19 tests) ✅
- SP-399 : Récurrence shifts (36 tests) ✅
- SP-400 : Détection conflits horaires (25 tests) ✅
- SP-401 : CRUD Indisponibilités (54 tests) ✅
- SP-402 : Overlay indisponibilités calendrier (47 tests) ✅
- SP-403 : Export PDF planning (6 tests) ✅
- SP-404 : Export Excel planning (7 tests) ✅
- SP-406 : Panneau heures hebdomadaires + Tests E2E plannings (16 tests) ✅
- SP-406 : Type REST (repos journée entière) ✅
- SP-406 : Simplification statuts (DRAFT/CONFIRMED) ✅
- SP-406 : Suppression en masse employés ✅
- SP-406 : Nom entreprise dynamique dans layout ✅
- SP-406 : Corrections boucles infinies React 19 ✅
- SP-406 : Refonte CSS calendrier Schedule-X ✅
- SP-115 : Workflow congés (demandes, validation, calendrier) 🚧

#### Phase 7 : Gestion des Congés (Sprint 13 - Janvier 2026)

- SP-407 : Epic Gestion des Congés
- SP-408 : Fondations Prisma — LeaveBalance + enrichissements + seed ✅
  - Modèle LeaveBalance (soldes congés payés + RTT par employé/année)
  - Champs halfDay/halfDayPeriod sur LeaveRequest
  - Ajout FAMILY_EVENT à l'enum LeaveType Prisma
  - Alignement types TS (PARENTAL_LEAVE ajouté)
  - Seed : 20 LeaveBalances + 6 nouvelles LeaveRequests (CANCELLED, halfDay, FAMILY_EVENT, PARENTAL_LEAVE)
- SP-409 : Validations Zod + utilitaires Leave Management (45 tests) ✅
  - 6 schémas Zod (create, update, updateBalance, filters, enums)
  - calculateWorkingDays (3 modes : MON_FRI, MON_SAT, ALL_DAYS)
  - hasEnoughBalance, getRemainingBalance
  - Labels, couleurs, icônes pour l'UI
- SP-410 : Server Actions CRUD Congés + Workflow Validation (48 tests) ✅
  - 11 server actions avec RBAC strict (EMPLOYEE/MANAGER/DIRECTOR/SYSTEM_ADMIN)
  - createLeaveRequest avec validation solde CP/RTT et warning conflit >50% équipe
  - reviewLeaveRequest avec transaction atomique (débit solde + email)
  - cancelLeaveRequest avec recrédit solde via $transaction
  - getTeamAbsences, getLeaveStats, checkLeaveConflicts
  - Multi-tenant : companyId vérifié systématiquement
- SP-411 : Composants UI Leave Management (50 tests) ✅
  - 8 composants React : LeaveTypeBadge, LeaveStatusBadge, LeaveConflictWarning, LeaveBalanceCard, LeaveBalanceEditDialog, LeaveRequestCard, LeaveRequestForm, LeaveReviewDialog
  - LeaveTypeBadge/LeaveStatusBadge : Badges avec icônes Lucide et couleurs par type/statut
  - LeaveBalanceCard : Carte CP/RTT avec ProgressBar et seuils couleur (success/warning/destructive)
  - LeaveBalanceEditDialog : Dialog RHF + Zod pour modifier les soldes (Director)
  - LeaveRequestCard : Carte demande avec actions contextuelles par rôle (edit/cancel/review)
  - LeaveRequestForm : Formulaire complet avec Calendar range, demi-journée, détection conflits équipe
  - LeaveReviewDialog : Dialog approbation/refus avec commentaire obligatoire sur refus
  - LeaveConflictWarning : Banner alerte quand >50% équipe absente
  - Barrel export `src/components/leaves/index.ts`
- SP-412 : Composants Liste & Calendrier Congés (39 tests) ✅
  - 6 composants React : LeaveFilters, LeavesList, LeavesListMobile, LeaveCalendar, LeaveCalendarDay, LeaveStatsBar
  - LeaveStatsBar : Badges filtres rapides par statut (pending/approved/rejected/cancelled) avec compteurs
  - LeaveFilters : Barre de filtres avec status, type, employé (MANAGER+), équipe (DIRECTOR+), période date range
  - LeaveCalendar : Grille mensuelle employés × jours avec navigation, colonnes sticky, légende types
  - LeaveCalendarDay : Cellule calendrier avec Popover tooltip, support demi-journée (AM/PM), weekend grisé
  - LeavesList : DataTable TanStack Table v8 avec pagination manuelle, actions contextuelles par rôle
  - LeavesListMobile : Vue responsive en cartes avec "Voir plus" et compteur
- SP-413 : Page Congés + Orchestrateur (18 tests) ✅
  - Route `/app/dashboard/leaves` avec metadata SEO (title, description, OpenGraph)
  - Server Component avec fetch initial (requests, stats, employees, teams)
  - LeavesPageContent : Client Component orchestrateur avec tabs (Liste/Calendrier)
- SP-414 : Pages Détail et Balances (48 tests) ✅
  - Route `/app/dashboard/leaves/[id]` : Page détail demande avec timeline événements
  - Route `/app/dashboard/leaves/balances` : Gestion soldes CP/RTT (DIRECTOR only)
  - LeaveDetailCard, LeaveTimeline : Composants détail avec historique
  - getAllLeaveBalances : Server action liste paginée des soldes
  - Stats bar avec filtres rapides cliquables par statut
  - Filtres URL sync (searchParams) avec refetch automatique
  - Dialog création/édition (desktop) / Sheet (mobile) responsive
  - Review dialog pour managers/directors
  - Sidebar href corrigé `/app/dashboard/leaves`
  - 18 tests unitaires (13 LeavesPageContent + 5 Sidebar)
- SP-414 à SP-415 : En attente (workflow, notifications) 🚧
- SP-416 : Tests E2E Leaves ✅ (21 tests Playwright, Page Object LeavesPage)

#### Phase 8+ : Notifications, IA... (À venir)

## Documentation complète

Toute la documentation est centralisée dans le dossier `/docs` :

1. **[Vue d'ensemble du projet](/docs/project-overview.md)**
   - Contexte et objectifs
   - Stack technique détaillée
   - Fonctionnalités principales
   - Roadmap

2. **[Schéma de base de données](/docs/database-schema.md)**
   - 11 modèles Prisma détaillés
   - 8 enums et leurs valeurs
   - Relations et contraintes
   - Exemples de requêtes

3. **[Configuration Docker](/docs/docker-setup.md)**
   - Docker Compose expliqué
   - PostgreSQL + Redis + Adminer
   - Résolution des conflits de ports
   - Variables d'environnement

4. **[Configuration Jira](/docs/JIRA-SETUP.md)**
   - Création du projet Jira
   - Epic et issues détaillées
   - Configuration MCP pour Claude Code
   - Smart Commits GitHub

5. **[Suivi des issues](/docs/ISSUES-TRACKING.md)**
   - Statut des 11 premières issues
   - Détails par phase
   - Prochaines actions
   - Changelog

6. **[DataTable avancée - Confluence](https://christophedev.atlassian.net/wiki/spaces/SP/pages/57409537/DataTable+avanc+e)**
   - Documentation complète du composant DataTable
   - Guide d'utilisation et props
   - Responsive design et accessibilité
   - [Décisions techniques](https://christophedev.atlassian.net/wiki/spaces/SP/pages/57901057/DataTable+D+cisions+techniques)

7. **[Guide de déploiement](/docs/deployment.md)**
   - Configuration VPS complète
   - Script de sécurisation automatisé
   - Résolution des problèmes UFW + Docker
   - Maintenance et monitoring

8. **Documentation sécurité (/docs/security/)**
   - [Plan de sécurisation complet](docs/security/security-hardening-plan.md)
   - [Incident UFW + Docker](docs/security/incident-2026-01-06-ufw-docker.md)
   - [Docker hardening](docs/security/docker-hardening-2026-01-05.md)

9. **Pages Légales, À propos & Tarifs**
   - `/mentions-legales` : Informations légales obligatoires
   - `/cgu` : Conditions Générales d'Utilisation
   - `/cgv` : Conditions Générales de Vente
   - `/confidentialite` : Politique de Confidentialité RGPD
   - `/cookies` : Politique Cookies détaillée
   - `/a-propos` : Présentation de SmartPlanning
   - `/tarifs` : Page tarifs dédiée avec simulateur, FAQ et JSON-LD (SP-359)

10. **[Umami Analytics](/docs/analytics.md)**
    - Configuration self-hosted (Docker + Nginx)
    - Composant UmamiAnalytics (chargement conditionnel)
    - Hook useUmamiTrack (events custom)
    - Intégration RGPD et consentement cookies
    - Dashboard et métriques

## Sécurité

### Système RBAC (Role-Based Access Control)

Le système de permissions est centralisé dans `src/lib/permissions.ts` :

```typescript
// Hiérarchie des rôles (du plus élevé au plus bas)
SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE

// Routes protégées par rôle minimum
/app/admin/*      → SYSTEM_ADMIN uniquement
/app/director/*   → DIRECTOR ou SYSTEM_ADMIN
/app/manager/*    → MANAGER, DIRECTOR ou SYSTEM_ADMIN
/app/*            → Tous les utilisateurs authentifiés
```

**Fonctions utilitaires :**

- `hasMinimumRole(userRole, requiredRole)` : Vérifie si un rôle a le niveau minimum requis
- `canAccessRoute(userRole, pathname)` : Vérifie si un rôle peut accéder à une route
- `getRoleDashboardPath(role)` : Retourne le dashboard approprié selon le rôle

### Implémentation OWASP

- Validation de tous les inputs (Zod)
- Protection CSRF (NextAuth)
- Cookies httpOnly + secure + sameSite
- Rate limiting sur les endpoints critiques
- Hashage des mots de passe (bcryptjs via `serverExternalPackages`)
- Variables d'environnement sécurisées (.env.local)
- Paiement sécurisé Stripe (validation Zod des env vars, clés préfixées)
- Gestion des permissions RBAC stricte
- Audit logs (ActivityLog)
- Content Security Policy (CSP) avec headers sécurisés (`upgrade-insecure-requests` conditionnel HTTP/HTTPS)
- SRI (Subresource Integrity) activé en production

### Variables d'environnement sensibles

Jamais commiter :

- `.env.local`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Tokens API

## Performance

### Optimisations

- Code splitting automatique (Next.js)
- Lazy loading des composants
- Images optimisées (next/image)
- Compression gzip
- Cache Redis pour sessions
- Indexes database optimisés
- React.memo sur composants lourds
- Suspense boundaries

### Analytics - Umami ✅ (SP-345 - 16-17 janvier 2026)

SmartPlanning utilise **Umami** comme solution d'analytics privacy-friendly et RGPD-compliant :

- **Self-hosted** : Déployé sur le VPS OVH (Docker + PostgreSQL dédié)
- **Accès dashboard** : `https://analytics.smartplanning.fr`
- **Tracking conditionnel** : Script chargé uniquement si consentement analytics accepté
- **Events custom** : Hook `useUmamiTrack()` pour tracker les conversions
- **Intégration RGPD** : Respecte le consentement cookies (catégorie "analytics")

**Architecture** :

- `UmamiAnalyticsWrapper` : Server Component qui injecte la config au runtime
- `UmamiAnalytics` : Client Component avec chargement conditionnel
- **Config hardcodée** : Les valeurs Umami sont intégrées en fallback pour contourner la limitation des `NEXT_PUBLIC_*` au build-time Docker

```tsx
// Exemple d'utilisation
import { useUmamiTrack } from '@/hooks/useUmamiTrack'

function CTAButton() {
  const { track } = useUmamiTrack()

  const handleClick = () => {
    track('cta-click', { location: 'hero' })
  }

  return <button onClick={handleClick}>S'inscrire</button>
}
```

📚 **Documentation complète** : [`/docs/analytics.md`](/docs/analytics.md)

### Monitoring Admin (SP-464, SP-465)

- Page `/app/admin/monitoring` SYSTEM_ADMIN avec Suspense + skeleton loading
- **Health Check DB** : Service `checkDatabaseHealth` (connexion, latence, pool Prisma, migrations Prisma)
- **KPIs SaaS** : Entreprises, utilisateurs, MRR, churn (via `getAdminQuickStats`)
- **Répartition abonnements** : Badges colorés par statut (ACTIVE, TRIAL, PAST_DUE, CANCELED, EXPIRED)
- **Graphiques Recharts** (SP-465) : Activité audit 7 jours (AreaChart), distribution abonnements (PieChart donut), top 5 actions audit (BarChart horizontal), croissance entreprises 30 jours (AreaChart)
- 52 tests unitaires (30 MVP + 22 charts)

### Améliorations Espace SYSTEM_ADMIN (SP-468 Epic - 20-23 février 2026)

9 tickets d'amélioration de l'espace admin pour la supervision SaaS :

- **SP-469 — Service MRR unifié** : Service partagé `mrr.service.ts` comme source de vérité unique pour le calcul du MRR (Monthly Recurring Revenue). Corrige l'incohérence entre Dashboard et Stats (deux implémentations divergentes). Filtre `company.isActive: true`, gestion `null` défensive, arrondi 2 décimales. 9 tests unitaires

- **SP-470 — Sécurisation /api/health** : Durcissement de l'endpoint healthcheck exposé. Suppression CORS `*`, restriction au domaine production. 3 niveaux d'accès : basic (Docker healthcheck, sans auth), standard (SYSTEM_ADMIN, métriques fonctionnelles), full (SYSTEM_ADMIN, versions runtime et pool DB). Principe de moindre privilège (OWASP A05:2021). 6 tests unitaires

- **SP-471 — Bouton Rafraîchir monitoring** : Composant `RefreshButton` générique utilisant `router.refresh()` (Next.js 15) pour invalider le cache des Server Components sans rechargement de page. `useTransition` pour feedback visuel (spinner + désactivation), horodatage dernière mise à jour avec `aria-live="polite"`. 4 tests unitaires

- **SP-472 — Page Utilisateurs cross-entreprises** : Page admin `/app/admin/users` avec tableau TanStack Table de tous les utilisateurs de toutes les entreprises. Jointure cross-tenant contrôlée (exception documentée au principe d'isolation multi-tenant, strictement SYSTEM_ADMIN). Filtres combinables (recherche, rôle, entreprise, statut). Export CSV client-side avec BOM UTF-8 pour compatibilité Excel FR. Double protection RBAC (middleware + Server Action). 9 tests unitaires

- **SP-473 — Widget « Essais à risque »** : Widget dashboard admin affichant les entreprises dont l'essai expire dans les 7 prochains jours, classées par urgence (critical 0-1j rouge, warning 2-3j orange, moderate 4-7j jaune). Calcul `potentialMrr` (employeeCount × 2,90€) pour priorisation commerciale. `Math.ceil` pour arrondi vers le haut des jours restants. 10 tests unitaires

- **SP-474 — Email contact admin → entreprise** : Modale de contact depuis la page Companies pour envoyer un email professionnel aux DIRECTOR d'une entreprise. Template React Email `AdminContactEmail` partagé, envoi Nodemailer, traçabilité `EmailLog` par destinataire. Catégories : information, facturation, technique, autre. 9 tests unitaires

- **SP-475 — Statistiques globales + export PDF** : Page admin `/app/admin/stats` avec 7 indicateurs SaaS parallèles (`Promise.all`) : MRR, croissance entreprises 12 mois, répartition abonnements, top 10 actions audit, DAU/MAU, taux de conversion essai→payant. Export PDF via `@react-pdf/renderer` côté serveur. Réutilisation `calculatePlatformMrr()` (SP-469). 12 tests unitaires

- **SP-476 — Notifications SSE temps réel SYSTEM_ADMIN** : Extension du système SSE existant pour 4 types de notifications admin : `NEW_COMPANY_REGISTERED` (inscription), `SUBSCRIPTION_PAST_DUE` (paiement échoué), `SUBSCRIPTION_CANCELED` (résiliation), `TRIAL_EXPIRED` (fin d'essai). Factory `createAdminNotification()` avec pattern fire-and-forget. Migration Prisma `Notification.companyId` optionnel. 7 tests unitaires

- **SP-477 — Broadcast email global** : Diffusion d'emails à tous les DIRECTOR actifs des entreprises ACTIVE/TRIAL. Server Action `sendAdminBroadcast()` avec batch de 10 via `Promise.allSettled` (résilient aux échecs partiels). Modale `BroadcastModal` avec 4 catégories (maintenance, mise à jour produit, information importante, offre commerciale). `EmailLog` par destinataire (SENT/FAILED). 9 tests unitaires

## SEO (SP-462)

### Optimisations automatiques

- Meta tags dynamiques (Next.js 15 Metadata API)
- Open Graph et Twitter Cards
- `src/app/sitemap.ts` — 8 pages publiques avec priorités hiérarchisées (homepage 1.0, tarifs 0.9, légales 0.3)
- `src/app/robots.ts` — Bloque /app/, /api/ et pages auth de l'indexation
- Favicon convention Next.js 15 (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`)
- Balises sémantiques HTML5
- Schema.org JSON-LD @graph (WebSite, Organization avec logo, SoftwareApplication, FAQPage)
- Canonical URLs sur toutes les pages publiques
- Keywords long-tail français (10 expressions ciblées)
- noindex defense-in-depth sur le layout dashboard
- Performance optimisée (Core Web Vitals)

### Pages optimisées SEO

| Page             | Meta Title | Meta Description | Canonical | Structured Data                                              |
| ---------------- | ---------- | ---------------- | --------- | ------------------------------------------------------------ |
| Landing          | ✅         | ✅               | ✅        | WebSite + Organization (logo) + SoftwareApplication + FAQPage (SP-462) |
| À propos         | ✅         | ✅               | ✅        | AboutPage + Organization + SoftwareApplication + FAQ         |
| Tarifs           | ✅         | ✅               | ✅        | SoftwareApplication + FAQPage + WebPage (SP-359)             |
| CGU              | ✅         | ✅               | ✅        | -                                                            |
| CGV              | ✅         | ✅               | ✅        | -                                                            |
| Confidentialité  | ✅         | ✅               | ✅        | -                                                            |
| Mentions légales | ✅         | ✅               | ✅        | -                                                            |
| Cookies          | ✅         | ✅               | ✅        | -                                                            |
| Login/Register   | ✅         | ✅               | -         | -                                                            |

### Optimisation LLMs (SP-462)

Toutes les pages publiques sont optimisées pour les LLMs (ChatGPT, Claude, Perplexity, Gemini) :

- `public/llms.txt` — Résumé structuré suivant la convention llmstxt.org
- `public/llms-full.txt` — Version détaillée avec fonctionnalités, comparaison tarifaire, stack et sécurité
- Homepage Server Component avec JSON-LD @graph 4 schemas (WebSite, Organization, SoftwareApplication, FAQPage)
- Keywords long-tail français pour le marché TPE/PME
- Structured Data JSON-LD étendu sur les pages À propos et Tarifs
- FAQ structurée (FAQPage Schema.org) sur la homepage et la page Tarifs
- Organization schema avec logo pour Google Knowledge Panel

## Tests

### Infrastructure de test

- **Framework** : Vitest 2.1.8
- **Testing Library** : React Testing Library + user-event
- **Mocking** : MSW (Mock Service Worker) + vitest-mock-extended
- **E2E** : Playwright (configuré)
- **Coverage** : v8 provider

### Couverture actuelle (23 février 2026 - SP-477)

| Catégorie                              | Coverage   | Tests    |
| -------------------------------------- | ---------- | -------- |
| **Global**                             | **~86%**   | **5914** |
| loading                                | 100%     | 152      |
| modals                                 | 100%     | 52       |
| cards                                  | 77.09%   | 88       |
| forms                                  | 76.65%   | 170      |
| auth                                   | ~95%     | 34       |
| permissions                            | 100%     | 62       |
| dashboard components                   | 100%     | 57       |
| charts                                 | 100%     | 88       |
| dashboard services                     | 100%     | 119      |
| dashboard employee                     | 100%     | 91       |
| dashboard director                     | 100%     | 87       |
| dashboard admin                        | 100%     | 115      |
| cookies                                | 100%     | 83       |
| analytics                              | 100%     | 13       |
| emails (Sprint 9)                      | 100%     | 129      |
| contact (SP-287/289)                   | 100%     | 95       |
| error boundary                         | 100%     | 22       |
| animations (SP-379)                    | 100%     | 102      |
| design tokens                          | 100%     | 99       |
| dark/light mode                        | 100%     | 30       |
| loading states (SP-266)                | 100%     | 131      |
| command palette (SP-264)               | 100%     | 55       |
| navigation shortcuts (SP-264)          | 100%     | 15       |
| keyboard shortcuts modal (SP-264)      | 100%     | 10       |
| keyboard shortcuts provider (SP-264)   | 100%     | 10       |
| recent pages store (SP-264 Phase 4)    | 100%     | 18       |
| use-recent-pages hook (SP-264 Phase 4) | 100%     | 8        |
| format-relative-time (SP-264 Phase 4)  | 100%     | 27       |
| swipeable-drawer (SP-383)              | 100%     | 21       |
| touchable-button (SP-385)              | 100%     | 31       |
| command-palette-mobile (SP-386)        | 100%     | 32       |
| data-table-pagination (SP-387)         | 100%     | 22       |
| responsive-breadcrumb (SP-388)         | 100%     | 25       |
| recurrence utils (SP-399)              | 100%     | 24       |
| RecurrenceConfig (SP-399)              | 100%     | 12       |
| schedules actions (SP-397/399)         | 100%     | 30       |
| schedule validation (SP-393/399)       | 100%     | 47       |
| availabilities actions (SP-401)        | 100%     | 22       |
| AvailabilityCard (SP-401)              | 100%     | 18       |
| AvailabilityModal (SP-401)             | 100%     | 14       |
| useConflictDetection (SP-400)          | 100%     | 12       |
| ConflictAlert (SP-400)                 | 100%     | 13       |
| useCalendarAvailabilities (SP-402)     | 100%     | 10       |
| AvailabilityBadge (SP-402)             | 100%     | 20       |
| AvailabilityOverlay (SP-402)           | 100%     | 17       |
| SchedulePdfDocument (SP-403)           | 100%     | 6        |
| generateScheduleExcel (SP-404)         | 100%     | 7        |
| WeeklyHoursPanel (SP-406)              | 100%     | -        |
| ScheduleCalendarMobile (SP-396)        | 100%     | 18       |
| leave validation schemas (SP-409)      | 100%     | 22       |
| leave-utils (SP-409)                   | 100%     | 23       |
| leaves actions (SP-410)                | 100%     | 48       |
| LeaveTypeBadge (SP-411)                | 100%     | 4        |
| LeaveStatusBadge (SP-411)              | 100%     | 4        |
| LeaveConflictWarning (SP-411)          | 100%     | 4        |
| LeaveBalanceCard (SP-411)              | 100%     | 6        |
| LeaveRequestCard (SP-411)              | 100%     | 11       |
| LeaveRequestForm (SP-411)              | 100%     | 15       |
| LeaveReviewDialog (SP-411)             | 100%     | 6        |
| LeaveStatsBar (SP-412)                 | 100%     | 6        |
| LeaveFilters (SP-412)                  | 100%     | 10       |
| LeaveCalendar (SP-412)                 | 100%     | 10       |
| LeavesList (SP-412)                    | 100%     | 13       |
| LeavesPageContent (SP-413)             | 100%     | 13       |
| Sidebar leaves link (SP-413)           | 100%     | 5        |
| LeaveDetailCard (SP-414)               | 100%     | 11       |
| LeaveTimeline (SP-414)                 | 100%     | 9        |
| LeaveDetailContent (SP-414)            | 100%     | 13       |
| BalancesPageContent (SP-414)           | 100%     | 15       |
| company-settings actions (SP-435)      | 100%     | 19       |
| pricing config (SP-355)               | 100%     | 23       |
| PricingSimulator (SP-355)             | 100%     | 20       |
| PricingCard (SP-355)                  | 100%     | 12       |
| PricingPageContent (SP-359)           | 100%     | 22       |
| StructuredData tarifs (SP-359)        | 100%     | 12       |
| stripe singleton (SP-349)            | 100%     | 9        |
| stripe-config (SP-349)               | 100%     | 29       |
| stripe validations (SP-349)          | 100%     | 28       |
| company validations (SP-350)         | 100%     | 37       |
| companies actions (SP-350)           | 100%     | 20       |
| CompanyCard (SP-350)                 | 100%     | 25       |
| CompanyForm (SP-350)                 | 100%     | -        |
| company columns (SP-350)            | 100%     | 20       |
| DeleteCompanyDialog (SP-350)        | 100%     | 10       |
| AdminRecentCompanies (SP-350)       | 100%     | 18       |
| admin-stats service (SP-350)        | 100%     | 39       |
| stripe service (SP-351)            | 100%     | 40       |
| webhook route (SP-351)             | 100%     | 10       |
| stripe actions (SP-352)           | 100%     | 32       |
| SubscriptionStatus (SP-360)       | 100%     | 16       |
| UsageIndicator (SP-360)           | 100%     | 8        |
| InvoiceHistory (SP-360)           | 100%     | 11       |
| BillingPageContent (SP-360)       | 100%     | 6        |
| subscription-guard (SP-440)       | 100%     | 31       |
| subscription-banner (SP-441)      | 100%     | 44       |
| SubscriptionBanner (SP-441)       | 100%     | 29       |
| subscription-sync (SP-439)       | 100%     | 27       |
| employees SP-439 (SP-439)        | 100%     | 6        |
| email-log service (SP-368)       | 100%     | 16       |
| billing email templates (SP-369) | 100%     | 27       |
| cron trial + webhooks (SP-370)   | 100%     | 25       |
| TeamCard (SP-460)                | 100%     | 14       |
| TeamForm (SP-460)                | 100%     | 20       |
| TeamMembersManager (SP-460)      | 100%     | 24       |
| TeamsDataTable (SP-460)          | 100%     | 14       |
| EmployeeCard (SP-460)            | 100%     | 18       |
| EmployeeFilters (SP-460)         | 100%     | 18       |
| DeleteEmployeeDialog (SP-460)    | 100%     | 16       |
| BulkDeleteDialog (SP-460)        | 100%     | 20       |
| columns employees (SP-460)       | 100%     | 16       |
| ExportDropdown (SP-460)          | 100%     | 12       |
| WeeklyHoursPanel (SP-460)        | 100%     | 16       |
| AvailabilityPopover (SP-460)     | 100%     | 13       |
| FormDatePicker (SP-460)          | 100%     | 20       |
| AvatarUpload (SP-460)            | 100%     | 21       |
| CookieConsentProvider (SP-460)   | 100%     | 16       |
| LeavesListMobile (SP-460)        | 100%     | 10       |
| ChartWidgets (SP-460)            | 100%     | 22       |
| UmamiAnalyticsWrapper (SP-460)   | 100%     | 5        |
| CompanyForm (SP-460)             | 100%     | 17       |
| send-functions billing (SP-460)  | 100%     | 9        |
| audit-schema (SP-442)            | 100%     | 30       |
| audit.service (SP-443)           | 100%     | 22       |
| audit-injection (SP-444)         | 100%     | 20       |
| audit-logs actions (SP-445)      | 100%     | 33       |
| getUserActivity (SP-463)         | 100%     | 17       |
| impersonate route (SP-456)       | 100%     | 10       |
| monitoring action (SP-464)       | 100%     | 10       |
| db-health service (SP-464)       | 100%     | 8        |
| HealthStatusBadge (SP-464)       | 100%     | 5        |
| DatabaseHealthPanel (SP-464)     | 100%     | 12       |
| MonitoringKpisGrid (SP-464)      | 100%     | 4        |
| SubscriptionBreakdownPanel (SP-464) | 100%  | 4        |
| monitoring-chart action (SP-465) | 100%     | 10       |
| ActivityChart (SP-465)           | 100%     | 4        |
| SubscriptionPieChart (SP-465)    | 100%     | 4        |
| TopActionsChart (SP-465)         | 100%     | 4        |
| CompanyGrowthChart (SP-465)      | 100%     | 4        |
| mrr.service (SP-469)             | 100%     | 9        |
| health endpoint (SP-470)         | 100%     | 6        |
| RefreshButton (SP-471)           | 100%     | 4        |
| admin users page (SP-472)        | 100%     | 9        |
| trials at risk (SP-473)          | 100%     | 10       |
| admin contact email (SP-474)     | 100%     | 9        |
| admin stats + PDF (SP-475)       | 100%     | 12       |
| admin notifications (SP-476)     | 100%     | 7        |
| admin broadcast (SP-477)         | 100%     | 9        |

### Tests E2E

| Suite                               | Tests   | Status                            |
| ----------------------------------- | ------- | --------------------------------- |
| Auth (login/register)               | 20      | ✅                                |
| Middleware RBAC                     | 26      | ✅                                |
| Smoke tests                         | 4       | ✅                                |
| **Dashboard Employee**              | 15      | ✅                                |
| **Dashboard Manager**               | 23      | ✅                                |
| **Dashboard Director**              | 22      | ✅                                |
| **Dashboard Super Admin**           | 25      | ✅                                |
| **RBAC Protection**                 | 21      | ✅                                |
| **CRUD Companies**                  | 18      | ✅                                |
| **CRUD Employees**                  | 18      | ✅                                |
| **CRUD Teams**                      | 15      | ✅                                |
| **Empty States**                    | 8       | ✅                                |
| **Cookies RGPD**                    | 18      | ✅                                |
| **Analytics Umami**                 | 8       | ✅                                |
| **Error Pages** (404/500/boundary)  | 15      | ✅                                |
| **Command Palette (SP-264)**        | 6       | ✅                                |
| **Recent Pages (SP-264)**           | 6       | ✅                                |
| **Keyboard Shortcuts (SP-264)**     | 6       | ✅                                |
| **Mobile Navigation (SP-389)**      | 9       | ✅                                |
| **Mobile Command Palette (SP-389)** | 15      | ✅                                |
| **Mobile Breadcrumbs (SP-389)**     | 20      | ✅                                |
| **Mobile Data Table (SP-389)**      | 15      | ✅                                |
| **Mobile Touch Targets (SP-389)**   | 16      | ✅                                |
| **Accessibility WCAG (SP-269)**     | 14      | ✅                                |
| **Schedules (SP-406)**              | 16      | ✅                                |
| **Leaves (SP-416)**                 | 21      | ✅                                |
| **Personal Tasks (SP-421)**         | 20      | ✅                                |
| **Profile (SP-270)**                | 15      | ✅                                |
| **Edit Profile (SP-271)**           | 22      | ✅                                |
| **Change Password (SP-273)**        | 9       | ✅                                |
| **Account Actions** (delete/export) | 11      | ✅                                |
| **Settings Hub (SP-274)**           | 20      | ✅                                |
| **Appearance (SP-276)**             | 18      | ✅                                |
| **Notification Preferences (SP-275)** | 14    | ✅                                |
| **Company Settings (SP-435)**       | 21      | ✅                                |
| **Billing Alerts (SP-373)**         | 8       | ✅                                |
| **Billing Subscription (SP-373)**   | 7       | ✅                                |
| **Audit Logs (SP-446)**            | 26      | ✅ (23 pass + 3 skip)            |
| **Impersonation (SP-456)**         | 9       | ✅                                |
| **Total E2E (40 fichiers)**         | **~584** | ✅                                |

**Note** : Tests desktop exécutés sur Chromium uniquement. Tests mobiles exécutés sur 5 devices (iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro 11") via Chromium avec émulation mobile (WebKit supprimé car bug HTTPS upgrade sur localhost). Consolidation 50→38 fichiers le 18/02/2026 (suppression redondances, fusion suites similaires). Ajout audit-logs.spec.ts le 18/02/2026 (39 fichiers). Ajout impersonation-flow.spec.ts le 19/02/2026 (40 fichiers).

### Composants testés

#### Auth (2 composants)

- LoginForm (15 tests)
- RegisterForm (19 tests)

#### Permissions (1 module)

- permissions.ts (62 tests) : `hasMinimumRole`, `canAccessRoute`, `getRoleDashboardPath`, `ROLE_HIERARCHY`

#### Forms (6 composants)

- FormField, FormInput, FormCheckbox
- FormSelect, FormTextarea, FormRadioGroup

#### Cards (3 composants)

- UserCard, TeamCard, AvatarStack

#### Loading (6 composants)

- Spinner, LoadingOverlay
- Skeleton, SkeletonCard, SkeletonTable, SkeletonText

#### Modals (2 composants)

- ConfirmDialog, FormDialog

#### Dashboard (3 composants)

- StatCard, TrendIndicator, StatsGrid

#### Charts (4 composants)

- ChartContainer (wrapper responsive avec loading/empty)
- AreaChartWidget (graphiques d'aire avec gradients SVG)
- BarChartWidget (barres verticales/horizontales, stacked)
- PieChartWidget (pie/donut avec labels pourcentage)

#### Dashboard Services (7 modules - SP-144)

- types.ts (typage ServiceResult<T>, params, résultats)
- base-stats.service.ts (utilitaires partagés : calculs, dates, vérifications multi-tenant)
- employee-stats.service.ts (heures travaillées, solde congés, tendances)
- manager-stats.service.ts (taille équipe, demandes en attente, couverture)
- director-stats.service.ts (métriques entreprise, équipes, performance)
- admin-stats.service.ts (KPIs plateforme : MRR, churn, entreprises)
- index.ts (barrel export centralisé)

#### Stripe Service (1 module + 1 route - SP-351)

- stripe.service.ts (5 fonctions exportées + 5 handlers webhook internes, pattern ServiceResult<T>)
- route.ts (POST /api/webhooks/stripe : signature HMAC, raw body, error handling)

#### Billing Dashboard (4 composants - SP-360)

- SubscriptionStatus (16 tests) : 6 badges statut, countdown essai, alerte annulation, EmptyState, callbacks
- UsageIndicator (8 tests) : jauge sièges, prix unitaire/total, prorata, plafond 100%
- InvoiceHistory (11 tests) : table factures, badges statut, liens Stripe, état vide
- BillingPageContent (6 tests) : orchestrateur, gestion null, action portail Stripe

#### Subscription Sync Employés → Stripe (SP-439)

- subscription-sync.service.ts (27 tests) : skip no_subscription (1), skip no_stripe_subscription_id (1), skip statuts TRIAL/CANCELED/EXPIRED/INCOMPLETE (4), skip quantity_unchanged (2), skip no_stripe_item_id (1), sync success avec prorata (5), erreurs Stripe (StripeError, network, timeout, invalid_request, authentication) (5), erreurs Prisma (retrieve, update, count) (3), edge cases (quantity=0→1, 1 employé, 250 employés, Decimal pricePerEmployee) (4), logging structuré (1).
- employees.test.ts SP-439 (6 tests) : sync appelé après createEmployee (1), deleteEmployee (1), toggleEmployeeStatus (1), bulkDeleteEmployees (1), fire-and-forget safety avec rejection (1), bon companyId transmis (1).

#### Subscription Banner (SP-441)

- getSubscriptionBannerConfig (44 tests) : bypass SYSTEM_ADMIN/ACTIVE/null/CANCELED/EXPIRED/INCOMPLETE/inconnu (7), TRIAL info 7-14j (9), TRIAL warning 4-6j (5), TRIAL urgent 1-3j (6), TRIAL cas limites expiré/null/20j (3), PAST_DUE grâce (10), rôles DIRECTOR/MANAGER/EMPLOYEE (3), constantes seuils (1). Fonction pure, 0 mock.
- SubscriptionBanner composant (29 tests) : rendu conditionnel ACTIVE/SYSTEM_ADMIN/billing/info/warning/urgent/PAST_DUE (8), variants visuels info/warning/destructive (3), CTA labels et href (5), dismiss localStorage et palier (6), accessibilité role/aria-label/data-testid (5), messages trial/payment (2).

#### Subscription Guard (SP-440)

- checkSubscriptionAccess (31 tests) : bypass SYSTEM_ADMIN (2), routes exemptées billing/profile/settings (5), statut ACTIVE (1), TRIAL valide/expiré/null (4), PAST_DUE grâce 7j/dépassé/null (5), CANCELED (2), EXPIRED (2), INCOMPLETE (2), null (2), statut inconnu (2), tous les rôles non-admin (3), constante PAST_DUE_GRACE_DAYS (1). Fonction pure, 0 mock, 4ms d'exécution.

#### Impersonation API Route (SP-456)

- POST /api/admin/impersonate (8 tests) : 401 non authentifié, 403 non SYSTEM_ADMIN, 400 body vide, 404 aucun utilisateur actif dans company, 400 cible SYSTEM_ADMIN, 400 cible désactivée, succès avec companyId (cookie + audit log), succès avec targetUserId direct
- DELETE /api/admin/impersonate (2 tests) : 400 aucune impersonation active, succès (supprime cookie + crée audit log stop)

#### Dashboard Employee (5 composants - SP-145)

- EmployeeWelcome (message bienvenue contextuel + prochain shift)
- EmployeeStats (4 KPIs : heures, shifts, congés, demandes)
- EmployeeSchedule (BarChartWidget heures hebdomadaires)
- EmployeeLeaveBalance (PieChartWidget donut solde congés)
- EmployeeQuickActions (boutons actions rapides avec badge)

#### Dashboard Manager (5 composants - SP-316)

- ManagerWelcome (message bienvenue contextuel + badges alertes conges/absences)
- ManagerStats (4 KPIs : membres equipe, conges a valider, absents, heures equipe avec tendance)
- ManagerTeamChart (BarChartWidget performance equipe heures travaillees)
- ManagerPendingLeaves (liste demandes conges en attente avec actions approuver/refuser)
- ManagerQuickActions (4 boutons actions rapides : equipe, planning, conges, incidents)

#### CRUD Infrastructure (SP-150)

- Types génériques : `CrudActionResult<T>`, `PaginatedResult<T>`, `ListQueryParams`, `FilterParams`
- Types formulaires : `CompanyFormData`, `TeamFormData`, `UserFormData`
- Schémas Zod Company : `createCompanySchema`, `updateCompanySchema`, `companyFiltersSchema`
- Schémas Zod Team : `createTeamSchema`, `updateTeamSchema`, `teamMembersSchema`
- Server Actions : `withRoleCheck`, `validateData`, `handlePrismaError`, `getPaginationParams`
- Hooks React : `useCrudMutation`, `useDeleteMutation`, `useRefreshList`

#### Dashboard Director (6 composants - SP-147)

- DirectorWelcome (message bienvenue + indicateur santé entreprise + alertes)
- DirectorStats (6 KPIs : employés, équipes, congés, heures, présence, absences)
- DirectorTeamsChart (PieChartWidget répartition équipes avec légende)
- DirectorTrendsChart (AreaChartWidget évolution effectifs 6 mois avec %)
- DirectorPendingLeaves (liste congés en attente avec dates FR + bouton voir plus)
- DirectorQuickActions (4 boutons actions rapides avec badge compteur)

#### Dashboard Super Admin (7 composants - SP-148)

- AdminWelcome (message bienvenue + indicateur santé plateforme MRR/churn)
- AdminStats (6 KPIs SaaS : entreprises, utilisateurs, MRR, abonnements, conversion, churn)
- AdminMrrChart (AreaChartWidget évolution entreprises avec % croissance)
- AdminSignupsChart (BarChartWidget inscriptions mensuelles avec calcul deltas)
- AdminPlansChart (PieChartWidget répartition plans avec légende détaillée)
- AdminRecentCompanies (Server Component async Prisma - 5 dernières inscriptions)
- AdminQuickActions (4 boutons actions rapides avec badges compteurs)

#### Cookies RGPD (4 composants + 1 hook + 1 lib - SP-283)

- CookieBanner (bannière consentement glassmorphism)
- CookiePreferencesModal (modal choix granulaire avec switches)
- CookieSettingsButton (bouton d'accès aux paramètres)
- CookieConsentProvider (Context React pour état partagé)
- useCookieConsent (hook standalone pour tests)
- lib/cookies.ts (gestion cookie HTTP, préférences, types)

#### Analytics Umami (1 composant + 1 hook - SP-345)

- UmamiAnalytics (chargement conditionnel script basé sur consentement)
- useUmamiTrack (hook pour tracking events custom avec vérification RGPD)

#### Error Boundary (2 composants - SP-304)

- ErrorBoundaryWrapper (wrapper react-error-boundary avec logging structuré)
- ErrorFallback (UI de secours avec retry/home buttons, stack trace dev mode)
- error.tsx (Next.js route segment error boundary)
- global-error.tsx (Next.js root layout error boundary avec inline styles)

#### Page 404 (2 composants - SP-302)

- NotFoundPage (page 404 complète avec animations)
- NotFoundIllustration (illustration animée avec icônes orbitantes)

#### Page 500 (2 composants + utilitaire - SP-303)

- ServerErrorPage (page 500 complète avec animations)
- error-logger.ts (utilitaire de logging serveur structuré)

#### Dark/Light Mode (3 composants - SP-265)

- ThemeProvider (wrapper next-themes avec config SmartPlanning)
- ThemeToggle (bouton cycle system → light → dark avec icônes animées)
- ThemeDropdown (menu dropdown 3 options avec descriptions)

#### Loading States avancés (2 composants + 2 hooks + 1 HOC - SP-266)

- ProgressBar (barre horizontale : déterminé/indéterminé, 3 tailles, 5 couleurs, labels)
- ProgressCircle (cercle SVG : déterminé/indéterminé, 3 tailles, 5 couleurs, centerLabel)
- useLoading (gestion état chargement avec minDuration, callbacks, withLoading wrapper)
- useProgressLoading (progression 0-100% avec increment, auto-completion)
- withLoading HOC (injection props isLoading + méthodes)

#### Command Palette (3 modules - SP-264)

- useKeyboardShortcuts (hook raccourcis clavier avec modifiers et séquences)
- CommandPalette (composant cmdk avec navigation, actions, thème, RBAC)
- CommandPaletteProvider (context React pour état global + raccourci Cmd+K)

#### Navigation Shortcuts & Keyboard Shortcuts Modal (3 modules - SP-264 Phase 3)

- useNavigationShortcuts (hook séquences Vim-style : g h, g e, g t, g p, g l, g s, g c)
- KeyboardShortcutsModal (modal Radix Dialog avec animations Framer Motion, détection OS)
- KeyboardShortcutsProvider (context React pour modal raccourcis, touche `?`)

#### Recent Pages (4 modules - SP-264 Phase 4)

- recentPagesStore (store externe useSyncExternalStore, localStorage, FIFO 5 pages, déduplication)
- useRecentPages (hook React avec addPage, clearHistory, isLoading)
- formatRelativeTime (formatage temps relatif FR : "À l'instant", "Il y a X min", etc.)
- PageTracker (composant invisible tracking automatique, RGPD compliant)

#### Mobile Navigation (1 composant + 3 hooks - SP-383/SP-384)

- SwipeableDrawer (drawer mobile avec gestes Framer Motion, swipe to close)
- useBodyScrollLock (verrouillage scroll body avec compensation scrollbar)
- usePrefersReducedMotion (détection prefers-reduced-motion)
- useFocusTrap (focus trap basique pour accessibilité dialog)

#### Mobile UI Components (4 composants - SP-268 Phase 3)

- TouchableButton (boutons adaptatifs 44px sur mobile, mapping automatique des tailles)
- CommandPalette mobile (layout full-screen, Visual Viewport API, safe-area insets iOS)
- DataTablePagination responsive (layout vertical mobile, options réduites, labels compacts)
- ResponsiveBreadcrumb (scroll horizontal snap, fade indicators, auto-scroll vers page courante)

#### Accessibilité (1 composant - SP-269)

- SkipLink (skip to main content, WCAG 2.4.1 Bypass Blocks, 14 tests unitaires)

#### E2E Mobile Tests (SP-389 - 25 janvier 2026)

Tests E2E Playwright pour appareils mobiles avec émulation multi-device :

- **Configuration Playwright mobile** (`playwright.config.ts`) :
  - iPhone SE (320x568) : petit écran, test contraintes espace
  - iPhone 14 Pro (393x852) : écran moderne iOS
  - Pixel 7 (412x915) : Android référence Chrome mobile
  - iPad Mini (768x1024) : tablette petite
  - iPad Pro 11" (834x1194) : tablette grande, layout quasi-desktop
  - Note : Utilisation de Chromium au lieu de WebKit pour tous les projets mobiles (fix bug WebKit localhost HTTPS upgrade)

- **Fixtures et utilitaires** :
  - `e2e/fixtures/mobile.fixture.ts` : Fixture d'authentification mobile avec gestion orientation
  - `e2e/utils/touch-gestures.ts` : Utilitaires gestes tactiles (tap, doubleTap, longPress, swipe, pinch, scroll)

- **Tests mobiles** (`e2e/specs/mobile/`) :
  - `navigation.spec.ts` : Navigation mobile (sidebar swipe, menu burger, footer)
  - `command-palette.spec.ts` : Command palette en mode plein écran mobile
  - `breadcrumbs.spec.ts` : Fil d'Ariane avec scroll horizontal snap
  - `data-table.spec.ts` : Pagination responsive et layout cards
  - `touch-targets.spec.ts` : Conformité WCAG 2.5.5 (zones tactiles 44px minimum)

- **Documentation** : `/docs/e2e-mobile-tests.md`

### Accessibilité WCAG 2.1 (SP-269 - 25 janvier 2026)

Conformité WCAG 2.1 niveau AA avec tests automatisés axe-core et audit Lighthouse :

- **Skip to Main Content** (WCAG 2.4.1 Bypass Blocks) :
  - Composant `SkipLink` : Premier élément focusable de la page
  - Pattern `sr-only` + `focus:not-sr-only` pour visibilité au focus uniquement
  - Cible `#main-content` avec `tabIndex={-1}` pour focus programmatique
  - Style : `bg-primary text-primary-foreground rounded-md` avec ring focus
  - Label français : "Aller au contenu principal"
  - 14 tests unitaires

- **Tests E2E axe-core** (`e2e/specs/a11y/accessibility.spec.ts`) :
  - Intégration `@axe-core/playwright` pour audit WCAG automatisé
  - Tags WCAG testés : `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
  - **Public Pages** (3 tests) : Login, Register, Home - violations critiques
  - **Skip Link** (4 tests) : Présence DOM, visibilité focus, navigation, main-content
  - **Keyboard Navigation** (2 tests) : Tab navigation, Escape fermeture modals
  - **Color Contrast** (1 test) : Violations critiques uniquement
  - **Forms** (2 tests) : Labels accessibles login/register
  - **ARIA & Semantics** (2 tests) : Landmark regions, éléments focusables
  - 14 tests E2E au total

- **Lighthouse Audit Script** (`scripts/lighthouse-audit.js`) :
  - Audit automatisé accessibilité sur pages principales
  - Seuil minimum configurable (défaut : 90%)
  - Rapport Markdown généré dans `/docs/lighthouse-a11y-report.md`
  - Support variable `BASE_URL` pour environnements staging/production
  - Utilisation sécurisée `execFileSync` (vs execSync)

- **Résultats audit** :
  - Score moyen : **100%** (objectif ≥ 90%)
  - Pages conformes : Accueil, Login, Register

**Scripts NPM** :

```bash
npm run test:a11y     # Tests E2E accessibilité (14 tests)
npm run a11y:audit    # Audit Lighthouse (nécessite serveur actif)
```

**Import** :

```typescript
// Skip Link (intégré automatiquement dans layout.tsx)
import { SkipLink } from '@/components/layout/skip-link'
```

### Scripts de test

```bash
npm run test             # Tests en mode watch
npm run test -- --run    # Tests single run
npm run test:coverage    # Tests avec coverage
npm run test:e2e         # Tests E2E Playwright
npm run test:a11y        # Tests E2E accessibilité axe-core
npm run a11y:audit       # Audit Lighthouse accessibilité
```

## Contribution

### Workflow Git

```bash
# Créer une branche depuis main
git checkout -b feature/SP-XX-description

# Commits avec Smart Commits Jira
git commit -m "SP-XX #in-progress Description du commit"

# Push et créer PR
git push origin feature/SP-XX-description
```

### Conventions de code

- ESLint + Prettier configurés
- TypeScript strict mode
- Nommage : camelCase (variables), PascalCase (composants)
- Commentaires JSDoc sur fonctions publiques
- Tests obligatoires sur features critiques

## Déploiement

### Guide complet

📚 **Voir le guide de déploiement détaillé** : [`docs/deployment.md`](docs/deployment.md)

Le guide inclut :

- Configuration initiale du VPS (script automatisé)
- Configuration UFW compatible Docker ⚠️
- Résolution des problèmes courants
- Maintenance et monitoring

### Environnements

- **Development** : Local Docker (localhost:3000)
- **Production** : VPS OVH ✅ (Déployé le 6 janvier 2026)

### Infrastructure Production

| Élément           | Valeur                                          |
| ----------------- | ----------------------------------------------- |
| **URL**           | https://smartplanning.fr                        |
| **Serveur**       | VPS OVH (4 vCores, 8GB RAM, 75GB SSD)           |
| **OS**            | Ubuntu 24.04 LTS                                |
| **IP**            | 51.77.146.72 (smartplanning.fr)                 |
| **SSL**           | Let's Encrypt (auto-renew jusqu'au 2 mars 2026) |
| **Reverse Proxy** | Nginx 1.24.0                                    |
| **Firewall**      | UFW (allow outgoing - compatible Docker)        |
| **Containers**    | Docker Compose (app + PostgreSQL 16 + Redis 7)  |
| **Analytics**     | Umami (analytics.smartplanning.fr)              |
| **Registry**      | GitHub Container Registry (ghcr.io)             |

### Connexion SSH

```bash
ssh -i ~/.ssh/smartplanning_deploy deploy@smartplanning.fr
```

### CI/CD Pipeline

```
Push feature → Tests unitaires (~3-5 min)
PR vers main → Tests unitaires + Build + E2E production (~15-20 min)
Merge main → Build Docker → Push GHCR → Deploy VPS (~8-10 min)
Nightly → Tests unitaires + Build + Suite E2E complète desktop + 5 mobiles (2h00 UTC)
```

**Stratégie optimisée (SP-113)** :

| Scénario            | Tests Unit | Tests E2E              | Déploiement | Temps      |
| ------------------- | ---------- | ---------------------- | ----------- | ---------- |
| Push feature branch | ✅         | ❌                     | ❌          | ~3-5 min   |
| PR vers main        | ✅         | ✅ (prod, Chromium)    | ❌          | ~15-20 min |
| Merge sur main      | ✅         | ❌                     | ✅          | ~8-10 min  |
| Nightly (2h UTC)    | ✅         | ✅ (prod, desktop + 5 mobiles) | ❌  | ~45-60 min |

- **CI** (`.github/workflows/ci.yml`) : Lint, Type-check, Tests unitaires, Build, Tests E2E en mode production (PR/push main)
- **CD** (`.github/workflows/cd.yml`) : Build image Docker, Push sur ghcr.io, Deploy via SSH
- **Nightly** (`.github/workflows/nightly-e2e.yml`) : Tests unitaires Vitest + Suite E2E complète desktop + 5 devices mobiles en mode production (`npm run start`)
- Tests unitaires sur tous les push (~5760 tests Vitest)
- Tests E2E en mode production (`npm run build` + `npm run start`) pour des résultats représentatifs de la prod
- Env vars CI : `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST` pour NextAuth v5 sur HTTP localhost
- Stabilisation E2E (SP-434) : Touch targets WCAG 2.5.5 (44px), command palette, mobile navigation
- Déploiement automatique sur merge main ✅
- Migrations Prisma automatiques
- Healthcheck endpoint : `/api/health` ✅

### Sécurité Infrastructure

| Élément           | Status              |
| ----------------- | ------------------- |
| Docker Hardening  | ✅                  |
| UFW Firewall      | ✅                  |
| Fail2ban          | ✅                  |
| SSH Key Auth      | ✅                  |
| IPs malveillantes | ✅ (5 IPs bloquées) |
| SSL/TLS           | ✅                  |

**Documentation sécurité** :

- [Plan de sécurisation](docs/security/security-hardening-plan.md)
- [Script de sécurisation VPS](scripts/secure-vps-part1.sh)
- [Incident UFW + Docker](docs/security/incident-2026-01-06-ufw-docker.md)

### Scores Lighthouse (11 février 2026)

| Métrique           | Score |
| ------------------ | ----- |
| **Performance**    | 91%   |
| **SEO**            | 100%  |
| **Accessibilité**  | 100%  |
| **Best Practices** | 96%   |

## Auteur

**Christophe Mostefaoui** - Développeur Full-Stack MERN/Symfony

- Portfolio : https://christophe-dev-freelance.fr
- GitHub : https://github.com/krismos64
