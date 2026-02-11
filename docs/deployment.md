# Guide de Déploiement SmartPlanning V2

**Dernière mise à jour** : 10 février 2026
**Version** : 2.0.0
**Environnement** : Production
**URL** : https://smartplanning.fr

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Infrastructure](#2-infrastructure)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Pipeline CI/CD](#4-pipeline-cicd)
5. [Déploiement manuel](#5-déploiement-manuel)
6. [Commandes utiles](#6-commandes-utiles)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Vue d'ensemble

### Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DÉVELOPPEUR                                     │
│                                   │                                          │
│                            git push main                                     │
│                                   ▼                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                              GITHUB                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   CI Pipeline   │───▶│   CD Pipeline   │───▶│      GHCR       │         │
│  │  (Lint, Test,   │    │  (Build Docker, │    │  (Image Store)  │         │
│  │  E2E, Build)    │    │     Push)       │    │                 │         │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘         │
├─────────────────────────────────────────────────────────┼───────────────────┤
│                         VPS OVH (51.77.146.72)          │                   │
│                                                          ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     Docker Compose                               │       │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │       │
│  │  │    App    │  │ PostgreSQL│  │   Redis   │  │   Umami   │   │       │
│  │  │ (Next.js) │  │   (DB)    │  │  (Cache)  │  │(Analytics)│   │       │
│  │  │ Port 3000 │  │ Port 5432 │  │ Port 6379 │  │ Port 3001 │   │       │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                   │                                         │
│                         Nginx (Reverse Proxy)                               │
│                         Port 80/443 + SSL                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stack technique

| Composant        | Technologie                      | Version      |
| ---------------- | -------------------------------- | ------------ |
| Application      | Next.js                          | 15.5.9       |
| Runtime          | Node.js                          | 20 Alpine    |
| Base de données  | PostgreSQL                       | 16 Alpine    |
| Cache/Sessions   | Redis                            | 7 Alpine     |
| ORM              | Prisma                           | 6.18.0       |
| Media Storage    | Cloudinary                       | SDK v2       |
| Analytics        | Umami                            | Latest       |
| Conteneurisation | Docker                           | 24.x         |
| Orchestration    | Docker Compose                   | 2.x          |
| CI/CD            | GitHub Actions                   | -            |
| Registry         | GitHub Container Registry (GHCR) | -            |
| VPS              | OVH                              | Ubuntu 24.04 |
| Reverse Proxy    | Nginx                            | Latest       |
| SSL              | Let's Encrypt                    | Auto-renew   |

### URLs

| Service            | URL                                          |
| ------------------ | -------------------------------------------- |
| Application        | https://smartplanning.fr                     |
| Analytics          | https://analytics.smartplanning.fr           |
| Repository GitHub  | https://github.com/krismos64/SmartplanningAI |
| Container Registry | ghcr.io/krismos64/smartplanningai-v2         |

---

## 2. Infrastructure

### VPS OVH

| Caractéristique | Valeur           |
| --------------- | ---------------- |
| Fournisseur     | OVH              |
| IP              | 51.77.146.72     |
| OS              | Ubuntu 24.04 LTS |
| RAM             | 8 GB             |
| CPU             | 4 vCPU           |
| Stockage        | 75 GB SSD NVMe   |

### Accès SSH

```bash
# Connexion
ssh deploy@51.77.146.72

# Chemin de l'application
/var/www/smartplanning/
```

### Structure des fichiers sur le VPS

```
/var/www/smartplanning/
├── .env                    # Variables d'environnement (SECRETS)
├── docker-compose.yml      # Orchestration des conteneurs
└── prisma/                 # Schema et migrations (copié depuis l'image)

/home/deploy/umami/
├── docker-compose.yml      # Configuration Umami Analytics
```

### Conteneurs Docker

| Container              | Image                                          | Port | Status  |
| ---------------------- | ---------------------------------------------- | ---- | ------- |
| smartplanning-app      | ghcr.io/krismos64/smartplanningai-v2:latest    | 3000 | Running |
| smartplanning-postgres | postgres:16-alpine                             | 5432 | Running |
| smartplanning-redis    | redis:7-alpine                                 | 6379 | Running |
| smartplanning-umami    | ghcr.io/umami-software/umami:postgresql-latest | 3001 | Running |

---

## 3. Variables d'environnement

### Variables requises en production

Le fichier `.env` sur le VPS doit contenir :

```bash
# ==============================================
# SMARTPLANNING V2 - PRODUCTION ENVIRONMENT
# Dernière mise à jour : 10 février 2026
# ==============================================

# ----------------------------------------------
# BASE DE DONNÉES POSTGRESQL
# ----------------------------------------------
DATABASE_URL="postgresql://smartplanning:<PASSWORD>@postgres:5432/smartplanning?schema=public"
POSTGRES_USER=smartplanning
POSTGRES_PASSWORD=<GENERATED_SECRET>
POSTGRES_DB=smartplanning

# ----------------------------------------------
# AUTHENTIFICATION (NextAuth.js v5)
# ----------------------------------------------
NEXTAUTH_URL=https://smartplanning.fr
NEXTAUTH_SECRET=<GENERATED_SECRET>
AUTH_TRUST_HOST=true

# ----------------------------------------------
# REDIS (Cache et sessions)
# ----------------------------------------------
REDIS_PASSWORD=<GENERATED_SECRET>
REDIS_URL=redis://:<PASSWORD>@redis:6379

# ----------------------------------------------
# EMAIL SMTP (Hostinger)
# ----------------------------------------------
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@smartplanning.fr
SMTP_PASSWORD=<SMTP_PASSWORD>
SMTP_FROM="SmartPlanning <contact@smartplanning.fr>"
CONTACT_EMAIL=contact@smartplanning.fr

# ----------------------------------------------
# UMAMI ANALYTICS
# ----------------------------------------------
NEXT_PUBLIC_UMAMI_WEBSITE_ID=3a177239-31b0-4201-a1cb-e9938326d52b
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.smartplanning.fr/script.js
NEXT_PUBLIC_UMAMI_DOMAINS=smartplanning.fr

# ----------------------------------------------
# CLOUDINARY (Upload d'images - SP-272)
# ----------------------------------------------
CLOUDINARY_CLOUD_NAME=<CLOUD_NAME>
CLOUDINARY_API_KEY=<API_KEY>
CLOUDINARY_API_SECRET=<API_SECRET>

# ----------------------------------------------
# APPLICATION
# ----------------------------------------------
NODE_ENV=production
IMAGE_TAG=latest

# ----------------------------------------------
# STRIPE (Paiements per-seat 2,90€/employé/mois)
# ----------------------------------------------
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://smartplanning.fr
```

### Correspondance des noms de variables

> **IMPORTANT** : Les noms des variables doivent correspondre exactement à ceux attendus par le code.

| Variable (code)         | Fichier                   | Description                |
| ----------------------- | ------------------------- | -------------------------- |
| `SMTP_HOST`             | `src/lib/email/config.ts` | Serveur SMTP               |
| `SMTP_PORT`             | `src/lib/email/config.ts` | Port SMTP (587)            |
| `SMTP_USER`             | `src/lib/email/config.ts` | Email d'auth SMTP          |
| `SMTP_PASSWORD`         | `src/lib/email/config.ts` | Mot de passe SMTP          |
| `SMTP_FROM`             | `src/lib/email/config.ts` | Adresse d'expédition       |
| `CONTACT_EMAIL`         | `src/lib/email/config.ts` | Email de réception contact |
| `CLOUDINARY_CLOUD_NAME` | `src/lib/cloudinary.ts`   | Nom du cloud Cloudinary    |
| `CLOUDINARY_API_KEY`    | `src/lib/cloudinary.ts`   | Clé API Cloudinary         |
| `CLOUDINARY_API_SECRET` | `src/lib/cloudinary.ts`   | Secret API Cloudinary      |
| `STRIPE_SECRET_KEY`              | `src/lib/stripe/`         | Clé secrète Stripe         |
| `STRIPE_WEBHOOK_SECRET`          | `src/lib/stripe/`         | Secret webhook Stripe      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `src/lib/stripe/`     | Clé publique Stripe        |
| `STRIPE_PRICE_ID`                | `src/lib/stripe/`         | ID du prix per-seat Stripe |

### GitHub Secrets requis

Les secrets suivants doivent être configurés dans GitHub (Settings → Secrets → Actions) :

| Secret         | Description             | Valeur actuelle |
| -------------- | ----------------------- | --------------- |
| `VPS_HOST`     | IP du VPS               | `51.77.146.72`  |
| `VPS_USER`     | Utilisateur SSH         | `deploy`        |
| `VPS_SSH_KEY`  | Clé privée SSH (base64) | Configuré ✅    |
| `VPS_SSH_PORT` | Port SSH                | `22`            |

> **Note** : Les secrets applicatifs (DB, Redis, SMTP) sont gérés via le `.env` sur le VPS, pas via GitHub Secrets. C'est une approche valide car le CD ne fait que `docker pull` + `docker compose up`.

---

## 4. Pipeline CI/CD

### CI Pipeline (`.github/workflows/ci.yml`)

**Déclencheurs** :

- Push sur toutes les branches
- Pull requests vers `main`

**Jobs** :

| Job        | Description                    | Condition                     |
| ---------- | ------------------------------ | ----------------------------- |
| `lint`     | ESLint + TypeScript            | Tous les push                 |
| `test`     | Tests unitaires Vitest (~5281) | Tous les push                 |
| `test-e2e` | Tests E2E Playwright (~1018)   | PR vers main OU push sur main |
| `build`    | Build Next.js                  | Tous les push                 |

### CD Pipeline (`.github/workflows/cd.yml`)

**Déclencheurs** :

- Après succès du CI sur `main`
- Déclenchement manuel (`workflow_dispatch`)

**Jobs** :

| Job              | Description                    |
| ---------------- | ------------------------------ |
| `build-and-push` | Build image Docker → Push GHCR |
| `deploy`         | SSH → Pull image → Restart     |
| `migrate`        | Prisma migrate deploy          |

### Flux complet

```
Push main → CI (Lint + Tests + E2E + Build) → CD (Docker Build → Deploy VPS → Migrate)
```

---

## 5. Déploiement manuel

### Depuis GitHub Actions

1. Aller sur https://github.com/krismos64/SmartplanningAI/actions
2. Sélectionner "CD - Build & Deploy"
3. Cliquer "Run workflow" → "Run workflow"

### Depuis le VPS (rollback ou urgence)

```bash
# Connexion SSH
ssh deploy@51.77.146.72

# Aller dans le dossier
cd /var/www/smartplanning

# Pull la dernière image
docker pull ghcr.io/krismos64/smartplanningai-v2:latest

# Redémarrer les conteneurs
docker compose down
docker compose up -d

# Vérifier le status
docker ps
curl http://localhost:3000/api/health
```

### Rollback vers une version précédente

```bash
# Lister les images disponibles
docker images ghcr.io/krismos64/smartplanningai-v2

# Pull une version spécifique (utiliser le sha)
docker pull ghcr.io/krismos64/smartplanningai-v2:sha-abc1234

# Modifier le tag dans docker-compose ou .env
# IMAGE_TAG=sha-abc1234

# Redémarrer
docker compose down
docker compose up -d
```

---

## 6. Commandes utiles

### Logs et monitoring

```bash
# Logs de l'application
docker logs smartplanning-app --tail 100 -f

# Logs de tous les services
docker compose logs -f

# Status des conteneurs
docker ps

# Healthcheck
curl https://smartplanning.fr/api/health
```

### Base de données

```bash
# Accès PostgreSQL
docker exec -it smartplanning-postgres psql -U smartplanning -d smartplanning

# Backup
docker exec smartplanning-postgres pg_dump -U smartplanning smartplanning > backup_$(date +%Y%m%d).sql

# Migrations manuelles
docker exec smartplanning-app npx prisma migrate deploy
```

### Docker

```bash
# Redémarrer un service spécifique
docker restart smartplanning-app

# Nettoyer les images inutilisées
docker image prune -f

# Voir l'utilisation des ressources
docker stats
```

### Nginx & SSL

```bash
# Tester la configuration Nginx
sudo nginx -t

# Renouveler le certificat SSL
sudo certbot renew

# Vérifier le certificat
echo | openssl s_client -servername smartplanning.fr -connect smartplanning.fr:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 7. Troubleshooting

### L'application ne démarre pas

```bash
# Vérifier les logs
docker logs smartplanning-app --tail 200

# Vérifier que les dépendances sont healthy
docker ps

# Vérifier les variables d'environnement
docker exec smartplanning-app env | grep -E 'DATABASE|NEXTAUTH|SMTP'
```

### Emails non envoyés

1. Vérifier les variables SMTP :

```bash
docker exec smartplanning-app env | grep SMTP
```

2. S'assurer que les noms sont corrects :
   - `SMTP_PASSWORD` (pas `SMTP_PASS`)
   - `SMTP_FROM` (pas `EMAIL_FROM`)
   - `CONTACT_EMAIL` (pas `EMAIL_CONTACT`)

3. Vérifier les logs :

```bash
docker logs smartplanning-app 2>&1 | grep -i email
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est running
docker exec smartplanning-postgres pg_isready -U smartplanning

# Vérifier la connectivité depuis l'app
docker exec smartplanning-app node -e "console.log(process.env.DATABASE_URL)"
```

### Le déploiement GitHub Actions échoue

1. Vérifier les secrets GitHub :
   - `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PORT`

2. Vérifier l'authentification GHCR sur le VPS :

```bash
docker pull ghcr.io/krismos64/smartplanningai-v2:latest
```

3. Vérifier les permissions du fichier SSH key (doit être en base64)

---

## Historique des mises à jour

| Date       | Version | Description                                   |
| ---------- | ------- | --------------------------------------------- |
| 2025-12-02 | 1.0     | Déploiement initial                           |
| 2026-01-06 | 1.1     | Migration vers nouveau VPS (51.77.146.72)     |
| 2026-01-16 | 1.2     | Ajout Umami Analytics                         |
| 2026-01-19 | 2.0     | Configuration SMTP + refonte documentation    |
| 2026-02-04 | 2.1     | Ajout Cloudinary pour upload avatars (SP-272) |
| 2026-02-10 | 2.2     | Variables Stripe activées, compteurs tests à jour (~5281 unit / ~1018 E2E) |

---

## Contacts et ressources

- **Repository** : https://github.com/krismos64/SmartplanningAI
- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation Docker** : https://docs.docker.com
- **Umami** : https://umami.is/docs
- **Cloudinary** : https://cloudinary.com/documentation
