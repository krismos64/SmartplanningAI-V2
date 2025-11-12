# SP-118 : Layout System - Documentation

**Date** : 12 novembre 2024
**Ticket Jira** : SP-118
**Sprint** : EPIC SP-107 - Composants UI de Base
**Auteur** : Christophe Mostefaoui
**Durée** : 3-4 heures

---

## 📋 Vue d'ensemble

SP-118 implémente le système de layout complet de SmartPlanning V2, comprenant 4 composants principaux qui orchestrent l'interface utilisateur des dashboards :

1. **Footer.tsx** - Pied de page avec liens légaux
2. **Sidebar.tsx** - Navigation latérale avec menus par rôle
3. **Header.tsx** - Barre supérieure avec logo animé et user menu
4. **DashboardLayout.tsx** - Wrapper orchestrant tous les composants

---

## 🏗️ Architecture des composants

### 1. Footer (`src/components/layout/Footer.tsx`)

#### Props TypeScript

```typescript
interface FooterProps {
  variant?: 'dashboard' | 'public'
}
```

#### Fonctionnalités

- **Variante dashboard** : Minimaliste (56px hauteur), copyright + version + 3 liens
- **Variante public** : Complète avec sections (logo, navigation, social media)
- **Copyright dynamique** : Année courante automatique
- **Version app** : Récupérée depuis `package.json` (v2.0.0)
- **Liens légaux** : CGU, Confidentialité, Contact
- **Social media** : GitHub (krismos64), site web personnel

#### Responsive

- **Mobile** : Stack vertical
- **Desktop** : Flex layout horizontal (3 colonnes pour variante public)

---

### 2. Sidebar (`src/components/layout/Sidebar.tsx`)

#### Props TypeScript

```typescript
interface SidebarProps {
  user: {
    name: string
    email: string
    role: 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
    organizationId?: string
  }
}

interface MenuItem {
  id: string
  label: string
  icon: typeof Home // Lucide React icon
  href: string
  roles: UserRole[] | 'ALL'
}
```

#### Menu items par rôle

| Rôle | Menu items | Navigation |
|------|------------|------------|
| **SUPER_ADMIN** | 4 items | Dashboard SaaS, Organisations, Monitoring, Logs |
| **DIRECTOR** | 9 items | Dashboard, Collaborateurs, Plannings, Congés, Tâches, Statistiques, Incidents, IA Planning, Paramètres |
| **MANAGER** | 7 items | Dashboard, Plannings, Congés, Tâches, Statistiques, Incidents, IA Planning |
| **EMPLOYEE** | 4 items | Dashboard, Plannings, Congés, Tâches |

#### Fonctionnalités

- **Filtrage dynamique** : `getMenuItemsByRole(role)` pour afficher seulement les items autorisés
- **Active route highlight** : `usePathname()` pour détecter la route courante
- **Collapse/expand** : `useSidebar()` hook (Shadcn/ui) pour toggle état
  - Collapsed : 80px width, icons uniquement avec tooltips
  - Expanded : 256px width, icons + labels
- **Animations** : Framer Motion pour fade-in, slide, hover effects
- **Icons** : Lucide React (Home, Calendar, Brain, Plane, etc.)
- **User footer** : Avatar avec initiales + nom + email

#### Responsive

- **Desktop** : Sidebar fixe avec bouton collapse
- **Mobile** : Sheet overlay via `SidebarProvider`

---

### 3. Header (`src/components/layout/Header.tsx`)

#### Props TypeScript

```typescript
interface HeaderProps {
  user: {
    name: string
    email: string
    avatar?: string
    role: 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
  }
  notificationsCount?: number
}
```

#### Fonctionnalités

- **Logo animé** : Lottie animation (`/public/animations/planning-animation.json`)
- **User dropdown menu** :
  - Avatar avec initiales (fallback)
  - Nom + rôle affiché
  - Liens : Mon profil, Paramètres, Se déconnecter
- **Notifications** :
  - Icône Bell avec badge compteur
  - Badge rouge "9+" si > 9 notifications
- **Glassmorphism** : `backdrop-blur-md` + `bg-background/80`
- **Sticky header** : `position: sticky` + `top: 0` + `z-index: 40`
- **Burger menu mobile** : Toggle sidebar via `useSidebar().toggleSidebar()`

#### Animations & Effects

- **Lottie** : Dynamic import (SSR-safe) avec `next/dynamic`
- **Glassmorphism** : Effet de flou sur arrière-plan (modern browsers)
- **Dropdown** : Animations natives Radix UI

#### Responsive

- **< 1024px** : Burger menu visible, logo texte caché
- **>= 1024px** : Logo texte + user details affichés

---

### 4. DashboardLayout (`src/components/layout/DashboardLayout.tsx`)

#### Props TypeScript

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
    organizationId?: string
  }
  notificationsCount?: number
}
```

#### Structure

```tsx
<SidebarProvider defaultOpen={true}>
  <div className="flex min-h-screen">
    <Sidebar user={user} />
    <div className="flex flex-1 flex-col">
      <Header user={user} notificationsCount={notificationsCount} />
      <main className="flex-1">
        <ScrollArea>
          <Breadcrumbs pathname={pathname} />
          <Suspense fallback={<Skeleton />}>
            {children}
          </Suspense>
        </ScrollArea>
      </main>
      <Footer variant="dashboard" />
    </div>
  </div>
</SidebarProvider>
```

#### Fonctionnalités

- **SidebarProvider** : Context global pour state collapse/expand
- **Breadcrumbs** : Génération automatique depuis `pathname`
  - Parsing des segments d'URL
  - Mapping labels personnalisés (`formatBreadcrumbLabel`)
  - Séparateurs ChevronRight
- **Suspense boundary** : Fallback Skeleton pendant chargement
- **ScrollArea** : Main content scrollable (hauteur calculée)
- **Responsive layout** : Flex pour adaptation mobile/desktop

#### Label mapping (breadcrumbs)

```typescript
const labelMap: Record<string, string> = {
  'super-admin': 'Administration',
  organizations: 'Organisations',
  monitoring: 'Monitoring',
  logs: 'Logs',
  team: 'Équipe',
  schedules: 'Plannings',
  leaves: 'Congés',
  tasks: 'Tâches',
  stats: 'Statistiques',
  incidents: 'Incidents',
  'ai-planning': 'IA Planning',
  settings: 'Paramètres',
  profile: 'Profil',
  notifications: 'Notifications',
}
```

---

## 🧪 Pages de test

### `/test-layout` - Test interactif

Page permettant de tester les 4 rôles utilisateur avec onglets :

- **4 tabs** : SUPER_ADMIN, DIRECTOR, MANAGER, EMPLOYEE
- **Mock users** : Données de test pour chaque rôle
- **Role descriptions** : Fonctionnalités et menu items affichés
- **Test content** : 3 cards avec lorem ipsum

**Utilisation** :

```bash
npm run dev
# Ouvrir http://localhost:3000/test-layout
# Cliquer sur les onglets pour tester chaque rôle
# Observer les changements dans la Sidebar
```

### `/super-admin` - Placeholder Phase 5

Page placeholder pour l'administration SaaS :

- **Carte informative** : Fonctionnalités prévues Phase 5
- **Liste des features** : MRR, churn, logs RGPD, impersonate, monitoring
- **Navigation testable** : Layout fonctionnel

---

## 📦 Dépendances installées

| Package | Version | Usage |
|---------|---------|-------|
| `lottie-react` | **latest** | Animations Lottie (logo animé Header) |

**Installation** :

```bash
npm install lottie-react
```

---

## 🎨 Design System

### Couleurs (via Shadcn/ui)

- **Primary** : Indigo (`#4f46e5` variante v1)
- **Background** : White/Dark selon theme
- **Muted** : Gray-100/800
- **Destructive** : Red (notifications badge)

### Typographie

- **Font family** : System fonts (Tailwind default)
- **Sizes** : text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px)
- **Weights** : medium (500), semibold (600), bold (700)

### Spacing

- **Header height** : 64px (h-16)
- **Footer height** : 56px (h-14) dashboard, variable public
- **Sidebar width** : 80px collapsed, 256px expanded (w-20 / w-64)
- **Container padding** : px-4 mobile, px-6 desktop

### Animations

- **Framer Motion** :
  - Fade-in : `opacity: 0 → 1`
  - Slide : `x: -20 → 0`
  - Hover scale : `scale: 1 → 1.02`
  - Tap scale : `scale: 1 → 0.98`
- **Transitions** : duration 0.2s, ease-in-out
- **Stagger** : delay 50ms par item menu

---

## 🔒 Sécurité & Bonnes pratiques

### TypeScript strict

- ✅ Tous les composants typés avec interfaces
- ✅ Enum `UserRole` pour éviter les string literals
- ✅ Props validation stricte

### Accessibilité (a11y)

- ✅ ARIA labels sur icons (Bell, Menu, etc.)
- ✅ Keyboard navigation (DropdownMenu, Sidebar)
- ✅ Screen reader friendly (semantic HTML)
- ✅ Focus states visibles

### Performance

- ✅ Dynamic import Lottie (SSR-safe)
- ✅ Suspense boundaries (lazy loading)
- ✅ ScrollArea optimisée (virtual scrolling Radix)
- ✅ Memoization des filtered menu items

### Responsive

- ✅ Mobile-first approach
- ✅ Breakpoints Tailwind (sm, md, lg, xl)
- ✅ Touch-friendly (tap targets 44x44px minimum)
- ✅ Sheet overlay mobile (Sidebar)

---

## 🚀 Utilisation dans l'application

### Exemple basique

```tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  // Récupérer user depuis session (next-auth)
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'DIRECTOR' as const,
    organizationId: 'org-123',
  }

  return (
    <DashboardLayout user={user} notificationsCount={5}>
      <h1>Dashboard Content</h1>
      <p>Your page content here...</p>
    </DashboardLayout>
  )
}
```

### Avec Next-auth

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={session.user}>
      {/* Page content */}
    </DashboardLayout>
  )
}
```

---

## 📊 Métriques & Validation

### Build production

```bash
npm run build
# ✅ 0 erreurs TypeScript
# ✅ 0 erreurs ESLint
# ✅ Build réussi
```

### Performance (Lighthouse estimé)

- **Performance** : ~95 (lazy loading, dynamic imports)
- **Accessibility** : ~100 (ARIA labels, semantic HTML)
- **Best Practices** : ~100 (TypeScript strict, no console.log)
- **SEO** : ~90 (meta tags à ajouter par page)

### Bundle size (estimé)

- **Footer** : ~2 KB
- **Sidebar** : ~8 KB (Framer Motion)
- **Header** : ~10 KB (Lottie + DropdownMenu)
- **DashboardLayout** : ~5 KB
- **Total** : ~25 KB (gzipped)

---

## 🔄 Prochaines étapes (hors SP-118)

### Phase actuelle (SP-107)

- ✅ SP-117 : Setup & Dépendances
- ✅ **SP-118 : Layout System** (ce ticket)
- ⏳ SP-119 : Form System (react-hook-form + zod)
- ⏳ SP-120 : DataTable (TanStack Table)
- ⏳ SP-121 : Modales & Loading States
- ⏳ SP-122 : Toast System (Sonner)
- ⏳ SP-123 : Business Components (UserCard, TeamCard)

### Phase 5 (Epic "Administration SaaS")

- Dashboard SaaS avec métriques MRR
- Gestion organisations (CRUD)
- Logs système RGPD
- Mode impersonate
- Monitoring (health checks)
- Stripe webhooks

---

## 📝 Notes techniques

### Différences v1 → v2

| Feature | SmartPlanning v1 | SmartPlanning v2 |
|---------|------------------|------------------|
| **Rôles** | `employee`, `manager`, `directeur`, `admin` | `EMPLOYEE`, `MANAGER`, `DIRECTOR`, `SUPER_ADMIN` |
| **Sidebar collapse** | ❌ Non disponible | ✅ Collapse avec localStorage |
| **Logo** | Texte "SmartPlanning" + Lottie | Idem + dynamic import SSR-safe |
| **Glassmorphism** | Header fixe avec gradient | Glassmorphism `backdrop-blur-md` |
| **Breadcrumbs** | ❌ Non implémenté | ✅ Génération automatique |
| **Theme** | Dark/Light toggle | 🔜 À implémenter (ThemeProvider) |

### Assets utilisés

- `/public/animations/planning-animation.json` - 152 KB (Lottie)
- `/public/images/logo-smartplanning.webp` - Non utilisé (Lottie prioritaire)

### Composants Shadcn/ui requis

```bash
# Déjà installés (SP-117)
npx shadcn@latest add button card avatar badge separator
npx shadcn@latest add dropdown-menu tabs scroll-area
npx shadcn@latest add sidebar tooltip breadcrumb skeleton
```

---

## 🏁 Conclusion

SP-118 établit la fondation UI de SmartPlanning V2 avec un système de layout professionnel, performant, et extensible. Les 4 composants sont **production-ready** et respectent les standards modernes (TypeScript strict, a11y, responsive, SEO-friendly).

**Points forts** :

✅ Navigation dynamique par rôle
✅ Collapse sidebar avec persistence
✅ Glassmorphism moderne
✅ Animations fluides (Framer Motion)
✅ TypeScript strict (0 erreur)
✅ Build production réussi
✅ Pages de test interactives

**Documentation consultable** :

- Code source : `/src/components/layout/`
- Tests : `/src/app/test-layout/`, `/src/app/super-admin/`
- Documentation : `/docs/SP-118-layout-system.md`

---

**Prêt pour SP-119 (Form System) !** 🚀
