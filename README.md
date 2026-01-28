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
- **Dernière mise à jour** : 28 janvier 2026 (Sprint 13 - SP-414 Leave Detail + Balances : pages détail et soldes + 48 tests)
- **Déploiement** : SP-158 Phase 4 complété - Nouveau VPS sécurisé avec déploiement automatisé ✅

## Stack technique

### Frontend

- **Framework** : Next.js 15.0.3 (App Router)
- **UI Library** : React 19.0.0
- **Language** : TypeScript 5.6.3
- **Styling** : Tailwind CSS + Shadcn/ui
- **Tables** : TanStack Table v8 + match-sorter-utils
- **State Management** : Zustand (à venir)
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts

### Backend

- **Runtime** : Node.js 20+
- **API** : Next.js API Routes
- **Authentication** : NextAuth v5 (Auth.js)
- **ORM** : Prisma 6.0.1
- **Validation** : Zod

### Base de données

- **Database** : PostgreSQL 16
- **Cache** : Redis 7
- **Admin** : Adminer

### DevOps

- **Containerization** : Docker + Docker Compose
- **CI/CD** : GitHub Actions ✅
- **Hosting** : VPS OVH (Ubuntu 24.04 LTS) ✅
- **SSL** : Let's Encrypt (auto-renew) ✅
- **Reverse Proxy** : Nginx
- **Monitoring** : Error Boundary React + À définir (Sentry/LogRocket)

## Fonctionnalités principales

### Composants UI production-ready

- **Auth System** (SP-109) : LoginForm, RegisterForm avec React Hook Form + Zod, Server Actions, auto-login
- **DataTable avancée** (SP-120) : Composant de tableau avec tri multi-colonnes, pagination, recherche fuzzy, sélection multi-rows, actions par ligne, responsive (table desktop / cards mobile)
- **Form System** (SP-119) : 7 composants formulaire avec React Hook Form + Zod, 23 schémas de validation
- **Toast System** (SP-122) : Notifications avec Sonner, hook useToast()
- **Modal System** (SP-121) : Modals et loading states
- **Composants métier** (SP-123) : UserCard, TeamCard, AvatarStack
- **Dashboard Components** (SP-142) : StatCard, TrendIndicator, StatsGrid avec types par rôle
- **Charts Recharts** (SP-143) : AreaChartWidget, BarChartWidget, PieChartWidget avec tooltips Shadcn et dark mode
- **Dashboard Services Prisma** (SP-144) : Services data layer par rôle (Employee, Manager, Director, Admin) avec architecture multi-tenant
- **Dashboard Employee** (SP-145) : Page dashboard complète avec Server Components, redirection par rôle, 5 composants métier (Welcome, Stats, Schedule, LeaveBalance, QuickActions)
- **Dashboard Director** (SP-147) : Page dashboard directeur avec Server Components, RBAC, 6 composants métier (Welcome, Stats, TeamsChart, TrendsChart, PendingLeaves, QuickActions)
- **Dashboard Super Admin** (SP-148) : Page dashboard admin SaaS avec Server Components, protection SYSTEM_ADMIN, 7 composants (Welcome, Stats, MrrChart, SignupsChart, PlansChart, RecentCompanies, QuickActions)
- **Leave Management UI** (SP-411/SP-412/SP-413/SP-414) : 16 composants congés + pages (LeaveTypeBadge, LeaveStatusBadge, LeaveBalanceCard, LeaveBalanceEditDialog, LeaveRequestCard, LeaveRequestForm, LeaveReviewDialog, LeaveConflictWarning, LeaveFilters, LeavesList, LeavesListMobile, LeaveCalendar, LeaveCalendarDay, LeaveStatsBar, LeaveDetailCard, LeaveTimeline) + pages orchestrateur, détail [id], balances

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
- Export PDF/Excel des plannings (avec filtres actifs et compteur heures)
- Suppression en masse employés avec cascade sécurisée
- Nom d'entreprise dynamique dans le layout
- Demandes de congés avec workflow validation
- Système de notifications temps réel
- Analytics et rapports

### CRUD Opérationnels

- **Entreprises** (SYSTEM_ADMIN) : Liste, création, édition, suppression avec filtres
- **Collaborateurs** (DIRECTOR, MANAGER) : Gestion complète avec permissions RBAC
- **Équipes** (DIRECTOR) : CRUD + gestion des membres

### Architecture CSS & Animations (SP-379 - 21 janvier 2026)

Système de design unifié et centralisé :

- **Design Tokens** (`src/styles/tokens/`) :
  - `colors.ts` : Palettes primitives et sémantiques (light/dark)
  - `typography.ts` : Fonts, tailles, styles de texte
  - `spacing.ts` : Échelle d'espacement, breakpoints, containers
  - `shadows.ts` : Box shadows, drop shadows, glows
  - `radius.ts` : Border radius, ring, outline
  - `index.ts` : Export centralisé `tokens` + `tailwindTheme`
  - Tests complets : 99 tests unitaires

- **Animations Framer Motion** (`src/lib/animations/`) :
  - `variants.ts` : Tous les variants d'animation centralisés
  - `presets.ts` : Configurations d'animation prédéfinies
  - `config.ts` : Durées, easings, breakpoints motion
  - `hooks/` : `useReducedMotion`, `useScrollAnimation`
  - `index.ts` : Re-export de `motion` + tous les variants
  - Tests complets : 102 tests unitaires

- **Styles globaux** (`src/app/globals.css`) :
  - CSS Variables pour le theming (couleurs HSL, radius, sidebar)
  - Classes utilitaires : `container-custom`, `transition-smooth`, `text-truncate`
  - Support dark mode préparé (variables `.dark`)
  - Scrollbar personnalisée (Webkit)

- **Tailwind Config** (`tailwind.config.ts`) :
  - Intègre les design tokens TypeScript
  - Keyframes Radix : `accordion-down`, `accordion-up`
  - Keyframes custom : `fade-in`, `scale-in`, `slide-up/down/left/right`
  - Plugin `tailwindcss-animate` pour Shadcn/ui

- **CSS Modules** (`landing.module.css`) : Styles spécifiques landing (glassmorphism, gradients)

**Import unifié** :

```typescript
// Animation system - import unique
import {
  motion,
  fadeInUp,
  staggerContainer,
  floatAnimation,
} from '@/lib/animations'

// Design tokens - import unique
import { tokens, colors, spacing } from '@/styles/tokens'
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
  - Tarification : 3 plans responsive avec badge "populaire"
  - FAQ : Accordion avec sticky sidebar
  - CTA : Section finale avec gradient
  - Footer : Liens, newsletter, réseaux sociaux (LinkedIn, Instagram, TikTok)
- **Contact** : Formulaire avec React Hook Form + Zod, animations Framer Motion
- **Navigation** : 7 liens avec scroll smooth, menu mobile fullscreen animé
- **SEO** : Meta tags, Open Graph, sémantique HTML5
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
│   │   ├── (about)/      # Page À propos (/a-propos)
│   │   │   ├── a-propos/         # Page principale + AboutContent + StructuredData
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
│   │   │   └── dashboard/  # Services stats par rôle (SP-144)
│   │   ├── validations/  # Schémas Zod (auth, user, employee, company, team, schedule, availability...)
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
│   └── lib/              # permissions.test.ts
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

### Modèles principaux (11 modèles)

1. **User** : Utilisateurs de la plateforme
2. **Company** : Entreprises (multi-tenant)
3. **Department** : Départements par entreprise
4. **Employee** : Employés liés aux utilisateurs
5. **Planning** : Plannings par département
6. **Shift** : Créneaux de travail (templates)
7. **ShiftAssignment** : Affectations shifts → employés
8. **LeaveRequest** : Demandes de congés (avec halfDay/halfDayPeriod)
9. **LeaveBalance** : Soldes de congés par employé et par année (@@unique employeeId+year)
10. **Notification** : Système de notifications
11. **ActivityLog** : Logs d'activité (audit)
12. **CompanySettings** : Paramètres par entreprise

### Enums (10 enums)

1. **Role** : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE
2. **NotificationType** : INFO, WARNING, ERROR, SUCCESS, SHIFT_ASSIGNED, etc.
3. **LeaveStatus** : PENDING, APPROVED, REJECTED, CANCELLED
4. **LeaveType** : PAID_LEAVE, RTT, SICK_LEAVE, UNPAID_LEAVE, PARENTAL_LEAVE, FAMILY_EVENT, OTHER
5. **ShiftStatus** : DRAFT, PUBLISHED, ARCHIVED
6. **DayOfWeek** : MONDAY, TUESDAY, ..., SUNDAY
7. **EmploymentType** : FULL_TIME, PART_TIME, TEMPORARY, INTERN
8. **ContractType** : CDI, CDD, INTERIM, FREELANCE, APPRENTICE, INTERN
9. **ScheduleType** : WORK, MEETING, BREAK, TRAINING, REMOTE, ON_CALL, OVERTIME, REST
10. **ScheduleStatus** : DRAFT, CONFIRMED

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
- SP-414 à SP-416 : En attente (workflow, notifications) 🚧

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

7. **[Guide de déploiement](/.github/DEPLOY.md)**
   - Configuration VPS complète
   - Script de sécurisation automatisé
   - Résolution des problèmes UFW + Docker
   - Maintenance et monitoring

8. **Documentation sécurité (/docs/security/)**
   - [Plan de sécurisation complet](docs/security/security-hardening-plan.md)
   - [Incident UFW + Docker](docs/security/incident-2026-01-06-ufw-docker.md)
   - [Docker hardening](docs/security/docker-hardening-2026-01-05.md)

9. **Pages Légales & À propos**
   - `/mentions-legales` : Informations légales obligatoires
   - `/cgu` : Conditions Générales d'Utilisation
   - `/cgv` : Conditions Générales de Vente
   - `/confidentialite` : Politique de Confidentialité RGPD
   - `/cookies` : Politique Cookies détaillée
   - `/a-propos` : Présentation de SmartPlanning

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
- Gestion des permissions RBAC stricte
- Audit logs (ActivityLog)
- Content Security Policy (CSP) avec headers sécurisés
- SRI (Subresource Integrity) activé en production

### Variables d'environnement sensibles

Jamais commiter :

- `.env.local`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
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

### Monitoring (à venir)

- Sentry pour les erreurs
- LogRocket pour le comportement utilisateur
- Lighthouse CI pour les performances

## SEO

### Optimisations automatiques

- Meta tags dynamiques (Next.js Metadata API)
- Open Graph et Twitter Cards
- Sitemap.xml généré
- Robots.txt configuré
- Balises sémantiques HTML5
- Schema.org JSON-LD (Organization, AboutPage)
- Canonical URLs
- Performance optimisée (Core Web Vitals)

### Pages optimisées SEO

| Page             | Meta Title | Meta Description | Structured Data          |
| ---------------- | ---------- | ---------------- | ------------------------ |
| Landing          | ✅         | ✅               | Organization             |
| À propos         | ✅         | ✅               | AboutPage + Organization |
| Mentions légales | ✅         | ✅               | -                        |
| CGU              | ✅         | ✅               | -                        |
| CGV              | ✅         | ✅               | -                        |
| Confidentialité  | ✅         | ✅               | -                        |
| Cookies          | ✅         | ✅               | -                        |
| Login/Register   | ✅         | ✅               | -                        |

### Optimisation LLMs

La page À propos est optimisée pour être indexée par les LLMs (ChatGPT, Claude, Perplexity) avec :

- Keywords riches et contextuels
- Structured Data JSON-LD étendu
- Descriptions longues pour Open Graph

Voir `/docs/seo-optimization.md` (à créer) pour le détail.

## Tests

### Infrastructure de test

- **Framework** : Vitest 2.1.8
- **Testing Library** : React Testing Library + user-event
- **Mocking** : MSW (Mock Service Worker) + vitest-mock-extended
- **E2E** : Playwright (configuré)
- **Coverage** : v8 provider

### Couverture actuelle (28 janvier 2026)

| Catégorie                              | Coverage | Tests    |
| -------------------------------------- | -------- | -------- |
| **Global**                             | **~85%** | **3666** |
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

### Tests E2E

| Suite                               | Tests   | Status                            |
| ----------------------------------- | ------- | --------------------------------- |
| Auth (login/register)               | 20      | ✅                                |
| Middleware RBAC                     | 26      | ✅                                |
| Smoke tests                         | 4       | ✅                                |
| **Dashboard Employee**              | 15      | ✅                                |
| **Dashboard Manager**               | 1       | ⏸️ (22 skipped - UI en attente)   |
| **Dashboard Director**              | 22      | ✅                                |
| **Dashboard Super Admin**           | 25      | ✅                                |
| **RBAC Protection**                 | 21      | ✅                                |
| **CRUD Companies**                  | 18      | ✅                                |
| **CRUD Employees**                  | 18      | ✅                                |
| **CRUD Teams**                      | 15      | ✅                                |
| **Empty States**                    | 8       | ✅                                |
| **Cookies RGPD**                    | 18      | ✅                                |
| **Analytics Umami**                 | 8       | ✅                                |
| **Error Boundary**                  | 5       | ✅                                |
| **Page 404**                        | 8       | ✅                                |
| **Page 500**                        | 22      | ✅                                |
| **Command Palette (SP-264)**        | 6       | ✅                                |
| **Recent Pages (SP-264)**           | 6       | ✅                                |
| **Keyboard Shortcuts (SP-264)**     | 6       | ✅                                |
| **Mobile Navigation (SP-389)**      | 9       | ✅ (+ 4 échouent - bugs UX réels) |
| **Mobile Command Palette (SP-389)** | 15      | ✅                                |
| **Mobile Breadcrumbs (SP-389)**     | 20      | ✅                                |
| **Mobile Data Table (SP-389)**      | 15      | ✅                                |
| **Mobile Touch Targets (SP-389)**   | 16      | ✅                                |
| **Accessibility WCAG (SP-269)**     | 14      | ✅                                |
| **Schedules (SP-406)**              | 16      | ✅                                |
| **Total E2E actifs**                | **377** | ✅                                |
| **Total E2E skipped**               | **69**  | ⏸️                                |
| **Total E2E**                       | **446** |                                   |

**Note** : Tests desktop exécutés sur Chromium uniquement. Tests mobiles exécutés sur 5 devices (iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro 11") via Chromium avec émulation mobile (WebKit supprimé car bug HTTPS upgrade sur localhost).

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

#### Dashboard Employee (5 composants - SP-145)

- EmployeeWelcome (message bienvenue contextuel + prochain shift)
- EmployeeStats (4 KPIs : heures, shifts, congés, demandes)
- EmployeeSchedule (BarChartWidget heures hebdomadaires)
- EmployeeLeaveBalance (PieChartWidget donut solde congés)
- EmployeeQuickActions (boutons actions rapides avec badge)

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
  - Score moyen : **95%** (objectif ≥ 90%)
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

📚 **Voir le guide de déploiement détaillé** : [`.github/DEPLOY.md`](.github/DEPLOY.md)

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
PR vers main → Tests unitaires + E2E multi-navigateurs (~15-20 min)
Merge main → Build Docker → Push GHCR → Deploy VPS (~8-10 min)
```

**Stratégie optimisée (SP-113)** :

| Scénario            | Tests Unit | Tests E2E          | Déploiement | Temps      |
| ------------------- | ---------- | ------------------ | ----------- | ---------- |
| Push feature branch | ✅         | ❌                 | ❌          | ~3-5 min   |
| PR vers main        | ✅         | ✅ (3 navigateurs) | ❌          | ~15-20 min |
| Merge sur main      | ✅         | ❌                 | ✅          | ~8-10 min  |

- **CI** (`.github/workflows/ci.yml`) : Lint, Type-check, Tests unitaires, Build, Tests E2E (PR uniquement)
- **CD** (`.github/workflows/cd.yml`) : Build image Docker, Push sur ghcr.io, Deploy via SSH
- Tests unitaires sur tous les push (~3666 tests Vitest)
- Tests E2E sur PR vers main (~347 tests Playwright actifs, 5 devices mobiles)
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

### Scores Lighthouse (3 décembre 2025)

| Métrique           | Score |
| ------------------ | ----- |
| **Performance**    | 86%   |
| **SEO**            | 100%  |
| **Accessibilité**  | 98%   |
| **Best Practices** | 96%   |

## Auteur

**Christophe Mostefaoui** - Développeur Full-Stack MERN/Symfony

- Portfolio : https://christophe-dev-freelance.fr
- GitHub : https://github.com/krismos64
