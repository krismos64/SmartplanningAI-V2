# SP-345 - Plan d'implémentation Umami Analytics

## Résumé

Intégration d'Umami Analytics, une solution open-source privacy-friendly, en self-hosting sur le VPS OVH (51.77.146.72) avec chargement conditionnel basé sur le consentement cookies RGPD (SP-283).

## Décisions techniques

| Critère | Choix | Justification |
|---------|-------|---------------|
| URL d'accès | `smartplanning.fr/analytics` | Même domaine, certificat SSL partagé |
| Base de données | PostgreSQL existant (container) | Moins de ressources, schéma dédié `umami` |
| Niveau de tracking | Pages + Events custom | Insights détaillés (CTA, inscriptions, conversions) |
| Infrastructure | Nginx existant + Docker | Ajout d'un service au compose prod |

## Architecture cible

```
┌─────────────────────────────────────────────────────────────────┐
│                        VPS OVH (Ubuntu 24.04)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Nginx (Reverse Proxy)                 │    │
│  │  ┌─────────────────┐  ┌────────────────────────────┐   │    │
│  │  │ smartplanning.fr│  │ smartplanning.fr/analytics │   │    │
│  │  │     → :3000     │  │         → :3001            │   │    │
│  │  └────────┬────────┘  └───────────┬────────────────┘   │    │
│  └───────────┼───────────────────────┼────────────────────┘    │
│              │                       │                          │
│  ┌───────────▼───────────┐  ┌───────▼────────────────────┐    │
│  │   Next.js App :3000   │  │    Umami App :3001         │    │
│  │   (smartplanning)     │  │    (analytics dashboard)   │    │
│  └───────────┬───────────┘  └───────┬────────────────────┘    │
│              │                       │                          │
│  ┌───────────▼───────────────────────▼────────────────────┐    │
│  │              PostgreSQL 16 (port 5432)                  │    │
│  │    ┌──────────────┐    ┌──────────────────┐            │    │
│  │    │   public.*   │    │     umami.*      │            │    │
│  │    │ (smartplan)  │    │  (analytics DB)  │            │    │
│  │    └──────────────┘    └──────────────────┘            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de chargement du script (côté client)

```
┌──────────────────────────────────────────────────────────────┐
│                      Page Load                                │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│    CookieConsentProvider (SP-283) initialise l'état          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         Vérifie isCategoryAccepted('analytics')              │
└──────────────────────┬───────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │ analytics:   │        │ analytics:   │
    │   true       │        │   false      │
    └──────┬───────┘        └──────┬───────┘
           │                       │
           ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │ Charge script│        │ Ne charge    │
    │ Umami via    │        │ rien         │
    │ next/script  │        │              │
    └──────────────┘        └──────────────┘
```

## Plan d'implémentation

### Phase 1 : Infrastructure VPS (fichiers de config)

#### 1.1 Docker Compose Umami (`docker/docker-compose.umami.yml`)

Configuration Docker séparée pour Umami :
- Image officielle `ghcr.io/umami-software/umami:postgresql-latest`
- Port 3001 (interne)
- BASE_PATH=/analytics pour fonctionner sur un sous-chemin
- Connexion au PostgreSQL existant via le network partagé
- Health check et limites de ressources

#### 1.2 Script d'initialisation base Umami

Script SQL pour créer la base `umami` dans PostgreSQL existant.
Umami crée automatiquement ses tables au premier démarrage.

#### 1.3 Configuration Nginx (`docker/nginx/umami.conf`)

- Reverse proxy `/analytics` → port 3001
- Support WebSocket pour le dashboard real-time
- Cache du script de tracking (1 jour)
- Headers X-Real-IP, X-Forwarded-For pour les stats géo

### Phase 2 : Composants Next.js

#### 2.1 Composant `UmamiAnalytics` (`src/components/analytics/UmamiAnalytics.tsx`)

Composant client qui :
- Vérifie `isCategoryAccepted('analytics')` avant de charger
- Utilise `next/script` avec strategy `afterInteractive`
- Écoute l'event custom `cookie-consent-changed` pour réagir aux changements
- Props : `disabled` pour désactiver en preview

#### 2.2 Hook `useUmamiTrack` (`src/hooks/useUmamiTrack.ts`)

Hook pour tracker des events custom :
- Vérifie le consentement avant chaque appel
- API simple : `track('event-name', { data })`
- Retourne `isEnabled` pour conditionner l'UI si besoin
- Types TypeScript pour `window.umami`

#### 2.3 Mise à jour de `scripts.ts`

- Ajouter `loadUmamiScript()`
- Ajouter `notifyConsentChange()` qui dispatch un CustomEvent
- Modifier `applyConsentPreferences()` pour inclure Umami

#### 2.4 Intégration dans `layout.tsx`

Ajouter `<UmamiAnalytics />` dans le CookieConsentProvider.

### Phase 3 : Variables d'environnement

Ajouts à `.env.example` :
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - ID du site dans Umami
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` - URL du script (défaut: /analytics/script.js)
- `UMAMI_APP_SECRET` - Secret pour l'app Umami (VPS uniquement)

### Phase 4 : Tests

#### 4.1 Tests unitaires UmamiAnalytics
- Ne charge pas si consentement = false
- Charge si consentement = true
- Réagit aux changements de consentement
- Gère l'absence de WEBSITE_ID

#### 4.2 Tests unitaires useUmamiTrack
- track() silencieux si pas de consentement
- track() appelle window.umami.track si OK
- isEnabled reflète le consentement

#### 4.3 Tests E2E (`e2e/specs/analytics.spec.ts`)
- Script absent avant consentement
- Script présent après acceptation analytics
- Events envoyés correctement

### Phase 5 : Documentation

- `docs/analytics.md` - Guide complet
- Mise à jour README.md

## Events custom à implémenter

| Event | Description | Données |
|-------|-------------|---------|
| `cta-click` | Clic sur un CTA landing | `{ location: string }` |
| `signup-start` | Début d'inscription | `{ source: string }` |
| `signup-complete` | Inscription terminée | `{ plan: string }` |
| `login` | Connexion utilisateur | `{ method: string }` |
| `feature-use` | Utilisation d'une feature | `{ feature: string }` |

## Checklist de déploiement VPS

1. Créer la base `umami` dans PostgreSQL existant
2. Générer `UMAMI_APP_SECRET` avec `openssl rand -base64 32`
3. Déployer le container Umami
4. Configurer Nginx avec le reverse proxy
5. Accéder au dashboard, changer le mot de passe admin
6. Créer le website et récupérer l'ID
7. Configurer `NEXT_PUBLIC_UMAMI_WEBSITE_ID` dans l'app

## Critères de succès

- [ ] Umami accessible sur `https://smartplanning.fr/analytics`
- [ ] Dashboard fonctionnel avec login sécurisé
- [ ] Script chargé UNIQUEMENT si `analytics: true`
- [ ] Hook `useUmamiTrack` fonctionnel
- [ ] Tests passants
- [ ] Build production OK
- [ ] Documentation complète

## Références

- ✅ **Context7** : Documentation Umami officielle (self-hosting, tracking script)
- ✅ **Context7** : Next.js Script component (afterInteractive strategy)
- ✅ **Context7** : Docker Compose best practices (health checks, depends_on)
- ✅ **Context7** : Nginx reverse proxy (WebSocket, proxy_pass, headers)
