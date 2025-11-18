# SmartPlanning V2

Plateforme SaaS moderne de gestion intelligente des plannings d'entreprise (multi-tenant).

## Informations projet

- **Version** : 2.0.0 (Refonte complète)
- **Statut** : En développement actif
- **Date de démarrage** : 04/11/2025
- **Préfixe Jira** : `SP`

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
- **CI/CD** : GitHub Actions (à venir)
- **Hosting** : À définir (Vercel/Railway/DigitalOcean)
- **Monitoring** : À définir (Sentry/LogRocket)

## Fonctionnalités principales

### Composants UI production-ready

- **DataTable avancée** (SP-120) : Composant de tableau avec tri multi-colonnes, pagination, recherche fuzzy, sélection multi-rows, actions par ligne, responsive (table desktop / cards mobile)

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
│   │   ├── (auth)/       # Routes authentification
│   │   ├── (dashboard)/  # Routes dashboard
│   │   ├── api/          # API Routes
│   │   └── layout.tsx
│   ├── components/       # Composants React réutilisables
│   │   ├── ui/           # Shadcn components
│   │   ├── auth/         # Composants authentification
│   │   ├── dashboard/    # Composants dashboard
│   │   └── planning/     # Composants planning
│   ├── lib/              # Utilitaires et helpers
│   │   ├── prisma.ts     # Client Prisma
│   │   ├── auth.ts       # Configuration NextAuth
│   │   └── utils.ts      # Fonctions utilitaires
│   ├── types/            # Types TypeScript globaux
│   ├── hooks/            # Custom React hooks
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

#### Phase 3 : Authentification 📋

- SP-7 : Pages login/register
- SP-8 : Middleware protection routes
- SP-9 : Gestion des 4 rôles (RBAC)

#### Phase 4 : Dashboard 📋

- SP-10 : Layout dashboard + sidebar
- SP-11 : Page d'accueil par rôle

#### Phase 5+ : Planning, Congés, Notifications, Export... (À venir)

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

## Sécurité

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

## Tests (à venir)

### Stratégie de tests

- **Unitaires** : Jest + React Testing Library
- **E2E** : Playwright
- **Intégration** : API Routes avec Supertest
- **Accessibilité** : axe-core
- **Performance** : Lighthouse CI

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

## Déploiement (à venir)

### Environnements

- **Development** : Local Docker
- **Staging** : À définir
- **Production** : À définir (Vercel/Railway)

### CI/CD

- GitHub Actions
- Tests automatiques sur PR
- Déploiement automatique sur merge main
- Rollback automatique si erreur
