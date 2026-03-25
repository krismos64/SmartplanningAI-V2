# SmartPlanning

[![CI - Lint, Test & Build](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/ci.yml)
[![CD - Build & Deploy](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml/badge.svg)](https://github.com/krismos64/SmartplanningAI-V2/actions/workflows/cd.yml)

Plateforme SaaS multi-tenant de gestion intelligente des plannings et des ressources humaines.

- **Production** : https://smartplanning.fr
- **Version** : 2.0
- **Jira** : préfixe `SP`

## Stack technique

| Couche          | Technologies                                                                  |
| --------------- | ----------------------------------------------------------------------------- |
| Frontend        | Next.js 15.5.9 (App Router), React 19, TypeScript 5.7.2, Tailwind + Shadcn/ui |
| Backend         | NextAuth v5 (Auth.js), Prisma 6.18.0, Zod, Stripe v20.3.1                     |
| Base de données | PostgreSQL 16, Redis 7 (ioredis 5.10)                                         |
| Emails          | React Email (28 templates), Nodemailer SMTP                                    |
| DevOps          | Docker, GitHub Actions (CI/CD), VPS OVH (Ubuntu 24.04), Nginx, Let's Encrypt  |

## Fonctionnalités

- **Authentification** : Multi-rôles (SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE), invitation par email, activation de compte
- **Dashboards** : 4 tableaux de bord par rôle avec KPIs, graphiques Recharts, animations Framer Motion
- **Planning** : Calendrier Schedule-X (drag & drop, récurrence, conflits, exports PDF/Excel/CSV), vues jour/semaine/mois
- **Congés** : Workflow validation (PENDING → APPROVED/REJECTED), soldes CP/RTT, overlay calendrier, demi-journées
- **Billing** : Abonnement per-seat Stripe (2,90€/employé/mois), portail client, webhooks, sync employés auto
- **Notifications** : Temps réel SSE, 29 emails transactionnels (React Email), préférences par catégorie/canal respectées avant chaque envoi
- **Redis** : Rate limiting distribué (INCR+EXPIRE), sessions actives (TTL 24h), cache dashboards (TTL 300s), fallback mémoire si indisponible
- **CRUD** : Entreprises, employés, équipes avec RBAC et multi-tenant strict
- **Audit** : Journal d'audit complet, export CSV, protection anti-injection
- **Impersonation** : Mode support SYSTEM_ADMIN lecture seule avec audit trail
- **Monitoring** : Health check DB + Redis (PING/PONG), KPIs SaaS, graphiques admin, service MRR unifié
- **Admin** : Page utilisateurs cross-tenant, essais à risque, broadcast email, stats + export PDF
- **Profil** : Avatar Cloudinary, RGPD (export données, suppression compte), préférences affichage
- **Settings** : Apparence, notifications, entreprise (jours travaillés, horaires)
- **Notes & Incidents** : Tâches personnelles, notes d'incidents avec visibilité RBAC
- **SEO** : Metadata API, JSON-LD Schema.org, sitemap, robots.txt, optimisation LLMs
- **Landing** : Design "Cyber Glass 3D", simulateur tarifs, FAQ, pages légales RGPD
- **Accessibilité** : WCAG 2.1 AA, Lighthouse 100%

> Historique détaillé du développement : [`docs/development-log.md`](docs/development-log.md)

## Prérequis

| Outil      | Version minimale | Vérification          |
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
npm run db:seed                # Données de démonstration
npm run dev
```

### Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner au minimum :

| Variable | Description | Obligatoire |
| -------- | ----------- | :---------: |
| `DATABASE_URL` | URL PostgreSQL (pré-rempli pour Docker local) | Oui |
| `AUTH_SECRET` | Clé JWT — `openssl rand -base64 32` | Oui |
| `AUTH_URL` | URL de l'app (`http://localhost:3000`) | Oui |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Config SMTP pour emails transactionnels | Oui |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clés API Stripe (mode test en dev) | Oui |
| `STRIPE_WEBHOOK_SECRET` | Webhook Stripe — `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | Oui |
| `STRIPE_PRICE_ID` | Price ID du tarif per-seat | Oui |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Upload avatars | Oui |
| `REDIS_URL` | URL Redis (pré-rempli pour Docker local) | Oui |
| `CRON_SECRET` | Secret routes cron — `openssl rand -base64 32` | Oui |
| `HEALTH_API_KEY` | Secret endpoint `/api/health` | Oui |

Voir `.env.example` pour la liste complète et les variables optionnelles (Umami, Sentry, OpenAI).

### Accès locaux

| Service     | URL                   | Identifiants                                              |
| ----------- | --------------------- | --------------------------------------------------------- |
| Application | http://localhost:3000 | `contact@smartplanning.fr` / `Password123!` (admin)       |
| Adminer     | http://localhost:8081 | smartplanning / smartplanning_password / smartplanning_db |
| PostgreSQL  | localhost:5433        | —                                                         |
| Redis       | localhost:6380        | —                                                         |

> Tous les comptes du seed partagent le mot de passe `Password123!`. Voir `prisma/seed.ts` pour la liste complète.

## Scripts

```bash
npm run dev              # Développement
npm run build            # Build production
npm run lint             # ESLint
npm run db:migrate       # Migrations Prisma
npm run db:studio        # Prisma Studio
npm run db:seed          # Seed base de données
npm run test             # Tests unitaires (watch)
npm run test -- --run    # Tests unitaires (single run)
npm run test:e2e         # Tests E2E Playwright
```

## Architecture

```
src/
├── app/              # Next.js 15 App Router (53 pages, 5 layouts)
│   ├── (auth)/       # Login, register, activate-account
│   ├── (about)/      # À propos, tarifs
│   ├── (landing)/    # Landing page
│   ├── (legal)/      # Pages légales RGPD
│   ├── app/          # Routes protégées par rôle
│   └── api/          # API Routes (avatar, webhooks, health, SSE...)
├── components/       # 188 composants React
├── lib/              # Actions (38), services (18), validations Zod (23), animations, email (28 templates)
├── hooks/            # 19 hooks custom
├── types/            # Types TypeScript globaux
└── styles/           # Design tokens centralisés
```

## Base de données

18 modèles Prisma (14 core + 4 NextAuth), 14 enums, 54 index, 16 migrations.

Voir [`docs/database-architecture.md`](docs/database-architecture.md) pour le détail complet.

## Tests

| Type      | Framework  | Fichiers | Tests     |
| --------- | ---------- | -------- | --------- |
| Unitaires | Vitest     | 154      | 2 746     |
| E2E       | Playwright | 13       | 189       |
| **Total** |            | **167**  | **2 935** |

Rationalisation mars 2026 : focus sur la logique métier critique (RBAC, Zod, Server Actions, Stripe, workflows E2E). Zéro test cosmétique.

> Détail des tests par catégorie : [`docs/development-log.md`](docs/development-log.md#tests-détaillés)

## Déploiement

| Élément    | Valeur                                         |
| ---------- | ---------------------------------------------- |
| URL        | https://smartplanning.fr                       |
| Serveur    | VPS OVH (4 vCores, 8GB RAM)                    |
| OS         | Ubuntu 24.04 LTS                               |
| Containers | Docker Compose (app + PostgreSQL 16 + Redis 7) |
| Analytics  | Umami (analytics.smartplanning.fr)             |
| Registry   | GitHub Container Registry (ghcr.io)            |

### CI/CD Pipeline

| Trigger          | Tests                   | Déploiement | Temps      |
| ---------------- | ----------------------- | ----------- | ---------- |
| Push feature     | Unitaires               | Non         | ~3-5 min   |
| PR vers main     | Unitaires + E2E prod    | Non         | ~15-20 min |
| Merge main       | Unitaires               | Oui         | ~8-10 min  |
| Nightly (2h UTC) | Unitaires + E2E complet | Non         | ~45-60 min |

> Guide complet : [`docs/deployment.md`](docs/deployment.md)

## Sécurité

- RBAC 4 niveaux avec `checkPermission()` sur chaque Server Action
- Isolation multi-tenant par `companyId` sur chaque requête Prisma (defense-in-depth)
- Validation Zod aux frontières, protection CSRF (NextAuth)
- Cookies httpOnly + secure + sameSite, hashage bcrypt
- Rate limiting Redis distribué (fallback mémoire), audit logs, CSP headers, SRI en production
- Subscription guard middleware Edge Runtime
- Emails sécurité envoyés inconditionnellement (changement mot de passe, suppression RGPD), emails métier soumis aux préférences utilisateur

> Documentation sécurité : [`docs/security/`](docs/security/)

### Scores Lighthouse

| Performance | SEO  | Accessibilité | Best Practices |
| ----------- | ---- | ------------- | -------------- |
| 91%         | 100% | 100%          | 96%            |

## Documentation

- [`docs/deployment.md`](docs/deployment.md) — Guide de déploiement VPS
- [`docs/database-architecture.md`](docs/database-architecture.md) — Architecture BDD
- [`docs/development-log.md`](docs/development-log.md) — Journal de développement détaillé
- [`docs/analytics.md`](docs/analytics.md) — Configuration Umami
- [`docs/security/`](docs/security/) — Plan de sécurisation, incidents, hardening

## Auteur

**Christophe Mostefaoui** — Développeur full-stack freelance

Projet réalisé dans le cadre du titre professionnel **Concepteur Développeur d'Applications** (CDA).

## Licence

Ce projet est propriétaire. Tous droits réservés.
