# Rapport de Déploiement SmartPlanning V2

**Date** : 2 décembre 2025
**Version** : 2.0.0
**Environnement** : Production
**VPS** : OVH (141.94.78.0)

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture de déploiement](#2-architecture-de-déploiement)
3. [Pipeline CI/CD](#3-pipeline-cicd)
4. [Configuration VPS OVH](#4-configuration-vps-ovh)
5. [GitHub Actions](#5-github-actions)
6. [Docker & Conteneurisation](#6-docker--conteneurisation)
7. [Base de données & Migrations](#7-base-de-données--migrations)
8. [Sécurité](#8-sécurité)
9. [Monitoring & Healthchecks](#9-monitoring--healthchecks)
10. [Problèmes rencontrés et solutions](#10-problèmes-rencontrés-et-solutions)
11. [Commandes utiles](#11-commandes-utiles)
12. [Prochaines étapes](#12-prochaines-étapes)

---

## 1. Vue d'ensemble

### 1.1 Objectif

Mise en place d'un pipeline de déploiement continu (CI/CD) automatisé pour l'application SmartPlanning V2, permettant :

- **Intégration Continue (CI)** : Validation automatique du code (lint, tests, build)
- **Déploiement Continu (CD)** : Déploiement automatique sur VPS à chaque push sur `main`

### 1.2 Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Application | Next.js | 15.x |
| Runtime | Node.js | 20 Alpine |
| Base de données | PostgreSQL | 16 Alpine |
| Cache/Sessions | Redis | 7 Alpine |
| ORM | Prisma | 6.1.0 |
| Conteneurisation | Docker | 24.x |
| Orchestration | Docker Compose | 2.x |
| CI/CD | GitHub Actions | - |
| Registry | GitHub Container Registry (GHCR) | - |
| VPS | OVH | Ubuntu 22.04 |

### 1.3 URLs

| Service | URL |
|---------|-----|
| Application (IP directe) | http://141.94.78.0:3000 |
| Application (domaine) | https://smartplanning.fr (à configurer) |
| Repository GitHub | https://github.com/krismos64/SmartplanningAI-V2 |
| Container Registry | ghcr.io/krismos64/smartplanningai-v2 |

---

## 2. Architecture de déploiement

### 2.1 Diagramme de flux

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DÉVELOPPEUR                                      │
│                                   │                                           │
│                            git push main                                      │
│                                   ▼                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                              GITHUB                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   CI Pipeline   │───▶│   CD Pipeline   │───▶│      GHCR       │          │
│  │  (Lint, Test,   │    │  (Build Docker, │    │  (Image Store)  │          │
│  │    Build)       │    │     Push)       │    │                 │          │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘          │
├─────────────────────────────────────────────────────────┼────────────────────┤
│                              VPS OVH                     │                    │
│                                                          ▼                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                     Docker Compose                               │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │        │
│  │  │    App      │  │  PostgreSQL │  │    Redis    │             │        │
│  │  │  (Next.js)  │  │   (DB)      │  │   (Cache)   │             │        │
│  │  │  Port 3000  │  │  Port 5432  │  │  Port 6379  │             │        │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                   │                                          │
│                            Nginx (à venir)                                   │
│                            Port 80/443                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de déploiement

1. **Push sur main** → Déclenche les workflows GitHub Actions
2. **CI Pipeline** → Lint, Type-check, Tests, Build
3. **CD Pipeline** → Build image Docker, Push sur GHCR
4. **Déploiement VPS** → SSH, Pull image, Restart containers
5. **Migrations** → Prisma migrate deploy
6. **Healthcheck** → Vérification de l'état de l'application

---

## 3. Pipeline CI/CD

### 3.1 Pipeline CI (`.github/workflows/ci.yml`)

**Déclencheurs** :
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`

**Jobs** :

| Job | Description | Durée |
|-----|-------------|-------|
| `lint` | ESLint + Prettier | ~30s |
| `type-check` | TypeScript strict | ~45s |
| `test` | Vitest (tests unitaires) | ~30s |
| `build` | Next.js production build | ~2min |

**Exemple de sortie** :
```
✓ ESLint: 0 errors, 0 warnings
✓ TypeScript: No errors
✓ Tests: 15 passed
✓ Build: Completed successfully
```

### 3.2 Pipeline CD (`.github/workflows/cd.yml`)

**Déclencheurs** :
- Push sur `main` uniquement
- `workflow_dispatch` (déclenchement manuel)

**Jobs** :

| Job | Description | Durée |
|-----|-------------|-------|
| `build-and-push` | Build Docker + Push GHCR | ~3-4min |
| `deploy` | SSH → Pull → Restart | ~1-2min |
| `migrate` | Prisma migrations | ~30s |

**Flux détaillé** :

```yaml
# 1. Build & Push
- Checkout code
- Setup QEMU (multi-arch)
- Setup Docker Buildx
- Login to GHCR
- Build & Push image avec tags:
  - latest
  - sha-{commit}
  - main

# 2. Deploy
- SSH vers VPS
- docker pull ghcr.io/krismos64/smartplanningai-v2:latest
- docker compose down
- docker compose up -d
- Healthcheck

# 3. Migrate
- prisma migrate deploy
```

### 3.3 Secrets GitHub requis

| Secret | Description | Exemple |
|--------|-------------|---------|
| `VPS_HOST` | IP ou domaine du VPS | `141.94.78.0` |
| `VPS_USER` | Utilisateur SSH | `deploy` |
| `VPS_SSH_KEY` | Clé privée SSH | `-----BEGIN OPENSSH...` |
| `VPS_SSH_PORT` | Port SSH | `22` |

> **Note** : `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions.

---

## 4. Configuration VPS OVH

### 4.1 Spécifications serveur

| Caractéristique | Valeur |
|-----------------|--------|
| Fournisseur | OVH |
| IP | 141.94.78.0 |
| OS | Ubuntu 22.04 LTS |
| RAM | 4 GB |
| CPU | 2 vCPU |
| Stockage | 40 GB SSD |

### 4.2 Utilisateur déploiement

```bash
# Utilisateur dédié au déploiement
User: deploy
Home: /home/deploy
App path: /var/www/smartplanning
```

### 4.3 Structure des fichiers sur le VPS

```
/var/www/smartplanning/
├── .env                    # Variables d'environnement (SECRETS)
├── docker/
│   └── docker-compose.prod.yml
└── prisma/                 # Copié depuis le conteneur app
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

### 4.4 Variables d'environnement (`.env`)

```bash
# ==============================================
# SMARTPLANNING - PRODUCTION ENVIRONMENT
# ==============================================

# Base de données PostgreSQL
POSTGRES_USER=smartplanning
POSTGRES_PASSWORD=<GENERATED_SECRET>
POSTGRES_DB=smartplanning
DATABASE_URL=postgresql://smartplanning:<PASSWORD>@postgres:5432/smartplanning

# NextAuth
NEXTAUTH_SECRET=<GENERATED_SECRET>
NEXTAUTH_URL=https://smartplanning.fr

# Redis
REDIS_PASSWORD=<GENERATED_SECRET>
REDIS_URL=redis://:<PASSWORD>@redis:6379

# Application
NODE_ENV=production
IMAGE_TAG=latest

# Stripe (à configurer)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (à configurer)
RESEND_API_KEY=
```

### 4.5 Authentification GHCR

L'authentification au GitHub Container Registry est configurée de manière persistante sur le VPS :

```bash
# Configuration stockée dans ~/.docker/config.json
docker login ghcr.io -u krismos64 --password-stdin <<< "ghp_XXX"
```

> **Important** : Un Personal Access Token (PAT) avec le scope `read:packages` est requis.

---

## 5. GitHub Actions

### 5.1 Fichiers de workflow

| Fichier | Rôle |
|---------|------|
| `.github/workflows/ci.yml` | Intégration continue |
| `.github/workflows/cd.yml` | Déploiement continu |

### 5.2 Permissions

```yaml
permissions:
  contents: read      # Lire le code source
  packages: write     # Push images sur GHCR
```

### 5.3 Actions utilisées

| Action | Version | Usage |
|--------|---------|-------|
| `actions/checkout` | v4 | Clone du repo |
| `actions/setup-node` | v4 | Setup Node.js |
| `docker/setup-qemu-action` | v3 | Support multi-arch |
| `docker/setup-buildx-action` | v3 | Builder Docker avancé |
| `docker/login-action` | v3 | Login GHCR |
| `docker/metadata-action` | v5 | Tags et labels |
| `docker/build-push-action` | v5 | Build & Push |
| `appleboy/ssh-action` | v1.0.3 | SSH vers VPS |

### 5.4 Cache et optimisations

```yaml
# Cache GitHub Actions pour Docker layers
cache-from: type=gha
cache-to: type=gha,mode=max
```

Gain de temps estimé : ~50% sur les builds suivants.

---

## 6. Docker & Conteneurisation

### 6.1 Dockerfile (`docker/Dockerfile`)

**Architecture multi-stage** :

```dockerfile
# Stage 1: deps - Installation des dépendances
FROM node:20-alpine AS deps
RUN npm ci

# Stage 2: builder - Build de l'application
FROM node:20-alpine AS builder
RUN npx prisma generate
RUN npm run build

# Stage 3: runner - Image finale légère
FROM node:20-alpine AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
```

**Taille de l'image finale** : ~509 MB

### 6.2 Docker Compose Production (`docker/docker-compose.prod.yml`)

```yaml
services:
  app:
    image: ghcr.io/krismos64/smartplanningai-v2:latest
    ports:
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 1G

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 512M

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  postgres_data:
  redis_data:

networks:
  smartplanning-network:
    driver: bridge
```

### 6.3 Réseau Docker

Tous les conteneurs communiquent via le réseau `smartplanning-network` :

| Service | Hostname interne | Port |
|---------|------------------|------|
| App | `app` | 3000 |
| PostgreSQL | `postgres` | 5432 |
| Redis | `redis` | 6379 |

---

## 7. Base de données & Migrations

### 7.1 PostgreSQL

- **Image** : `postgres:16-alpine`
- **Authentification** : `scram-sha-256`
- **Persistance** : Volume Docker `postgres_data`

### 7.2 Prisma

**Schema** : `prisma/schema.prisma`

**Commande de migration** :
```bash
# Dans le conteneur app
node node_modules/prisma/build/index.js migrate deploy

# Ou via conteneur temporaire
docker run --rm --network docker_smartplanning-network \
  -e DATABASE_URL="..." \
  -v ./prisma:/app/prisma \
  node:20-alpine sh -c 'npm install prisma@6.1.0 && npx prisma migrate deploy'
```

### 7.3 Migrations appliquées

| Migration | Date | Description |
|-----------|------|-------------|
| `20251104150848_init` | 04/11/2025 | Schéma initial |

---

## 8. Sécurité

### 8.1 Headers HTTP

Configurés dans `next.config.ts` :

```typescript
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

### 8.2 Secrets

| Type | Stockage | Accès |
|------|----------|-------|
| Secrets GitHub | GitHub Secrets | CI/CD uniquement |
| Secrets VPS | `/var/www/smartplanning/.env` | Fichier protégé (600) |
| PAT GHCR | `~/.docker/config.json` | Utilisateur deploy |

### 8.3 Utilisateur non-root

L'application tourne avec un utilisateur non-root dans Docker :

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### 8.4 Réseau

- Seul le port 3000 est exposé sur l'hôte
- PostgreSQL et Redis ne sont pas accessibles de l'extérieur
- Communication inter-conteneurs via réseau Docker isolé

---

## 9. Monitoring & Healthchecks

### 9.1 Endpoint de santé

**URL** : `GET /api/health`

**Réponse** :
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T22:20:55.898Z",
  "checks": {
    "connection": {
      "status": "pass",
      "message": "Connexion établie",
      "value": true
    },
    "latency": {
      "status": "pass",
      "message": "Latence OK (3ms)",
      "value": 3
    },
    "migrations": {
      "status": "pass",
      "message": "Schéma DB accessible"
    },
    "poolSize": {
      "status": "pass",
      "message": "Métriques pool non disponibles"
    }
  },
  "metrics": {
    "latency": 3
  }
}
```

### 9.2 Healthchecks Docker

**App** :
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**PostgreSQL** :
```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U smartplanning -d smartplanning']
  interval: 10s
  timeout: 5s
  retries: 5
```

**Redis** :
```yaml
healthcheck:
  test: ['CMD-SHELL', 'redis-cli -a $$REDIS_PASSWORD ping | grep PONG']
  interval: 10s
  timeout: 5s
  retries: 5
```

### 9.3 Vérification manuelle

```bash
# Status des conteneurs
docker ps

# Logs de l'application
docker logs smartplanning-app --tail 100

# Test healthcheck
curl http://localhost:3000/api/health
```

---

## 10. Problèmes rencontrés et solutions

### 10.1 GHCR Pull Denied

**Problème** : Le VPS ne pouvait pas pull l'image depuis GHCR malgré la visibilité "Public".

**Cause** : Le `GITHUB_TOKEN` utilisé dans le workflow expire après l'exécution.

**Solution** :
- Créer un PAT avec scope `read:packages`
- Configurer l'auth de manière persistante sur le VPS :
```bash
docker login ghcr.io -u krismos64 --password-stdin <<< "ghp_XXX"
```

### 10.2 Prisma CLI manquant dans l'image

**Problème** : `npx prisma migrate deploy` téléchargeait Prisma 7.x au lieu de 6.1.0.

**Cause** : Le mode `standalone` de Next.js ne copie pas tous les `node_modules`.

**Solution** : Ajouter explicitement Prisma dans le Dockerfile :
```dockerfile
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
```

### 10.3 Redis Healthcheck en échec

**Problème** : Redis redémarrait en boucle à cause du healthcheck.

**Cause** : `${REDIS_PASSWORD}` n'était pas interpolé dans le contexte du healthcheck.

**Solution** :
```yaml
environment:
  REDIS_PASSWORD: ${REDIS_PASSWORD}
healthcheck:
  test: ['CMD-SHELL', 'redis-cli -a $$REDIS_PASSWORD ping | grep PONG']
```

### 10.4 Variables d'environnement non chargées

**Problème** : Docker Compose ne trouvait pas le fichier `.env`.

**Cause** : Le fichier `.env` était dans le répertoire parent.

**Solution** : Utiliser `--env-file .env` explicitement :
```bash
docker compose --env-file .env -f docker/docker-compose.prod.yml up -d
```

---

## 11. Commandes utiles

### 11.1 Déploiement manuel

```bash
# Se connecter au VPS
ssh -i ~/.ssh/smartplanning_deploy deploy@141.94.78.0

# Aller dans le dossier du projet
cd /var/www/smartplanning

# Pull la dernière image
docker pull ghcr.io/krismos64/smartplanningai-v2:latest

# Redémarrer les conteneurs
docker compose --env-file .env -f docker/docker-compose.prod.yml down
docker compose --env-file .env -f docker/docker-compose.prod.yml up -d

# Vérifier le status
docker ps
curl http://localhost:3000/api/health
```

### 11.2 Logs et debugging

```bash
# Logs de l'application
docker logs smartplanning-app -f

# Logs de tous les services
docker compose --env-file .env -f docker/docker-compose.prod.yml logs -f

# Entrer dans un conteneur
docker exec -it smartplanning-app sh
```

### 11.3 Migrations

```bash
# Via conteneur temporaire (méthode recommandée)
source .env
docker run --rm --network docker_smartplanning-network \
  -e DATABASE_URL="$DATABASE_URL" \
  -v /var/www/smartplanning/prisma:/app/prisma \
  -w /app node:20-alpine sh -c \
  'npm init -y && npm install prisma@6.1.0 && npx prisma migrate deploy'
```

### 11.4 Rollback

```bash
# Trouver l'ancien tag
docker images ghcr.io/krismos64/smartplanningai-v2

# Pull une version spécifique
docker pull ghcr.io/krismos64/smartplanningai-v2:sha-abc1234

# Modifier IMAGE_TAG dans .env
echo "IMAGE_TAG=sha-abc1234" >> .env

# Redémarrer
docker compose --env-file .env -f docker/docker-compose.prod.yml up -d
```

---

## 12. Prochaines étapes

### 12.1 Configuration SSL/HTTPS (Priorité haute)

1. Installer Nginx comme reverse proxy
2. Configurer Certbot pour Let's Encrypt
3. Rediriger le domaine smartplanning.fr

```bash
# Exemple de config Nginx
server {
    listen 80;
    server_name smartplanning.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name smartplanning.fr;

    ssl_certificate /etc/letsencrypt/live/smartplanning.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartplanning.fr/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 12.2 Secrets à configurer

| Secret | Service | Usage |
|--------|---------|-------|
| `STRIPE_SECRET_KEY` | Stripe | Paiements |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Frontend |
| `RESEND_API_KEY` | Resend | Emails transactionnels |

### 12.3 Monitoring avancé (Optionnel)

- Sentry pour le tracking d'erreurs
- Prometheus + Grafana pour les métriques
- UptimeRobot pour le monitoring externe

### 12.4 Backup automatique

```bash
# Script de backup PostgreSQL (cron quotidien)
docker exec smartplanning-postgres pg_dump -U smartplanning smartplanning > backup_$(date +%Y%m%d).sql
```

---

## Annexes

### A. Fichiers de configuration

| Fichier | Chemin | Description |
|---------|--------|-------------|
| CI Workflow | `.github/workflows/ci.yml` | Pipeline d'intégration |
| CD Workflow | `.github/workflows/cd.yml` | Pipeline de déploiement |
| Dockerfile | `docker/Dockerfile` | Build de l'image |
| Docker Compose | `docker/docker-compose.prod.yml` | Orchestration prod |
| Next.js Config | `next.config.ts` | Configuration Next.js |
| Prisma Schema | `prisma/schema.prisma` | Schéma de la BDD |

### B. Contacts et ressources

- **Repository** : https://github.com/krismos64/SmartplanningAI-V2
- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation Docker** : https://docs.docker.com

---

*Document généré le 2 décembre 2025*
*SmartPlanning V2 - Rapport de déploiement*
