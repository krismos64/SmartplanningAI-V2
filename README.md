# SmartPlanning

[![CI - Lint, Test & Build](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml)
[![CD - Build & Deploy](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml)

Plateforme SaaS multi-tenant de gestion intelligente des plannings et des ressources humaines.

- **Production** : https://smartplanning.fr
- **Version** : 2.0
- **Jira** : prefixe `SP`

## Stack technique

| Couche          | Technologies                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| Frontend        | Next.js 15.5.9 (App Router), React 19, TypeScript 5.7.2, Tailwind + Shadcn/ui |
| Backend         | NextAuth v5 (Auth.js), Prisma 6.18.0, Zod, Stripe v20.3.1                     |
| Base de donnees | PostgreSQL 16, Redis 7 (ioredis 5.10)                                         |
| Emails          | React Email (30 templates), Nodemailer SMTP                                    |
| Temps reel      | Server-Sent Events (SSE) — notifications + messagerie sur un stream unique     |
| DevOps          | Docker, GitHub Actions (CI/CD), VPS OVH (Ubuntu 24.04), Nginx, Let's Encrypt  |

## Fonctionnalites

- **Authentification** : Multi-roles (SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE), verification email, invitation par email, activation de compte
- **Dashboards** : 4 tableaux de bord par role avec KPIs, graphiques Recharts, animations Framer Motion
- **Planning** : Calendrier Schedule-X (drag & drop, recurrence, conflits, exports PDF/Excel/CSV), vues jour/semaine/mois
- **Conges** : Workflow validation (PENDING -> APPROVED/REJECTED), soldes CP/RTT, overlay calendrier, demi-journees
- **Messagerie interne** : Conversations DIRECT (1:1), TEAM (auto-sync equipes) et GROUP (manuelles). Messages texte + pieces jointes (PDF, images via Cloudinary, max 10 Mo). Reception temps reel via SSE. Groupement de messages, scroll infini cursor-based, optimistic updates. Archivage avec desarchivage auto sur nouveau message. Administration de groupe : avatar personnalisable, renommage, gestion des membres reserves a l'admin. **SYSTEM_ADMIN peut contacter n'importe quel utilisateur cross-tenant** (conversations avec `companyId: null`, isolation multi-tenant preservee pour les autres roles).
- **Import CSV/Excel** : Import bulk d'employes depuis fichier CSV ou Excel (.xlsx). Validation Zod temps reel cote client avec cellules colorees. Support headers FR/EN avec normalisation. Detection des doublons, creation auto des equipes, sync Stripe. Modele telecharger pre-rempli.
- **Billing** : Abonnement per-seat Stripe (2,90 euros/employe/mois), portail client, webhooks, sync employes auto
- **Notifications** : Temps reel SSE, 30 emails transactionnels (React Email), preferences par categorie/canal
- **Redis** : Rate limiting distribue (INCR+EXPIRE), sessions actives (TTL 24h), cache dashboards (TTL 300s), fallback memoire
- **CRUD** : Entreprises, employes, equipes avec RBAC et multi-tenant strict
- **Audit** : Journal d'audit complet, export CSV, protection anti-injection
- **Impersonation** : Mode support SYSTEM_ADMIN lecture seule avec audit trail
- **Monitoring** : Health check DB + Redis (PING/PONG), KPIs SaaS, graphiques admin, service MRR unifie
- **Admin** : Page utilisateurs cross-tenant, essais a risque, broadcast email, stats + export PDF
- **Profil** : Avatar Cloudinary, RGPD (export donnees, suppression compte), preferences affichage
- **Settings** : Apparence, notifications, entreprise (jours travailles, horaires)
- **Notes & Incidents** : Taches personnelles (drag & drop), notes d'incidents avec visibilite RBAC
- **SEO** : Metadata API, JSON-LD Schema.org, sitemap, robots.txt
- **Landing** : Design "Cyber Glass 3D", simulateur tarifs, FAQ, pages legales RGPD
- **Accessibilite** : WCAG 2.1 AA, touch targets 44px, Lighthouse 100%

> Historique detaille du developpement : [`docs/development-log.md`](docs/development-log.md)

## Prerequis

| Outil      | Version minimale | Verification          |
| ---------- | ---------------- | --------------------- |
| Node.js    | >= 20.0.0        | `node -v`             |
| npm        | >= 10.0.0        | `npm -v`              |
| Docker     | >= 24.0          | `docker --version`    |
| Docker Compose | >= 2.0       | `docker compose version` |

## Installation

```bash
git clone https://github.com/krismos64/SmartplanningAI-V2.git
cd SmartplanningAI-V2
npm install
cp .env.example .env.local    # Configurer les variables
docker-compose up -d           # PostgreSQL + Redis + Adminer
npx prisma migrate dev
npx prisma generate
npm run db:seed                # Donnees de demonstration
npm run dev
```

### Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner au minimum :

| Variable | Description | Obligatoire |
| -------- | ----------- | :---------: |
| `DATABASE_URL` | URL PostgreSQL (pre-rempli pour Docker local) | Oui |
| `AUTH_SECRET` | Cle JWT — `openssl rand -base64 32` | Oui |
| `AUTH_URL` | URL de l'app (`http://localhost:3000`) | Oui |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Config SMTP pour emails transactionnels | Oui |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Cles API Stripe (mode test en dev) | Oui |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe — `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | Oui |
| `STRIPE_PRICE_ID` | Price ID du tarif per-seat | Oui |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Upload avatars + pieces jointes messagerie | Oui |
| `REDIS_URL` | URL Redis (pre-rempli pour Docker local) | Oui |
| `CRON_SECRET` | Secret routes cron — `openssl rand -base64 32` | Oui |
| `HEALTH_API_KEY` | Secret endpoint `/api/health` | Oui |

Voir `.env.example` pour la liste complete et les variables optionnelles (Umami, Sentry, OpenAI).

### Acces locaux

| Service     | URL                   | Identifiants                                              |
| ----------- | --------------------- | --------------------------------------------------------- |
| Application | http://localhost:3000 | `contact@smartplanning.fr` / `Password123!` (admin)       |
| Adminer     | http://localhost:8081 | smartplanning / smartplanning_password / smartplanning_db |
| PostgreSQL  | localhost:5433        | —                                                         |
| Redis       | localhost:6380        | —                                                         |

> Tous les comptes du seed partagent le mot de passe `Password123!`. Voir `prisma/seed.ts` pour la liste complete.

## Scripts

```bash
npm run dev              # Developpement
npm run build            # Build production
npm run lint             # ESLint
npm run db:migrate       # Migrations Prisma
npm run db:studio        # Prisma Studio
npm run db:seed          # Seed base de donnees
npm run test             # Tests unitaires (watch)
npm run test -- --run    # Tests unitaires (single run)
npm run test:e2e         # Tests E2E Playwright
```

## Architecture

```
src/
├── app/              # Next.js 15 App Router (56 pages, 5 layouts)
│   ├── (auth)/       # Login, register, verify-email, activate-account
│   ├── (about)/      # A propos, tarifs
│   ├── (landing)/    # Landing page
│   ├── (legal)/      # Pages legales RGPD
│   ├── app/          # Routes protegees par role
│   └── api/          # API Routes (avatar, webhooks, health, SSE, messages...)
├── components/       # 200 composants React
│   ├── messaging/    # Messagerie (9 composants)
│   ├── import/       # Import CSV (4 composants)
│   └── ui/           # Shadcn/ui (34 composants)
├── lib/              # Actions (28), services (20), validations Zod (22), email (30 templates)
├── hooks/            # 23 hooks custom (SSE, SWR, messagerie, import CSV)
├── types/            # Types TypeScript globaux
└── styles/           # Design tokens centralises
```

## Base de donnees

21 modeles Prisma (17 core + 4 NextAuth), 16 enums, 55+ index, 19 migrations.

| Categorie | Modeles |
|---|---|
| Auth (NextAuth) | User, Account, Session, VerificationToken |
| Core | Company, Employee, Team |
| Planning | Schedule, Availability |
| Conges | LeaveRequest, LeaveBalance |
| Notes | PersonalTask, IncidentNote |
| Messagerie | Conversation, ConversationMember, Message |
| Systeme | Notification, Subscription, Payment, AuditLog, EmailLog |

Voir [`docs/database-architecture.md`](docs/database-architecture.md) pour le detail complet.

## Tests

| Type      | Framework  | Fichiers | Tests     |
| --------- | ---------- | -------- | --------- |
| Unitaires | Vitest     | 157      | 2 785     |
| E2E       | Playwright | 13       | 189       |
| **Total** |            | **170**  | **2 974** |

Focus sur la logique metier critique : RBAC, Zod, Server Actions, Stripe, workflows E2E, messagerie, import CSV.

## Deploiement

| Element    | Valeur                                         |
| ---------- | ---------------------------------------------- |
| URL        | https://smartplanning.fr                       |
| Serveur    | VPS OVH (4 vCores, 8GB RAM)                    |
| OS         | Ubuntu 24.04 LTS                               |
| Containers | Docker Compose (app + PostgreSQL 16 + Redis 7) |
| Analytics  | Umami (analytics.smartplanning.fr)             |
| Registry   | GitHub Container Registry (ghcr.io)            |

### CI/CD Pipeline

```
Push main → CI (lint + tests + build) → CD (Docker build → deploy VPS → Prisma migrate)
```

| Trigger          | Tests                   | Deploiement | Temps      |
| ---------------- | ----------------------- | ----------- | ---------- |
| Push feature     | Unitaires               | Non         | ~3-5 min   |
| PR vers main     | Unitaires + E2E prod    | Non         | ~15-20 min |
| Merge main       | Unitaires               | Oui (auto)  | ~8-10 min  |
| Nightly (2h UTC) | Unitaires + E2E complet | Non         | ~45-60 min |

Les migrations Prisma sont executees automatiquement dans le conteneur Docker apres le deploiement.

> Guide complet : [`docs/deployment.md`](docs/deployment.md)

## Securite

- RBAC 4 niveaux avec `checkPermission()` sur chaque Server Action
- Isolation multi-tenant par `companyId` sur chaque requete Prisma (defense-in-depth)
- Validation Zod aux frontieres, protection CSRF (NextAuth)
- Cookies httpOnly + secure + sameSite, hashage bcrypt
- Rate limiting Redis distribue (fallback memoire), audit logs, CSP headers, SRI en production
- Subscription guard middleware Edge Runtime
- Verification email a l'inscription (token 24h, page `/verify-email`)
- Emails securite envoyes inconditionnellement (changement mot de passe, suppression RGPD)
- Messagerie : messages prives par conversation, isolation multi-tenant, verification membership sur chaque action

> Documentation securite : [`docs/security/`](docs/security/)

### Scores Lighthouse

| Performance | SEO  | Accessibilite | Best Practices |
| ----------- | ---- | ------------- | -------------- |
| 91%         | 100% | 100%          | 96%            |

## Documentation

- [`docs/deployment.md`](docs/deployment.md) — Guide de deploiement VPS
- [`docs/database-architecture.md`](docs/database-architecture.md) — Architecture BDD (21 modeles, 16 enums)
- [`docs/development-log.md`](docs/development-log.md) — Journal de developpement detaille
- [`docs/audit-technique-v2.md`](docs/audit-technique-v2.md) — Audit technique complet du projet
- [`docs/plan-messagerie-interne.md`](docs/plan-messagerie-interne.md) — Plan architecture messagerie
- [`docs/analytics.md`](docs/analytics.md) — Configuration Umami
- [`docs/security/`](docs/security/) — Plan de securisation, incidents, hardening

## Auteur

**Christophe Mostefaoui** — Developpeur full-stack freelance

Projet realise dans le cadre du titre professionnel **Concepteur Developpeur d'Applications** (CDA).

## Licence

Ce projet est proprietaire. Tous droits reserves.
