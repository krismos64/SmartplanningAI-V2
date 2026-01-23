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
- **Dernière mise à jour** : 23 janvier 2026 (Sprint 11 - SP-268 Phase 3 Mobile UI Components)
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

### MVP (Phases 1-4)

- Authentification multi-rôles (4 rôles : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE)
- Gestion multi-tenant (isolation complète par entreprise)
- Dashboard personnalisé par rôle avec KPIs
- Gestion des employés et départements
- Planning drag & drop (à venir)
- Gestion des shifts et affectations
- Demandes de congés avec workflow validation
- Système de notifications temps réel
- Export PDF/Excel des plannings
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
import { motion, fadeInUp, staggerContainer, floatAnimation } from '@/lib/animations'

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
  - 6 types de congés supportés (PAID_LEAVE, RTT, SICK_LEAVE, UNPAID_LEAVE, FAMILY_EVENT, OTHER)
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
  - `role="main"` sur le conteneur principal
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-hidden="true"` sur éléments décoratifs
  - Labels accessibles sur tous les boutons

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
import { CommandPaletteProvider, useCommandPalette } from '@/components/providers'
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
import { useBreadcrumbResolver, isIdSegment, getEntityTypeFromPreviousSegment } from '@/hooks'
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
import { KeyboardShortcutsProvider, useKeyboardShortcutsContext } from '@/providers'

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
  - Support iOS safe-area (env(safe-area-inset-*))
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
import { recentPagesStore, type RecentPage } from '@/lib/storage/recent-pages-store'

// Hook React
import { useRecentPages } from '@/hooks/use-recent-pages'

// Formatage temps relatif
import { formatRelativeTime, formatRelativeTimeLong } from '@/lib/utils/format-relative-time'

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
  - `role="main"` sur le conteneur principal
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `aria-hidden="true"` sur éléments décoratifs
  - Labels accessibles sur tous les boutons
  - Navigation clavier complète

- **Tests** : 47 tests unitaires + 24 tests E2E

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
│   │   ├── layout/       # LandingHeader, LandingFooter, PageTracker (partagés)
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
│   │   ├── validations/  # Schémas Zod (auth, user, employee, company, team...)
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
│   ├── fixtures/         # Fixtures auth par rôle (SP-149)
│   ├── pages/            # Page Objects dashboards (SP-149)
│   └── specs/            # middleware-rbac.spec.ts, auth.spec.ts, dashboard/*.spec.ts
├── __tests__/            # Tests unitaires Vitest
│   └── lib/              # permissions.test.ts
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
8. **LeaveRequest** : Demandes de congés
9. **Notification** : Système de notifications
10. **ActivityLog** : Logs d'activité (audit)
11. **CompanySettings** : Paramètres par entreprise

### Enums (8 enums)

1. **Role** : SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE
2. **NotificationType** : INFO, WARNING, ERROR, SUCCESS, SHIFT_ASSIGNED, etc.
3. **LeaveStatus** : PENDING, APPROVED, REJECTED, CANCELLED
4. **LeaveType** : PAID_LEAVE, SICK_LEAVE, UNPAID_LEAVE, OTHER
5. **ShiftStatus** : DRAFT, PUBLISHED, ARCHIVED
6. **DayOfWeek** : MONDAY, TUESDAY, ..., SUNDAY
7. **EmploymentType** : FULL_TIME, PART_TIME, TEMPORARY, INTERN
8. **ContractType** : CDI, CDD, INTERIM, FREELANCE, APPRENTICE, INTERN

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

#### Phase 6 : Planning & Congés (À venir)

- SP-114 : Gestion plannings (drag & drop, shifts, affectations)
- SP-115 : Workflow congés (demandes, validation, calendrier)

#### Phase 7+ : Notifications, Export, IA... (À venir)

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

| Page | Meta Title | Meta Description | Structured Data |
|------|-----------|------------------|-----------------|
| Landing | ✅ | ✅ | Organization |
| À propos | ✅ | ✅ | AboutPage + Organization |
| Mentions légales | ✅ | ✅ | - |
| CGU | ✅ | ✅ | - |
| CGV | ✅ | ✅ | - |
| Confidentialité | ✅ | ✅ | - |
| Cookies | ✅ | ✅ | - |
| Login/Register | ✅ | ✅ | - |

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

### Couverture actuelle (23 janvier 2026)

| Catégorie            | Coverage | Tests    |
| -------------------- | -------- | -------- |
| **Global**           | **~85%** | **2881** |
| loading              | 100%     | 152      |
| modals               | 100%     | 52       |
| cards                | 77.09%   | 88       |
| forms                | 76.65%   | 170      |
| auth                 | ~95%     | 34       |
| permissions          | 100%     | 62       |
| dashboard components | 100%     | 57       |
| charts               | 100%     | 88       |
| dashboard services   | 100%     | 119      |
| dashboard employee   | 100%     | 91       |
| dashboard director   | 100%     | 87       |
| dashboard admin      | 100%     | 115      |
| cookies              | 100%     | 83       |
| analytics            | 100%     | 13       |
| emails (Sprint 9)    | 100%     | 129      |
| contact (SP-287/289) | 100%     | 95       |
| error boundary       | 100%     | 22       |
| animations (SP-379)  | 100%     | 102      |
| design tokens        | 100%     | 99       |
| dark/light mode      | 100%     | 30       |
| loading states (SP-266) | 100%  | 131      |
| command palette (SP-264) | 100% | 55       |
| navigation shortcuts (SP-264) | 100% | 15    |
| keyboard shortcuts modal (SP-264) | 100% | 10 |
| keyboard shortcuts provider (SP-264) | 100% | 10 |
| recent pages store (SP-264 Phase 4) | 100% | 18 |
| use-recent-pages hook (SP-264 Phase 4) | 100% | 8 |
| format-relative-time (SP-264 Phase 4) | 100% | 27 |
| swipeable-drawer (SP-383) | 100% | 21 |
| touchable-button (SP-385) | 100% | 31 |
| command-palette-mobile (SP-386) | 100% | 32 |
| data-table-pagination (SP-387) | 100% | 22 |
| responsive-breadcrumb (SP-388) | 100% | 25 |

### Tests E2E

| Suite                        | Tests | Status |
| ---------------------------- | ----- | ------ |
| Auth (login/register)        | 20    | ✅     |
| Middleware RBAC              | 26    | ✅     |
| Smoke tests                  | 4     | ✅     |
| **Dashboard Employee**       | 15    | ✅     |
| **Dashboard Manager**        | 1     | ⏸️ (22 skipped - UI en attente) |
| **Dashboard Director**       | 22    | ✅     |
| **Dashboard Super Admin**    | 25    | ✅     |
| **RBAC Protection**          | 21    | ✅     |
| **CRUD Companies**           | 18    | ✅     |
| **CRUD Employees**           | 18    | ✅     |
| **CRUD Teams**               | 15    | ✅     |
| **Empty States**             | 8     | ✅     |
| **Cookies RGPD**             | 18    | ✅     |
| **Analytics Umami**          | 8     | ✅     |
| **Error Boundary**           | 5     | ✅     |
| **Page 404**                 | 8     | ✅     |
| **Page 500**                 | 22    | ✅     |
| **Command Palette (SP-264)** | 6     | ✅     |
| **Recent Pages (SP-264)**    | 6     | ✅     |
| **Keyboard Shortcuts (SP-264)** | 6  | ✅     |
| **Total E2E actifs**         | **272** | ✅   |
| **Total E2E skipped**        | **24**  | ⏸️   |
| **Total E2E**                | **296** |      |

**Note** : Tests exécutés uniquement sur Chromium (Firefox et WebKit supprimés pour stabilité et performance).

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

### Scripts de test

```bash
npm run test             # Tests en mode watch
npm run test -- --run    # Tests single run
npm run test:coverage    # Tests avec coverage
npm run test:e2e         # Tests E2E Playwright
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
| **IP**            | 51.77.146.72 (smartplanning.fr)                  |
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

| Scénario | Tests Unit | Tests E2E | Déploiement | Temps |
|----------|------------|-----------|-------------|-------|
| Push feature branch | ✅ | ❌ | ❌ | ~3-5 min |
| PR vers main | ✅ | ✅ (3 navigateurs) | ❌ | ~15-20 min |
| Merge sur main | ✅ | ❌ | ✅ | ~8-10 min |

- **CI** (`.github/workflows/ci.yml`) : Lint, Type-check, Tests unitaires, Build, Tests E2E (PR uniquement)
- **CD** (`.github/workflows/cd.yml`) : Build image Docker, Push sur ghcr.io, Deploy via SSH
- Tests unitaires sur tous les push (~2881 tests Vitest)
- Tests E2E sur PR vers main (~272 tests Playwright actifs)
- Déploiement automatique sur merge main ✅
- Migrations Prisma automatiques
- Healthcheck endpoint : `/api/health` ✅

### Sécurité Infrastructure

| Élément             | Status |
| ------------------- | ------ |
| Docker Hardening    | ✅     |
| UFW Firewall        | ✅     |
| Fail2ban            | ✅     |
| SSH Key Auth        | ✅     |
| IPs malveillantes   | ✅ (5 IPs bloquées) |
| SSL/TLS             | ✅     |

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
