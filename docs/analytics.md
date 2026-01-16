# Umami Analytics - Documentation technique

> **Ticket** : SP-345 - Intégration Umami Analytics
> **Statut** : ✅ Implémenté
> **Version** : 2.0.0

## Vue d'ensemble

SmartPlanning utilise **Umami** comme solution d'analytics, une alternative privacy-friendly et RGPD-compliant à Google Analytics.

### Caractéristiques

- 🔒 **Privacy-first** : Aucun tracking cross-site, pas de cookies tiers
- 🇪🇺 **RGPD compliant** : Respect total du consentement utilisateur
- 🏠 **Self-hosted** : Déployé sur notre VPS OVH (pas de données chez un tiers)
- 📊 **Lightweight** : Script <2KB, aucun impact sur les Core Web Vitals
- 🎯 **Events custom** : Tracking des conversions et interactions

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   Nginx Proxy   │────▶│  Umami Docker   │
│  (port 3000)    │     │ /analytics/*    │     │  (port 3001)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (db: umami)   │
                                               └─────────────────┘
```

## Configuration

### Variables d'environnement

```env
# Website ID (récupérer dans le dashboard Umami)
NEXT_PUBLIC_UMAMI_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# URL du script (reverse proxy)
NEXT_PUBLIC_UMAMI_SCRIPT_URL="/analytics/script.js"

# Domaines autorisés pour le tracking
NEXT_PUBLIC_UMAMI_DOMAINS="smartplanning.fr"

# Secret pour l'instance Umami (VPS uniquement)
UMAMI_APP_SECRET="générer avec: openssl rand -base64 32"
```

### Infrastructure VPS

Le fichier `docker/docker-compose.umami.yml` déploie Umami :

```bash
# Déployer sur le VPS
docker-compose -f docker/docker-compose.umami.yml up -d

# Vérifier les logs
docker logs smartplanning-umami --tail 100

# Accéder au dashboard
# https://smartplanning.fr/analytics
# Login: admin / umami (changer au premier accès !)
```

## Utilisation dans le code

### Composant UmamiAnalytics

Le composant `<UmamiAnalytics />` est déjà intégré dans `layout.tsx`. Il gère :

- Le chargement conditionnel basé sur le consentement cookies
- L'écoute des changements de consentement en temps réel
- La vérification de la configuration (WEBSITE_ID)

```tsx
// src/components/analytics/UmamiAnalytics.tsx
// Déjà intégré - pas besoin de l'ajouter manuellement
```

### Hook useUmamiTrack

Pour tracker des events custom :

```tsx
import { useUmamiTrack } from '@/hooks/useUmamiTrack'

function CTAButton() {
  const { track, isEnabled } = useUmamiTrack()

  const handleClick = () => {
    track('cta-click', { location: 'hero' })
    // ... reste de la logique
  }

  return (
    <button onClick={handleClick}>
      S'inscrire {isEnabled && '📊'}
    </button>
  )
}
```

### Events prédéfinis

| Event | Description | Données |
|-------|-------------|---------|
| `cta-click` | Clic sur un CTA | `{ location: 'hero' \| 'pricing' \| 'footer' }` |
| `signup-start` | Début d'inscription | `{ source: 'landing' \| 'pricing' }` |
| `signup-complete` | Inscription terminée | `{ plan: 'free' \| 'pro' \| 'enterprise' }` |
| `login` | Connexion | `{ method: 'email' \| 'google' \| 'github' }` |
| `pricing-view` | Vue page pricing | `{ plan: 'free' \| 'pro' \| 'enterprise' }` |
| `contact-submit` | Soumission formulaire contact | `{ subject: string }` |
| `feature-use` | Utilisation d'une feature | `{ feature: 'planning' \| 'team' \| 'export' }` |

## Intégration RGPD

Le tracking est **strictement conditionnel** au consentement :

1. **Catégorie `analytics`** : L'utilisateur doit accepter cette catégorie
2. **Événement `cookie-consent-changed`** : Le composant réagit en temps réel
3. **Vérification double** : À chaque appel de `track()`, le consentement est re-vérifié

```tsx
// La fonction track() ne fait RIEN si le consentement n'est pas donné
const { track } = useUmamiTrack()
track('event-name') // Silencieusement ignoré si pas de consentement
```

## Dashboard Umami

Accès : `https://smartplanning.fr/analytics`

### Premier accès

1. Login : `admin` / `umami`
2. **Changer le mot de passe immédiatement !**
3. Créer le site "SmartPlanning"
4. Récupérer le Website ID
5. Configurer `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

### Métriques disponibles

- **Pages vues** : Toutes les pages visitées
- **Visiteurs uniques** : Basé sur les sessions (sans cookies)
- **Durée de session** : Temps passé sur le site
- **Taux de rebond** : Visiteurs avec 1 seule page vue
- **Sources de trafic** : Referrer, UTM parameters
- **Devices** : Mobile/Desktop, Navigateurs, OS
- **Géolocalisation** : Pays (sans IP stockée)
- **Events custom** : Tous les events trackés avec leurs données

## Tests

### Tests unitaires

```bash
# Hook useUmamiTrack
npm test -- --run __tests__/hooks/useUmamiTrack.test.ts

# Composant UmamiAnalytics
npm test -- --run __tests__/components/analytics/UmamiAnalytics.test.tsx
```

### Tests E2E

```bash
# Tests analytics complets
npx playwright test e2e/specs/analytics.spec.ts
```

### Vérifier en développement

1. Définir `NEXT_PUBLIC_UMAMI_WEBSITE_ID` dans `.env.local`
2. Accepter les cookies analytics
3. Ouvrir DevTools > Network
4. Vérifier les requêtes vers `/analytics/script.js` et `/api/send`

## Troubleshooting

### Le script ne se charge pas

1. Vérifier le consentement : `localStorage.getItem('cookie-consent')`
2. Vérifier la config : `process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID`
3. Vérifier le proxy Nginx : `curl -I https://smartplanning.fr/analytics/script.js`

### Les events ne sont pas enregistrés

1. Vérifier que `window.umami` existe dans la console
2. Vérifier le consentement analytics
3. Vérifier les logs Umami : `docker logs smartplanning-umami`

### Dashboard inaccessible

1. Vérifier le conteneur : `docker ps | grep umami`
2. Vérifier la connexion DB : `docker logs smartplanning-umami | grep -i error`
3. Vérifier Nginx : `nginx -t && systemctl status nginx`

## Fichiers concernés

```
src/
├── components/analytics/
│   ├── UmamiAnalytics.tsx    # Composant de chargement du script
│   └── index.ts              # Barrel export
├── hooks/
│   └── useUmamiTrack.ts      # Hook pour events custom
├── lib/cookies/
│   └── scripts.ts            # notifyConsentChange()
└── app/
    └── layout.tsx            # <UmamiAnalytics /> intégré

docker/
├── docker-compose.umami.yml  # Config Umami
├── nginx/
│   └── umami.conf            # Reverse proxy
└── scripts/
    └── init-umami-db.sql     # Init base PostgreSQL

__tests__/
├── components/analytics/
│   └── UmamiAnalytics.test.tsx
└── hooks/
    └── useUmamiTrack.test.ts

e2e/specs/
└── analytics.spec.ts         # Tests E2E
```

## Ressources

- [Documentation officielle Umami](https://umami.is/docs)
- [API Events Umami](https://umami.is/docs/track-events)
- [GitHub Umami](https://github.com/umami-software/umami)
- [SP-283 - Système de consentement cookies](./SP-283-cookie-banner-plan.md)
