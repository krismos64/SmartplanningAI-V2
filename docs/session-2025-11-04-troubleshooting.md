# 🛠️ Rapport de Troubleshooting - Session 04/11/2025

## 📋 Résumé Exécutif

**Projet :** SmartPlanning V2 - SaaS de gestion de plannings (Projet CDA)
**Date :** 4 novembre 2025 - Après-midi
**Phase :** Configuration environnement de développement
**Statut final :** ✅ Environnement opérationnel

---

## 🎯 Objectif de la Session

Reprendre le projet SmartPlanning V2 après redémarrage du Mac et configurer l'accès à PostgreSQL via DBeaver.

---

## ⚙️ Stack Technique Vérifiée

| Composant | Version | Statut |
|-----------|---------|--------|
| **Next.js** | 15.5.6 | ✅ Installé |
| **React** | 19.0.0 | ✅ Installé |
| **TypeScript** | 5.7.2 | ✅ Configuré (mode strict) |
| **PostgreSQL** | 16.10 (Docker) | ✅ Opérationnel |
| **Redis** | 7-alpine (Docker) | ✅ Opérationnel |
| **Adminer** | latest (Docker) | ✅ Accessible (localhost:8080) |
| **Prisma** | 6.1.0 | ✅ Installé (schéma à créer) |
| **NextAuth** | v5.0.0-beta.25 | ✅ Installé (config à faire) |

---

## 🐛 Problèmes Rencontrés & Solutions

### ❌ Problème 1 : Docker ne démarrait pas (bloqué lors de la session précédente)

**Symptôme :**
```bash
npm run docker:dev
# Conteneurs ne démarraient pas correctement
```

**Cause :** Nécessitait un redémarrage du Mac (problème hardware/OS)

**Solution :**
- Redémarrage du MacBook Pro M1
- Docker Desktop relancé automatiquement
- ✅ Vérifié avec `docker ps`

---

### ❌ Problème 2 : "FATAL: role 'smartplanning' does not exist"

**Symptôme :**
```bash
psql -h localhost -U smartplanning -d smartplanning
# FATAL: role "smartplanning" does not exist
```

**Investigations menées :**

1. **Volume PostgreSQL corrompu**
   - Les volumes Docker contenaient une ancienne config
   - Solution : `docker-compose down -v` (suppression volumes)
   - ✅ Recréation avec base propre

2. **Problème d'authentification pg_hba.conf**
   - PostgreSQL alpine utilisait `trust` au lieu de `scram-sha-256`
   - Tentative de modification manuelle du `pg_hba.conf`
   - ⚠️ Modifications perdues au redémarrage

3. **Image PostgreSQL alpine problématique**
   - Passage de `postgres:16-alpine` → `postgres:16` (Debian)
   - Ajout de `POSTGRES_HOST_AUTH_METHOD: scram-sha-256` dans docker-compose.yml
   - ✅ Image plus stable mais problème persistait

---

### ❌ Problème 3 : **CAUSE RÉELLE** - Conflit de ports PostgreSQL

**Symptôme :**
Même après recréation des volumes, DBeaver ne pouvait pas se connecter avec "role smartplanning does not exist"

**Investigation décisive :**
```bash
lsof -i :5432
# Résultat : 2 processus écoutent sur le port 5432 !
# - PostgreSQL Homebrew (PID 847) installé localement
# - PostgreSQL Docker (via com.docker)
```

**Explication technique :**
Le PostgreSQL installé via **Homebrew** (version 15.14) tournait en arrière-plan sur macOS et écoutait sur `localhost:5432`. Quand DBeaver ou psql essayaient de se connecter, ils tombaient sur le **mauvais PostgreSQL** (celui de Homebrew qui n'a pas l'utilisateur "smartplanning"), pas celui dans Docker.

**Solution finale :**
```bash
brew services stop postgresql@15
# Arrêt du PostgreSQL Homebrew
```

**Vérification :**
```bash
lsof -i :5432
# Seul com.docker écoute maintenant
```

**Test de connexion réussi :**
```bash
PGPASSWORD=smartplanning psql -h 127.0.0.1 -p 5432 -U smartplanning -d smartplanning
# You are connected to database "smartplanning" as user "smartplanning"
# PostgreSQL 16.10 (Debian) ✅
```

---

## 📊 État Actuel du Projet

### ✅ Services Opérationnels

| Service | Conteneur | Port | Statut | Accès |
|---------|-----------|------|--------|-------|
| **PostgreSQL 16** | smartplanning-postgres | 5432 | Healthy | DBeaver/Adminer |
| **Redis 7** | smartplanning-redis | 6379 | Healthy | - |
| **Adminer** | smartplanning-adminer | 8080 | Running | http://localhost:8080 |

**Commandes de gestion :**
```bash
# Démarrer
npm run docker:dev

# Arrêter
npm run docker:dev:down

# Logs
docker logs smartplanning-postgres
```

### ✅ Connexion DBeaver Validée

**Paramètres de connexion :**
```
Host:     127.0.0.1
Port:     5432
Database: smartplanning
Username: smartplanning
Password: smartplanning
```

**Base de données :** Vide (normal - migrations Prisma pas encore exécutées)

---

## 🎓 Leçons pour la Soutenance CDA

### 1. Debugging Méthodique

**Approche utilisée :**
1. Vérifier les conteneurs : `docker ps`
2. Vérifier les volumes : `docker volume ls`
3. Consulter les logs : `docker logs smartplanning-postgres`
4. Tester la connexion depuis le conteneur : `docker exec smartplanning-postgres psql -U smartplanning -c "\du"`
5. **Identifier les conflits de ports** : `lsof -i :5432` ← Clé du problème !

### 2. Gestion des Environnements

**Conflit identifié :**
- PostgreSQL local (Homebrew) vs PostgreSQL Docker
- Même port = priorité au service local

**Bonnes pratiques à retenir :**
- Toujours vérifier les services qui écoutent sur les ports (`lsof -i :PORT`)
- Isoler les environnements de dev (Docker) vs outils système
- Documenter les ports utilisés dans le README

### 3. Architecture Multi-Services (Docker Compose)

**Services configurés :**
```yaml
services:
  postgres:   # Base de données principale
  redis:      # Cache et sessions
  adminer:    # Interface web DB
```

**Réseau isolé :** `smartplanning-network` (communication inter-conteneurs)
**Volumes persistants :** `postgres_data`, `redis_data`

---

## 📝 Prochaines Étapes

### 🎯 Étape 5 : Créer le schéma Prisma
- Modèles : User, Company, Employee, Team, Schedule, LeaveRequest
- Enums : UserRole, SubscriptionPlan, ScheduleType, LeaveType
- Relations multi-tenant avec isolation par entreprise

### 🎯 Étape 6 : Migrations Prisma
```bash
npm run db:generate  # Générer Prisma Client
npm run db:migrate   # Créer les tables
npm run db:studio    # Interface web Prisma
```

### 🎯 Étape 7 : Architecture src/
- Dossiers : app/, components/, lib/, types/
- Route groups : (auth), (dashboard)
- Layouts et pages Next.js 15 App Router

### 🎯 Étape 8 : Configuration NextAuth v5
- Stratégie Credentials avec Prisma
- Middleware de protection des routes
- Session Redis (performance)

### 🎯 Étape 9 : Initialiser Shadcn/ui
```bash
npx shadcn@latest init
```

---

## 🔧 Modifications Apportées

### Fichier : `docker/docker-compose.yml`

**Avant :**
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_INITDB_ARGS: '--encoding=UTF-8 --lc-collate=fr_FR.UTF-8'
```

**Après :**
```yaml
postgres:
  image: postgres:16  # Image Debian (plus stable)
  environment:
    POSTGRES_HOST_AUTH_METHOD: scram-sha-256  # Force auth par mot de passe
```

**Raison :** Image alpine avait des problèmes d'authentification. Image Debian est plus robuste pour le développement.

---

## 📚 Commandes Utiles Apprises

### Docker
```bash
# Tout supprimer et recréer
docker-compose -f docker/docker-compose.yml down -v
docker volume rm docker_postgres_data docker_redis_data
npm run docker:dev

# Vérifier les ports utilisés
lsof -i :5432
lsof -i :6379

# Arrêter un service local
brew services stop postgresql@15
```

### PostgreSQL
```bash
# Tester connexion avec mot de passe
PGPASSWORD=smartplanning psql -h 127.0.0.1 -p 5432 -U smartplanning -d smartplanning

# Lister les utilisateurs
docker exec smartplanning-postgres psql -U smartplanning -c "\du"

# Vérifier la base
docker exec smartplanning-postgres psql -U smartplanning -c "\l"
```

---

## 🎯 Points à Présenter au Jury CDA

### 1. Résolution de Problèmes Complexes
- Identification d'un conflit de ports entre services locaux et Docker
- Approche méthodique : logs, tests, isolation du problème
- Documentation du processus (ce rapport)

### 2. Maîtrise de Docker
- Orchestration multi-services (PostgreSQL, Redis, Adminer)
- Gestion des volumes et persistance
- Configuration réseau et healthchecks

### 3. Environnement de Développement Professionnel
- Isolation des services (Docker)
- Outils de debugging (DBeaver, Adminer, logs Docker)
- Variables d'environnement sécurisées (.env, .gitignore)

### 4. Bonnes Pratiques de Documentation
- Rapport de troubleshooting détaillé
- Commandes reproductibles
- Leçons apprises et amélioration continue

---

## 🚀 État Final

✅ **Environnement Docker opérationnel**
✅ **PostgreSQL accessible via DBeaver**
✅ **Redis fonctionnel**
✅ **Adminer accessible (localhost:8080)**
✅ **Conflit de ports résolu**
✅ **Documentation à jour**

**Prêt pour la suite :** Création du schéma Prisma et développement des fonctionnalités.

---

## 📖 Références

- Docker Compose : https://docs.docker.com/compose/
- PostgreSQL Docker : https://hub.docker.com/_/postgres
- Debugging réseau macOS : `lsof`, `netstat`
- Homebrew services : `brew services list`

---

**Document généré le :** 4 novembre 2025
**Auteur :** Christophe Mostefaoui
**Projet :** SmartPlanning V2 - Titre CDA
**Assistance :** Claude Code (Anthropic)
