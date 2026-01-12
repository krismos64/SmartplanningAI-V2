# SmartPlanning

[![CI - Lint, Test & Build](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml)
[![CD - Build & Deploy](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml)

Plateforme SaaS moderne de gestion intelligente des plannings d'entreprise (multi-tenant).

## Informations projet

- **Version** : 2.0 (Refonte complète)
- **Statut** : En développement actif
- **Date de démarrage** : 04/11/2025
- **Préfixe Jira** : `SP`
- **URL Production** : https://smartplanning.fr ✅
- **Dernière mise à jour** : 9 janvier 2026
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
- **Monitoring** : À définir (Sentry/LogRocket)

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
│   │   ├── auth/         # LoginForm, RegisterForm
│   │   ├── cards/        # UserCard, TeamCard, AvatarStack
│   │   ├── charts/       # AreaChartWidget, BarChartWidget, PieChartWidget
│   │   ├── dashboard/    # StatCard, TrendIndicator, StatsGrid
│   │   ├── forms/        # FormField, FormInput, FormSelect...
│   │   ├── loading/      # Spinner, Skeleton, LoadingOverlay
│   │   ├── modals/       # ConfirmDialog, FormDialog
│   │   └── toast/        # Toast system (Sonner)
│   ├── lib/              # Utilitaires et helpers
│   │   ├── prisma.ts     # Client Prisma
│   │   ├── auth.ts       # Configuration NextAuth
│   │   ├── auth.config.ts # Config middleware + callbacks RBAC
│   │   ├── permissions.ts # Système de permissions centralisé
│   │   ├── actions/      # Server Actions
│   │   │   ├── auth-actions.ts   # Actions authentification
│   │   │   └── crud-utils.ts     # Utilitaires CRUD génériques (SP-150)
│   │   ├── services/     # Services métier
│   │   │   └── dashboard/  # Services stats par rôle (SP-144)
│   │   ├── validations/  # Schémas Zod (auth, user, employee, company, team...)
│   │   └── utils.ts      # Fonctions utilitaires
│   ├── types/            # Types TypeScript globaux (+ crud.ts SP-150)
│   ├── hooks/            # Custom React hooks (+ useCrudMutation SP-150)
│   └── middleware.ts     # Middleware NextAuth (protection routes)
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   └── migrations/       # Migrations Prisma
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
  - 106 tests E2E (318 avec 3 navigateurs) répartis en 5 fichiers :
    - employee.spec.ts (15 tests) : accès, bienvenue, stats, planning, actions
    - manager.spec.ts (23 tests) : stats équipe, planning, demandes congés
    - director.spec.ts (22 tests) : KPIs, graphiques, congés en attente
    - super-admin.spec.ts (25 tests) : KPIs SaaS, MRR, entreprises
    - rbac-protection.spec.ts (21 tests) : protection routes par rôle
  - Tests multi-navigateurs : Chromium, Firefox, WebKit
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
- Hashage des mots de passe (bcrypt)
- Variables d'environnement sécurisées (.env.local)
- Gestion des permissions RBAC stricte
- Audit logs (ActivityLog)

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

### Monitoring (à venir)

- Sentry pour les erreurs
- LogRocket pour le comportement utilisateur
- Lighthouse CI pour les performances
- Analytics personnalisés

## SEO

### Optimisations automatiques

- Meta tags dynamiques
- Open Graph et Twitter Cards
- Sitemap.xml généré
- Robots.txt configuré
- Balises sémantiques HTML5
- Schema.org JSON-LD
- Canonical URLs
- Performance optimisée (Core Web Vitals)

Voir `/docs/seo-optimization.md` (à créer) pour le détail.

## Tests

### Infrastructure de test

- **Framework** : Vitest 2.1.8
- **Testing Library** : React Testing Library + user-event
- **Mocking** : MSW (Mock Service Worker) + vitest-mock-extended
- **E2E** : Playwright (configuré)
- **Coverage** : v8 provider

### Couverture actuelle (12 janvier 2026)

| Catégorie            | Coverage | Tests    |
| -------------------- | -------- | -------- |
| **Global**           | **~55%** | **1374** |
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

### Tests E2E

| Suite                        | Tests   |
| ---------------------------- | ------- |
| Auth (login/register)        | 18      |
| Middleware RBAC              | 27      |
| Smoke tests                  | 4       |
| **Dashboard Employee**       | 15      |
| **Dashboard Manager**        | 23      |
| **Dashboard Director**       | 22      |
| **Dashboard Super Admin**    | 25      |
| **RBAC Protection**          | 21      |
| **CRUD Companies**           | 18      |
| **CRUD Employees**           | 18      |
| **CRUD Teams**               | 15      |
| **Empty States**             | 8       |
| **Total E2E**                | **214** |
| **Total avec 3 navigateurs** | **642** |

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
- Tests unitaires sur tous les push (~1300 tests Vitest)
- Tests E2E sur PR vers main (~165 tests Playwright, 3 navigateurs en parallèle)
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
