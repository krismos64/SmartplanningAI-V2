# Guide de Déploiement SmartPlanning V2

**Dernière mise à jour** : 9 septembre 2026
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
7. [Sauvegardes et restauration](#7-sauvegardes-et-restauration)
8. [Troubleshooting](#8-troubleshooting)

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
| Application      | Next.js                          | 15.5.25      |
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
| Repository GitHub  | https://github.com/krismos64/SmartplanningAI-V2 |
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
├── .env                    # Variables d'environnement (SECRETS), edite a la main
├── docker-compose.yml      # Copie depuis le depot par le CD, ne pas editer ici
└── prisma/                 # Schema et migrations (copié depuis l'image)

/home/deploy/umami/
├── docker-compose.yml      # Configuration Umami Analytics
```

**Le `docker-compose.yml` de production vient du depot.** Depuis SP-580, le job
`deploy` du CD copie `docker/docker-compose.prod.yml` par `scp` avant le
`docker compose up`. Toute edition faite directement sur le VPS sera donc
ecrasee au deploiement suivant : modifier le fichier dans le depot.

Avant SP-580, ce fichier vivait uniquement sur le serveur et le CD ne le
copiait pas. Il avait derive du depot dans les deux sens, et le tmpfs du cache
d'images pointait sur `/.next/cache` au lieu de `/app/.next/cache`, ce qui
produisait 10 a 17 erreurs `ENOENT` par jour sans que rien ne les signale.

Le `.env` reste edite a la main sur le serveur, il porte les secrets. Avant
d'ajouter une variable au compose, verifier qu'elle y figure, sinon le
conteneur demarre avec une valeur vide.

### Conteneurs Docker

| Container              | Image                                          | Publication      | Compose |
| ---------------------- | ---------------------------------------------- | ---------------- | ------- |
| smartplanning-app      | ghcr.io/krismos64/smartplanningai-v2:sha-&lt;court&gt; | `127.0.0.1:3000` | dépôt   |
| smartplanning-postgres | postgres:16-alpine                             | interne          | dépôt   |
| smartplanning-redis    | redis:7-alpine                                 | interne          | dépôt   |
| smartplanning-umami    | ghcr.io/umami-software/umami:postgresql-latest | `127.0.0.1:3001` | VPS     |

**Tous les ports applicatifs sont publiés sur la boucle locale depuis SP-583**
(8 septembre 2026), Nginx restant le seul point d'entrée. Publier sur toutes
les interfaces les rendait joignables depuis Internet en contournant TLS et la
limitation de débit, `ufw status` les donnant pourtant fermés : Docker insère
ses règles DNAT en amont de la chaîne d'ufw. Se vérifier depuis une autre
machine, jamais depuis le VPS, où `curl localhost:3000` répondra toujours.

**Umami ne fait pas partie du compose du dépôt** : il tourne depuis
`/home/deploy/umami/docker-compose.yml` et le CD ne le synchronise pas. Toute
correction le concernant s'applique à la main sur le VPS.

**Surveillance (SP-587).** Rien n'impose cette convention mécaniquement, la
chaîne `DOCKER-USER` étant vide sur cette machine : une seule ligne mal écrite
dans un futur compose rouvrirait le port sur Internet.
`scripts/ops/check-public-ports.sh` tourne en cron une fois par jour à 06:43 et
alerte par email. Il interroge l'adresse publique du VPS et non `localhost`,
seul point de vue qui distingue un port restreint d'un port ouvert. Détail dans
`scripts/ops/README.md`.

---

## 3. Variables d'environnement

### Variables requises en production

Le fichier `.env` sur le VPS doit contenir :

```bash
# ==============================================
# SMARTPLANNING V2 - PRODUCTION ENVIRONMENT
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
# RELEVE IMAP DES BOUNCES (SP-579)
# ----------------------------------------------
# Lecture de la boite d'expedition pour detecter les adresses qui ont refuse
# un email. Hostinger n'expose aucun webhook de delivrabilite, c'est le seul
# chemin possible pour les refus asynchrones.
# Sans ces variables, /api/cron/bounce-sync repond 200 sans rien faire.
IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_USER=contact@smartplanning.fr
IMAP_PASSWORD=<SMTP_PASSWORD>

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
# Renseigné par le CD à chaque déploiement, avec le SHA court du commit.
# NE PAS remettre `latest` : le CD suit un tag précis depuis SP-588, et `latest`
# remonterait une image qui n'est pas celle que le pipeline déploie.
IMAGE_TAG=sha-abc1234

# ----------------------------------------------
# STRIPE (Paiements per-seat 2,90€/employé/mois)
# ----------------------------------------------
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://smartplanning.fr

# ----------------------------------------------
# HEALTH CHECK (SP-470)
# ----------------------------------------------
HEALTH_API_KEY=<GENERER_AVEC_openssl_rand_base64_32>
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
| `IMAP_HOST`             | `src/lib/email/bounce/bounce-sync.service.ts` | Serveur IMAP de la boîte relevée |
| `IMAP_PORT`             | `src/lib/email/bounce/bounce-sync.service.ts` | Port IMAP (993 par défaut) |
| `IMAP_USER`             | `src/lib/email/bounce/bounce-sync.service.ts` | Compte de la boîte relevée |
| `IMAP_PASSWORD`         | `src/lib/email/bounce/bounce-sync.service.ts` | Mot de passe IMAP, identique au SMTP |
| `CLOUDINARY_CLOUD_NAME` | `src/lib/cloudinary.ts`   | Nom du cloud Cloudinary    |
| `CLOUDINARY_API_KEY`    | `src/lib/cloudinary.ts`   | Clé API Cloudinary         |
| `CLOUDINARY_API_SECRET` | `src/lib/cloudinary.ts`   | Secret API Cloudinary      |
| `STRIPE_SECRET_KEY`              | `src/lib/stripe/`         | Clé secrète Stripe         |
| `STRIPE_WEBHOOK_SECRET`          | `src/lib/stripe/`         | Secret webhook Stripe      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `src/lib/stripe/`     | Clé publique Stripe        |
| `STRIPE_PRICE_ID`                | `src/lib/stripe/`         | ID du prix per-seat Stripe |

**`RESEND_API_KEY` est un résidu.** `docker-compose.prod.yml` la déclare encore,
mais elle n'est utilisée nulle part : `resend` n'est pas une dépendance de
`package.json`, et la chaîne n'apparaît dans aucun fichier de `src/`. Les envois
passent par Nodemailer et le SMTP Hostinger. Vérifié le 10 septembre 2026, à
retirer du compose lors d'un prochain passage dessus. Ne pas la renseigner, elle
ne servirait à rien.

### GitHub Secrets requis

Les secrets suivants doivent être configurés dans GitHub (Settings → Secrets → Actions) :

| Secret         | Description             | Valeur actuelle |
| -------------- | ----------------------- | --------------- |
| `VPS_HOST`     | IP du VPS               | `51.77.146.72`  |
| `VPS_USER`     | Utilisateur SSH         | `deploy`        |
| `VPS_SSH_KEY`  | Clé privée SSH (base64) | Configuré ✅    |
| `VPS_SSH_PORT` | Port SSH                | `22`            |

> **Note** : Les secrets applicatifs (DB, Redis, SMTP) sont gérés via le `.env` sur le VPS, pas via GitHub Secrets. C'est une approche valide car le CD ne fait que `docker pull` + `docker compose up`.

### Tâches planifiées (crontab du VPS)

Les traitements périodiques passent par des routes `/api/cron/*`, appelées en
HTTP et authentifiées par `CRON_SECRET`. Le secret vit dans
`/etc/smartplanning/cron.env` et n'apparaît jamais en clair dans la crontab.

```bash
# crontab -l (utilisateur deploy)
0 8 * * * . /etc/smartplanning/cron.env && curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://smartplanning.fr/api/cron/trial-emails >> /var/log/smartplanning-cron.log 2>&1

# SP-579 : releve des bounces, toutes les 6 heures
0 */6 * * * . /etc/smartplanning/cron.env && curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://smartplanning.fr/api/cron/bounce-sync >> /var/log/smartplanning-cron.log 2>&1
```

La relève parcourt `INBOX`, `INBOX.Trash` et `INBOX.Junk`. Relever INBOX seul
ne suffit pas : au 31 août 2026, les 9 messages de non-remise reçus depuis le
5 août étaient tous en corbeille, et aucun en boîte de réception. L'un d'eux y
était arrivé sans avoir été lu, donc sans geste humain.

Elle est idempotente : un bounce traité reçoit le mot-clé
`SmartPlanningBounceSynced`, et la relève écarte les messages qui le portent
déjà. Le marquage n'utilise pas `\Seen` volontairement, l'état « lu »
appartenant à la personne qui relève la boîte. Un message ordinaire n'est ni
marqué ni modifié.

Une exécution supplémentaire ne produit donc aucun doublon, et une exécution
manquée est rattrapée au passage suivant dans la limite de la fenêtre de
7 jours.

Sans les variables `IMAP_*`, la route répond `200` avec `skipped: true` plutôt
que d'échouer : c'est le comportement attendu en développement.

---

## 4. Pipeline CI/CD

### CI Pipeline (`.github/workflows/ci.yml`)

**Déclencheurs** :

- Push sur `main` uniquement
- Pull requests vers `main`
- Déclenchement manuel (`workflow_dispatch`)

**Un push sur une branche sans PR ne déclenche donc aucun workflow** : ouvrir
une PR, même en draft, pour obtenir le retour de la CI.

**Jobs** :

| Job        | Description                | Condition                     |
| ---------- | -------------------------- | ----------------------------- |
| `lint`     | ESLint + TypeScript        | Tous les déclenchements       |
| `test`     | Tests unitaires Vitest     | Tous les déclenchements       |
| `test-e2e` | Tests E2E Playwright, whitelist `testMatch` | PR vers main OU push sur main |
| `build`    | Build Next.js              | Tous les déclenchements       |

Les compteurs de tests ne sont pas repris ici : ils se périment à chaque
sprint. Les mesurer avec `npm run test` et `npx playwright test --list`.

### CD Pipeline (`.github/workflows/cd.yml`)

**Déclencheurs** :

- Après succès du CI sur `main`
- Déclenchement manuel (`workflow_dispatch`)

**Jobs (ordre important — SP-523)** :

| Ordre | Job              | Description                                                      |
| ----- | ---------------- | ---------------------------------------------------------------- |
| 1     | `build-and-push` | Build image Docker → Push GHCR                                   |
| 2     | `migrate`        | Prisma migrate deploy (conteneur éphémère avec la nouvelle image) |
| 3     | `deploy`         | SSH → Pull image → Restart conteneur app                          |

**Pourquoi `migrate` AVANT `deploy` (SP-523)** : l'ancien ordre `deploy → migrate` créait une fenêtre où le nouveau code tournait avec l'ancien schéma. Inoffensif pour `DROP NOT NULL`, mais une future migration `ADD COLUMN ... NOT NULL` sans valeur par défaut crasherait l'app immédiatement. Avec l'ordre actuel, si `migrate` échoue → `deploy` bloqué → la prod n'est jamais mise à jour avec un schéma cassé.

**Point technique clé** : `prisma migrate deploy` ne peut pas tourner via `docker compose exec` sur l'ancien conteneur (les nouveaux fichiers `prisma/migrations/` ne s'y trouvent pas). Solution : `docker run --rm` avec la nouvelle image en conteneur éphémère, accès DB via le réseau Docker du compose. Pendant cette opération, l'ancienne app continue de servir les requêtes.

**Lecture de `DATABASE_URL`** : ne PAS parser le fichier `.env` (caractères spéciaux + guillemets cassent Prisma). Lire directement depuis l'environnement du conteneur app running :
```bash
DATABASE_URL=$(docker exec smartplanning-app printenv DATABASE_URL)
```
Le nom du réseau Docker est résolu dynamiquement via `docker inspect smartplanning-postgres` (le nom réel est préfixé par le projet : `smartplanning_smartplanning-network`).

**Condition du job `deploy`** :
```yaml
if: always() && needs.build-and-push.result == 'success' && (needs.migrate.result == 'success' || needs.migrate.result == 'skipped')
```
Cas `workflow_dispatch` manuel : `migrate` skippé, `deploy` s'exécute quand même.

### Flux complet

```
Push main → CI (Lint + Tests + E2E + Build) → CD (Build & Push → Migrate → Deploy)
```

### Ce que le pipeline garantit depuis SP-588

**Un déploiement en échec est rouge, et la production est restaurée.** Si le
healthcheck ne répond pas 200 dans les 150 secondes, le script restaure l'image
qui tournait avant, revérifie qu'elle répond, puis sort en code 1. Auparavant il
écrivait « Déploiement terminé (avec warnings) » et le job réussissait : un
conteneur qui ne démarrait pas devenait la production, annoncée comme un succès.

**L'image déployée est celle que le workflow vient de construire.** Les jobs
`migrate` et `deploy` visent `sha-<commit court>`, exposé en sortie du job
`build` (`image_sha_tag`) plutôt que reconstruit. Les deux formes ont divergé
une fois, `github.sha` faisant 40 caractères là où `docker/metadata-action`
produit un tag de 7, et le déploiement a échoué sur un tag inexistant.

**Deux déploiements ne tournent jamais en parallèle.** Clause
`concurrency: cd-production`, avec `cancel-in-progress: false` : un déploiement
en cours a déjà migré la base, l'interrompre laisserait la production dans un
état indéterminé.

**Les images récentes sont conservées.** Le `prune` de fin porte
`--filter until=168h` : un `prune -f` nu supprimait l'image de la version
précédente, donc la cible du rollback.

Le comportement du script de déploiement est couvert hors ligne par
`scripts/ops/test-cd-rollback.sh`, qui extrait le heredoc depuis `cd.yml`
lui-même et le rejoue avec `docker`, `curl` et `sleep` simulés. Le prouver en
conditions réelles demanderait de casser la production volontairement.

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

# Repérer le tag déployé (SHA court du commit)
docker inspect smartplanning-app --format '{{.Config.Image}}'

# Redémarrer sur ce même tag, sans down/up complet :
# PostgreSQL et Redis restent debout
IMAGE_TAG=sha-abc1234 docker compose --env-file .env up -d --no-deps --force-recreate app

# Vérifier le status
docker ps
curl -H "Authorization: Bearer $HEALTH_API_KEY" http://localhost:3000/api/health
```

### Rollback vers une version précédente

**Depuis SP-588, le rollback est automatique.** Si le healthcheck ne passe pas
dans les 150 secondes qui suivent le remplacement du conteneur, le déploiement
restaure de lui-même l'image précédente, revérifie qu'elle répond, puis sort en
erreur. Le workflow apparaît en rouge et le résumé d'échec l'explique.

Un rollback manuel ne sert donc que si le rollback automatique a lui aussi
échoué, ou pour revenir à une version plus ancienne que la précédente :

```bash
# Lister les images disponibles (les tags sont des SHA courts, 7 caractères)
docker images ghcr.io/krismos64/smartplanningai-v2

# Redémarrer sur une version précise, sans down/up complet :
# PostgreSQL et Redis restent debout, seul le conteneur app est recréé
cd /var/www/smartplanning
IMAGE_TAG=sha-abc1234 docker compose --env-file .env up -d --no-deps --force-recreate app

# Vérifier
HEALTH_KEY=$(grep -oP 'HEALTH_API_KEY=\K.*' .env)
curl -H "Authorization: Bearer $HEALTH_KEY" http://localhost:3000/api/health
```

**Le rollback restaure le code, jamais le schéma.** Le job `migrate` s'exécute
avant le déploiement et Prisma ne défait pas une migration appliquée. C'est sans
conséquence pour une migration additive, et cassant pour une migration
destructive : l'ancienne image chercherait une colonne supprimée. D'où la règle,
toute migration destructive se découpe en deux temps (expand puis contract),
une PR qui ajoute sans retirer, une seconde qui retire une fois l'ancienne
version hors production.

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

# Healthcheck (nécessite le header Authorization - SP-470)
curl -H "Authorization: Bearer $HEALTH_API_KEY" https://smartplanning.fr/api/health
```

### Base de données

```bash
# Accès PostgreSQL
docker exec -it smartplanning-postgres psql -U smartplanning -d smartplanning

# Backup ponctuel, NON CHIFFRE : ne pas le laisser trainer sur le disque,
# il contient les donnees personnelles de toutes les entreprises clientes.
# Pour une sauvegarde chiffree et verifiee, utiliser le script dedie :
#   sudo /opt/smartplanning/ops/backup-database.sh
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

Ces deux dernières commandes ne disent pas la même chose. `certbot certificates`
lit le disque du VPS, `openssl s_client` interroge ce qui est réellement servi
au visiteur, résolution DNS comprise. Quand elles divergent, le trafic
n'atteint pas le VPS : vérifier le DNS avant de toucher à certbot.

C'est exactement ce qui s'est produit dans la nuit du 17 au 18 août 2026. Le
DNS a basculé vers le CDN Hostinger, qui a présenté un vieux certificat expiré
depuis le 23 février, alors que certbot renouvelait correctement et que le VPS
n'a jamais servi de certificat expiré. `dig +short smartplanning.fr A` doit
renvoyer `51.77.146.72`.

Surveillance automatique depuis cet incident : `scripts/ops/check-tls-expiry.sh`,
deux fois par jour en cron, alerte email sous 12 h.

---

## 7. Sauvegardes et restauration

Mises en place par SP-593, le 9 septembre 2026. Avant cette date, **la base de
production n'était sauvegardée nulle part** : aucune tâche cron, aucun timer,
aucun fichier de dump. Le constat a été fait en vérifiant une affirmation de la
politique de confidentialité.

### Ce qui tourne

| Élément | Valeur |
|---|---|
| Script | `/opt/smartplanning/ops/backup-database.sh` |
| Déclenchement | `smartplanning-backup.timer`, chaque jour à 03:20 UTC |
| Destination | `/var/backups/smartplanning/`, en `0700` |
| Chiffrement | GPG symétrique AES256 |
| Clé | `/etc/smartplanning/backup.key`, en `0600` |
| Rétention | 30 jours |
| **Copie hors site** | `/opt/smartplanning/ops/sync-backups-offsite.sh` |
| **Déclenchement** | `smartplanning-backup-offsite.timer`, chaque jour à 04:10 UTC |
| **Destination distante** | Backblaze B2, bucket `smartplanning-backups`, région `eu-central-003` |
| **Identifiants B2** | `/etc/smartplanning/b2.conf`, en `0600` |
| **Rétention distante** | 30 jours |

Le script produit un dump au format `custom`, vérifie son intégrité par
`pg_restore --list`, le chiffre, contrôle que le fichier chiffré se déchiffre
bien en archive PostgreSQL, puis fait la rotation. **Chaque étape qui ne peut
pas conclure arrête le script en erreur** : une sauvegarde qui échoue en
silence est pire que pas de sauvegarde.

### Contrôler l'état

```bash
systemctl list-timers smartplanning-backup.timer
journalctl -u smartplanning-backup.service -n 20

# Compter les sauvegardes présentes
sudo find /var/backups/smartplanning -name "*.dump.gpg" | wc -l
```

**Ne pas utiliser `sudo ls /var/backups/smartplanning/*.gpg`** : le shell
développe le joker avant `sudo`, donc sans les droits sur un répertoire en
`0700`, et renvoie 0 à tort. Utiliser `sudo find` comme ci-dessus.

### Tester une restauration

Une sauvegarde jamais restaurée ne prouve rien. Le script dédié restaure la
dernière archive dans une base temporaire, compte les objets, puis la supprime :

```bash
sudo /opt/smartplanning/ops/test-backup-restore.sh
```

Il refuse de s'exécuter si la base cible porte le nom de la production. À lancer
périodiquement, et systématiquement avant une migration risquée.

### Restaurer pour de vrai

```bash
cd /var/backups/smartplanning
# Déchiffrer l'archive choisie
sudo gpg --batch --decrypt --passphrase-file /etc/smartplanning/backup.key \
  --output /tmp/restauration.dump quotidienne-AAAAMMJJ-HHMMSS.dump.gpg

# L'écrire dans le conteneur. `docker cp` est REFUSÉ, le conteneur tournant en
# read_only depuis le durcissement SP-157 : on passe par docker exec.
sudo docker exec -i smartplanning-postgres sh -c 'cat > /tmp/r.dump' < /tmp/restauration.dump

# Restaurer (arrêter l'application d'abord pour éviter les écritures concurrentes)
sudo docker compose --env-file .env stop app
sudo docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" smartplanning-postgres \
  pg_restore --username smartplanning --dbname smartplanning --clean --if-exists /tmp/r.dump
sudo docker compose --env-file .env start app

# Nettoyer le dump en clair, il porte les données personnelles des clients
sudo docker exec smartplanning-postgres rm -f /tmp/r.dump
sudo rm -f /tmp/restauration.dump
```

### La copie hors site (SP-594, 10 septembre 2026)

Jusqu'au 10 septembre 2026, les archives et la clé vivaient sur le même disque
que la base : la perte du VPS emportait les trois. Les sauvegardes ne
protégeaient donc que du `DROP` malheureux et de la corruption logique.

`sync-backups-offsite.sh` envoie désormais chaque nuit la dernière archive vers
Backblaze B2, **fournisseur volontairement distinct d'OVH** : un stockage objet
OVH aurait couvert le disque mort, pas la panne du fournisseur.

Trois décisions à connaître avant d'y toucher :

- **API native B2 et non S3.** L'API S3-compatible impose une signature AWS v4,
  plusieurs dizaines de lignes de HMAC en shell. L'API native s'utilise en
  `curl`, et n'exige aucun outil supplémentaire sur le VPS.
- **La vérification porte sur ce que B2 a reçu**, taille et SHA-1 relus depuis
  le bucket. Un code HTTP 200 dit que la requête a abouti, pas que le fichier
  est intact : même distinction qu'entre un email accepté par le relais et un
  email délivré (SP-579).
- **Le chiffrement côté serveur du bucket reste désactivé.** Les fichiers
  partent déjà chiffrés avec notre passphrase, qui ne quitte pas le VPS.
  Activer celui de B2 ajouterait une couche dont Backblaze détiendrait la clé.

Le script **refuse une archive de plus de 48 h** : si la sauvegarde locale
cessait, le hors-site paraîtrait sain alors qu'il recopierait un vieux fichier.

Restauration prouvée le 10 septembre 2026 depuis B2, sur une machine autre que
le VPS : 23 tables, 200 objets, dix comptages identiques à la production.
Procédure dans `docs/runbooks/restauration-base-production.md`.

**La clé de chiffrement vit hors du VPS**, dans le gestionnaire de mots de passe
et sur le poste de développement. Une clé rangée à côté de ce qu'elle protège ne
protège rien, et sans elle les archives sont illisibles, y compris pour nous.

### Limites connues, à ne pas oublier

**Le disque n'est pas chiffré** (`ext4` nu, aucun volume LUKS) et la machine est
partagée avec un second projet. C'est précisément pourquoi les archives, elles,
le sont. Un accès fichier sur le VPS donne accès à `/etc/smartplanning/backup.key`,
donc aux archives locales.

**Il n'y a aucun chiffrement des données au repos dans la base** : ni
`pgcrypto`, ni chiffrement applicatif. L'affirmation a été retirée de la
politique de confidentialité plutôt que maintenue à tort.

---

## 8. Troubleshooting

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
# Test d'authentification uniquement : `latest` suffit pour vérifier que le
# registre répond. NE PAS déployer depuis ce tag, le CD suit `sha-<court>`.
docker pull ghcr.io/krismos64/smartplanningai-v2:latest
```

3. Vérifier les permissions du fichier SSH key (doit être en base64)

### Le job `migrate` échoue dans le CD

Symptômes typiques et solutions (20 avril 2026) :

| Exit code | Cause | Fix |
| --------- | ----- | --- |
| 1 — Prisma ne reçoit pas l'URL | `grep -oP 'DATABASE_URL=\K.*'` tronquait l'URL à cause des caractères spéciaux | Lire depuis l'env du conteneur : `docker exec smartplanning-app printenv DATABASE_URL` |
| 125 — Docker refuse de démarrer | `--network smartplanning-network` hardcodé ≠ nom réel `smartplanning_smartplanning-network` | Résoudre dynamiquement : `docker inspect -f '{{range $n,$_ := .NetworkSettings.Networks}}{{$n}}{{end}}' smartplanning-postgres` |
| 1 — Prisma reçoit l'URL avec guillemets | `--env-file .env` propage les guillemets littéraux | Ne pas utiliser `--env-file`, passer la variable via `-e DATABASE_URL=$DATABASE_URL` |

### La 1re visite de smartplanning.fr renvoie des 503 sur les chunks JS (12 mai 2026)

**Symptôme** : sur une 1re visite (cache navigateur vide), plusieurs chunks JS reçoivent un 503 et la page reste figée. Un reload manuel la débloque.

**Cause** : `limit_conn conn_limit 10` était appliqué globalement dans `nginx/smartplanning.conf`. En HTTP/2, Nginx 1.24 compte **chaque stream multiplexé** individuellement contre `limit_conn`, alors qu'une seule connexion TCP est ouverte. Une landing Next.js qui charge 30+ chunks en parallèle dépasse trivialement le seuil.

**Diagnostic rapide** :
```bash
ssh deploy@51.77.146.72
sudo tail -200 /var/log/nginx/smartplanning-error.log | grep "limiting connections"
```
Si tu vois des entrées `client: <ton-IP>`, c'est ce bug.

**Fix appliqué** dans `nginx/smartplanning.conf` :
- Retrait de `limit_conn` global du server block
- Ajout de `limit_conn conn_limit 100` uniquement sur `location /` et `location /api/`
- `/_next/static/*`, fonts et images exempts (cachés par `proxy_cache nextjs_cache`)
- `limit_req_status 429` + `limit_conn_status 429` (au lieu de 503) → monitoring plus précis

**Validation post-fix** :
```bash
# 31 chunks HTTP/2 multiplexés doivent tous renvoyer 200
CHUNKS=$(curl -s https://smartplanning.fr | grep -oE '/_next/static/chunks/[^"]+\.js' | sort -u)
TMPFILE=$(mktemp)
echo "$CHUNKS" | sed 's|^|url = "https://smartplanning.fr|;s|$|"|' > "$TMPFILE"
curl --http2 --parallel --parallel-max 50 -s -o /dev/null \
  -w 'CODE=%{http_code}\n' --config "$TMPFILE" | sort | uniq -c
rm "$TMPFILE"
```

### Dette de configuration Nginx (repo vs VPS)

**Attention** : la config Nginx du VPS peut diverger du repo si des modifs sont appliquées en urgence directement en SSH. À chaque édition `/etc/nginx/sites-available/smartplanning.conf`, **backporter dans `nginx/smartplanning.conf` du repo** et commit.

**Vérifier le drift** :
```bash
ssh deploy@51.77.146.72 'sudo cat /etc/nginx/sites-available/smartplanning.conf' > /tmp/vps.conf
diff nginx/smartplanning.conf /tmp/vps.conf
```

Drift connus déjà backportés (12 mai 2026) :
- `proxy_cache nextjs_cache` sur `/_next/static/`
- `include /etc/nginx/snippets/umami-location.conf`

### Procédure : push d'une nouvelle config Nginx vers le VPS

```bash
# 1. Modifier nginx/smartplanning.conf localement + commit
# 2. Copier sur le VPS
scp nginx/smartplanning.conf deploy@51.77.146.72:/tmp/smartplanning-new.conf

# 3. Backup + remplacement + validation + reload
ssh deploy@51.77.146.72 '
sudo cp /etc/nginx/sites-available/smartplanning.conf \
        /etc/nginx/sites-available/smartplanning.conf.bak.$(date +%Y%m%d_%H%M%S)
sudo mv /tmp/smartplanning-new.conf /etc/nginx/sites-available/smartplanning.conf
sudo chown root:root /etc/nginx/sites-available/smartplanning.conf
sudo chmod 644 /etc/nginx/sites-available/smartplanning.conf
sudo nginx -t && sudo systemctl reload nginx
'
```

Le `reload` n'interrompt pas les connexions en cours.

---

## Historique des mises à jour

| Date       | Version | Description                                   |
| ---------- | ------- | --------------------------------------------- |
| 2025-12-02 | 1.0     | Déploiement initial                           |
| 2026-01-06 | 1.1     | Migration vers nouveau VPS (51.77.146.72)     |
| 2026-01-16 | 1.2     | Ajout Umami Analytics                         |
| 2026-01-19 | 2.0     | Configuration SMTP + refonte documentation    |
| 2026-02-04 | 2.1     | Ajout Cloudinary pour upload avatars (SP-272) |
| 2026-02-10 | 2.2     | Variables Stripe activées                                                  |
| 2026-03-12 | 2.3     | Compteurs tests mis à jour après rationalisation (~2 785 unit / ~189 E2E)  |
| 2026-04-17 | 2.4     | Fix admin : changement statut abonnement sans Stripe, correction redirects 404 |
| 2026-04-20 | 2.5     | CI/CD : ordre `migrate → deploy` inversé (SP-523), pattern `docker run --rm` avec image éphémère, lecture `DATABASE_URL` depuis `docker exec printenv` (sans parse `.env`) |
| 2026-05-12 | 2.6     | Fix Nginx HTTP/2 : `limit_conn` 10 → 100 sur `location /` et `/api/`, exempt sur `/_next/static/*`, codes 429 au lieu de 503. Backport repo des additions VPS (`proxy_cache`, include Umami). Procédure de push config Nginx documentée. |
| 2026-08-18 | 2.7     | Panne DNS et certificat TLS : la zone avait basculé vers le CDN Hostinger, certbot allait bien. Surveillance ajoutée (`scripts/ops/check-tls-expiry.sh`). |
| 2026-09-08 | 2.8     | SP-580 : le compose de production avait dérivé du dépôt, le CD ne le copiait pas. `scp` ajouté au job de déploiement, cache d'images rendu inscriptible. |
| 2026-09-08 | 2.9     | SP-583 : les ports 3000 et 3001 répondaient depuis Internet en contournant Nginx, ufw ne filtrant pas les ports publiés par Docker. Publication passée sur la boucle locale. |
| 2026-09-09 | 2.10    | Correction du document : tableau des conteneurs aligné sur la publication réelle, déclencheurs du CI corrigés (push sur `main` uniquement), compteurs de tests retirés au profit de la mesure. |
| 2026-09-09 | 2.11    | SP-587 : surveillance quotidienne des ports applicatifs joignables depuis Internet, en filet de SP-583. Le durcissement `iptables` (`DOCKER-USER`) reste écarté, arbitrage documenté. |
| 2026-09-09 | 2.12    | SP-588 : le CD annonçait un succès sur une production morte. Healthcheck bloquant, rollback automatique vers l'image précédente, déploiement par `sha-<court>` au lieu de `latest`, clause `concurrency`, `prune` borné à 168 h. Limite documentée : le rollback ne défait pas les migrations. |
| 2026-09-09 | 2.13    | SP-593 : la base de production n'était sauvegardée nulle part. Sauvegarde quotidienne chiffrée (AES256, 03:20 UTC, rétention 30 jours), script de test de restauration, section 7 et runbook dédiés. |
| 2026-09-10 | 2.14    | SP-594 : les archives et la clé vivaient sur le disque de la base. Copie hors site quotidienne vers Backblaze B2 (04:10 UTC, vérifiée taille et SHA-1, rétention 30 jours), clé conservée hors du VPS, restauration prouvée sur une autre machine. |

---

## Contacts et ressources

- **Repository** : https://github.com/krismos64/SmartplanningAI-V2
- **Documentation Next.js** : https://nextjs.org/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Documentation Docker** : https://docs.docker.com
- **Umami** : https://umami.is/docs
- **Cloudinary** : https://cloudinary.com/documentation
