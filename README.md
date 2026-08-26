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
| Emails          | React Email (30 envois transactionnels), Nodemailer SMTP                      |
| Temps reel      | Server-Sent Events (SSE) — notifications + messagerie sur un stream unique     |
| DevOps          | Docker, GitHub Actions (CI/CD), VPS OVH (Ubuntu 24.04), Nginx, Let's Encrypt  |

## Fonctionnalites

- **Authentification** : Multi-roles (SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE), verification email, invitation par email, activation de compte
- **Dashboards** : 4 tableaux de bord par role avec KPIs, graphiques Recharts, animations Framer Motion
- **Onboarding** : Ecran de bienvenue a la premiere connexion (DIRECTOR) et checklist de demarrage contextuelle sur le dashboard (equipe -> employe -> planning -> profil), affichee tant que la configuration est incomplete
- **Planning** : Calendrier Schedule-X (drag & drop, recurrence, conflits, exports PDF/Excel/CSV), vues jour/semaine/mois
- **Conges** : Workflow validation (PENDING -> APPROVED/REJECTED), soldes CP/RTT, overlay calendrier, demi-journees
- **Messagerie interne** : Conversations DIRECT (1:1), TEAM (auto-sync equipes) et GROUP (manuelles). Messages texte + pieces jointes (PDF, images via Cloudinary, max 10 Mo). Reception temps reel via SSE. Groupement de messages, scroll infini cursor-based, optimistic updates. Archivage avec desarchivage auto sur nouveau message. Administration de groupe : avatar personnalisable, renommage, gestion des membres reserves a l'admin. **SYSTEM_ADMIN peut contacter n'importe quel utilisateur cross-tenant** (conversations avec `companyId: null`, isolation multi-tenant preservee pour les autres roles).
- **Import CSV/Excel** : Import bulk d'employes depuis fichier CSV ou Excel (.xlsx). Validation Zod temps reel cote client avec cellules colorees. Support headers FR/EN avec normalisation. Detection des doublons, creation auto des equipes, sync Stripe. Modele telecharger pre-rempli.
- **Billing** : Abonnement per-seat Stripe (2,90 euros/employe/mois), portail client, webhooks, sync employes auto. Essai gratuit 21 jours sans carte bancaire : aucun customer Stripe n'est cree avant la premiere souscription volontaire, le suivi de l'essai passe par une ligne `Subscription` locale (statut TRIAL) basculee en EXPIRED par le cron `/api/cron/trial-emails`, une fois la date de fin reellement depassee et non le jour meme. `Subscription.quantity` compte les sieges factures chez Stripe : il vaut 0 tant qu'aucun abonnement n'existe, y compris pour une entreprise ayant des employes actifs
- **Notifications** : Temps reel SSE, 30 emails transactionnels (React Email), preferences par categorie/canal. Destinataires bornes par `companyId` a la selection ET refuses par une garde multi-tenant dans les factories : une notification ne peut pas partir vers une autre entreprise
- **Redis** : Rate limiting distribue (INCR+EXPIRE), sessions actives (TTL 24h), cache dashboards (TTL 300s), fallback memoire
- **CRUD** : Entreprises, employes, equipes avec RBAC et multi-tenant strict. Corriger l'email d'un collaborateur propage le changement au compte de connexion : reinvitation immediate si le compte n'a jamais ete active, sinon confirmation par le collaborateur lui-meme (l'ancienne adresse reste l'identifiant jusqu'au clic, et recoit une alerte)
- **Audit** : Journal d'audit complet, export CSV, protection anti-injection
- **Impersonation** : Mode support SYSTEM_ADMIN "Voir espace client" lecture seule (cookie `sp-impersonation` TTL 1h, audit trail start/stop, billing accessible en lecture, fallback cookie pour race condition JWT)
- **Monitoring** : Health check DB + Redis (PING/PONG), KPIs SaaS, graphiques admin, service MRR unifie
- **Admin** : Page utilisateurs cross-tenant, essais a risque, broadcast email, stats + export PDF, journal des emails, suivi des messages de contact (`/app/admin/messages-contact`, reserve au SYSTEM_ADMIN : la table ne porte pas de `companyId`, l'expediteur etant un visiteur anonyme)
- **Profil** : Avatar Cloudinary (affiche dans le header et la sidebar), RGPD (export donnees, suppression compte), preferences affichage. Le poste (`jobTitle`) renseigne au profil s'affiche a la place du libelle de role dans l'interface
- **Settings** : Apparence, notifications, entreprise (jours travailles, horaires)
- **Notes & Incidents** : Taches personnelles (drag & drop), notes d'incidents avec visibilite RBAC
- **SEO / GEO** : Metadata API, JSON-LD Schema.org (@graph, Article, HowTo, FAQPage, BreadcrumbList), sitemap data-driven avec `lastModified` reels, robots.txt ouvert aux crawlers IA, `llms.txt` et `llms-full.txt`
- **Contenu editorial** : Pages secteur `/solutions/[slug]` (restauration, commerce, BTP) et guides pratiques `/guides/[slug]`, chacune sous son hub (`/solutions`, `/guides`), generes depuis des registres data-driven en SSG strict. Ajouter une page = 1 fichier de donnees + 1 ligne au registre (sitemap, footer, navigation et garde-fous de tests suivent automatiquement)
- **Pages publiques** : Identite editoriale depuis SP-565 a SP-575, aplats pleine largeur, angles vifs, mode clair unique. Landing en dix sections numerotees, FAQ, page contact dediee (chaque demande est ecrite en base avant l'envoi des emails, une panne SMTP ne fait donc plus disparaitre de message), pages legales RGPD, demos video par role (Directeur/Manager/Employe) avec onglets et JSON-LD VideoObject. Le simulateur de tarifs vit sur `/tarifs`, la landing y renvoie. Navigation en pattern disclosure (liens toujours dans le DOM pour le maillage interne, `inert` a l'etat ferme). Le fil d'Ariane est pose dans le hero et non dans une bande a lui : il garde son `BreadcrumbList` sans couter de hauteur. Les pages d'authentification partagent la meme identite, leurs deux moities alignees en haut
- **Accessibilite** : WCAG 2.1 AA, touch targets 44px, Lighthouse A11y 97-100%

> Historique detaille du developpement : [`docs/journal/`](docs/journal/)

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
npm run type-check       # TypeScript strict (tsc --noEmit)
npm run format           # Prettier
npm run db:migrate       # Migrations Prisma
npm run db:studio        # Prisma Studio
npm run db:seed          # Seed base de donnees
npm run test             # Tests unitaires (single run)
npm run test:watch       # Tests unitaires (watch)
npm run test:coverage    # Couverture de tests
npm run test:e2e         # Tests E2E Playwright (suite complete)
npm run test:e2e:ci      # Tests E2E (whitelist CI)
npm run a11y:audit       # Audit Lighthouse accessibilite
npm run email:dev        # Previsualisation des templates React Email
```

> Playwright en local : prefixer par `PORT=3001` si le port 3000 est deja occupe.

## Architecture

```
src/
├── app/              # Next.js 15 App Router (64 pages, 5 layouts, 17 API routes)
│   ├── (auth)/       # Login, register, verify-email, activate-account
│   ├── (about)/      # A propos, tarifs, contact
│   ├── (landing)/    # Landing page
│   ├── (legal)/      # Pages legales RGPD
│   ├── (sectors)/    # Pages secteur /solutions/[slug] (registre data-driven)
│   ├── (guides)/     # Hub et guides pratiques /guides/[slug] (registre data-driven)
│   ├── app/          # Routes protegees par role
│   └── api/          # API Routes (avatar, webhooks, health, SSE, messages...)
├── components/       # 184 composants React
│   ├── public/       # Primitives des pages publiques (identite editoriale)
│   ├── messaging/    # Messagerie (8 composants)
│   ├── import/       # Import CSV (2 composants + utilitaires)
│   └── ui/           # Shadcn/ui (41 composants)
├── lib/              # Actions (32), services (19), validations Zod, email (21 fichiers de templates)
├── hooks/            # 22 hooks custom (SSE, SWR, messagerie, import CSV)
├── types/            # Types TypeScript globaux
└── styles/           # Design tokens centralises
```

## Base de donnees

21 modeles Prisma (17 core + 4 NextAuth), 16 enums, 55+ index, 22 migrations.

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
| Unitaires | Vitest     | 188      | 3 163     |
| E2E       | Playwright | 21       | 247       |
| **Total** |            | **209**  | **3 410** |

La CI execute une whitelist E2E (8 specs, 122 tests) ; la suite complete (22 specs, 248 tests) tourne en nightly. `testMatch` de `playwright.ci.config.ts` etant une liste explicite, un spec renomme ou supprime disparait silencieusement de la CI : verifier cette liste apres chaque ajout ou suppression.

**Les specs publiques ne sont pas dans la whitelist CI.** Les 20 tests de
`e2e/specs/landing/`, dont 7 audits axe-core, ne tournent donc qu'en nightly
et en local (`npx playwright test e2e/specs/landing/`). L'arbitrage sur leur
entree en CI n'est pas tranche.

Focus sur la logique metier critique : RBAC, Zod, Server Actions, Stripe, workflows E2E, messagerie, import CSV, registres SEO/GEO.

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

| Trigger                  | Tests                            | Deploiement | Temps      |
| ------------------------ | -------------------------------- | ----------- | ---------- |
| Push feature (sans PR)   | Aucun                            | Non         | —          |
| PR vers main             | Unitaires + E2E (whitelist CI)   | Non         | ~15-18 min |
| Push direct / merge main | Unitaires + E2E (whitelist CI)   | Oui (auto)  | ~15-18 min |
| Nightly (2h UTC)         | Unitaires + E2E complet          | Non         | ~45-60 min |

Depuis la revision de juillet 2026, un push sur une branche sans PR ne declenche plus le CI : auparavant, chaque push sur une branche avec PR ouverte lancait deux runs complets pour le meme commit (evenements `push` et `pull_request`). Ouvrir une PR, meme en draft, donne le feedback CI.

Le CD ne se declenche que si le CI reussit entierement, E2E comprises : meme un push direct sur main passe par les tests avant deploiement. Les migrations Prisma sont executees automatiquement dans un conteneur ephemere apres le deploiement.

> Guide complet : [`docs/deployment.md`](docs/deployment.md)

### Surveillance TLS

Le DNS du domaine est gere chez Hostinger alors que le serveur est chez OVH.
Une bascule de la zone DNS rend le site inaccessible sans que rien ne casse
cote VPS : c'est la panne du 18 aout 2026, ou le trafic partait vers un CDN
tiers servant un certificat expire pendant que certbot renouvelait
correctement.

`scripts/ops/check-tls-expiry.sh` tourne en cron sur le VPS deux fois par jour
et alerte par email. Il interroge le certificat **tel qu'il est servi en
HTTPS**, resolution DNS comprise, un controle lisant `/etc/letsencrypt/`
n'ayant rien vu de cette panne. Voir [`scripts/ops/README.md`](scripts/ops/README.md).

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

| Page                            | Performance | SEO  | Accessibilite | Best Practices |
| ------------------------------- | ----------- | ---- | ------------- | -------------- |
| Landing (mesure mai 2026)       | 91%         | 100% | 100%          | 96%            |
| `/solutions/planning-restaurant` | —           | 100% | 97%           | 100%           |

Mesures ponctuelles, non rejouees a chaque build : les rejouer apres toute modification d'une page publique.

## Documentation

- [`docs/deployment.md`](docs/deployment.md) — Guide de deploiement VPS
- [`docs/database-architecture.md`](docs/database-architecture.md) — Architecture BDD (21 modeles, 16 enums)
- [`docs/journal/`](docs/journal/) — Journal de developpement, une entree par session
- [`docs/analytics.md`](docs/analytics.md) — Configuration Umami
- [`docs/security/`](docs/security/) — Plan de securisation, incidents, hardening
- [`.claude/`](.claude/) — Configuration de l'assistant : regles, hooks et conventions du projet

## Auteur

**Christophe Mostefaoui** — Developpeur full-stack freelance

Projet realise dans le cadre du titre professionnel **Concepteur Developpeur d'Applications** (CDA).

## Licence

Ce projet est proprietaire. Tous droits reserves.
