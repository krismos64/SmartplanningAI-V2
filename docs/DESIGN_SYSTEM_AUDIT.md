# RAPPORT D'AUDIT - Design System SmartPlanning V2

**Date :** 31 janvier 2026
**Auditeur :** Claude (Opus 4.5)
**Version analysée :** 2.0.0
**Ticket Jira de référence :** SP-259 (Design Tokens)

---

## 1. RÉSUMÉ EXÉCUTIF

### Points forts identifiés

1. **Architecture de tokens mature** - Système de design tokens complet et bien documenté avec 5 fichiers de tokens (colors, typography, spacing, shadows, radius)
2. **Intégration Tailwind exemplaire** - Configuration Tailwind extensible qui importe directement les tokens TypeScript
3. **Support dark mode complet** - CSS variables HSL avec overrides `.dark` cohérents
4. **Direction esthétique claire** - "Neon Soft — Blue 3D Glow" bien exécutée avec glassmorphisme et effets de glow
5. **Composants Shadcn/ui étendus** - Variants sémantiques ajoutés (success, warning, info) + variants tactiles WCAG
6. **Documentation intégrée** - README des tokens, commentaires JSDoc, références aux tickets Jira
7. **Tests des tokens** - Suite de tests Vitest pour valider la structure des tokens

### Axes d'amélioration prioritaires

1. **Incohérence light/dark des CSS variables** - Les tokens TypeScript (semanticLight/semanticDark) ne sont pas directement synchronisés avec globals.css
2. **Classes utilitaires custom nombreuses** - 25+ classes `.sp-*` dans globals.css pourraient être converties en composants ou tokens
3. **Absence de Storybook** - Pas de documentation visuelle interactive des composants
4. **Palette couleurs charts séparée** - chartTheme.ts duplique des couleurs au lieu d'utiliser les tokens
5. **Landing page isolée** - Styles CSS Modules séparés (`landing.module.css`) non alignés sur le design system

### Score de maturité du Design System

| Critère | Score | Commentaire |
|---------|-------|-------------|
| Tokens structurés | 9/10 | Architecture exemplaire avec TypeScript |
| Cohérence des couleurs | 8/10 | Quelques duplications (charts) |
| Typographie | 9/10 | Échelle modulaire bien pensée |
| Espacements | 9/10 | Système sémantique complet |
| Composants UI | 8/10 | Shadcn/ui bien étendu |
| Dark mode | 8/10 | Fonctionnel mais sync à améliorer |
| Documentation | 7/10 | Bonne mais manque Storybook |
| Accessibilité | 9/10 | TouchableButton, focus rings, WCAG |
| Tests | 8/10 | Tokens testés, composants à compléter |
| **Score global** | **8.3/10** | **Design System production-ready** |

---

## 2. CONFIGURATION TECHNIQUE

### 2.1 Tailwind Configuration

**Fichier :** `tailwind.config.ts` (437 lignes)

#### Points clés

```typescript
// Dark mode basé sur la classe (recommandé Shadcn/ui)
darkMode: ['class'],

// Import direct des design tokens TypeScript
import { slate, blue, cyan, emerald, amber, rose, violet } from './src/styles/tokens/colors'
import { fontFamily, fontSize } from './src/styles/tokens/typography'
import { spacing, breakpoints, containerWidths } from './src/styles/tokens/spacing'
import { boxShadowLight } from './src/styles/tokens/shadows'
import { borderRadius } from './src/styles/tokens/radius'
```

#### Couleurs sémantiques via CSS variables

```typescript
colors: {
  // Palettes primitives directes
  slate, blue, cyan, emerald, amber, rose, violet,

  // Sémantiques via HSL CSS vars
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    hover: 'hsl(var(--primary-hover))',
    muted: 'hsl(var(--primary-muted))',
  },
  // + secondary, accent, destructive, success, warning, info, muted, popover, card, sidebar
}
```

#### Animations personnalisées

| Animation | Durée | Usage |
|-----------|-------|-------|
| accordion-down/up | 0.2s | Composants accordéon |
| fade-in/out | 0.3s | Transitions entrée/sortie |
| scale-in/out | 0.3s | Modals, popovers |
| slide-up/down/left/right | 0.3s | Drawers, sheets |
| shimmer | 2s (loop) | Skeletons loading |
| pulse-soft | 2s (loop) | Notifications |

#### Plugin utilisé

- `tailwindcss-animate` - Animations Radix UI

---

### 2.2 Styles Globaux

**Fichier :** `src/app/globals.css` (882 lignes)

#### Structure du fichier

```css
/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. CSS Variables (Light Mode) - 155 lignes */
:root { /* ~50 variables */ }

/* 3. CSS Variables (Dark Mode) - 100 lignes */
.dark { /* overrides */ }

/* 4. Base styles - Reset et fondations */
@layer base { /* focus-visible, smooth scroll, selection */ }

/* 5. Utility classes - 25+ classes .sp-* */
@layer utilities { /* custom utilities */ }

/* 6. Scrollbar styles */
::-webkit-scrollbar { /* custom scrollbar */ }
```

#### Variables CSS principales

| Catégorie | Variables Light | Variables Dark |
|-----------|-----------------|----------------|
| Background | `--background: 226 100% 97%` | `--background: 224 71% 3%` |
| Foreground | `--foreground: 222.2 84% 4.9%` | `--foreground: 210 40% 98%` |
| Primary | `--primary: 217 91% 60%` (#3B82F6) | `--primary: 217 91% 65%` |
| Accent | `--accent: 258 90% 66%` (#8B5CF6) | `--accent: 258 90% 70%` |
| Card | `--card: 0 0% 100%` | `--card: 220 47% 8%` |
| Sidebar | `--sidebar-background: 230 67% 5%` | `--sidebar-background: 230 67% 3%` |

#### Classes utilitaires personnalisées (`.sp-*`)

| Classe | Usage | Effets |
|--------|-------|--------|
| `.sp-surface` | Cards dark premium | Radial gradient + shadow |
| `.sp-toggle-pill` | Filtres toggle | Glow actif, transitions |
| `.sp-empty-state` | États vides | Dashed border, hover scale |
| `.sp-header` | Top bar | Glassmorphisme, blur |
| `.sp-avatar-neon` | Avatar sidebar | Ring animé hover |
| `.sp-card` | Cards interactives | Hover lift 3D |
| `.sp-skeleton` | Loading shimmer | Gradient animé |
| `.sp-tooltip` | Tooltips | Glass dark, glow |
| `.sp-modal-backdrop` | Backdrops | Blur profond |
| `.sp-icon-orb` | Icônes glow | Radial gradient pseudo |
| `.sp-btn-glow` | Boutons CTA | Shadow glow hover |
| `.sp-stat-orb` | Stats cards | Couleur par type |
| `.sp-glass-panel` | Panels latéraux | Backdrop blur |
| `.sp-progress-track/bar` | Progress bars | Transition width |
| `.sidebar-neon` | Sidebar gradient | Radial + border glow |
| `.sidebar-nav-item` | Nav items | Hover/active states |

---

### 2.3 Design Tokens

**Répertoire :** `src/styles/tokens/` (6 fichiers + tests)

#### Architecture des tokens

```
src/styles/tokens/
├── colors.ts        (439 lignes) - 7 palettes + sémantiques light/dark
├── typography.ts    (390 lignes) - 4 font families + 12 sizes + text styles
├── spacing.ts       (303 lignes) - Échelle 0-96 + sémantiques
├── shadows.ts       (280 lignes) - Box/drop/text shadows + glow
├── radius.ts        (323 lignes) - Scale + sémantiques + corner utilities
├── index.ts         (351 lignes) - Export centralisé + utilities
├── README.md        (320 lignes) - Documentation complète
└── __tests__/       (4 fichiers) - Tests Vitest
```

#### Couleurs primitives

| Palette | Couleur 500 | Usage |
|---------|-------------|-------|
| `slate` | `#64748b` | Gris neutres, textes |
| `blue` | `#3b82f6` | **Primary** - Couleur signature |
| `cyan` | `#06b6d4` | Accents, liens |
| `emerald` | `#10b981` | Success, validation |
| `amber` | `#f59e0b` | Warning, alertes |
| `rose` | `#e11d48` | Destructive, erreurs |
| `violet` | `#8b5cf6` | **Accent** - Premium |

Chaque palette contient 11 nuances (50-950).

#### Tokens sémantiques

```typescript
// Structure pour chaque couleur sémantique
{
  DEFAULT: '217 91% 60%',      // Couleur principale
  hover: '217 91% 55%',        // État hover
  active: '217 91% 50%',       // État actif
  foreground: '210 40% 98%',   // Texte sur cette couleur
  muted: '217 91% 95%',        // Background léger
}
```

#### Typographie

| Token | Font Family | Usage |
|-------|-------------|-------|
| `display` | Rajdhani | Titres hero, display |
| `sans` | Plus Jakarta Sans | Corps de texte |
| `mono` | JetBrains Mono | Code |
| `serif` | Merriweather | Citations |

**Échelle des tailles :**

| Token | Taille | Line Height | Usage |
|-------|--------|-------------|-------|
| `xs` | 12px | 16px | Labels, captions |
| `sm` | 14px | 20px | Texte secondaire |
| `base` | 16px | 24px | Corps principal |
| `lg` | 18px | 28px | Texte mis en avant |
| `xl` | 20px | 28px | Sous-titres |
| `2xl` | 24px | 32px | Titres de section |
| `3xl` | 30px | 36px | Titres de page |
| `4xl` | 36px | 40px | Titres majeurs |
| `5xl` | 48px | 1.1 | Hero titles |
| `6xl` | 60px | 1 | Display large |
| `7xl` | 72px | 1 | Display XL |
| `8xl` | 96px | 1 | Display jumbo |
| `9xl` | 128px | 1 | Display massive |

#### Espacements

**Base :** 4px (0.25rem)

| Token | Valeur | Pixels |
|-------|--------|--------|
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `4` | 1rem | 16px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |
| `24` | 6rem | 96px |

**Espacements sémantiques :**
- `component` : xs(4px) → xl(24px)
- `gap` : xs(4px) → 2xl(48px)
- `section` : sm(32px) → 2xl(128px)
- `form` : labelGap(6px), fieldGap(16px), sectionGap(32px)

#### Ombres

**Box shadows (light mode) :**

| Token | Valeur |
|-------|--------|
| `xs` | `0 1px 2px 0 rgba(59, 130, 246, 0.03)` |
| `sm` | `0 1px 3px 0 rgba(59, 130, 246, 0.06)` |
| `md` | `0 4px 6px -1px rgba(59, 130, 246, 0.07)` |
| `lg` | `0 10px 15px -3px rgba(59, 130, 246, 0.08)` |
| `xl` | `0 20px 25px -5px rgba(59, 130, 246, 0.1)` |
| `2xl` | `0 25px 50px -12px rgba(59, 130, 246, 0.15)` |

**Glow effects :**
- `glow.primary` : sm/md/lg avec rgba(59, 130, 246, 0.3-0.5)
- `glow.accent` : cyan rgba(6, 182, 212, 0.3-0.5)
- `glow.success/error/warning` : couleurs sémantiques

#### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `none` | 0 | Éléments carrés |
| `xs` | 2px | Tags compacts |
| `sm` | 4px | Inputs, badges |
| `md` | 6px | Défaut Shadcn |
| `DEFAULT` | 8px | Cards, boutons |
| `lg` | 12px | Cards principales |
| `xl` | 16px | Sections |
| `2xl` | 24px | Grandes sections |
| `full` | 9999px | Pills, avatars |

---

## 3. INVENTAIRE DES COMPOSANTS

### 3.1 Statistiques globales

| Catégorie | Nombre de fichiers |
|-----------|-------------------|
| **Total composants TSX** | **202** |
| Composants UI (Shadcn) | 35 |
| Composants métier | 167 |
| Répertoires de composants | 47 |

### 3.2 Composants de base (Shadcn/ui)

**Répertoire :** `src/components/ui/`

| Composant | Variantes | Extensions | Tests |
|-----------|-----------|------------|-------|
| `button.tsx` | 9 variants, 10 sizes | success, warning, info, touch-* | ✅ |
| `badge.tsx` | 8 variants, 3 sizes | icon prop, dot variant, pulse | ✅ |
| `input.tsx` | - | Extensions custom | ✅ |
| `card.tsx` | - | Classes `sp-card` intégrées | - |
| `avatar.tsx` | - | Avatar group | ✅ |
| `alert.tsx` | 4 variants | - | - |
| `dialog.tsx` | - | Radix UI base | - |
| `sheet.tsx` | 4 sides | Mobile drawer | - |
| `dropdown-menu.tsx` | - | Radix UI base | - |
| `popover.tsx` | - | Radix UI base | - |
| `select.tsx` | - | Radix UI base | - |
| `tooltip.tsx` | - | Radix UI base | - |
| `tabs.tsx` | - | Radix UI base | - |
| `table.tsx` | - | Table structure | - |
| `form.tsx` | - | React Hook Form | - |
| `calendar.tsx` | - | react-day-picker | - |
| `checkbox.tsx` | - | Radix UI base | - |
| `radio-group.tsx` | - | Radix UI base | - |
| `switch.tsx` | - | Radix UI base | - |
| `textarea.tsx` | - | - | - |
| `label.tsx` | - | - | - |
| `separator.tsx` | - | - | - |
| `scroll-area.tsx` | - | Radix UI base | - |
| `skeleton.tsx` | - | - | - |
| `sidebar.tsx` | - | Navigation complète | - |
| `breadcrumb.tsx` | - | - | - |
| `dynamic-breadcrumbs.tsx` | - | Auto-génération | ✅ |
| `progress-bar.tsx` | - | - | ✅ |
| `progress-circle.tsx` | - | SVG circulaire | ✅ |
| `empty-state.tsx` | 4 variants | Illustrations | ✅ |
| `command-palette.tsx` | - | cmdk integration | - |
| `keyboard-shortcuts-modal.tsx` | - | - | ✅ |
| `alert-dialog.tsx` | - | Radix UI base | - |
| `ThemeToggle.tsx` | - | Light/Dark/System | ✅ |
| `ThemeDropdown.tsx` | - | Menu déroulant | ✅ |

**Data Table :** `src/components/ui/data-table/`
- `index.tsx` - Composant principal TanStack Table
- `data-table-toolbar.tsx` - Barre d'outils filtres
- `data-table-pagination.tsx` - Pagination
- `data-table-row-actions.tsx` - Actions par ligne
- `data-table-cards.tsx` - Vue cards mobile

### 3.3 Composants composés (molecules)

| Répertoire | Composants | Description |
|------------|------------|-------------|
| `forms/` | 7 | FormInput, FormSelect, FormDatePicker, FormCheckbox, FormRadioGroup, FormTextarea, FormField |
| `loading/` | 6 | LoadingOverlay, Skeleton, SkeletonCard, SkeletonTable, SkeletonText, Spinner |
| `modals/` | 2 | ConfirmDialog, FormDialog |
| `cards/` | 5 | AvatarStack, TeamCard, UserCard, TeamCardSkeleton, UserCardSkeleton |
| `charts/` | 4 | AreaChartWidget, BarChartWidget, PieChartWidget, ChartContainer |
| `dashboard/` | 4 | StatCard, StatsGrid, TrendIndicator, PersonalTasksWidget |
| `toast/` | 2 | toast-provider.tsx, use-toast.ts |
| `illustrations/` | 4 | EmptyBoxIllustration, ErrorIllustration, NoPermissionIllustration, SearchNotFoundIllustration |
| `error/` | 5 | ErrorBoundary, ErrorFallback, ForbiddenPage, NotFoundPage, ServerErrorPage |
| `hoc/` | 1 | with-loading.tsx (HOC) |

### 3.4 Composants métier (organisms)

| Répertoire | Composants | Description |
|------------|------------|-------------|
| `auth/` | 4 | LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm |
| `leaves/` | 16 | Gestion complète des congés (badges, cards, dialogs, forms, calendar) |
| `schedules/` | 13 | Calendrier planning Schedule-X (desktop/mobile, overlays, modals) |
| `teams/` | 4 | TeamCard, TeamForm, TeamMembersManager, TeamsDataTable |
| `admin/companies/` | 4 | CompanyForm, CompanyFilters, DeleteCompanyDialog, columns |
| `admin/employees/` | 4 | EmployeeCard, EmployeeForm, EmployeeFilters, BulkDeleteDialog |
| `availabilities/` | 3 | AvailabilitiesList, AvailabilityCard, AvailabilityModal |
| `layout/` | 5 | DashboardLayout, Header, Footer, LandingHeader, LandingFooter |
| `shared/` | 3 | Header, Sidebar, Footer (versions partagées) |
| `cookies/` | 4 | CookieBanner, CookieConsentProvider, CookiePreferencesModal, CookieSettingsButton |
| `analytics/` | 2 | UmamiAnalytics, UmamiAnalyticsWrapper |
| `public/` | 3 | ContactForm, ContactSuccessState, ContactErrorState |
| `mobile/` | 1 | swipeable-drawer.tsx |
| `providers/` | 2 | ThemeProvider, command-palette-provider |

---

## 4. PALETTE ACTUELLE

### 4.1 Couleurs

#### Couleurs primaires

| Nom | Hex | HSL | Usage |
|-----|-----|-----|-------|
| Primary | `#3B82F6` | `217 91% 60%` | CTA, liens, focus |
| Primary Hover | `#2563EB` | `217 91% 55%` | État hover |
| Primary Muted | `#EFF6FF` | `217 91% 95%` | Backgrounds légers |

#### Couleurs secondaires/accent

| Nom | Hex | HSL | Usage |
|-----|-----|-----|-------|
| Secondary | `#2563EB` | `217 91% 53%` | Boutons secondaires |
| Accent (Violet) | `#8B5CF6` | `258 90% 66%` | Éléments premium |
| Cyan | `#06B6D4` | `189 94% 43%` | Highlights tech |

#### Couleurs sémantiques

| Nom | Hex | HSL | Usage |
|-----|-----|-----|-------|
| Success | `#10B981` | `160 84% 39%` | Validation, succès |
| Warning | `#F59E0B` | `38 92% 50%` | Alertes |
| Destructive | `#E11D48` | `347 77% 50%` | Erreurs, suppression |
| Info | `#0EA5E9` | `199 89% 48%` | Information |

#### Couleurs de surface

| Nom | Light | Dark | Usage |
|-----|-------|------|-------|
| Background | `#F7FAFF` | `#030712` | Fond page |
| Card | `#FFFFFF` | `#0B1220` | Cards, surfaces |
| Muted | `#F1F5F9` | `#1E293B` | Backgrounds secondaires |
| Border | `#E0E7FF` | `#1E3A5F` | Bordures |

#### Couleurs sidebar

| Nom | Valeur | Usage |
|-----|--------|-------|
| Sidebar BG | `#050816` | Fond sidebar |
| Sidebar FG | `#E2E8F0` | Texte sidebar |
| Sidebar Primary | `#3B82F6` | Éléments actifs |
| Neon Blue | `#3B82F6` | Glow effects |
| Neon Violet | `#8B5CF6` | Glow accent |

### 4.2 Typographie

#### Familles de polices

| Rôle | Police | Fallbacks |
|------|--------|-----------|
| Display | Rajdhani | system-ui, sans-serif |
| Sans | Plus Jakarta Sans | system-ui, -apple-system |
| Mono | JetBrains Mono | Menlo, Monaco, Consolas |
| Serif | Merriweather | Georgia, Times New Roman |

#### Weights utilisés

| Weight | Valeur | Usage |
|--------|--------|-------|
| Normal | 400 | Corps de texte |
| Medium | 500 | Labels, emphasis |
| Semibold | 600 | Sous-titres, boutons |
| Bold | 700 | Titres |

#### Échelle typographique (extraits)

| Classe | Taille | Line Height | Letter Spacing |
|--------|--------|-------------|----------------|
| `text-xs` | 12px | 16px | 0.025em |
| `text-sm` | 14px | 20px | 0.01em |
| `text-base` | 16px | 24px | 0 |
| `text-lg` | 18px | 28px | -0.01em |
| `text-xl` | 20px | 28px | -0.01em |
| `text-2xl` | 24px | 32px | -0.02em |
| `text-3xl` | 30px | 36px | -0.02em |

### 4.3 Espacements et Dimensions

#### Breakpoints responsive

| Breakpoint | Largeur | Usage |
|------------|---------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

#### Tailles de composants

| Composant | Tailles | Défaut |
|-----------|---------|--------|
| Button height | 28px, 32px, 40px, 44px, 48px | 36px |
| Input height | 32px, 40px, 44px | 40px |
| Avatar | 24px, 32px, 40px, 48px, 64px, 96px | 40px |
| Icon | 12px, 16px, 20px, 24px, 32px, 40px | 20px |
| Sidebar | 64px (collapsed), 256px (expanded) | 256px |

---

## 5. ANIMATIONS ET EFFETS VISUELS

### 5.1 Transitions

| Nom | Durée | Easing | Usage |
|-----|-------|--------|-------|
| `transition-smooth` | 200ms | ease-in-out | Défaut app |
| `accordion` | 200ms | ease-out | Accordéons |
| `fade` | 300ms | ease-in-out | Entrées/sorties |
| `scale` | 300ms | ease-in-out | Modals |
| `slide` | 300ms | ease-in-out | Drawers |

### 5.2 Animations loop

| Nom | Durée | Type | Usage |
|-----|-------|------|-------|
| `shimmer` | 2s | linear infinite | Skeleton loading |
| `pulse-soft` | 2s | ease-in-out infinite | Notifications |

### 5.3 Effets visuels

| Effet | Classes | Description |
|-------|---------|-------------|
| Glassmorphisme | `.glass`, `.sp-header` | backdrop-blur + bg semi-transparent |
| Glow | `.glow-primary`, `.sp-btn-glow` | box-shadow coloré |
| Neon | `.sidebar-neon`, `.sp-neon-*` | text-shadow + box-shadow bleu |
| Lift 3D | `.sp-card:hover` | translateY(-1px) + scale(1.005) |
| Gradient text | `.text-gradient-primary` | bg-clip-text blue→violet |

### 5.4 Focus states

```css
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

- **Ring color :** Primary blue
- **Ring width :** 2px
- **Ring offset :** 2px

---

## 6. DÉPENDANCES UI

### 6.1 Core

| Package | Version | Usage |
|---------|---------|-------|
| `tailwindcss` | ^3.4.17 | Framework CSS |
| `tailwindcss-animate` | ^1.0.7 | Animations Radix |
| `class-variance-authority` | ^0.7.1 | Variants composants |
| `clsx` | ^2.1.1 | Conditional classes |
| `tailwind-merge` | ^2.6.0 | Merge classes Tailwind |

### 6.2 Composants Radix UI

| Package | Version |
|---------|---------|
| `@radix-ui/react-alert-dialog` | ^1.1.15 |
| `@radix-ui/react-avatar` | ^1.1.11 |
| `@radix-ui/react-checkbox` | ^1.3.3 |
| `@radix-ui/react-dialog` | ^1.1.15 |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 |
| `@radix-ui/react-icons` | ^1.3.2 |
| `@radix-ui/react-label` | ^2.1.8 |
| `@radix-ui/react-popover` | ^1.1.15 |
| `@radix-ui/react-radio-group` | ^1.3.8 |
| `@radix-ui/react-scroll-area` | ^1.2.10 |
| `@radix-ui/react-select` | ^2.2.6 |
| `@radix-ui/react-separator` | ^1.1.8 |
| `@radix-ui/react-slot` | ^1.2.4 |
| `@radix-ui/react-switch` | ^1.2.6 |
| `@radix-ui/react-tabs` | ^1.1.13 |
| `@radix-ui/react-toast` | ^1.2.4 |
| `@radix-ui/react-tooltip` | ^1.2.8 |

### 6.3 Autres UI

| Package | Version | Usage |
|---------|---------|-------|
| `lucide-react` | ^0.468.0 | Icônes |
| `framer-motion` | ^12.23.25 | Animations avancées |
| `react-day-picker` | ^9.11.1 | Calendrier date picker |
| `recharts` | ^3.5.1 | Graphiques |
| `@schedule-x/react` | ^3.7.0 | Calendrier planning |
| `cmdk` | ^1.1.1 | Command palette |
| `sonner` | ^2.0.7 | Toasts |
| `react-hook-form` | ^7.68.0 | Formulaires |
| `@hookform/resolvers` | ^5.2.2 | Validation Zod |
| `@tanstack/react-table` | ^8.21.3 | Tables |
| `@dnd-kit/core` | ^6.3.1 | Drag & drop |
| `react-loading-skeleton` | ^3.5.0 | Skeletons |
| `next-themes` | ^0.4.6 | Theme switching |

---

## 7. RECOMMANDATIONS

### 7.1 Quick Wins (faciles à implémenter)

1. **Synchroniser chartTheme.ts avec tokens**
   ```typescript
   // Remplacer les couleurs hardcodées
   import { blue, violet, cyan } from '@/styles/tokens'
   export const CHART_COLORS = {
     primary: [blue[500], violet[500], cyan[500], ...],
   }
   ```

2. **Ajouter des aliases TypeScript pour les tokens**
   ```typescript
   // Dans tokens/index.ts
   export const colors = tokens.colors
   export const spacing = tokens.spacing.scale
   ```

3. **Documenter les variants Button/Badge**
   - Ajouter un fichier `src/components/ui/README.md` avec exemples visuels

4. **Créer des CSS variables pour les glows**
   ```css
   :root {
     --glow-primary: 0 0 20px rgba(59, 130, 246, 0.4);
     --glow-accent: 0 0 20px rgba(139, 92, 246, 0.4);
   }
   ```

### 7.2 Améliorations moyennes

1. **Migrer les classes `.sp-*` vers des composants**
   - Créer `<GlassPanel>`, `<StatOrb>`, `<EmptyState>` comme vrais composants
   - Utiliser CVA pour les variantes

2. **Ajouter Storybook**
   ```bash
   npx storybook@latest init
   ```
   - Documenter tous les composants UI
   - Ajouter des stories pour les variants

3. **Créer un thème landing page cohérent**
   - Migrer `landing.module.css` vers tokens/globals.css
   - Réutiliser les classes existantes

4. **Tests visuels avec Chromatic**
   - Intégrer dans CI/CD
   - Détecter les régressions visuelles

5. **Compléter les tests composants**
   - Actuellement : tokens testés, quelques UI
   - Objectif : 80%+ de couverture composants

### 7.3 Refactoring majeur (si nécessaire)

1. **Migration Tailwind v4** (quand stable)
   - CSS-first configuration
   - `@theme` directive native
   - Variables CSS automatiques

2. **Design tokens en JSON**
   - Utiliser Style Dictionary ou Tokens Studio
   - Générer CSS/TS/Figma depuis une source unique

3. **Component library package**
   - Extraire `@smartplanning/ui` en package séparé
   - Réutilisable dans d'autres projets

---

## 8. FICHIERS ANALYSÉS

### Configuration

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `tailwind.config.ts` | 437 | Configuration Tailwind |
| `src/app/globals.css` | 882 | Styles globaux + CSS vars |
| `package.json` | 151 | Dépendances |

### Design Tokens

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `src/styles/tokens/index.ts` | 351 | Export centralisé |
| `src/styles/tokens/colors.ts` | 439 | Palettes couleurs |
| `src/styles/tokens/typography.ts` | 390 | Typographie |
| `src/styles/tokens/spacing.ts` | 303 | Espacements |
| `src/styles/tokens/shadows.ts` | 280 | Ombres |
| `src/styles/tokens/radius.ts` | 323 | Border radius |
| `src/styles/tokens/README.md` | 320 | Documentation |

### Composants clés

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `src/components/ui/button.tsx` | 183 | Button + TouchableButton |
| `src/components/ui/badge.tsx` | 127 | Badge avec extensions |
| `src/components/ui/card.tsx` | 77 | Card composites |
| `src/components/charts/chartTheme.ts` | 253 | Configuration charts |
| `src/lib/utils.ts` | 161 | Utilitaires (cn, formatters) |

### Statistiques finales

| Métrique | Valeur |
|----------|--------|
| Total fichiers tokens | 7 |
| Total composants TSX | 202 |
| Lignes CSS variables | ~255 |
| Classes utilitaires custom | 25+ |
| Dépendances UI | 35 |
| Score maturité | 8.3/10 |

---

## 9. CONCLUSION

Le Design System de SmartPlanning V2 est **mature et production-ready**. L'architecture des tokens TypeScript, l'intégration Tailwind et les extensions Shadcn/ui sont exemplaires.

Les principales améliorations à envisager sont :
1. Synchronisation des sources (tokens TS ↔ CSS vars ↔ chartTheme)
2. Documentation visuelle (Storybook)
3. Migration progressive des classes `.sp-*` vers des composants

Le score de 8.3/10 reflète un système robuste avec des opportunités d'optimisation bien identifiées.

---

**SmartPlanning V2** - Design System Audit
*Généré le 31 janvier 2026*
*✅ Via Context7 (Tailwind CSS docs)*
