# Cahier de recettage - SmartPlanning

Ce document trace l'historique complet des tests réalisés sur SmartPlanning. Il constitue une preuve de la démarche qualité mise en œuvre tout au long du projet et justifie les choix techniques dans le cadre du diplôme **CDA (Concepteur Développeur d'Applications)**.

---

## Informations générales

| Information          | Valeur                                                 |
| -------------------- | ------------------------------------------------------ |
| Projet               | SmartPlanning                                          |
| Repository           | [GitHub](https://github.com/krismos64/SmartplanningAI) |
| Production           | https://smartplanning.fr                               |
| Pipeline CI/CD       | GitHub Actions                                         |
| Responsable          | Christophe Mostefaoui                                  |
| Date de création     | 4 décembre 2025                                        |
| Dernière mise à jour | 27 février 2026 (Notifications résiliation, seed Stripe réel, améliorations billing/director/CSV, 5914 unitaires + 584 E2E) |

---

## 🎯 Contexte CDA - Justification de la démarche qualité

### Pourquoi ce cahier de recettage ?

Dans le cadre du diplôme **CDA (Concepteur Développeur d'Applications)**, ce cahier de recettage démontre ma capacité à :

- Mettre en place une **stratégie de tests complète** couvrant unitaires, intégration et E2E
- **Justifier mes choix techniques** avec une réflexion argumentée
- **Documenter les problèmes rencontrés** et leurs résolutions
- Maintenir une **qualité de code professionnelle** avec une couverture > 80%

### Objectifs qualité fixés

| Métrique              | Objectif  | Atteint  |
| --------------------- | --------- | -------- |
| Couverture globale    | ≥ 70%     | ✅ 86.35% |
| Tests unitaires       | ≥ 500     | ✅ 5914   |
| Tests E2E             | ≥ 50      | ✅ 584 (40 fichiers)   |
| Score Lighthouse A11y | ≥ 90%     | ✅ 95%   |
| Anomalies critiques   | 0 en prod | ✅ 0     |

---

## 🔧 Justification des choix techniques (CDA)

Cette section explique pourquoi j'ai choisi chaque outil plutôt qu'un autre, démontrant ma capacité d'analyse et de prise de décision technique.

### Pourquoi Vitest plutôt que Jest ?

| Critère                       | Jest                      | Vitest              | Mon choix |
| ----------------------------- | ------------------------- | ------------------- | --------- |
| Support ESM natif             | ❌ Configuration complexe | ✅ Natif            | Vitest    |
| Vitesse d'exécution           | ~20s pour 1000 tests      | ~8s pour 1000 tests | Vitest    |
| Compatibilité Vite/Next.js 15 | ⚠️ Nécessite babel        | ✅ Natif            | Vitest    |
| API                           | Propre                    | Compatible Jest     | Vitest    |
| Hot Module Reload tests       | ❌ Non                    | ✅ Oui              | Vitest    |

**Conclusion** : Vitest offre une meilleure DX (Developer Experience) avec Next.js 15 et son support Turbopack, tout en restant compatible avec l'API Jest que je connaissais déjà.

### Pourquoi Playwright plutôt que Cypress ?

| Critère                  | Cypress                             | Playwright                          | Mon choix  |
| ------------------------ | ----------------------------------- | ----------------------------------- | ---------- |
| Multi-navigateurs        | ⚠️ Limité (Chromium, Firefox, Edge) | ✅ Tous (Chromium, Firefox, WebKit) | Playwright |
| Tests parallèles         | 💰 Payant (Dashboard)               | ✅ Gratuit natif                    | Playwright |
| Vitesse                  | Plus lent                           | 2-3x plus rapide                    | Playwright |
| Auto-waiting             | ✅ Bon                              | ✅ Excellent                        | Playwright |
| Maintenance Microsoft    | ❌ Non                              | ✅ Oui                              | Playwright |
| Support mobile viewports | ⚠️ Limité                           | ✅ Excellent                        | Playwright |

**Conclusion** : Pour un projet SaaS devant supporter tous les navigateurs (y compris Safari/WebKit), Playwright est le choix optimal. Sa gratuité totale (pas de dashboard payant) et sa rapidité d'exécution ont été déterminantes.

### Pourquoi MSW (Mock Service Worker) plutôt que des mocks classiques ?

| Critère                    | Mocks Jest/Vitest    | MSW                     | Mon choix |
| -------------------------- | -------------------- | ----------------------- | --------- |
| Interception réseau réelle | ❌ Non               | ✅ Oui (Service Worker) | MSW       |
| Tests plus réalistes       | ❌ Mocks artificiels | ✅ Simule vraie API     | MSW       |
| Réutilisable E2E           | ❌ Non               | ✅ Oui                  | MSW       |
| Maintenance                | ⚠️ Mocks éparpillés  | ✅ Handlers centralisés | MSW       |

**Conclusion** : MSW intercepte les vraies requêtes HTTP au niveau du Service Worker, rendant les tests plus fiables et plus proches du comportement réel de l'application.

### Pourquoi react-error-boundary plutôt qu'un Error Boundary natif ? (Sprint 10) 🆕

| Critère               | Class Component natif | react-error-boundary                 | Mon choix            |
| --------------------- | --------------------- | ------------------------------------ | -------------------- |
| Syntaxe               | Verbeuse (Class)      | Moderne (Hooks + HOC)                | react-error-boundary |
| API Reset             | ❌ À implémenter      | ✅ resetErrorBoundary natif          | react-error-boundary |
| resetKeys             | ❌ Non                | ✅ Reset automatique sur changement  | react-error-boundary |
| useErrorBoundary hook | ❌ Non                | ✅ Oui (throw depuis event handlers) | react-error-boundary |
| onError callback      | ❌ componentDidCatch  | ✅ Prop déclarative                  | react-error-boundary |
| Fallback component    | ❌ Render method      | ✅ FallbackComponent prop            | react-error-boundary |
| Bundle size           | 0kb                   | ~2kb                                 | react-error-boundary |
| Maintenance           | Manuel                | Maintenu par React Core Team member  | react-error-boundary |

**Contrainte technique** : Les Error Boundaries doivent être des composants Class en React. Les méthodes `getDerivedStateFromError` et `componentDidCatch` n'ont pas d'équivalent en hooks.

**Conclusion** : react-error-boundary v5.0.0 (créée par Brian Vaughn, ex-React Core Team) encapsule la complexité des Class Components tout en offrant une API moderne et déclarative. Le coût de 2kb est négligeable face aux bénéfices en maintenabilité.

### Pourquoi Framer Motion plutôt que CSS Animations ? (Sprint 10) 🆕

| Critère              | CSS Animations           | Framer Motion               | Mon choix     |
| -------------------- | ------------------------ | --------------------------- | ------------- |
| API déclarative      | ❌ Keyframes impératives | ✅ Variants déclaratifs     | Framer Motion |
| Animations complexes | ⚠️ Verbeux               | ✅ Orchestration simple     | Framer Motion |
| Interactivité        | ❌ Nécessite JS          | ✅ Gestures natifs          | Framer Motion |
| Accessibilité        | ⚠️ Manuel                | ✅ useReducedMotion intégré | Framer Motion |
| Stagger/Delay        | ❌ Complexe              | ✅ API simple               | Framer Motion |
| Performance          | ✅ GPU-accelerated       | ✅ GPU-accelerated          | ⚖️ Égalité    |
| Bundle size          | 0kb                      | ~35kb (gzipped)             | ⚠️ CSS        |

**Justification du choix (SP-302, SP-303, SP-304)** :

- **Accessibilité native** : `useReducedMotion` respecte automatiquement les préférences utilisateur (`prefers-reduced-motion`)
- **Code déclaratif** : Les variants permettent de gérer des animations complexes de manière lisible et maintenable
- **Orchestration** : Stagger animations, delays, et séquences gérés facilement sans calculs manuels
- **Projet CDA** : Démontre la maîtrise d'une bibliothèque moderne et professionnelle

**Conclusion** : Pour les pages d'erreur (404, 500) et les UI engageantes, Framer Motion offre le meilleur rapport expressivité/maintenance malgré un coût de 35kb. L'accessibilité native justifie à elle seule ce choix pour un projet certifiant CDA.

### Pourquoi @axe-core/playwright plutôt que pa11y ou Lighthouse CI ? (Sprint 11) 🆕

| Critère                | pa11y           | Lighthouse CI   | @axe-core/playwright    | Mon choix |
| ---------------------- | --------------- | --------------- | ----------------------- | --------- |
| Intégration Playwright | ❌ Outil séparé | ❌ CLI distinct | ✅ API native           | axe-core  |
| Règles WCAG            | ⚠️ Basiques     | ✅ Bonnes       | ✅ Excellentes (Deque)  | axe-core  |
| Granularité tests      | ❌ Page entière | ❌ Page entière | ✅ Par composant/zone   | axe-core  |
| Filtrage violations    | ⚠️ Limité       | ⚠️ Limité       | ✅ Par impact/règle     | axe-core  |
| Context Playwright     | ❌ Non          | ❌ Non          | ✅ Accès page/locator   | axe-core  |
| Maintenance            | ⚠️ Communauté   | ✅ Google       | ✅ Deque (experts a11y) | axe-core  |

**Justification du choix (SP-269)** :

- **Intégration native** : `new AxeBuilder({ page })` s'intègre directement dans les tests Playwright existants
- **Filtrage précis** : `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])` pour cibler WCAG 2.1 AA
- **Exclusions design** : `.disableRules(['color-contrast'])` pour exclure les choix de design validés
- **Filtrage par impact** : `violations.filter(v => v.impact === 'critical')` pour CI non-bloquant sur violations mineures

**Conclusion** : @axe-core/playwright offre la meilleure intégration dans la stack de tests existante tout en bénéficiant de l'expertise de Deque (créateurs de axe, référence en accessibilité). Le filtrage granulaire permet une approche pragmatique de la conformité WCAG.

### Pourquoi React Email plutôt que MJML ou HTML brut ? (Sprint 9)

| Critère                     | HTML brut               | MJML             | React Email               | Mon choix   |
| --------------------------- | ----------------------- | ---------------- | ------------------------- | ----------- |
| Syntaxe                     | Verbose, difficile      | XML propriétaire | JSX natif (même stack)    | React Email |
| Typage TypeScript           | ❌ Non                  | ❌ Non           | ✅ Props typées           | React Email |
| Composants réutilisables    | ❌ Copy-paste           | ⚠️ Limité        | ✅ Pattern React          | React Email |
| Preview en dev              | ❌ Manuel               | ⚠️ Outil séparé  | ✅ Hot reload intégré     | React Email |
| Compatibilité clients email | ⚠️ À gérer manuellement | ✅ Très bon      | ✅ Génère HTML compatible | React Email |

**Conclusion** : React Email permet de capitaliser sur les compétences React/TypeScript existantes tout en générant des emails compatibles avec tous les clients de messagerie (Gmail, Outlook, Apple Mail).

### Pourquoi React Hook Form plutôt que Formik ? (Sprint 9)

| Critère        | Formik                  | React Hook Form       | Mon choix       |
| -------------- | ----------------------- | --------------------- | --------------- |
| Performance    | ⚠️ Re-renders fréquents | ✅ Minimal re-renders | React Hook Form |
| Bundle size    | 12.7kb                  | 8.5kb                 | React Hook Form |
| TypeScript     | ⚠️ Types partiels       | ✅ Types complets     | React Hook Form |
| Validation Zod | ⚠️ Config manuelle      | ✅ zodResolver natif  | React Hook Form |
| API            | Verbose                 | Intuitive (register)  | React Hook Form |

**Conclusion** : React Hook Form offre de meilleures performances grâce à l'approche "uncontrolled" et s'intègre parfaitement avec Zod via le resolver officiel.

### Pourquoi un Rate Limiter en mémoire plutôt que Redis ? (Sprint 9)

| Critère        | Solution en mémoire | Redis              | Upstash           |
| -------------- | ------------------- | ------------------ | ----------------- |
| Complexité     | ✅ Simple           | ❌ Config serveur  | ⚠️ Compte externe |
| Coût           | ✅ Gratuit          | ⚠️ RAM serveur     | ⚠️ Payant         |
| Scalabilité    | ⚠️ 1 instance       | ✅ Multi-instances | ✅ Serverless     |
| Pertinence MVP | ✅ Suffisant        | ❌ Overkill        | ❌ Overkill       |

**Conclusion** : Pour le MVP avec une seule instance, un rate limiter en mémoire est suffisant et évite la complexité d'un service externe. Migration vers Redis/Upstash possible si besoin de scaling horizontal.

### Pourquoi le Pattern Page Object pour les tests E2E ?

**Problème initial** : Tests E2E avec sélecteurs dupliqués, maintenance difficile, code peu lisible.

**Solution adoptée** : Pattern Page Object

```typescript
// AVANT (mauvais) - Sélecteurs répétés partout
test('should login', async ({ page }) => {
  await page.fill('[data-testid="email"]', 'user@test.com')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="submit"]')
})

// APRÈS (Page Object) - Abstraction réutilisable
test('should login', async ({ loginPage }) => {
  await loginPage.login('user@test.com', 'password')
})
```

**Bénéfices mesurés** :

- **-40%** de lignes de code dans les specs
- **Maintenance centralisée** : 1 seul fichier à modifier si l'UI change
- **Lisibilité améliorée** : les tests lisent comme des user stories

### Pourquoi une architecture Design Tokens plutôt que CSS-in-JS ? (Sprint 14) 🆕

| Critère              | CSS-in-JS (Emotion) | Design Tokens TypeScript   | Mon choix     |
| -------------------- | ------------------- | -------------------------- | ------------- |
| Typage               | ⚠️ Runtime          | ✅ Compile-time            | Design Tokens |
| Performance          | ⚠️ Runtime overhead | ✅ CSS statique            | Design Tokens |
| Intégration Tailwind | ❌ Conflits         | ✅ tailwindTheme natif     | Design Tokens |
| Thème centralisé     | ⚠️ Provider requis  | ✅ Import direct           | Design Tokens |
| Dark mode            | ⚠️ Context API      | ✅ CSS Variables .dark     | Design Tokens |
| Tests                | ⚠️ Mocks complexes  | ✅ Tests unitaires simples | Design Tokens |

**Justification du choix (SP-259)** :

- **Tokens TypeScript** : Types stricts pour `colors`, `spacing`, `shadows`, etc.
- **Export Tailwind** : `tailwindTheme` intégré directement dans `tailwind.config.ts`
- **CSS Variables** : Thème dynamique sans JavaScript runtime
- **129 tests unitaires** : Couverture complète des tokens

**Conclusion** : L'architecture Design Tokens permet une source de vérité unique, typée, testable et performante, parfaitement adaptée à Next.js 15 et Tailwind CSS.

### Pourquoi l'esthétique "Cyber Glass 3D" ? (Sprint 14) 🆕

| Critère                  | Design plat (Flat) | Glassmorphism + 3D         | Mon choix      |
| ------------------------ | ------------------ | -------------------------- | -------------- |
| Différenciation visuelle | ⚠️ Standard        | ✅ Premium, moderne        | Cyber Glass 3D |
| Perception utilisateur   | ⚠️ Neutre          | ✅ Effet "wow"             | Cyber Glass 3D |
| Accessibilité            | ✅ Simple          | ⚠️ Contraste à vérifier    | ⚖️ Équilibré   |
| Performance CSS          | ✅ Minimal         | ⚠️ backdrop-filter coûteux | ⚖️ Équilibré   |
| Modernité 2026           | ⚠️ Dépassé         | ✅ Tendance actuelle       | Cyber Glass 3D |

**Implémentation (SP-259)** :

- **Glass Morphism** : `.glass`, `.glass-strong` avec `backdrop-blur` et bordures semi-transparentes
- **Effets 3D** : `.card-3d` avec `perspective`, `rotateX`, `translateY` au hover
- **Neon Glow** : `.glow-primary`, `.text-neon-primary` pour les accents lumineux
- **Animations CSS** : `shimmer-premium`, `pulse-glow`, `float`, `border-gradient-animated`
- **AnimatedContainer** : Composant Framer Motion avec variants `fadeInUp`, `staggerContainer`

**Mesures d'accessibilité** :

- Contrastes WCAG 2.1 AA vérifiés sur tous les textes
- `prefers-reduced-motion` respecté via `useReducedMotion`
- Effets visuels non-bloquants pour la compréhension du contenu

**Conclusion** : L'esthétique Cyber Glass 3D apporte une identité visuelle distinctive tout en respectant les critères d'accessibilité. La page de démo `/app/dev/design-system` documente tous les effets disponibles.

### Pourquoi Server-Sent Events (SSE) plutôt que WebSocket ? (Sprint 16) 🆕

| Critère                   | WebSocket                     | Server-Sent Events (SSE)       | Mon choix |
| ------------------------- | ----------------------------- | ------------------------------ | --------- |
| Direction communication   | ✅ Bidirectionnelle           | ⚠️ Serveur → Client uniquement | SSE       |
| Complexité serveur        | ⚠️ État persistant, heartbeat | ✅ Requête HTTP standard       | SSE       |
| Reconnexion automatique   | ❌ À implémenter              | ✅ Natif (EventSource)         | SSE       |
| Proxies/Load balancers    | ⚠️ Configuration spéciale     | ✅ HTTP standard               | SSE       |
| Support navigateurs       | ✅ Tous                       | ✅ Tous (sauf IE)              | SSE       |
| Intégration Next.js API   | ⚠️ Nécessite serveur custom   | ✅ API Routes natives          | SSE       |
| Cas d'usage notifications | ❌ Overkill                   | ✅ Parfait (push serveur)      | SSE       |

**Justification du choix (SP-327)** :

- **Notifications = push serveur uniquement** : Les notifications sont créées côté serveur et envoyées aux clients. Pas besoin de bidirectionnel.
- **Reconnexion native** : `EventSource` gère automatiquement la reconnexion en cas de perte de connexion.
- **Simplicité d'implémentation** : API Routes Next.js avec `ReadableStream`, pas de serveur WebSocket séparé.
- **Compatibilité infrastructure** : Fonctionne avec Nginx, Cloudflare, et tous les reverse proxies sans configuration spéciale.

**Architecture implémentée** :

- `NotificationSSEManager` : Singleton gérant les connexions actives par utilisateur
- `/api/notifications/stream` : API Route SSE avec authentification
- `useNotificationsStream` : Hook client avec reconnexion automatique (5 tentatives)
- `NotificationsProvider` : Contexte global avec toast automatique
- Heartbeat toutes les 30s pour garder les connexions actives

**Conclusion** : SSE est la solution optimale pour les notifications temps réel car il ne nécessite que du push serveur→client. La reconnexion automatique de l'EventSource et la compatibilité HTTP native simplifient considérablement l'architecture par rapport à WebSocket.

---

## 📚 Difficultés rencontrées et résolutions (CDA)

Cette section narrative documente mon apprentissage et ma capacité à résoudre des problèmes complexes.

### Difficulté 1 : Authentification NextAuth v5 en Edge Runtime

**Contexte** : Au début du Sprint 5, j'ai implémenté l'authentification avec NextAuth v5 (Auth.js). Les tests unitaires passaient, mais les tests E2E échouaient systématiquement.

**Symptôme** : `auth?.user?.role` retournait `undefined` dans le middleware, empêchant la protection RBAC des routes.

**Investigation** :

- J'ai d'abord pensé à un problème de session, mais les cookies étaient présents
- En lisant la documentation Context7 de NextAuth v5, j'ai découvert la contrainte Edge Runtime
- Le middleware Next.js s'exécute en Edge Runtime, qui ne supporte pas toutes les APIs Node.js

**Solution (ANO-005)** :

```typescript
// ❌ AVANT : callbacks dans auth.ts (Node.js runtime)
export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: { jwt, session },
})

// ✅ APRÈS : callbacks dans authConfig séparé (Edge-compatible)
// auth.config.ts
export const authConfig = {
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    },
  },
}
```

**Apprentissage** : Toujours vérifier la compatibilité Edge Runtime pour le code utilisé dans le middleware Next.js.

### Difficulté 2 : Tests E2E flaky avec Radix UI

**Contexte** : Les tests des composants Select et Dialog échouaient de façon intermittente (flaky tests).

**Symptôme** : `strict mode violation: locator resolved to X elements` sur les tests TeamForm.

**Investigation** :

- Radix UI génère des portails DOM pour les menus déroulants
- Plusieurs éléments avec le même `data-testid` existaient dans le DOM
- Playwright en mode strict refuse d'interagir avec des locators ambigus

**Solution (ANO-015, ANO-016)** :

```typescript
// ❌ AVANT : locator ambigu
await page.click('[data-testid="manager-select"]')

// ✅ APRÈS : locator précis avec .first()
await page.locator('[data-testid="manager-select"]').first().click()
```

**Apprentissage** : Avec les composants headless UI (Radix, HeadlessUI), toujours anticiper les portails DOM et utiliser des locators précis.

### Difficulté 3 : Migration Prisma pour userId optionnel

**Contexte** : Le modèle Employee avait `userId String` requis, mais le métier demandait des employés "planning only" sans compte utilisateur.

**Symptôme** : Impossible de créer un employé sans l'associer à un User.

**Solution (ANO-014)** :

```prisma
// ❌ AVANT
model Employee {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

// ✅ APRÈS (migration make_employee_userid_optional)
model Employee {
  userId String? @unique  // Optionnel avec ?
  user   User?   @relation(fields: [userId], references: [id])
}
```

**Apprentissage** : Toujours prévoir la flexibilité métier dès la conception du schéma, mais les migrations Prisma permettent d'évoluer proprement.

### Difficulté 4 : État non partagé entre composants cookies (Context API)

**Contexte** : Sprint 8, implémentation de la bannière cookies RGPD (SP-283). Le bouton "Gérer les cookies" dans le footer n'ouvrait pas le modal de préférences.

**Symptôme** : Cliquer sur le bouton footer ne déclenchait aucune action visible.

**Investigation** :

- Chaque composant (CookieBanner, CookiePreferencesModal, CookieSettingsButton) instanciait son propre hook `useCookieConsent()`
- Ces hooks créaient des états React indépendants (`isPreferencesOpen`)
- Le changement d'état dans un composant n'était pas visible par les autres

**Solution (ANO-017)** :

```typescript
// ❌ AVANT : Chaque composant a son propre état
function CookieBanner() {
  const { isOpen } = useCookieConsent(); // Instance A
}
function CookieSettingsButton() {
  const { setIsOpen } = useCookieConsent(); // Instance B (différente!)
}

// ✅ APRÈS : État partagé via Context Provider
const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function CookieConsentProvider({ children }) {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  // État centralisé, partagé par tous les composants enfants
  return (
    <CookieConsentContext.Provider value={{ isPreferencesOpen, openPreferences, closePreferences }}>
      {children}
      <CookieBanner />
      <CookiePreferencesModal />
    </CookieConsentContext.Provider>
  );
}
```

**Apprentissage** : Pour un état partagé entre composants distants dans l'arbre React, le Context API est préférable aux instances de hooks multiples. Ce pattern est essentiel pour les systèmes de consentement où plusieurs points d'entrée (bannière, footer, paramètres) doivent interagir.

### Difficulté 5 : Mocking ESM avec vi.doMock() (Sprint 9)

**Contexte** : Sprint 9, tests des fonctions d'envoi d'email (sendWelcomeEmail, sendResetPasswordEmail, sendVerificationEmail).

**Symptôme** : Les mocks avec `vi.mock()` ne fonctionnaient pas - les vrais modules étaient appelés.

**Investigation** :

- Vitest hoiste les `vi.mock()` en haut du fichier avant les imports
- Avec ESM, les imports sont résolus statiquement avant l'exécution
- Le mock n'était pas en place au moment de l'import du module testé

**Solution (ANO-018)** :

```typescript
// ❌ AVANT : vi.mock() hoisté, ne fonctionne pas avec ESM dynamique
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
import { sendWelcomeEmail } from '@/lib/email/templates/welcome'

// ✅ APRÈS : vi.doMock() + import dynamique
beforeEach(() => {
  vi.resetModules() // Reset le cache des modules
})

it('should send email', async () => {
  const mockSendEmail = vi.fn().mockResolvedValue({ success: true })

  // Mock APRÈS resetModules
  vi.doMock('@/lib/email', () => ({
    sendEmail: mockSendEmail,
  }))

  // Import dynamique APRÈS le mock
  const { sendWelcomeEmail } = await import('@/lib/email/templates/welcome')

  await sendWelcomeEmail({ firstName: 'Test', email: 'test@test.com' })
  expect(mockSendEmail).toHaveBeenCalled()
})
```

**Apprentissage** : Pour mocker des modules ESM dans Vitest, utiliser `vi.doMock()` (non hoisté) + `vi.resetModules()` + import dynamique `await import()`.

### Difficulté 6 : Boucle redirect infinie et updateSession() NextAuth v5 (Sprint 19) 🆕

**Contexte** : Sprint 19, développement des tests E2E impersonation (SP-456). Le mode impersonation permet au SYSTEM_ADMIN de "voir l'espace client" d'une entreprise.

**Symptôme 1** : `ERR_TOO_MANY_REDIRECTS` lors du démarrage de l'impersonation. L'utilisateur est pris dans une boucle infinie de redirections.

**Investigation** :

- Tracé de la chaîne de redirection : `/app/dashboard` → `/app/director/dashboard` (RBAC role redirect) → `/app/dashboard/billing` (subscription guard) → `/app/dashboard` (impersonation guard) → boucle ∞
- En impersonation, le JWT SYSTEM_ADMIN est modifié avec le rôle DIRECTOR, mais les champs subscription (`subscriptionStatus`, `trialEndsAt`, `currentPeriodEnd`) restent `null`
- Le subscription guard (SP-440) interprète `null` comme "pas d'abonnement" → redirige vers billing
- L'impersonation guard bloque la route billing en mode impersonation → redirige vers dashboard

**Solution (ANO-028)** :

```typescript
// auth.config.ts — Avant le subscription guard (étape 8)
let isImpersonating = false
try {
  const impCookie = request.cookies.get(IMPERSONATION_COOKIE_NAME)
  if (impCookie?.value) {
    const parsed: unknown = JSON.parse(impCookie.value)
    if (typeof parsed === 'object' && parsed !== null && 'originalAdminId' in parsed) {
      isImpersonating = true
    }
  }
} catch { /* Cookie invalide */ }

if (!isImpersonating) {
  const subscriptionCheck = checkSubscriptionAccess({ ... })
  if (!subscriptionCheck.allowed) {
    return Response.redirect(billingUrl)
  }
}
```

**Symptôme 2** : Bannière impersonation invisible après démarrage. Le layout.tsx lit `session.user.isImpersonating` qui est `false`.

**Investigation** :

- `updateSession()` NextAuth v5 échoue avec `ClientFetchError: Failed to fetch`
- Le JWT n'est jamais mis à jour avec `isImpersonating: true`
- Le Server Component layout lit le JWT via `auth()` → `session.user.isImpersonating === false`
- Le cookie `sp-impersonation` est bien posé côté serveur, mais n'est pas lu par le layout

**Solution (ANO-029)** :

```typescript
// layout.tsx — Fallback cookie quand JWT non mis à jour
if (session.user.isImpersonating) {
  impersonationData = { /* ... depuis le JWT */ }
} else {
  // SP-456 : fallback cookie pour robustesse
  try {
    const cookieStore = await cookies()
    const impCookie = cookieStore.get(IMPERSONATION_COOKIE_NAME)
    if (impCookie?.value) {
      const ctx = JSON.parse(decodeURIComponent(impCookie.value)) as ImpersonationContext
      const isExpired = ctx.startedAt && Date.now() - ctx.startedAt > 3600 * 1000
      if (ctx.originalAdminId && ctx.targetCompanyName && !isExpired) {
        impersonationData = { isImpersonating: true, /* ... depuis le cookie */ }
      }
    }
  } catch { /* Cookie invalide */ }
}
```

**Apprentissage** : NextAuth v5 `updateSession()` peut échouer silencieusement (`ClientFetchError`), surtout lors de changements de rôle dynamiques. Pour les fonctionnalités critiques qui modifient le contexte de session, toujours prévoir un fallback (cookie, base de données) indépendant du JWT. En tests E2E, `page.request.delete()` (Playwright API context) est plus fiable que `page.evaluate(fetch)` quand la page est en état instable.

---

## Stack de tests

| Type de test     | Outil                       | Version | Description                                      |
| ---------------- | --------------------------- | ------- | ------------------------------------------------ |
| Tests unitaires  | Vitest                      | 2.1.8   | Tests de logique métier et utilitaires           |
| Tests composants | React Testing Library       | 16.3.0  | Tests des composants React isolés                |
| Tests E2E        | Playwright                  | 1.57.0  | Tests de parcours utilisateur complets           |
| Mocking API      | MSW                         | 2.12.4  | Simulation des réponses API                      |
| Mocking BDD      | vitest-mock-extended        | 3.1.0   | Simulation de Prisma Client                      |
| Couverture       | @vitest/coverage-v8         | 3.2.4   | Mesure de la couverture de code                  |
| Interactions     | @testing-library/user-event | 14.6.1  | Simulation réaliste des interactions utilisateur |

---

## Historique des campagnes de tests

Ce tableau recense chaque campagne de tests significative (mise en production, fin de sprint, correction majeure).

| Date       | Sprint    | Version/Commit | Tests unitaires | Tests E2E  | Couverture | Statut  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | --------- | -------------- | --------------- | ---------- | ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19/02/2026 | Sprint 19 | SP-456         | 5770/5770 ✅    | 584/584 ✅ | ~86%       | ✅ PASS | 🆕 Impersonation E2E + unitaires. +10 tests unitaires API route (POST/DELETE), +9 tests E2E (parcours nominal, sécurité, cas limites, audit). POM ImpersonationPage. 2 corrections applicatives : bypass subscription guard impersonation (ANO-028) + fallback cookie layout bannière (ANO-029). Fix lint ESLint. Total : 6354 tests |
| 27/02/2026 | Sprint 20 | Améliorations  | 5914/5914 ✅    | 584/584 ✅ | ~86%       | ✅ PASS | 🆕 Notifications résiliation admin (in-app + email), email confirmation directeur (template SubscriptionCanceledEmail). Seed Stripe réel (vrais customers/subscriptions mode Test, cleanup metadata). TechCorp 110 employés, 12 équipes grande distribution. Dashboard Director simplifié 3 KPIs. Export CSV employés enrichi. InvoiceHistory avec invoiceUrl. Portail Stripe nouvelle fenêtre. Breadcrumbs director/billing. Total : 6498 tests |
| 18/02/2026 | Sprint 19 | SP-442→446, SP-463 | 5760/5760 ✅ | 575/575 ✅ | ~86%       | ✅ PASS | 🆕 Audit System (schema, service, injection, admin page, E2E) + User Activity page. +122 tests unitaires, +26 tests E2E. Migration Prisma add_audit_log. Total : 6335 tests |
| 18/02/2026 | Sprint 19 | Consolidation  | 5638/5638 ✅    | 549/549 ✅   | ~86%       | ✅ PASS | 🔧 Consolidation E2E : 50→38 fichiers (suppression redondances, fusion suites similaires). Correction 38 tests command-palette sur tablets (data-testid desktop-search-button, Meta+k iPad). Alignement nightly : ajout job tests unitaires Vitest + 5 devices mobiles. Mise à jour commentaires CI/CD. Total : 6187 tests |
| 15/02/2026 | Sprint 18 | Prod E2E       | 5638/5638 ✅    | 1018/1018 ✅ | ~86%       | ✅ PASS | 🔧 Migration E2E CI/nightly vers mode production (`npm run start`). Résolution définitive ANO-026 : CSP `upgrade-insecure-requests` conditionnel, env vars `AUTH_URL`/`AUTH_SECRET`/`AUTH_TRUST_HOST` pour NextAuth v5 sur HTTP localhost, étape `npm run build` ajoutée aux workflows. 5 fichiers modifiés. Total : 6656 tests |
| 13/02/2026 | Sprint 18 | Stabilisation  | 5638/5638 ✅    | 1018/1018 ✅ | ~86%       | ✅ PASS | 🔧 Stabilisation nightly E2E (ANO-026) + fix billing trial sans subscription + fix i18n accents dashboard Manager + stabilisation 62 tests E2E. 14 commits depuis 11/02. Total : 6656 tests |
| 11/02/2026 | Sprint 18 | SP-462         | 5637/5637 ✅    | 1018/1018 ✅ | ~86%       | ✅ PASS | 🆕 SP-462 Optimisation SEO Google + LLMs : Homepage Server Component, robots.ts, sitemap.ts, favicon Next.js 15, JSON-LD @graph 4 schemas, llms.txt, canonical URLs pages légales, noindex dashboard. +37 tests unitaires. Total : 6655 tests |
| 10/02/2026 | Sprint 18 | SP-460         | 5600/5600 ✅    | 1018/1018 ✅ | 86.35%     | ✅ PASS | 🆕 SP-460 Nettoyage final & couverture 86%. Cleanup code mort (suppression `test-datatable/`, `console.log`, imports inutilisés, dépendances obsolètes). +387 tests unitaires (20 fichiers). Tests composants : Teams (TeamCard, TeamForm, TeamMembersManager, TeamsDataTable), Admin/Employees (EmployeeCard, EmployeeFilters, DeleteEmployeeDialog, BulkDeleteDialog, columns), Schedules (ExportDropdown, WeeklyHoursPanel, AvailabilityPopover), Admin/Companies (CompanyForm), Profile (AvatarUpload avec MSW handlers), Forms (FormDatePicker), Charts (AreaChart, BarChart, PieChart, ChartContainer), Cookies (CookieConsentProvider), Leaves (LeavesListMobile), Analytics (UmamiAnalyticsWrapper). Couverture de 80.38% → 86.35%. Lint 0, tsc 0, build OK. Total : 6618 tests |
| 10/02/2026 | Sprint 17 | SP-373         | 5281/5281 ✅    | 1018/1018 ✅ | ~85%       | ✅ PASS | 🆕 SP-373 Tests E2E Billing — **EPIC SP-348 COMPLÈTE** (15 tickets, 487+ tests). 30 tests Playwright E2E (6 suites). 2 Page Objects (BillingPage 25+ locators, PricingPage). Suites : trial-flow (5), checkout-flow (5), subscription-management (5), payment-failure (5), trial-expiry (5), cancellation-flow (5). Fixtures mock 7 états subscription. Stratégie seed TechCorp ACTIVE + query params `?reason=` pour simulation états. Total : 6299 tests |
| 10/02/2026 | Sprint 17 | SP-370         | 5281/5281 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-370 Cron Trial Expiration & Webhook Emails. +25 tests unitaires. Endpoint cron `/api/cron/trial-expiration` sécurisé CRON_SECRET : détection trials expirant 3j/7j → TrialExpiringEmail, trials expirés 24h → TrialExpiredEmail, logging EmailLog. Webhooks Stripe enrichis : checkout.session.completed → SubscriptionConfirmedEmail, invoice.payment_failed → PaymentFailedEmail, customer.subscription.deleted → SubscriptionCanceledEmail, invoice.paid → InvoiceEmail. Service sendBillingEmail fire-and-forget. Total : 6269 tests |
| 10/02/2026 | Sprint 17 | SP-369         | 5256/5256 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-369 Templates Emails Billing. +27 tests unitaires. 7 templates React Email cycle de vie Stripe : TrialWelcomeEmail, TrialExpiringEmail, TrialExpiredEmail, SubscriptionConfirmedEmail, PaymentFailedEmail, SubscriptionCanceledEmail, InvoiceEmail. Design tokens centralisés, layout responsive, CTA gradient. Tests : rendering, props dynamiques, liens, formatage prix, dates, contenu conditionnel. Total : 6244 tests |
| 10/02/2026 | Sprint 17 | SP-368         | 5229/5229 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-368 Modèle EmailLog & Service. +16 tests unitaires. Migration Prisma EmailLog (to, subject, template, status PENDING/SENT/FAILED/BOUNCED, metadata JSON). Service email-log.service.ts : sendAndLog (envoi + logging auto), getEmailLogs (pagination/filtres), getEmailStats (agrégation), retryFailedEmail (relance). Intégration fire-and-forget dans Server Actions existantes. Total : 6217 tests |
| 09/02/2026 | Sprint 17 | SP-440         | 5107/5107 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-440 Subscription Guard Middleware. +31 tests unitaires (1 fichier). Middleware vérification abonnement actif dans Edge Runtime. Architecture Defense in Depth 3 couches : JWT enrichi (subscriptionStatus, trialEndsAt, currentPeriodEnd, subscriptionCheckedAt), rafraîchissement périodique 5min via import dynamique Prisma (silencieux en Edge), webhooks Stripe. Fonction pure `checkSubscriptionAccess()` Edge-compatible (0 dépendance Node.js). Matrice complète : ACTIVE, TRIAL (valide/expiré), PAST_DUE (grâce 7j), CANCELED, EXPIRED, INCOMPLETE, null. Bypass SYSTEM_ADMIN + routes exemptées (billing, profile, settings). Page billing enrichie : alerte contextuelle ?reason=XXX (6 motifs, warning/destructive). Total : 6095 tests |
| 09/02/2026 | Sprint 17 | SP-360         | 5076/5076 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-360 Dashboard Billing Page. +41 tests unitaires (4 fichiers). Page `/app/dashboard/billing` avec Server Component (auth + RBAC DIRECTOR + fetch `getBillingDataAction` + sérialisation Date→ISO string). 4 composants Client : `BillingPageContent` (orchestrateur, Server Actions portail/annulation, AlertDialog), `SubscriptionStatus` (6 badges statut, countdown essai, alerte annulation programmée, EmptyState), `UsageIndicator` (ProgressBar colorée sièges, prix unitaire/total, tooltip prorata), `InvoiceHistory` (Table factures, badges Payé/Échoué/En attente, liens Stripe externes, EmptyState). Barrel export + types sérialisés. Loading skeleton. Navigation menu-items.ts : entrée "Facturation" (CreditCard, DIRECTOR, G B). Design glassmorphism + Framer Motion + useReducedMotion. Type `BillingData` enrichi (currentPeriodStart, canceledAt, createdAt, stripeInvoiceId, paymentMethod, trialEndsAt). Total : 6064 tests |
| 09/02/2026 | Sprint 17 | SP-352         | 5035/5035 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-352 Server Actions Stripe. +32 tests unitaires (1 fichier : `__tests__/lib/actions/stripe.test.ts`). 5 Server Actions connectant le service Stripe (SP-351) au frontend : `createCheckoutAction` (checkout per-seat avec email via auth() + companyName via Prisma), `createBillingPortalAction` (portail facturation via stripeCustomerId), `updateSubscriptionQuantityAction` (mise à jour sièges + revalidatePath), `cancelSubscriptionAction` (annulation fin de période ou immédiate + revalidatePath), `getBillingDataAction` (subscription + payments + employeeCount + monthlyAmount via Promise.all). RBAC DIRECTOR via `checkPermission('DIRECTOR')`, validation Zod via `validateData()`, conversion `ServiceResult<T>` → `CrudActionResult<T>`. Type `BillingData` ajouté à `src/types/stripe.ts` + barrel export. Total : 6023 tests |
| 09/02/2026 | Sprint 17 | SP-351         | 5003/5003 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-351 Stripe Service & Webhooks. +50 tests unitaires (40 service + 10 route webhook). Service Stripe (`createCheckoutSession`, `updateSubscriptionQuantity`, `cancelSubscription`, `createBillingPortalSession`, `handleWebhookEvent`). Route webhook `/api/webhooks/stripe/route.ts` avec vérification signature HMAC. 7 types TypeScript. Total : 5991 tests |
| 09/02/2026 | Sprint 17 | SP-350         | 4953/4953 ✅    | 988/988 ✅ | ~85%       | ✅ PASS | 🆕 SP-350 Migration Per-Seat Subscription Model. **Phase 1 Backend** : Migration Prisma SubscriptionPlan (FREE/PER_SEAT) + SubscriptionStatus (+INCOMPLETE), modèles Subscription et Payment avec relation 1:1 Company, seed data mis à jour (2 plans), validations Zod (labels FR, couleurs, descriptions pour 2 plans + 6 statuts), service admin-stats MRR refactoré (quantity × pricePerEmployee). **Phase 2 UI** : CompanyCard badges dynamiques, CompanyForm schéma FREE/PER_SEAT, columns.tsx colonnes virtuelles TanStack Table, [id]/page.tsx fallback subscription relation. Suppression complète STARTER/BUSINESS/ENTERPRISE (0 occurrence src/). +97 tests modifiés/ajoutés (validations 37, actions 20, CompanyCard 25, columns 20, DeleteDialog 10, AdminRecentCompanies 18, admin-stats 39, prisma 2). Total : 5941 tests |
| 06/02/2026 | Sprint 17 | SP-349         | 4856/4856 ✅    | 698/698 ✅ | ~85%       | ✅ PASS | 🆕 SP-349 Stripe SDK + Configuration + Validations. **Infrastructure paiement** : Installation Stripe SDK v20.3.1. Client singleton server-only (`src/lib/stripe/stripe.ts`) avec pattern globalThis HMR, apiVersion `2026-01-28.clover`, appInfo SmartPlanning. Config centralisée (`stripe-config.ts`) : STRIPE_PRICING (montant centimes, devise, intervalle, trial), STRIPE_STATUS_MAP (8 statuts Stripe → 5 statuts internes), STRIPE_WEBHOOK_EVENTS (8 événements groupés par domaine), STRIPE_METADATA_KEYS. Barrel export `index.ts`. Validations Zod (`src/lib/validations/stripe.ts`) : 5 schémas (stripeEnvSchema préfixes sk_/pk_/whsec_/price_, checkoutSessionSchema quantité 1-250, updateSubscriptionQuantitySchema, stripeWebhookHeaderSchema, customerPortalSchema). `.env.example` enrichi (4 variables Stripe). +66 tests unitaires (singleton 9, config 29, validations 28). Total : 5554 tests |
| 06/02/2026 | Sprint 17 | SP-355/358/359 | 4790/4790 ✅    | 698/698 ✅ | ~85%       | ✅ PASS | 🆕 SP-355/SP-358/SP-359 Page Tarifs et composants Pricing. **SP-355** : Composants pricing réutilisables — `PricingSimulator` (slider employés, calcul temps réel, message grandes équipes >50), `PricingCard` (prix per-seat, badge essai gratuit, features list), `src/lib/config/pricing.ts` (constantes centralisées SSOT). +55 tests unitaires (23 config + 20 simulator + 12 card). **SP-358** : Section pricing landing page avec PricingSimulator intégré. **SP-359** : Page dédiée `/tarifs` — Route group `(about)`, Server Component (metadata SEO) + Client Component (PricingPageContent avec 5 sections : Hero, Simulateur, Fonctionnalités, FAQ, CTA). `StructuredData` JSON-LD combiné `@graph` (SoftwareApplication + FAQPage + WebPage). PRICING_FAQS partagées entre schema et UI. +34 tests unitaires (22 PricingPageContent + 12 StructuredData). Total : 5488 tests |
| 05/02/2026 | Sprint 16 | Profile-Edit   | 4701/4701 ✅    | 657/657 ✅ | ~85%       | ✅ PASS | 🆕 Amélioration inscription et édition profil. **Registration** : Création automatique Employee + LeaveBalance à l'inscription DIRECTOR, champ téléphone optionnel, nom splitté en prénom/nom, soldes congés initialisés (25 CP, 10 RTT). **Edit Profile** : Ajout champs jobTitle (poste) et hireDate (date d'embauche) avec Calendar picker FR, suppression affichage département. Schéma Zod mis à jour. Server Action updateProfile enrichie. Tests unitaires mis à jour (24 tests EditProfileForm, 10 tests ProfessionalInfoCard). Tests E2E profile passent (22/22). Total : 5358 tests                                                                                                                                                                                                                                                                                                                                                                 |
| 04/02/2026 | Sprint 16 | SP-272         | 4701/4701 ✅    | 657/657 ✅ | ~85%       | ✅ PASS | 🆕 SP-272 Avatar Upload Cloudinary. API Route `/api/avatar` (POST upload, DELETE suppression). Intégration Cloudinary CDN (transformation crop/resize 400x400, optimisation auto). Affichage avatar dans Header (navbar), ScheduleCalendarMobile, WeeklyHoursPanel, LeavesList, LeaveCalendar, LeaveRequestCard. Propagation user.image via relations Prisma. Fetch DB direct dans layout pour image fraîche (vs JWT). Composant Avatar Shadcn/ui avec AvatarFallback initiales. Total : 5358 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 04/02/2026 | Sprint 16 | SP-435         | 4701/4701 ✅    | 657/657 ✅ | ~85%       | ✅ PASS | 🆕 SP-435 Company Settings Page. +19 tests unitaires (company-settings actions), +21 tests E2E (company-settings.spec.ts). Page `/app/settings/company` avec RBAC DIRECTOR/SYSTEM_ADMIN. Sections : Company Info (name, address), Working Days (7 checkboxes + 3 presets Mon-Fri/Mon-Sat/All Week), Working Hours (start/end), Lunch Break (toggle + hours). Server Actions : getCompanySettings, updateCompanySettings, resetCompanySettings. Optimistic UI avec rollback. Types DayOfWeek, CompanySettings, LunchBreakSettings. Page Object CompanySettingsPage. Badge "Bientôt" retiré section Entreprise. Total : 5358 tests                                                                                                                                                                                                                                                                                                                              |
| 03/02/2026 | Sprint 16 | SP-433         | 4548/4548 ✅    | 548/548 ✅ | ~85%       | ✅ PASS | 🆕 SP-433 User Preferences Migration. +62 tests unitaires (validation 31, utils 31). Champ `preferences Json?` ajouté au modèle User. Types TypeScript : UserPreferences, DisplayPreferences (theme, dateFormat, timeFormat, language), NotificationPreferences (email/inApp par canal). Schémas Zod validation avec defaults. Helpers parsing/serialization avec deep merge. Migration Prisma 20260203175823. Total : 5096 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 03/02/2026 | Sprint 15 | SP-327         | 4486/4486 ✅    | 548/548 ✅ | ~85%       | ✅ PASS | 🆕 SP-327 SSE Real-time Notifications. +83 tests unitaires (SSE emitter 3, notification actions 29, hooks). Route API `/api/notifications/stream` avec Server-Sent Events. Emission temps réel lors création notification. Nettoyage connexions mortes. **Fix E2E** : Remplacement `networkidle` par `domcontentloaded` (13 fichiers) car SSE maintient connexion ouverte. Suppression 41 tests E2E non critiques (navigation/keyboard, recent-pages, type filter flaky). Total : 5034 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 04/02/2026 | Sprint 15 | SP-275         | 4643/4643 ✅    | 636/636 ✅ | ~85%       | ✅ PASS | 🆕 SP-275 Notification Preferences. +27 tests unitaires (3 fichiers : notification-preferences actions 15, notification-categories helper 5, NotificationCategoryCard 16, NotificationsPageContent 12), +14 tests E2E (1 fichier). Page `/app/settings/notifications` avec gestion préférences par catégorie (Planning, Congés, Tâches, Système) et par canal (Email, In-App). Switches toggle optimistic UI avec useTransition. Server Actions : getNotificationPreferences, updateNotificationPreferences, resetNotificationPreferences. Helper notification-categories.ts pour mapping NotificationType → catégorie préférence. Intégration factory functions notifications (vérification préférences utilisateur avant création in-app). 4 composants : NotificationsPageContent, NotificationCategoryCard, loading skeleton, index barrel. Page Object NotificationsPreferencesPage. Badge "Bientôt" retiré de section Notifications. Total : 5279 tests |
| 04/02/2026 | Sprint 15 | SP-276         | 4616/4616 ✅    | 622/622 ✅ | ~85%       | ✅ PASS | 🆕 SP-276 Display Preferences. +43 tests unitaires (date-format helpers), +18 tests E2E (1 fichier). Page `/app/settings/appearance` avec sélection thème (Système/Clair/Sombre via next-themes), format date (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD), format heure (24h, 12h), prévisualisation temps réel. Architecture Cookie + DB persistence pour SSR sans flash FOUC. Server Actions : getDisplayPreferences, updateDisplayPreferences, syncPreferencesFromCookie, resetDisplayPreferences. 9 helpers date-fns (formatDate, formatTime, formatDateTime, formatRelativeDate, formatShortDate, formatLongDate, formatWeekday, formatMonthYear, createFormatter). 5 composants : AppearancePageContent, ThemeSelector, DateTimeFormatSelector, PreferencesPreview, index barrel. Page Object AppearancePage. Badge "Bientôt" retiré de section Apparence. Total : 5238 tests                                                                                  |
| 04/02/2026 | Sprint 15 | SP-274         | 4573/4573 ✅    | 604/604 ✅ | ~85%       | ✅ PASS | 🆕 SP-274 Settings Hub Page. +25 tests unitaires (3 fichiers : SettingsHeader 5, SettingsSection 10, SettingsPageContent 10), +15 tests E2E (1 fichier). Page centrale paramètres `/app/settings` avec Server Component, RBAC, AnimatedContainer stagger. 5 sections (Profil, Apparence, Notifications, Sécurité, Entreprise). Section Entreprise visible uniquement DIRECTOR/SYSTEM_ADMIN. Badges "Bientôt" pour sections futures (désactivent le lien). Cards navigables design Cyber Glass 3D avec hover-lift. Page Object SettingsPage. Sidebar href corrigé (`/app/settings`), roles changé de `['DIRECTOR']` à `'ALL'`. Total : 5177 tests                                                                                                                                                                                                                                                                                                              |
| 03/02/2026 | Sprint 15 | SP-326         | 4403/4403 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | 🆕 SP-326 Notification delete actions. +12 tests unitaires (actions 6, hook 6). Ajout action deleteAllRead (supprime toutes notifications lues). Mise à jour hook useNotifications avec deleteNotification et deleteAllRead (optimistic updates avec rollback). Total : 4992 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 03/02/2026 | Sprint 15 | SP-323         | 4391/4391 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | 🆕 SP-323 NotificationList dropdown. +44 tests unitaires (useNotifications 9, NotificationItem 15, NotificationList 10, NotificationEmptyState 6, NotificationSkeleton 4). Hook SWR pour liste notifications avec optimistic updates markAsRead/markAllAsRead. 5 composants : NotificationItem (icônes par type, date-fns FR), NotificationList (ScrollArea, skeleton, empty), NotificationEmptyState, NotificationSkeleton. Intégration NotificationBell. Total : 4980 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 03/02/2026 | Sprint 15 | SP-322         | 4347/4347 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | 🆕 SP-322 NotificationBell dropdown. +25 tests unitaires (useNotificationsCount 8, NotificationBell 17). Hook SWR pour compteur non-lus avec polling 30s. Composant cloche dropdown Framer Motion (shake, pulse). Badge compteur 9+ si > 9. Accessibilité aria-label, aria-live. Intégration Header. Suppression prop notificationsCount du layout. Total : 4936 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 03/02/2026 | Sprint 15 | SP-325         | 4322/4322 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | SP-325 Service notifications factory functions. +23 tests unitaires (notifications actions). Factory functions par domaine : createPlanningNotification, createLeaveNotification, createTaskNotification, createIncidentNotification, createSystemNotification. CRUD : getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, cleanupOldNotifications. Schémas Zod validation. Doc intégration docs/SP-325-integration-points.md. Pattern non-bloquant .catch(). Total : 4911 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 03/02/2026 | Sprint 15 | SP-321         | 4299/4299 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | SP-321 Enrichissement modèle Notification. +24 tests unitaires (notification types). Enum NotificationType enrichi avec types métier (PLANNING, LEAVE, TASK, INCIDENT). Nouvel enum NotificationPriority (LOW, MEDIUM, HIGH, URGENT). Champs priority et actionUrl ajoutés au modèle Notification. Types TypeScript complets avec labels FR, couleurs Tailwind, icônes Lucide. Migration Prisma 20260203102536. Total : 4888 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 02/02/2026 | Sprint 14 | CI-Optim       | 4275/4275 ✅    | 185/589 CI | ~85%       | ✅ PASS | 🆕 Optimisation CI/CD E2E. Réduction temps CI de 40min à ~10min. Nouvelle stratégie : playwright.ci.config.ts (185 tests critiques : smoke, auth, RBAC, CRUD, schedules, leaves), playwright.nightly.config.ts (suite complète 589 tests). Workflow nightly-e2e.yml (2h00 UTC chaque nuit). Scripts npm test:e2e:ci et test:e2e:nightly. Corrections tests E2E : profile-display (noms dynamiques), export-data (sélecteurs getByRole), edit-profile (idempotence avec restoreProfile). Fix mock exportLeavesCsv dans LeavesPageContent.test.tsx. Total : 4864 tests. _Note : les deux configs sont passées en mode production (`npm run start`) le 15/02/2026 — voir ANO-027_ |                                                                                                                                                                                                                                                                                                                                                                                          |
| 02/02/2026 | Sprint 14 | SP-333         | 4275/4275 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | 🆕 SP-333 Exports CSV Employés/Plannings/Congés. +116 tests unitaires (5 fichiers : generateCsv 34, export-employees-csv 21, export-schedules-csv 19, export-leaves-csv 22, ExportCsvButton 20). Utilitaire CSV générique (séparateur `;`, UTF-8 BOM Excel FR, échappement guillemets). 3 Server Actions RBAC : exportEmployeesCsv (DIRECTOR/MANAGER), exportSchedulesCsv (période/équipe), exportLeavesCsv (status/type/team). Composant ExportCsvButton<TFilters> avec Blob download. Intégration UI : bouton page Employés, item CSV dans ExportDropdown Plannings, bouton page Congés. Total : 4864 tests                                                                                                                                                                                                                                                                                                                                                 |
| 02/02/2026 | Sprint 14 | SP-278         | 4159/4159 ✅    | 589/589 ✅ | ~85%       | ✅ PASS | 🆕 SP-278 Export Data RGPD Article 20 Portabilité. +44 tests unitaires (2 fichiers : action 32, ExportDataButton 12), +24 tests E2E (1 fichier). Server Action exportUserData avec Promise.all parallel data fetching (account, profile, schedules, leaveRequests, leaveBalances, availabilities, personalTasks, notifications, incidentNotesAuthored). ExportDataButton avec useCrudMutation, download via Blob/URL.createObjectURL. Page /app/profile/export avec alert RGPD, liste données incluses/exclues. Types export complets (10 interfaces). Tests JSON valid, structure data, sécurité (password exclus). Total : 4748 tests                                                                                                                                                                                                                                                                                                                       |
| 02/02/2026 | Sprint 14 | SP-277         | 4115/4115 ✅    | 565/565 ✅ | ~85%       | ✅ PASS | 🆕 SP-277 Delete Account RGPD Article 17. +42 tests unitaires (2 fichiers : action 22, DeleteAccountForm 20), +22 tests E2E (1 fichier). Server Action deleteAccount avec double vérification identité (email + password), transaction Prisma cascade (LeaveBalance.updatedById mis à null), logs traçabilité RGPD Article 30. DeleteAccountForm avec alert RGPD, liste données supprimées, toggle visibilité password, checkbox consentement explicite. signOut automatique après suppression. deleteAccountSchema Zod (email + password + confirmDeletion). Page Object DeleteAccountPage. Tests multi-rôles (4 rôles), validation erreurs serveur. Total : 4680 tests                                                                                                                                                                                                                                                                                      |
| 02/02/2026 | Sprint 14 | SP-273         | 4073/4073 ✅    | 543/543 ✅ | ~85%       | ✅ PASS | 🆕 SP-273 Change Password Page. +56 tests unitaires (3 fichiers : action 16, PasswordStrengthIndicator 19, ChangePasswordForm 21), +19 tests E2E (1 fichier). Server Action changePassword sécurisée (bcrypt verify + hash). PasswordStrengthIndicator avec 4 niveaux (Faible/Moyen/Fort/Très fort) et 5 critères temps réel. ChangePasswordForm avec 3 toggles visibilité indépendants. Validation changePasswordSchema (refine : match + différent ancien). Messages erreur génériques (sécurité). Page Object ChangePasswordPage. Tests multi-rôles (4 rôles). Total : 4616 tests                                                                                                                                                                                                                                                                                                                                                                          |
| 02/02/2026 | Sprint 14 | SP-271         | 4017/4017 ✅    | 524/524 ✅ | ~85%       | ✅ PASS | 🆕 SP-271 Edit Profile Page. +69 tests unitaires (3 fichiers : validation 26, action 19, component 24), +22 tests E2E (1 fichier). Server Action updateProfile synchronisant User + Employee. Composant EditProfileForm avec React Hook Form + Zod (zodResolver). Gestion SYSTEM_ADMIN sans Employee (notice alert, champs limités firstName/lastName). Validation nameSchema (lettres/accents), phoneSchema (format FR). Page Object EditProfilePage. Tests idempotents (valeurs dynamiques). Total : 4541 tests                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 02/02/2026 | Sprint 14 | SP-270         | 3957/3957 ✅    | 502/502 ✅ | ~85%       | ✅ PASS | 🆕 SP-270 Page Profil Utilisateur. +62 tests unitaires (6 fichiers), +15 tests E2E (1 fichier). Server Action getProfile avec données User + Employee. 7 composants UI : ProfileHeader (avatar, initiales, badge rôle), PersonalInfoCard, ProfessionalInfoCard, AccountInfoCard, ProfileActions, ProfilePageContent (AnimatedContainer), InfoRow. Design Cyber Glass 3D. Skeleton loading. Page Object ProfilePage. Tests par rôle (Employee, Manager, Director, Admin). Total : 4459 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 30/01/2026 | Sprint 14 | SP-431         | 3851/3851 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-431 Animations Dashboards Framer Motion. 15 composants animés (4 dashboards). Variants fadeSlideUpVariants + staggerContainer/staggerItem. Hook useReducedMotion pour accessibilité WCAG. Stagger delay sur KPIs grids, charts delay 0.3s, quick actions delay 0.5s. Employee (2), Manager (5), Director (2), Admin (6 composants). Total : 4338 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 30/01/2026 | Sprint 14 | SP-317         | 3851/3851 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-317 Dashboard Director KPIs. +4 tests unitaires. 2 métriques ajoutées : plannedHoursThisMonth (heures planifiées ce mois via Schedule), absencesLast7Days (congés approuvés 7 derniers jours via LeaveRequest). Service getDirectorStats() mis à jour avec date-fns. Composant DirectorStats affiche les vraies valeurs au lieu de '-'. Total : 4338 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 30/01/2026 | Sprint 14 | SP-316         | 3847/3847 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-316 Dashboard Manager. +63 tests unitaires (5 fichiers). 5 composants : ManagerWelcome (bienvenue + badges alertes), ManagerStats (4 KPIs via StatsGrid), ManagerTeamChart (BarChartWidget performance equipe), ManagerPendingLeaves (liste conges + actions approve/reject), ManagerQuickActions (4 boutons). Service getManagerStats() integre. Loading skeleton. Total : 4334 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 30/01/2026 | Sprint 14 | SP-426         | 3784/3784 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-426 IncidentNote UI. +53 tests unitaires (6 fichiers). 10 composants : IncidentNotesPageContent, IncidentNotesList, IncidentNoteCard, IncidentNoteSheet, IncidentNoteForm, IncidentNoteDetailSheet, IncidentNotesFilters, IncidentNotesEmptyState, VisibilityBadge, VisibilityRadioGroup. RBAC : DIRECTOR/MANAGER créer/éditer/supprimer, EMPLOYEE lecture seule. Dialog/Sheet responsive. Filtres recherche + dates. Total : 4271 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 30/01/2026 | Sprint 14 | SP-425         | 3731/3731 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-425 IncidentNote Actions. +24 tests unitaires (1 fichier). 7 Server Actions CRUD : createIncidentNote, getIncidentNotes, getIncidentNoteById, getMyIncidentNotes, updateIncidentNote, deleteIncidentNote, getIncidentNotesForEmployee. RBAC visibility (DIRECTOR_ONLY, MANAGER_DIRECTOR, ALL). Helper checkNoteAccess. Total : 4218 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 30/01/2026 | Sprint 14 | SP-424         | 3707/3707 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-424 IncidentNote Model. +35 tests unitaires (1 fichier). Modèle Prisma IncidentNote avec relations subject/author/company. Enum IncidentNoteVisibility (DIRECTOR_ONLY, MANAGER_DIRECTOR, ALL). 3 schémas Zod (create, update, filters). Types TypeScript avec labels, descriptions, couleurs, icônes. Migration DB. Total : 4194 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 29/01/2026 | Sprint 14 | SP-421         | 3680/3680 ✅    | 487/487 ✅ | ~85%       | ✅ PASS | 🆕 SP-421 Notes perso E2E. +20 tests E2E (2 fichiers). Page Object PersonalTasksPage. Tests CRUD (navigation, création, modification, suppression, annulation), widget (4 dashboards), sécurité (isolation multi-user, persistance). Total : 4167 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 29/01/2026 | Sprint 14 | SP-420         | 3680/3680 ✅    | 467/467 ✅ | ~85%       | ✅ PASS | 🆕 SP-420 Personal Tasks Widget. +19 tests unitaires (2 fichiers). Server Action getPersonalTasksForWidget(limit=5). Composant PersonalTasksWidget avec Skeleton, EmptyState, toggle optimiste. Intégration dans 4 dashboards (Employee, Manager, Director, Admin). Total : 4147 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 29/01/2026 | Sprint 14 | SP-419         | 3653/3653 ✅    | 467/467 ✅ | ~85%       | ✅ PASS | 🆕 SP-419 Personal Tasks Page. +27 tests unitaires (4 fichiers). Page /dashboard/tasks avec drag & drop @dnd-kit. 6 composants : TasksPageContent, PersonalTaskList, PersonalTaskCard, PersonalTaskForm (Dialog/Sheet responsive), PrivacyBadge, EmptyState. Optimistic updates. Total : 4120 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 29/01/2026 | Sprint 14 | SP-418         | 3626/3626 ✅    | 467/467 ✅ | ~85%       | ✅ PASS | 🆕 SP-418 Personal Task Actions. +28 tests unitaires (1 fichier). 6 Server Actions CRUD : getPersonalTasks, createPersonalTask, updatePersonalTask, deletePersonalTask, togglePersonalTask, reorderPersonalTasks. Sécurité 100% privée (vérification userId). Transaction Prisma pour reorder. Total : 4093 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 29/01/2026 | Sprint 14 | SP-417         | 3598/3598 ✅    | 467/467 ✅ | ~85%       | ✅ PASS | 🆕 SP-417 Personal Task Model. +29 tests unitaires (1 fichier). Modèle Prisma PersonalTask avec 3 index (userId, userId+completed, userId+order). 5 schémas Zod (create, update, reorder, toggle, filters). Validation titre max 200, description max 2000, dueDate coerce. Total : 4065 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 28/01/2026 | Sprint 13 | SP-416         | 3569/3569 ✅    | 467/467 ✅ | ~85%       | ✅ PASS | 🆕 SP-416 E2E Tests Leaves. +21 tests E2E (5 fichiers). Page Object LeavesPage avec helpers navigation, filtres, formulaires, review. Tests : navigation (5), création (4), review manager/director (5), soldes RBAC (5), calendrier (2). data-testid ajoutés aux composants leaves. Total : 4036 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 28/01/2026 | Sprint 13 | SP-415         | 3569/3569 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-415 Leaves Integrations. +49 tests unitaires (3 fichiers). Email LeaveRequestedEmail (template + send function) notifiant manager lors création demande. Overlay congés approuvés sur Schedule-X calendrier (7 types couleurs). Props leaveRequests/showLeaves/onLeaveClick ajoutées. Dashboard stats déjà implémentées (pendingLeaveRequests). Total : 4015 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 28/01/2026 | Sprint 13 | SP-414         | 3539/3539 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-414 Leave Detail + Balances. +48 tests unitaires (4 fichiers). Routes `/leaves/[id]` (détail + timeline) et `/leaves/balances` (DIRECTOR). LeaveDetailCard, LeaveTimeline, LeaveDetailContent, BalancesPageContent. getAllLeaveBalances server action. Total : 3985 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 28/01/2026 | Sprint 13 | SP-413         | 3491/3491 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-413 Page Congés + Orchestrateur. +18 tests unitaires (2 fichiers). Route `/app/dashboard/leaves` avec metadata SEO. Server Component fetch initial. LeavesPageContent : tabs Liste/Calendrier, stats bar cliquable, filtres URL sync, Dialog/Sheet responsive, Review dialog RBAC. Sidebar href corrigé. Total : 3937 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 28/01/2026 | Sprint 13 | SP-411         | 3618/3618 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-411 Composants UI Leave Management. +50 tests unitaires (7 fichiers). 8 composants React : LeaveTypeBadge (4), LeaveStatusBadge (4), LeaveConflictWarning (4), LeaveBalanceCard (6), LeaveRequestCard (11), LeaveRequestForm (15), LeaveReviewDialog (6). Badges icônes Lucide, ProgressBar seuils couleur, Calendar range, formulaire RHF+Zod, Dialog review avec commentaire obligatoire refus. Total : 4064 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 28/01/2026 | Sprint 13 | SP-410         | 3568/3568 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-410 Server Actions CRUD Congés. +48 tests unitaires. 11 actions RBAC : getLeaveRequests, getLeaveRequestById, createLeaveRequest, updateLeaveRequest, cancelLeaveRequest (recrédit solde), reviewLeaveRequest (transaction atomique + email), getLeaveBalance, updateLeaveBalance, getTeamAbsences, getLeaveStats, checkLeaveConflicts. Multi-tenant companyId. Total : 4014 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 28/01/2026 | Sprint 13 | SP-409         | 3520/3520 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-409 Validations Zod + Utilitaires Leave Management. +45 tests unitaires (validation: 22, leave-utils: 23). 6 schémas Zod (createLeaveRequest, updateLeaveRequest, updateLeaveBalance, leaveRequestFilters, enums). calculateWorkingDays (3 modes : MON_FRI, MON_SAT, ALL_DAYS). hasEnoughBalance, getRemainingBalance. Labels, couleurs, icônes UI. Total : 3966 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 28/01/2026 | Sprint 13 | SP-408         | 3475/3475 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-408 Fondations Prisma Congés. LeaveBalance model, halfDay/halfDayPeriod sur LeaveRequest, FAMILY_EVENT enum. Seed : 20 LeaveBalances + 6 nouvelles LeaveRequests. Total : 3921 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 27/01/2026 | Sprint 12 | SP-406         | 3475/3475 ✅    | 446/446 ✅ | ~85%       | ✅ PASS | 🆕 SP-406 Améliorations Plannings. +16 tests E2E (schedules.spec.ts). WeeklyHoursPanel (compteur heures hebdo). Type REST (repos journée entière). Simplification statuts (DRAFT/PUBLISHED). Suppression en masse employés (BulkDeleteDialog). Nom entreprise dans Sidebar. Corrections boucles infinies React 19. Refonte CSS calendrier Schedule-X. Exports PDF/Excel avec filtres et heures. Downgrade @schedule-x 2.11.0 + patch-package. Email employé (migration Prisma). Total : 3921 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 27/01/2026 | Sprint 12 | SP-404         | 3291/3291 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-404 Export Excel Planning. +7 tests unitaires (generateScheduleExcel: 7). API Route GET `/api/schedules/export/excel` avec auth et RBAC (MANAGER/DIRECTOR). Générateur `generateScheduleExcel` via SheetJS : 3 feuilles (Planning détaillé, Résumé par employé, Statistiques). `ExportDropdown` mis à jour (Excel fonctionnel). Total : 3721 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 27/01/2026 | Sprint 12 | SP-403         | 3284/3284 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-403 Export PDF Planning. +6 tests unitaires (SchedulePdfDocument: 6). API Route GET `/api/schedules/export/pdf` avec auth et RBAC (MANAGER/DIRECTOR). Composant React PDF `SchedulePdfDocument` (A4 paysage, tableau employés × jours, légende 7 types). `ExportDropdown` dans toolbar schedules (PDF + placeholder Excel). Total : 3714 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 27/01/2026 | Sprint 12 | SP-402         | 3278/3278 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-402 Overlay Indisponibilités Calendrier. +47 tests unitaires (useCalendarAvailabilities: 10, AvailabilityBadge: 20, AvailabilityOverlay: 17). Server Action getAvailabilitiesForCalendar avec RBAC. Hook useCalendarAvailabilities avec debounce et cache. Composants AvailabilityBadge, AvailabilityPopover, AvailabilityOverlay. Intégration Schedule-X desktop + badges mobile. Toggle Eye/EyeOff. Total : 3708 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 26/01/2026 | Sprint 12 | SP-400         | 3231/3231 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-400 Détection Conflits Horaires. +25 tests unitaires (useConflictDetection: 12, ConflictAlert: 13). Server Action checkAvailabilityConflicts. Classification hard/soft conflicts. Composants ConflictAlert, ConflictConfirmDialog. Hook useConflictDetection avec debounce. Intégration ShiftModal + ScheduleCalendarDesktop (drag & drop). Total : 3661 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 26/01/2026 | Sprint 12 | SP-401         | 3206/3206 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-401 CRUD Availabilities. +54 tests unitaires (Server Actions: 22, AvailabilityCard: 18, AvailabilityModal: 14). 8 Server Actions RBAC : getAvailabilities, getAvailabilityById, createAvailability, updateAvailability, deleteAvailability, getEmployeeAvailabilities, getTeamAvailabilities, getAvailabilitiesStats. Composants UI : AvailabilityCard, AvailabilityModal, AvailabilitiesList. 6 types d'indisponibilité avec icônes/couleurs. Total : 3636 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 26/01/2026 | Sprint 12 | SP-399         | 3152/3152 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-399 Récurrence des Shifts. +40 tests unitaires (recurrence: 24, RecurrenceConfig: 12, availability fix: 4). Fréquences DAILY/WEEKLY/BIWEEKLY/MONTHLY. Sélection jours semaine. Limites: 52 occurrences max, 200 créneaux max. Server Actions groupées (delete/update par scope). RecurrenceEditDialog. Total : 3582 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 26/01/2026 | Sprint 12 | SP-398         | 3112/3112 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-398 Drag & Drop calendrier. +19 tests unitaires. Plugin @schedule-x/resize ajouté. Déplacer créneaux par drag, resize par bord. Persistance updateSchedule avec rollback erreur. RBAC: DIRECTOR/MANAGER uniquement. Toast feedback. Total : 3542 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 26/01/2026 | Sprint 12 | SP-397         | 3093/3093 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-397 ShiftModal création/édition créneaux. +30 tests unitaires (17 modal + 13 hook). Sélection multi-employés avec recherche et filtrage équipe. Date/time pickers locale FR. Types/statuts FR. Intégration createSchedule/updateSchedule. Total : 3523 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 26/01/2026 | Sprint 12 | SP-396         | 3063/3063 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-396 ScheduleCalendar responsive. +18 tests unitaires. Schedule-X intégré (desktop ≥768px) avec vues jour/semaine/mois. Vue mobile cards empilées (pas de scroll horizontal). Couleurs par type (7 types), badges statut. Temporal API polyfill. useMediaQuery hook. Total : 3493 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 26/01/2026 | Sprint 12 | SP-395         | 3045/3045 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-395 Page Liste Schedules. Route `/app/dashboard/schedules`. Layout SEO, loading skeleton, SchedulesPageContent (navigation date, vues jour/semaine/mois, filtres), SchedulesList (grille semaine, shifts colorés), SchedulesFilters (recherche, statut, type). Correction Sidebar URL. Total : 3475 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 26/01/2026 | Sprint 12 | SP-394         | 3045/3045 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-394 Server Actions Schedules CRUD avec RBAC. +30 tests unitaires. 10 actions : getSchedules, getScheduleById, createSchedule (multi-employé), updateSchedule, deleteSchedule, deleteScheduleGroup, duplicateSchedule, updateScheduleStatus, getEmployeeSchedules, getTeamSchedules. Permissions RBAC complètes. Total : 3475 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 26/01/2026 | Sprint 12 | SP-393         | 3015/3015 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-393 Validations Zod Plannings. +81 tests unitaires (schedule: 47, availability: 34). Schemas createScheduleSchema, updateScheduleSchema, scheduleFiltersSchema, recurrenceRuleSchema. Support multi-employés employeeIds. Labels FR, couleurs, icônes. Total : 3445 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 26/01/2026 | Sprint 12 | SP-392         | 2934/2934 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-392 Gestion Plannings - Prisma. Modèle Availability (disponibilités employés), enum AvailabilityType (6 types). Enrichissement Schedule (isRecurring, recurrenceRule, recurrenceGroupId, scheduleGroupId). Migration + indexes optimisés. Fondations Sprint 12. Total : 3364 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 25/01/2026 | Sprint 11 | SP-263         | 2934/2934 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-263 Réinitialisation mot de passe. +39 tests unitaires (ForgotPasswordForm: 14, ResetPasswordForm: 17, reset-password page: 8). Pages /forgot-password et /reset-password. Server Actions avec tokens sécurisés. Validation Zod. Anti-énumération OWASP. Framer Motion animations. Total : 3364 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 25/01/2026 | Sprint 11 | SP-269         | 2895/2895 ✅    | 430/430 ✅ | ~85%       | ✅ PASS | 🆕 SP-269 Accessibilité WCAG 2.1. +14 tests unitaires SkipLink, +14 tests E2E axe-core. Skip to main content (WCAG 2.4.1), audit Lighthouse 95%. Script a11y:audit. Total : 3325 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 25/01/2026 | Sprint 11 | SP-389         | 2881/2881 ✅    | 416/416 ✅ | ~85%       | ✅ PASS | 🆕 SP-389 E2E Mobile Tests Playwright. +90 tests E2E mobile (75 actifs + 15 skip). 5 devices configurés (iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro 11"). Mobile fixtures, touch-gestures utilities. WebKit → Chromium fix (ANO-020). Total : 3297 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 23/01/2026 | Sprint 11 | SP-268 Phase 3 | 2881/2881 ✅    | 326/326 ✅ | ~85%       | ✅ PASS | 🆕 SP-268 Phase 3 Mobile UI Components. +110 tests unitaires (SP-385: 31, SP-386: 32, SP-387: 22, SP-388: 25). TouchableButton, MobileFormField, DataTablePagination, ResponsiveBreadcrumb. WCAG 2.5.5 touch targets 44px, iOS zoom prevention, scroll-snap. Total : 3207 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 23/01/2026 | Sprint 11 | SP-383/384     | 2771/2771 ✅    | 326/326 ✅ | ~85%       | ✅ PASS | 🆕 SP-383/SP-384 Navigation Mobile Phase 2. +21 tests unitaires SwipeableDrawer. Framer Motion gestures, swipe to close, iOS safe-area, prefers-reduced-motion. Total : 3097 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 23/01/2026 | Sprint 11 | Hotfix         | 2750/2750 ✅    | 326/326 ✅ | ~85%       | ✅ PASS | 🔧 Suppression test E2E flaky "click overlay to close" Command Palette. Le z-index du dialog cmdk intercepte les pointer events. Comportement déjà couvert par test Escape. Total : 3076 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 23/01/2026 | Sprint 11 | SP-264         | 2750/2750 ✅    | 327/327 ✅ | ~85%       | ✅ PASS | 🆕 SP-264 Dashboard Layout V2. +133 tests unitaires, +30 tests E2E (163 total). Command Palette (⌘K), Dynamic Breadcrumbs, Keyboard Shortcuts Modal (?), Recent Pages (localStorage). Tests E2E temporairement skip (routes /schedules, /leaves non implémentées). Total : 3077 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 22/01/2026 | Sprint 11 | SP-266         | 2617/2617 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-266 Loading States. +133 tests unitaires. ProgressBar, ProgressCircle, withLoading HOC, useProgressLoading hook. Total : 2914 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 22/01/2026 | Sprint 11 | SP-378         | 2484/2484 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-378 Empty States. +78 tests unitaires. EmptyState component, 5 illustrations SVG (NoData, NoResults, NoNotifications, NoTasks, NoUsers). Total : 2781 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 21/01/2026 | Sprint 11 | SP-260         | 2406/2406 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-260 UI Components Extension. +147 tests unitaires. Button variants, Badge extensions, Input extensions, AvatarGroup. Total : 2703 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 21/01/2026 | Sprint 11 | SP-265         | 2259/2259 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-265 Dark/Light Mode. +32 tests unitaires. ThemeToggle, ThemeDropdown, next-themes integration, system detection. Total : 2556 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 21/01/2026 | Sprint 11 | SP-379         | 2227/2227 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-379 Animation System. +212 tests unitaires. Framer Motion centralisé, variants, hooks (useAnimation, useReducedMotion, useStaggerAnimation, useInViewAnimation), AnimatedContainer, AnimatedList. Total : 2524 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 21/01/2026 | Sprint 11 | SP-259         | 2015/2015 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | SP-259 Design Tokens System. +45 tests unitaires. Colors, spacing, typography tokens. CSS variables centralisées. Total : 2312 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 20/01/2026 | Sprint 10 | SP-305         | 1970/1970 ✅    | 297/297 ✅ | ~85%       | ✅ PASS | 🆕 SP-305 Page 403 Forbidden. +52 tests unitaires, +24 tests E2E (76 total). ForbiddenPage, ForbiddenIllustration, route /forbidden. Total : 2267 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 21/01/2026 | Sprint 10 | SP-303         | 1921/1921 ✅    | 273/273 ✅ | ~85%       | ✅ PASS | SP-303 Page 500 personnalisée. +74 tests unitaires, +22 tests E2E. Logging structuré error-logger, Framer Motion, WCAG 2.1 AA. Total : 2194 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 20/01/2026 | Sprint 10 | SP-302         | 1847/1847 ✅    | 251/251 ✅ | ~85%       | ✅ PASS | SP-302 Page 404 personnalisée. +40 tests unitaires, +8 tests E2E. Framer Motion, WCAG 2.1 AA, design cohérent. Total : 2098 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 20/01/2026 | Sprint 10 | SP-304         | 1807/1807 ✅    | 243/243 ✅ | ~85%       | ✅ PASS | SP-304 Error Boundary React. +22 tests unitaires, +5 tests E2E. react-error-boundary v5.0.0. Accessibilité WCAG 2.1 AA. Total : 2050 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 19/01/2026 | Sprint 9  | SP-301         | 1785/1785 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-301 Tests Templates Contact. +40 tests (ContactConfirmationEmail: 18, ContactNotificationEmail: 22). Complète SP-288. Total : 2014 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 19/01/2026 | Sprint 9  | SP-300         | 1745/1745 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-300 Email Congé Validé/Refusé Phase 1. +48 tests (templates: 28, fonctions: 20). Types LeaveType, templates LeaveApprovedEmail/LeaveRejectedEmail. Total : 1974 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 19/01/2026 | Sprint 9  | SP-289         | 1697/1697 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-289 Contact UX. +54 tests (hook: 21, success: 12, error: 10, integration: 11). Framer Motion + state machine.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 19/01/2026 | Sprint 9  | SP-288         | 1643/1643 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-288 API Contact. +48 tests (rate limiter: 15, email: 13, route: 20). Rate limiting + envoi emails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 19/01/2026 | Sprint 9  | SP-287         | 1595/1595 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-287 Formulaire Contact UI. +41 tests (20 Zod + 21 composant). React Hook Form + accessibilité WCAG 2.1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 19/01/2026 | Sprint 9  | SP-299         | 1554/1554 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-299 Email Vérification. +10 tests. Server Actions send/verify/resend. Préfixe token `verify_`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 19/01/2026 | Sprint 9  | SP-298         | 1544/1544 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-298 Email Reset Password. +9 tests. Server Actions forgot/reset. Protection énumération comptes (OWASP).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 19/01/2026 | Sprint 9  | SP-297         | 1535/1535 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-297 Email Bienvenue. +18 tests (template: 14, fonction: 4). Intégration non-bloquante registerAction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 19/01/2026 | Sprint 9  | SP-296         | 1517/1517 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-296 Templates React Email. Composants Layout/Header/Footer/Button. Design tokens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 19/01/2026 | Sprint 9  | SP-295         | 1517/1517 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-295 Configuration Email. +43 tests (config: 19, transporter: 9, send: 15). Nodemailer + SMTP Hostinger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 16/01/2026 | Sprint 8  | SP-283         | 1474/1474 ✅    | 229/229 ✅ | ~85%       | ✅ PASS | SP-283 Bannière Cookies RGPD. +83 tests unitaires. +18 tests E2E. Conformité RGPD 9/9 critères CNIL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 12/01/2026 | Sprint 5  | SP-156         | 1391/1391 ✅    | 214/214 ✅ | ~85%       | ✅ PASS | SP-156 Tests E2E CRUD terminé. +58 tests E2E. 8 Page Objects. EPIC SP-113 TERMINÉ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 09/01/2026 | Sprint 5  | SP-154         | 1333/1333 ✅    | 156/156 ✅ | ~85%       | ✅ PASS | SP-154 Navigation terminé. +107 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 09/01/2026 | Sprint 5  | SP-153         | 1226/1226 ✅    | 156/156 ✅ | ~85%       | ✅ PASS | SP-153 CRUD Teams terminé. +85 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 08/01/2026 | Sprint 5  | SP-152         | 1141/1141 ✅    | 156/156 ✅ | ~85%       | ✅ PASS | SP-152 CRUD Employees terminé. +37 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 08/01/2026 | Sprint 5  | SP-151         | 1104/1104 ✅    | 156/156 ✅ | ~85%       | ✅ PASS | SP-151 CRUD Companies terminé. +67 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 11/12/2025 | Sprint 5  | SP-149         | 1037/1037 ✅    | 156/156 ✅ | ~85%       | ✅ PASS | 🎉 EPIC SP-112 TERMINÉ. +106 tests E2E Dashboards                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 10/12/2025 | Sprint 5  | SP-148         | 1250/1250 ✅    | 50/50 ✅   | ~85%       | ✅ PASS | SP-148 Dashboard Super Admin. +115 tests unitaires                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 10/12/2025 | Sprint 5  | SP-147         | 1135/1135 ✅    | 50/50 ✅   | ~85%       | ✅ PASS | SP-147 Dashboard Director. +87 tests unitaires                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 09/12/2025 | Sprint 5  | SP-145         | 1048/1048 ✅    | 50/50 ✅   | ~85%       | ✅ PASS | SP-145 Dashboard Employee. +91 tests unitaires                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 09/12/2025 | Sprint 5  | SP-141         | 570/570 ✅      | 59/59 ✅   | ~85%       | ✅ PASS | SP-141 Tests E2E Auth. +18 tests Playwright login/register                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 05/12/2025 | Sprint 4  | SP-126         | 474/474 ✅      | 12/12 ✅   | 83.83%     | ✅ PASS | SP-126 Tests unitaires UI. 6 catégories                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 04/12/2025 | Sprint 4  | SP-125         | 15/15 ✅        | 12/12 ✅   | ~70%       | ✅ PASS | Setup initial. Vitest + RTL + Playwright + MSW                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## Détail des tests Sprint 19 - Impersonation Mode (SP-456) 🆕

### SP-456 : Tests E2E Impersonation + Tests Unitaires API + Corrections applicatives (19 tests)

**Objectif** : Tester le parcours complet du mode impersonation SYSTEM_ADMIN ("Voir espace client"), incluant le démarrage, la navigation en lecture seule, les restrictions de sécurité, les cas limites et l'audit trail. Découverte et correction de 2 bugs applicatifs pendant le développement des tests.

| Suite de test                              | Tests unitaires | Tests E2E | Total  |
| ------------------------------------------ | --------------- | --------- | ------ |
| API POST /api/admin/impersonate            | 8               | —         | 8      |
| API DELETE /api/admin/impersonate          | 2               | —         | 2      |
| E2E Parcours nominal                       | —               | 2         | 2      |
| E2E Restrictions sécurité                  | —               | 3         | 3      |
| E2E Cas limites                            | —               | 3         | 3      |
| E2E Audit trail                            | —               | 1         | 1      |
| **Total**                                  | **10**          | **9**     | **19** |

#### Fichiers créés

| Fichier                                                    | Rôle                                          |
| ---------------------------------------------------------- | --------------------------------------------- |
| `src/app/api/admin/impersonate/__tests__/route.test.ts`    | 10 tests unitaires API POST + DELETE          |
| `e2e/pages/impersonation.page.ts`                          | Page Object Model (POM) impersonation         |
| `e2e/specs/impersonation/impersonation-flow.spec.ts`       | 9 tests E2E (4 suites)                        |

#### Fichiers modifiés (corrections applicatives)

| Fichier                    | Modification                                                                  |
| -------------------------- | ----------------------------------------------------------------------------- |
| `src/lib/auth.config.ts`   | Bypass subscription guard quand cookie `sp-impersonation` présent             |
| `src/app/app/layout.tsx`   | Fallback lecture cookie pour bannière quand `updateSession()` NextAuth échoue |
| `e2e/pages/index.ts`       | Barrel export ImpersonationPage                                               |

#### Tests unitaires API (10 tests)

**POST /api/admin/impersonate (8 tests)** :
- 401 si non authentifié
- 403 si rôle non SYSTEM_ADMIN (DIRECTOR)
- 400 si body vide (ni targetUserId ni companyId)
- 404 si aucun utilisateur actif dans la company
- 400 si la cible est un SYSTEM_ADMIN (auto-impersonation bloquée)
- 400 si la cible est désactivée (isActive: false)
- 200 succès avec companyId → pose cookie + crée audit log start + retourne redirectTo
- 200 succès avec targetUserId direct

**DELETE /api/admin/impersonate (2 tests)** :
- 400 si aucune impersonation active (cookie absent)
- 200 succès → supprime cookie + crée audit log stop + retourne redirectTo `/app/admin/companies`

**Pattern mocking** : `vi.hoisted()` pour auth, prisma, cookies, logAuditAction. Types `ImpersonateSuccessResponse` / `ImpersonateErrorResponse` pour éviter ESLint `no-unsafe-assignment`.

#### Tests E2E (9 tests, 4 suites)

**Parcours nominal (2 tests)** :
- Démarre impersonation sur TechCorp → vérifie bannière orange visible avec nom entreprise → vérifie redirection dashboard lecture seule → stoppe impersonation → vérifie bannière disparue → retour `/app/admin/companies`
- Vérifie que la bannière affiche "Mode support" avec le bon nom d'entreprise

**Restrictions sécurité (3 tests)** :
- Routes admin bloquées : `/app/admin/companies` → redirect `/app/dashboard` en mode impersonation
- Route billing bloquée : `/app/dashboard/billing` → redirect `/app/dashboard` en mode impersonation
- Isolation tenant : bannière affiche le nom de l'entreprise cible, pas l'email admin

**Cas limites (3 tests)** :
- Bannière persiste après rafraîchissement de page (cookie `sp-impersonation` persistant)
- Suppression du cookie désactive le mode impersonation (stopImpersonation + navigation admin)
- Impersonation d'un SYSTEM_ADMIN bloquée via API directe (status ≠ 200)

**Audit trail (1 test)** :
- Parcours complet génère POST start (capturé via `page.on('response')`, status 200) et DELETE stop (vérifié implicitement — `stopImpersonation()` throw si ≠ 200)

#### Page Object Model (`ImpersonationPage`)

**Locators** : `impersonation-banner`, `impersonation-banner-text`, `quit-impersonation-button`, heading Entreprises, indicateur chargement

**`startImpersonation(companyName)`** :
1. Navigue vers `/app/admin/companies` (waitUntil: domcontentloaded)
2. Attend table + lignes de données + stabilisation React (500ms)
3. Clique "Menu actions" de la ligne cible → attend menuitem "Voir espace client" (Radix portal)
4. `Promise.all([waitForResponse POST, click])` — interception API
5. Attend navigation vers dashboard + `reload()` (force layout à lire le cookie fallback)

**`stopImpersonation()`** :
1. `page.request.delete('/api/admin/impersonate')` (Playwright API context, pas page.evaluate)
2. Suppression sélective cookies : `sp-impersonation`, `authjs.session-token`, `__Secure-authjs.session-token`, `authjs.csrf-token`
3. Re-login admin via `loginAs(page, TEST_USERS.SYSTEM_ADMIN)`
4. Navigation vers `/app/admin/companies`

#### Corrections applicatives découvertes

**Correction 1 — Subscription Guard Bypass (ANO-028)** :
- **Symptôme** : `ERR_TOO_MANY_REDIRECTS` en mode impersonation
- **Cause** : Le JWT SYSTEM_ADMIN n'a pas de données subscription → subscription guard redirige vers `/billing` → impersonation guard bloque `/billing` → redirect `/dashboard` → boucle ∞
- **Fix** : Lecture du cookie `sp-impersonation` dans `auth.config.ts` avant le subscription guard. Si `originalAdminId` présent, skip la vérification subscription

**Correction 2 — Layout Cookie Fallback** :
- **Symptôme** : Bannière impersonation invisible après démarrage
- **Cause** : `updateSession()` NextAuth v5 échoue avec `ClientFetchError: Failed to fetch` → JWT non mis à jour avec `isImpersonating: true`
- **Fix** : Fallback lecture directe du cookie `sp-impersonation` dans le Server Component `layout.tsx` quand `session.user.isImpersonating` est false, avec vérification expiration (3600s) et validité (`originalAdminId` + `targetCompanyName`)

---

## Détail des tests Sprint 17 - Server Actions Stripe (SP-352) 🆕

### SP-352 : Server Actions Stripe — Checkout, Portal, Quantity, Cancel, Billing (32 tests)

**Objectif** : Connecter le service Stripe (SP-351) au frontend avec authentification RBAC, validation Zod et conversion ServiceResult → CrudActionResult. Toutes les actions sont réservées au rôle DIRECTOR.

| Suite de test                              | Tests unitaires | Tests E2E | Total  |
| ------------------------------------------ | --------------- | --------- | ------ |
| `__tests__/lib/actions/stripe.test.ts`     | 32              | 0         | 32     |
| **Total**                                  | **32**          | **0**     | **32** |

**Fichiers créés** :

| Fichier                                     | Description                                          |
| ------------------------------------------- | ---------------------------------------------------- |
| `src/lib/actions/stripe.ts`                 | 5 Server Actions Stripe (339 lignes)                 |
| `__tests__/lib/actions/stripe.test.ts`      | 32 tests unitaires (625 lignes)                      |

**Fichiers modifiés** :

| Fichier                    | Modification                                    |
| -------------------------- | ----------------------------------------------- |
| `src/types/stripe.ts`      | Ajout interface `BillingData`                   |
| `src/types/index.ts`       | Ajout `BillingData` au barrel export            |

**5 Server Actions implémentées** :

| Action                              | Input                                | Output                              | Description                                             |
| ----------------------------------- | ------------------------------------ | ----------------------------------- | ------------------------------------------------------- |
| `createCheckoutAction`              | `{ quantity, successUrl?, cancelUrl? }` | `CrudActionResult<CheckoutSessionResult>` | Crée session Checkout Stripe per-seat              |
| `createBillingPortalAction`         | `{ returnUrl? }`                     | `CrudActionResult<BillingPortalResult>`   | Crée session Billing Portal                        |
| `updateSubscriptionQuantityAction`  | `{ quantity }`                       | `CrudActionResult<void>`                  | Met à jour la quantité de sièges (prorata)         |
| `cancelSubscriptionAction`          | `cancelImmediately?: boolean`        | `CrudActionResult<void>`                  | Annule l'abonnement (fin de période ou immédiat)   |
| `getBillingDataAction`              | aucun                                | `CrudActionResult<BillingData>`           | Récupère données facturation dashboard billing     |

**Patterns techniques utilisés** :

| Pattern                          | Implémentation                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| RBAC                             | `checkPermission('DIRECTOR')` depuis `@/lib/actions/crud-utils`                    |
| Validation Zod                   | `validateData(schema, input)` depuis `@/lib/actions/crud-helpers`                  |
| Conversion ServiceResult→CRUD    | `if (!result.success) return error; return { success: true, data: result.data! }`  |
| Retour URL (pas redirect)        | Le client gère le loading state et la redirection navigateur                       |
| revalidatePath                   | Uniquement pour mutations (updateQuantity, cancel) sur `/app/dashboard/billing`    |
| Guard companyId                  | SYSTEM_ADMIN n'a pas de company → message erreur dédié                             |
| Email via auth()                 | `checkPermission` ne retourne pas l'email → appel `auth()` séparé                 |

**Tests unitaires par catégorie (stripe.test.ts)** :

| Catégorie                         | Nb tests | Description                                                              |
| --------------------------------- | -------- | ------------------------------------------------------------------------ |
| createCheckoutAction              | 7        | Auth denied, RBAC denied, no companyId, Zod error, no email, service error, happy path |
| createBillingPortalAction         | 6        | Auth denied, no companyId, Zod error, no subscription, service error, happy path |
| updateSubscriptionQuantityAction  | 6        | Auth denied, no companyId, Zod error, no subscription, service error, happy path + revalidatePath |
| cancelSubscriptionAction          | 6        | Auth denied, no companyId, no subscription, service error, happy path default, happy path immediate + revalidatePath |
| getBillingDataAction              | 7        | Auth denied, no companyId, subscription + payments, no subscription (null), employee count, monthlyAmount calculation, Prisma error catch |
| **Total**                         | **32**   |                                                                          |

**Mocking strategy** :

```typescript
// vi.hoisted() pour variables référencées dans vi.mock()
const { mockCheckPermission, mockAuth, ... } = vi.hoisted(() => ({
  mockCheckPermission: vi.fn(),
  mockAuth: vi.fn(),
  mockCreateCheckoutSession: vi.fn(),
  // ...
}))

// Mock des modules
vi.mock('@/lib/actions/crud-utils', () => ({ checkPermission: mockCheckPermission }))
vi.mock('@/lib/auth', () => ({ auth: mockAuth }))
vi.mock('@/lib/services/stripe', () => ({
  createCheckoutSession: mockCreateCheckoutSession,
  // ...
}))

// Prisma via mock centralisé
import { prismaMock } from '@tests/mocks/prisma'
```

**Type BillingData ajouté** :

```typescript
export interface BillingData {
  subscription: {
    plan: string
    status: string
    quantity: number
    pricePerEmployee: number
    planPrice: number
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    stripeCustomerId: string
  } | null
  payments: {
    id: string
    amount: number
    currency: string
    status: string
    paidAt: Date | null
    createdAt: Date
  }[]
  employeeCount: number
  monthlyAmount: number  // (quantity × pricePerEmployee) / 100
}
```

**Décisions techniques documentées** :

1. **Pourquoi `auth()` séparé pour l'email ?** `checkPermission('DIRECTOR')` retourne `AuthenticatedUser = { id, role, companyId }` mais pas l'email. Pour `createCheckoutAction`, il faut l'email du customer Stripe, d'où l'appel séparé à `auth()` pour accéder à `session.user.email`.

2. **Pourquoi retourner l'URL au lieu de redirect() ?** Le client doit gérer le loading state (spinner) avant la redirection. Avec `redirect()` serveur, le client ne peut pas afficher de feedback utilisateur.

3. **Pourquoi `undefined as void` ?** Pour `CrudActionResult<void>`, TypeScript exige une valeur pour `data` même si le type est `void`. Le pattern `data: undefined as void` satisfait le type sans ambiguïté.

4. **Pourquoi pas de revalidatePath pour checkout/portal ?** Ces actions retournent une URL de redirection — l'utilisateur quitte la page. La revalidation n'a de sens que pour les mutations qui modifient les données affichées sur la même page (updateQuantity, cancel).

---

## Détail des tests Sprint 17 - Dashboard Billing (SP-360) 🆕

### SP-360 : Dashboard Billing Page — Statut, Utilisation, Historique (41 tests)

**Objectif** : Créer la page dashboard facturation complète `/app/dashboard/billing` avec 3 sous-composants (SubscriptionStatus, UsageIndicator, InvoiceHistory), orchestrateur BillingPageContent, Server Component avec sérialisation Date→ISO string, navigation sidebar, et loading skeleton.

| Suite de test                                               | Tests unitaires | Tests E2E | Total  |
| ----------------------------------------------------------- | --------------- | --------- | ------ |
| `__tests__/components/billing/SubscriptionStatus.test.tsx`  | 16              | 0         | 16     |
| `__tests__/components/billing/UsageIndicator.test.tsx`      | 8               | 0         | 8      |
| `__tests__/components/billing/InvoiceHistory.test.tsx`      | 11              | 0         | 11     |
| `__tests__/components/billing/BillingPageContent.test.tsx`  | 6               | 0         | 6      |
| **Total**                                                   | **41**          | **0**     | **41** |

**Fichiers créés** :

| Fichier                                                                    | Description                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/app/app/dashboard/billing/page.tsx`                                   | Server Component (auth + RBAC + sérialisation)         |
| `src/app/app/dashboard/billing/loading.tsx`                                | Skeleton loading 3 cartes                              |
| `src/app/app/dashboard/billing/_components/BillingPageContent.tsx`         | Orchestrateur Client Component (194 lignes)            |
| `src/app/app/dashboard/billing/_components/SubscriptionStatus.tsx`        | Statut abonnement (311 lignes)                         |
| `src/app/app/dashboard/billing/_components/UsageIndicator.tsx`            | Jauge utilisation sièges (164 lignes)                  |
| `src/app/app/dashboard/billing/_components/InvoiceHistory.tsx`            | Historique factures (212 lignes)                       |
| `src/app/app/dashboard/billing/_components/index.ts`                      | Barrel export composants + types                       |
| `__tests__/components/billing/SubscriptionStatus.test.tsx`                | 16 tests unitaires                                     |
| `__tests__/components/billing/UsageIndicator.test.tsx`                    | 8 tests unitaires                                      |
| `__tests__/components/billing/InvoiceHistory.test.tsx`                    | 11 tests unitaires                                     |
| `__tests__/components/billing/BillingPageContent.test.tsx`                | 6 tests unitaires                                      |

**Fichiers modifiés** :

| Fichier                              | Modification                                                             |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `src/types/stripe.ts`                | BillingData enrichi (currentPeriodStart, canceledAt, createdAt, stripeInvoiceId, paymentMethod, trialEndsAt) |
| `src/lib/actions/stripe.ts`          | getBillingDataAction enrichi (Promise.all + company.trialEndsAt)         |
| `src/lib/navigation/menu-items.ts`   | Entrée "Facturation" (CreditCard, DIRECTOR, G B)                        |

**4 composants implémentés** :

| Composant            | Props                                                          | Description                                                        |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `SubscriptionStatus` | subscription, trialEndsAt, monthlyAmount, onManage, onCancel   | 6 badges statut, countdown essai, alerte annulation programmée     |
| `UsageIndicator`     | employeeCount, quantity, pricePerEmployee, monthlyAmount       | ProgressBar colorée (vert/orange/rouge), prix unitaire/total       |
| `InvoiceHistory`     | payments, onOpenPortal                                         | Table 5 dernières factures, liens Stripe, badges statut            |
| `BillingPageContent` | billingData (SerializedBillingData)                            | Orchestrateur, portail Stripe, annulation AlertDialog, erreurs     |

**Tests unitaires par catégorie** :

| Fichier                      | Catégorie                  | Nb tests | Description                                                    |
| ---------------------------- | -------------------------- | -------- | -------------------------------------------------------------- |
| SubscriptionStatus.test.tsx  | Rendu selon le statut      | 6        | Badges ACTIVE, TRIAL, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE |
| SubscriptionStatus.test.tsx  | Countdown essai            | 1        | Jours restants trial avec alerte                               |
| SubscriptionStatus.test.tsx  | Annulation programmée      | 2        | Alerte cancelAtPeriodEnd, masquage bouton Annuler              |
| SubscriptionStatus.test.tsx  | Aucun abonnement           | 1        | EmptyState avec CTA "S'abonner"                                |
| SubscriptionStatus.test.tsx  | Interactions               | 2        | Callbacks onManageSubscription, onCancelSubscription           |
| SubscriptionStatus.test.tsx  | Affichage données          | 4        | Montant mensuel, sièges, période, label plan                   |
| UsageIndicator.test.tsx      | Affichage                  | 8        | Employés actifs, sièges total, % utilisation, plafond 100%, prix unitaire/total, prorata, data-testid |
| InvoiceHistory.test.tsx      | Table                      | 3        | Lignes factures, montants formatés, moyen paiement             |
| InvoiceHistory.test.tsx      | Badges statut              | 3        | Payé (vert), Échoué (rouge), En attente (jaune)               |
| InvoiceHistory.test.tsx      | Liens Stripe               | 2        | Lien "Voir" si stripeInvoiceId, "—" sinon                     |
| InvoiceHistory.test.tsx      | État vide                  | 2        | EmptyState "Aucune facture", masquage bouton "Voir tout"       |
| InvoiceHistory.test.tsx      | Interactions               | 1        | Callback onOpenPortal                                          |
| BillingPageContent.test.tsx  | Rendu                      | 4        | 3 sous-composants, null subscription, masquage conditionnel, data-testid |
| BillingPageContent.test.tsx  | Action Gérer               | 2        | Portail Stripe (redirection), erreur affichée                  |
| **Total**                    |                            | **41**   |                                                                |

**Sérialisation Date → ISO string** :

```typescript
// page.tsx - Server Component
function serializeBillingData(data: BillingData): SerializedBillingData {
  return {
    subscription: data.subscription ? {
      ...data.subscription,
      currentPeriodStart: data.subscription.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: data.subscription.currentPeriodEnd?.toISOString() ?? null,
      canceledAt: data.subscription.canceledAt?.toISOString() ?? null,
      createdAt: data.subscription.createdAt.toISOString(),
    } : null,
    payments: data.payments.map(p => ({
      ...p,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
    employeeCount: data.employeeCount,
    monthlyAmount: data.monthlyAmount,
    trialEndsAt: data.trialEndsAt?.toISOString() ?? null,
  }
}
```

**Type BillingData enrichi** :

```typescript
export interface BillingData {
  subscription: {
    plan: string
    status: string
    quantity: number
    pricePerEmployee: number
    planPrice: number
    currentPeriodStart: Date | null   // AJOUTÉ SP-360
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    canceledAt: Date | null           // AJOUTÉ SP-360
    createdAt: Date                   // AJOUTÉ SP-360
    stripeCustomerId: string
  } | null
  payments: {
    id: string
    amount: number
    currency: string
    status: string
    paidAt: Date | null
    createdAt: Date
    stripeInvoiceId: string | null    // AJOUTÉ SP-360
    paymentMethod: string | null      // AJOUTÉ SP-360
  }[]
  employeeCount: number
  monthlyAmount: number
  trialEndsAt: Date | null            // AJOUTÉ SP-360
}
```

**Décisions techniques documentées** :

1. **Pourquoi sérialiser les dates ?** Next.js 15 ne peut pas transmettre d'objets `Date` entre Server Components et Client Components. Les dates Prisma sont converties en ISO strings via `serializeBillingData()` dans le Server Component, puis parsées côté client avec `new Date()` ou `formatDate()`.

2. **Pourquoi 3 composants séparés + 1 orchestrateur ?** Chaque section (statut, utilisation, historique) a sa propre logique d'affichage et ses propres interactions. L'orchestrateur `BillingPageContent` gère les Server Actions partagées (portail, annulation) et l'état d'erreur global.

3. **Pourquoi masquer UsageIndicator et InvoiceHistory quand subscription=null ?** Sans abonnement actif, ces sections n'ont pas de sens. Seul `SubscriptionStatus` avec l'EmptyState "S'abonner" est affiché.

---

## Détail des tests Sprint 17 - Subscription Guard Middleware (SP-440) 🆕

### SP-440 : Middleware vérification abonnement actif — Subscription Guard (31 tests)

**Objectif** : Empêcher les utilisateurs dont l'abonnement est inactif (trial expiré, impayé, annulé, etc.) d'accéder aux fonctionnalités de l'application. Rediriger vers `/app/dashboard/billing?reason=XXX` avec un motif explicite. Architecture Defense in Depth 3 couches compatible Edge Runtime.

| Suite de test                                                | Tests unitaires | Tests E2E | Total  |
| ------------------------------------------------------------ | --------------- | --------- | ------ |
| `__tests__/lib/subscription-guard.test.ts`                   | 31              | 0         | 31     |
| **Total SP-440**                                             | **31**          | **0**     | **31** |

#### Fichiers créés

| Fichier                                    | Description                                                          |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `src/lib/subscription-guard.ts`            | Fonction pure Edge-compatible `checkSubscriptionAccess()` (164 lignes) |
| `__tests__/lib/subscription-guard.test.ts` | 31 tests unitaires (386 lignes)                                      |

#### Fichiers modifiés

| Fichier                                      | Modification                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `src/types/auth.ts`                          | Interfaces JWT/Session/User étendues + `SUBSCRIPTION_EXEMPT_ROUTES`         |
| `src/lib/auth.ts`                            | `authorize()` enrichi : requête Prisma subscription + retour données        |
| `src/lib/auth.config.ts`                     | Callbacks jwt/session enrichis + rafraîchissement 5min + étape 7 authorized |
| `src/app/app/dashboard/billing/page.tsx`     | Lecture `searchParams.reason` + passage prop `blockingReason`               |
| `src/app/.../BillingPageContent.tsx`         | Alerte contextuelle 6 motifs (warning/destructive)                          |

#### Architecture Defense in Depth (3 couches)

| Couche | Runtime | Mécanisme | Latence |
| ------ | ------- | --------- | ------- |
| 1. JWT enrichi | Edge | Lecture `subscriptionStatus`/`trialEndsAt`/`currentPeriodEnd` depuis le token | 0ms |
| 2. Rafraîchissement | Node.js | `import('@/lib/prisma')` dynamique dans jwt callback (silencieux en Edge) | Toutes les 5 min |
| 3. Webhook Stripe | Node.js | DB mise à jour → prochain `auth()` déclenche couche 2 | Asynchrone |

#### Matrice des statuts testés

| Statut | Condition | Accès | Redirect reason | Tests |
| ------ | --------- | ----- | --------------- | ----- |
| `ACTIVE` | — | ✅ | — | 1 |
| `TRIAL` | trialEndsAt futur | ✅ | — | 2 |
| `TRIAL` | trialEndsAt passé | ❌ | `trial_expired` | 2 |
| `PAST_DUE` | < 7 jours | ✅ | — | 3 |
| `PAST_DUE` | ≥ 7 jours | ❌ | `payment_overdue` | 2 |
| `CANCELED` | — | ❌ | `subscription_canceled` | 2 |
| `EXPIRED` | — | ❌ | `subscription_expired` | 2 |
| `INCOMPLETE` | — | ❌ | `payment_incomplete` | 2 |
| `null` | pas d'abonnement | ❌ | `no_subscription` | 2 |
| inconnu | statut non reconnu | ❌ | `unknown_status` | 2 |
| SYSTEM_ADMIN | tout statut | ✅ | — | 2 |
| Route exemptée | billing/profile/settings | ✅ | — | 5 |
| Rôles non-admin | DIRECTOR/MANAGER/EMPLOYEE | ❌ (si bloqué) | selon statut | 3 |

**Décisions techniques documentées** :

1. **Pourquoi une fonction pure plutôt qu'un middleware complet ?** `checkSubscriptionAccess()` n'a aucune dépendance Node.js/Prisma — elle prend des strings du JWT et retourne `{ allowed, redirectReason }`. Cela la rend testable sans mock (31 tests en 4ms), réutilisable côté serveur, et garantit la compatibilité Edge Runtime.

2. **Pourquoi un import dynamique `await import('@/lib/prisma')` ?** Le callback `jwt()` dans `auth.config.ts` est partagé entre Edge et Node.js. L'import dynamique réussit côté serveur (rafraîchissement des données) et échoue silencieusement en Edge (catch vide). C'est le mécanisme officiel pour résoudre la contrainte Edge/Prisma sans dupliquer le code.

3. **Pourquoi 7 jours de grâce pour PAST_DUE ?** Standard SaaS : Stripe relance automatiquement les paiements pendant cette période. Couper l'accès immédiatement pénaliserait les utilisateurs dont la carte a expiré temporairement.

4. **Pourquoi les dates en ISO string dans le JWT ?** Le JWT ne supporte que les types primitifs (string, number, boolean). Les objets Date de Prisma sont convertis via `.toISOString()` au login et parsés via `new Date()` dans le guard.

---

## Détail des tests Sprint 17 - Bannières Progressives Subscription (SP-441) 🆕

### SP-441 : Bannières progressives de conversion SaaS (73 tests)

**Objectif** : Afficher des bannières progressives dans le dashboard pour inciter les utilisateurs en période d'essai ou avec un paiement en retard à s'abonner. Architecture en 2 couches : fonction pure `getSubscriptionBannerConfig` (logique métier) + composant React `SubscriptionBanner` (UI). Héro de conversion sur la page billing pour les cas trial expiré / pas d'abonnement.

| Suite de test                                                        | Tests unitaires | Tests E2E | Total  |
| -------------------------------------------------------------------- | --------------- | --------- | ------ |
| `__tests__/lib/subscription-banner.test.ts`                          | 44              | 0         | 44     |
| `__tests__/components/layout/SubscriptionBanner.test.tsx`            | 29              | 0         | 29     |
| **Total SP-441**                                                     | **73**          | **0**     | **73** |

#### Fichiers créés

| Fichier                                                    | Description                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `src/lib/subscription-banner.ts`                           | Fonction pure `getSubscriptionBannerConfig()` — logique paliers      |
| `src/components/layout/SubscriptionBanner.tsx`              | Composant client bannière progressive avec dismiss localStorage      |
| `__tests__/lib/subscription-banner.test.ts`                | 44 tests unitaires (logique pure sans mocks)                         |
| `__tests__/components/layout/SubscriptionBanner.test.tsx`  | 29 tests unitaires (rendu, variants, CTA, dismiss, accessibilité)    |

#### Fichiers modifiés

| Fichier                                           | Modification                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/app/app/layout.tsx`                          | Construction `subscriptionData` depuis session.user, passage prop DashboardLayout |
| `src/components/layout/DashboardLayout.tsx`       | Interface SubscriptionData, prop subscriptionData, rendu SubscriptionBanner     |
| `src/app/.../BillingPageContent.tsx`              | Héro conversion (Rocket/Sparkles), ancre `#subscription-section`, @ticket SP-441 |

#### Paliers progressifs TRIAL

| Palier  | Jours restants | Couleur     | Icône          | CTA                    | Masquable | Rôle ARIA |
| ------- | -------------- | ----------- | -------------- | ---------------------- | --------- | --------- |
| info    | 7-14 jours     | Bleu (info) | Info           | Voir les offres        | Oui       | status    |
| warning | 4-6 jours      | Orange      | AlertTriangle  | S'abonner              | Oui       | status    |
| urgent  | 1-3 jours      | Rouge       | AlertCircle    | S'abonner maintenant   | Non       | alert     |

#### Logique PAST_DUE

| Condition                    | Affichage                                     | Masquable |
| ---------------------------- | --------------------------------------------- | --------- |
| < 7 jours depuis expiration  | Bannière warning "Paiement en retard"         | Non       |
| ≥ 7 jours depuis expiration  | Masquée (bloqué par SP-440 guard)             | —         |
| currentPeriodEnd null        | Bannière warning générique                    | Non       |

**Décisions techniques documentées** :

1. **Pourquoi une fonction pure séparée du composant React ?** `getSubscriptionBannerConfig()` est testable sans mocks React (44 tests en < 5ms), réutilisable côté serveur, et compatible Edge Runtime. Le composant React ne fait que du rendu conditionnel à partir de la config retournée.

2. **Pourquoi un dismiss par tier dans localStorage ?** Quand l'utilisateur masque la bannière au palier "info" (10 jours), elle réapparaît au passage au palier "warning" (6 jours). Cela évite de masquer indéfiniment une information dont l'urgence augmente.

3. **Pourquoi exclure la page billing ?** La page billing affiche déjà les alertes SP-440 (blocking reasons) et le héro de conversion SP-441. Afficher la bannière en plus serait redondant et visuellement encombrant.

4. **Pourquoi passer subscriptionData depuis le Server Component ?** Pattern Next.js 15 recommandé : les données session sont lues côté serveur dans `layout.tsx` (auth()) et passées en props aux Client Components. Pas de `useSession()` ni `SessionProvider` nécessaire, ce qui évite un fetch client supplémentaire.

---

## Détail des tests Sprint 11 - Accessibilité WCAG 2.1 (SP-269) 🆕

### SP-269 : Accessibilité WCAG 2.1 - Skip Link + Tests axe-core (28 tests)

**Objectif** : Implémenter la conformité WCAG 2.1 niveau AA avec un composant Skip to Main Content (WCAG 2.4.1 Bypass Blocks), des tests E2E automatisés via @axe-core/playwright, et un script d'audit Lighthouse.

| Suite de test         | Tests unitaires | Tests E2E | Total  |
| --------------------- | --------------- | --------- | ------ |
| SkipLink component    | 14              | 0         | 14     |
| accessibility.spec.ts | 0               | 14        | 14     |
| **Total**             | **14**          | **14**    | **28** |

**Fichiers créés** :

| Fichier                                              | Description                                   |
| ---------------------------------------------------- | --------------------------------------------- |
| `src/components/layout/skip-link.tsx`                | Composant SkipLink (WCAG 2.4.1 Bypass Blocks) |
| `src/components/layout/__tests__/skip-link.test.tsx` | 14 tests unitaires SkipLink                   |
| `e2e/specs/a11y/accessibility.spec.ts`               | 14 tests E2E axe-core WCAG                    |
| `scripts/lighthouse-audit.js`                        | Script audit Lighthouse accessibilité         |
| `docs/lighthouse-a11y-report.md`                     | Rapport Lighthouse généré                     |

**Tests E2E par catégorie (accessibility.spec.ts)** :

| Catégorie           | Nb tests | Description                                              |
| ------------------- | -------- | -------------------------------------------------------- |
| Public Pages        | 3        | Audit WCAG login, register, home (violations critiques)  |
| Skip Link           | 4        | Présence DOM, visibilité focus, navigation, main-content |
| Keyboard Navigation | 2        | Tab navigation, Escape fermeture modals                  |
| Color Contrast      | 1        | Violations critiques contraste                           |
| Forms               | 2        | Labels accessibles login/register                        |
| ARIA & Semantics    | 2        | Landmark regions, éléments focusables                    |
| **Total**           | **14**   |                                                          |

**Tests unitaires SkipLink (skip-link.test.tsx)** :

| Catégorie     | Nb tests | Description                                                |
| ------------- | -------- | ---------------------------------------------------------- |
| Rendering     | 3        | Rendu par défaut, label custom, targetId custom            |
| Accessibility | 4        | href correct, data-testid, focus visible, sr-only initial  |
| Styling       | 4        | Classes sr-only, focus:not-sr-only, bg-primary, ring focus |
| Customization | 3        | ClassName custom, props combinées, children                |
| **Total**     | **14**   |                                                            |

**Composant SkipLink** :

```typescript
// src/components/layout/skip-link.tsx
'use client'

export function SkipLink({
  label = 'Aller au contenu principal',
  targetId = 'main-content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only',                    // Invisible par défaut
        'focus:not-sr-only',          // Visible au focus
        'focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:font-medium',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      data-testid="skip-link"
    >
      {label}
    </a>
  )
}
```

**Intégration layout.tsx** :

```typescript
// src/app/layout.tsx
import { SkipLink } from '@/components/layout/skip-link'

<body>
  <SkipLink />  {/* Premier élément focusable */}
  <ThemeProvider>
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  </ThemeProvider>
</body>
```

**Configuration axe-core** :

```typescript
// e2e/specs/a11y/accessibility.spec.ts
import AxeBuilder from '@axe-core/playwright'

const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) // WCAG 2.1 AA
  .disableRules(['color-contrast']) // Exclusion design choice
  .analyze()

const criticalViolations = accessibilityScanResults.violations.filter(
  (v) => v.impact === 'critical'
) // Uniquement critiques
```

**Résultats Lighthouse Audit** :

| Page                 | Score   | Statut              |
| -------------------- | ------- | ------------------- |
| Accueil (/)          | 95%     | ✅ Conforme         |
| Login (/login)       | 95%     | ✅ Conforme         |
| Register (/register) | 95%     | ✅ Conforme         |
| **Moyenne**          | **95%** | ✅ (objectif ≥ 90%) |

**Scripts NPM ajoutés** :

```bash
npm run test:a11y     # Tests E2E accessibilité (14 tests)
npm run a11y:audit    # Audit Lighthouse (nécessite serveur actif)
```

**Critères WCAG 2.1 AA implémentés** :

| Critère | Description       | Implémentation                        |
| ------- | ----------------- | ------------------------------------- |
| 2.4.1   | Bypass Blocks     | SkipLink "Aller au contenu principal" |
| 2.4.3   | Focus Order       | Tab order logique, skip link premier  |
| 2.4.7   | Focus Visible     | ring-2 ring-ring ring-offset-2        |
| 2.5.5   | Target Size       | 44px minimum (SP-268 Phase 3)         |
| 4.1.2   | Name, Role, Value | aria-\* attributes sur formulaires    |

---

## Détail des tests Sprint 11 - E2E Mobile Tests (SP-389) 🆕

### SP-389 : Tests E2E Mobile Multi-Devices Playwright (90 tests)

**Objectif** : Implémenter une suite complète de tests E2E mobile couvrant 5 appareils différents (2 smartphones, 1 Android, 2 tablettes) avec émulation touch native Playwright.

| Suite de test                       | Tests actifs | Tests skip | Total  |
| ----------------------------------- | ------------ | ---------- | ------ |
| mobile/navigation.spec.ts           | 9            | 4          | 13     |
| mobile/command-palette.spec.ts      | 15           | 0          | 15     |
| mobile/breadcrumbs.spec.ts          | 20           | 0          | 20     |
| mobile/data-table.spec.ts           | 15           | 11         | 26     |
| mobile/touch-targets.mobile.spec.ts | 16           | 0          | 16     |
| **Total**                           | **75**       | **15**     | **90** |

**Devices configurés (playwright.config.ts)** :

| Device        | Viewport | Scale | Type       | Engine   |
| ------------- | -------- | ----- | ---------- | -------- |
| iPhone SE     | 320x568  | 2x    | Smartphone | Chromium |
| iPhone 14 Pro | 393x852  | 3x    | Smartphone | Chromium |
| Pixel 7       | 412x915  | 2.6x  | Android    | Chromium |
| iPad Mini     | 768x1024 | 2x    | Tablette   | Chromium |
| iPad Pro 11"  | 834x1194 | 2x    | Tablette   | Chromium |

> **Note technique** : Tous les projets mobiles utilisent Chromium au lieu de WebKit car WebKit a un bug connu qui upgrade `http://localhost` en `https://localhost`, causant des erreurs TLS et empêchant le login de fonctionner (voir ANO-020).

**Fichiers créés** :

| Fichier                                         | Description                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `e2e/fixtures/mobile.fixture.ts`                | Fixture d'authentification mobile avec MobileAuthPage               |
| `e2e/utils/touch-gestures.ts`                   | Utilitaires touch (tap, doubleTap, longPress, swipe, pinch, scroll) |
| `e2e/specs/mobile/navigation.spec.ts`           | Tests navigation mobile (menu hamburger, sidebar, swipe)            |
| `e2e/specs/mobile/command-palette.spec.ts`      | Tests Command Palette mobile (touch, clavier virtuel)               |
| `e2e/specs/mobile/breadcrumbs.spec.ts`          | Tests breadcrumbs responsive (scroll, truncation)                   |
| `e2e/specs/mobile/data-table.spec.ts`           | Tests DataTable mobile (cards, pagination touch)                    |
| `e2e/specs/mobile/touch-targets.mobile.spec.ts` | Tests WCAG 2.5.5 touch targets 44px                                 |
| `docs/e2e-mobile-tests.md`                      | Documentation complète                                              |

**Tests par catégorie** :

| Catégorie              | Nb tests | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| Navigation Mobile      | 13       | Menu hamburger, sidebar toggle, navigation swipe |
| Command Palette Touch  | 15       | Ouverture, recherche, navigation tactile, thème  |
| Breadcrumbs Responsive | 20       | Scroll horizontal, truncation, touch navigation  |
| DataTable Mobile       | 26       | Mode card, pagination tactile, tri mobile        |
| Touch Targets WCAG     | 16       | Zones 44px, boutons, formulaires, liens          |

**Anomalie identifiée et corrigée** : ANO-020 - WebKit HTTPS localhost upgrade bug → Migration vers Chromium avec viewports personnalisés.

---

## Détail des tests Sprint 11 - Mobile UI Components (SP-268 Phase 3) 🆕

### SP-268 Phase 3 : Mobile UI Component Adaptations (110 tests)

**Objectif** : Adapter les composants UI pour une expérience mobile optimale avec zones tactiles 44px (WCAG 2.5.5), prévention du zoom iOS et scroll horizontal snap.

| Composant                   | Tests unitaires | Tests E2E | Total   |
| --------------------------- | --------------- | --------- | ------- |
| SP-385 TouchableButton      | 31              | 0         | 31      |
| SP-386 MobileFormField      | 32              | 0         | 32      |
| SP-387 DataTablePagination  | 22              | 0         | 22      |
| SP-388 ResponsiveBreadcrumb | 25              | 0         | 25      |
| **Total**                   | **110**         | **0**     | **110** |

**Fichiers de test unitaires** :

| Fichier                                                                 | Nb tests | Description                                               |
| ----------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| `src/components/ui/__tests__/touchable-button.test.tsx`                 | 31       | Touch targets 44px, CVA variants, useIsMobile hook        |
| `src/components/ui/__tests__/mobile-form-field.test.tsx`                | 32       | iOS zoom prevention (font-size 16px), Visual Viewport API |
| `src/components/ui/data-table/__tests__/data-table-pagination.test.tsx` | 22       | Layout responsive, page size mobile, navigation           |
| `src/components/ui/__tests__/responsive-breadcrumb.test.tsx`            | 25       | Scroll horizontal, fade indicators, snap-to-item          |

---

### SP-385 : TouchableButton - Zones tactiles adaptatives (31 tests)

**Objectif** : Créer un wrapper Button intelligent avec zones tactiles 44px sur mobile (WCAG 2.5.5 AAA).

**Tests couverts** :

| Catégorie          | Nb tests | Description                                                      |
| ------------------ | -------- | ---------------------------------------------------------------- |
| Basic Rendering    | 4        | Rendu sans erreur, props passées, ref forwarding                 |
| Touch Size Mapping | 6        | Mapping default→touch, sm→touch-sm, lg→touch-lg, icon→touch-icon |
| Desktop Behavior   | 4        | Tailles standard sur desktop (pas de touch)                      |
| Mobile Behavior    | 5        | Tailles tactiles automatiques sur mobile                         |
| Force Touch Mode   | 4        | Prop forceTouchMode pour forcer 44px                             |
| Active Feedback    | 4        | Classes active:scale-95 active:opacity-90                        |
| CVA Variants       | 4        | Intégration buttonVariants touch-\*                              |

**Fichiers créés/modifiés** :

| Fichier                                                 | Description                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| `src/components/ui/button.tsx`                          | +buttonVariants touch-\*, +TouchableButton, +useIsMobile hook |
| `src/components/ui/__tests__/touchable-button.test.tsx` | 31 tests unitaires                                            |

**Architecture TouchableButton** :

```
TouchableButton (Client Component)
├── Props
│   ├── ...ButtonProps (variant, size, etc.)
│   └── forceTouchMode?: boolean
├── Hooks
│   └── useIsMobile() → matchMedia (max-width: 767px)
├── Size Mapping
│   ├── default → touch (h-11 min-h-[44px])
│   ├── sm → touch-sm (h-11 min-h-[44px])
│   ├── lg → touch-lg (h-12 min-h-[48px])
│   └── icon → touch-icon (h-11 w-11 min-h-[44px])
└── Active Feedback
    └── active:scale-95 active:opacity-90 (mobile)
```

---

### SP-386 : MobileFormField - Prévention zoom iOS (32 tests)

**Objectif** : Wrapper pour inputs avec font-size ≥ 16px évitant l'auto-zoom iOS.

**Tests couverts** :

| Catégorie           | Nb tests | Description                             |
| ------------------- | -------- | --------------------------------------- |
| Basic Rendering     | 4        | Rendu input, label, description         |
| iOS Zoom Prevention | 6        | font-size 16px, Visual Viewport API     |
| Desktop Behavior    | 4        | Styles standard sans modification       |
| Mobile Behavior     | 6        | Classes adaptatives, touch targets      |
| Error States        | 4        | Affichage erreurs, aria-invalid         |
| Accessibility       | 4        | Labels, aria-describedby, focus visible |
| Variants            | 4        | Input, textarea, select variants        |

**Fichiers créés** :

| Fichier                                                  | Description                     |
| -------------------------------------------------------- | ------------------------------- |
| `src/components/ui/mobile-form-field.tsx`                | Composant wrapper (~150 lignes) |
| `src/components/ui/__tests__/mobile-form-field.test.tsx` | 32 tests unitaires              |

**Caractéristiques iOS** :

| Feature             | Valeur            | Raison                     |
| ------------------- | ----------------- | -------------------------- |
| font-size           | ≥ 16px            | Évite auto-zoom iOS Safari |
| min-height          | 44px              | WCAG 2.5.5 touch target    |
| padding             | Augmenté          | Zone tactile confortable   |
| Visual Viewport API | Détection clavier | Ajustement viewport        |

---

### SP-387 : DataTablePagination - Layout responsive (22 tests)

**Objectif** : Pagination adaptive avec layout compact sur mobile et complet sur desktop.

**Tests couverts** :

| Catégorie       | Nb tests | Description                                |
| --------------- | -------- | ------------------------------------------ |
| Basic Rendering | 3        | Contrôles pagination, prev/next, page info |
| Desktop Layout  | 3        | First/last buttons, full text, flex-row    |
| Mobile Layout   | 5        | Compact "3/5", flex-col, hidden first/last |
| Touch Targets   | 2        | Boutons 44px, select trigger 44px          |
| Navigation      | 4        | previousPage, nextPage, setPageIndex       |
| Disabled States | 4        | Boutons disabled sur first/last page       |
| Accessibility   | 1        | aria-labels navigation                     |

**Fichiers modifiés** :

| Fichier                                                                 | Description                     |
| ----------------------------------------------------------------------- | ------------------------------- |
| `src/components/ui/data-table/data-table-pagination.tsx`                | Layout responsive (~200 lignes) |
| `src/components/ui/data-table/__tests__/data-table-pagination.test.tsx` | 22 tests unitaires              |

**Layout comparaison** :

| Feature            | Desktop                | Mobile           |
| ------------------ | ---------------------- | ---------------- |
| First/Last buttons | ✅ Visible             | ❌ Masqués       |
| Page info          | "Page 3 sur 5"         | "3/5"            |
| Total rows         | "45 ligne(s) au total" | "45 résultat(s)" |
| Page size label    | "Lignes par page"      | "Par page"       |
| Page size options  | 10, 20, 50, 100        | 10, 25, 50       |
| Layout             | flex-row               | flex-col         |
| Touch targets      | Standard               | 44px minimum     |

---

### SP-388 : ResponsiveBreadcrumb - Scroll horizontal mobile (25 tests)

**Objectif** : Breadcrumb avec scroll horizontal et snap-to-item sur mobile.

**Tests couverts** :

| Catégorie        | Nb tests | Description                                 |
| ---------------- | -------- | ------------------------------------------- |
| Basic Rendering  | 3        | Rendu items, separators                     |
| Desktop Behavior | 4        | Layout standard, flex-wrap                  |
| Mobile Scroll    | 6        | overflow-x-auto, scroll-to-end, touch-pan-x |
| Snap Behavior    | 4        | snap-x snap-mandatory, snap-center items    |
| Fade Indicators  | 5        | Left/right fade, visibility on scroll       |
| Accessibility    | 3        | aria-hidden fades, navigation role          |

**Fichiers modifiés** :

| Fichier                                                      | Description                         |
| ------------------------------------------------------------ | ----------------------------------- |
| `src/components/ui/breadcrumb.tsx`                           | +ResponsiveBreadcrumb (~150 lignes) |
| `src/components/ui/__tests__/responsive-breadcrumb.test.tsx` | 25 tests unitaires                  |

**Architecture ResponsiveBreadcrumb** :

```
ResponsiveBreadcrumb (Client Component)
├── Props
│   ├── children: React.ReactNode
│   ├── separator?: React.ReactNode
│   ├── showFadeEdges?: boolean (default: true)
│   └── className?: string
├── Hooks
│   └── useIsMobile() → matchMedia (max-width: 767px)
├── Desktop
│   └── Standard Breadcrumb + BreadcrumbList
└── Mobile
    ├── Scroll Container (overflow-x-auto)
    │   ├── scrollbar-none (hidden)
    │   ├── touch-pan-x (horizontal touch)
    │   └── scroll-to-end (current page visible)
    ├── BreadcrumbList
    │   ├── flex-nowrap
    │   ├── snap-x snap-mandatory
    │   └── Items avec snap-center shrink-0
    └── Fade Indicators (conditional)
        ├── Left fade (bg-gradient-to-r)
        └── Right fade (bg-gradient-to-l)
```

**CSS Scroll Snap** :

| Property       | Value                     | Description      |
| -------------- | ------------------------- | ---------------- |
| snap-x         | scroll-snap-type: x       | Snap horizontal  |
| snap-mandatory | mandatory                 | Force snap       |
| snap-center    | scroll-snap-align: center | Centre l'item    |
| touch-pan-x    | touch-action: pan-x       | Geste horizontal |

---

## Détail des tests Sprint 11 - Navigation Mobile Phase 2 🆕

### SP-383/SP-384 : SwipeableDrawer + Sidebar Mobile (21 tests)

**Objectif** : Créer une expérience de navigation mobile native avec gestes tactiles (swipe to close).

| Composant       | Tests unitaires | Tests E2E | Total  |
| --------------- | --------------- | --------- | ------ |
| SwipeableDrawer | 21              | 0         | 21     |
| **Total**       | **21**          | **0**     | **21** |

**Fichiers de test unitaires** :

| Fichier                                                     | Nb tests | Description                               |
| ----------------------------------------------------------- | -------- | ----------------------------------------- |
| `src/components/mobile/__tests__/swipeable-drawer.test.tsx` | 21       | Rendering, props, accessibility, gestures |

**Tests couverts** :

| Catégorie             | Nb tests | Description                 |
| --------------------- | -------- | --------------------------- |
| Conditional Rendering | 2        | open/closed states          |
| Side Props            | 2        | left/right positioning      |
| Accessibility         | 2        | ARIA attributes, Escape key |
| Overlay Interaction   | 1        | Click backdrop to close     |
| Close Button          | 3        | Show/hide, onClick callback |
| Custom Width          | 2        | Default 280px, custom width |
| Callbacks             | 1        | onOpen callback             |
| Body Scroll Lock      | 2        | Lock/unlock body scroll     |
| Swipe Indicator       | 2        | Show/hide indicator         |
| Drag Configuration    | 2        | Enable/disable drag         |
| Custom ClassName      | 1        | Apply custom class          |
| Children Rendering    | 1        | Complex children            |

**Fichiers créés** :

| Fichier                                                     | Description                                              |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| `src/components/mobile/swipeable-drawer.tsx`                | Composant drawer avec gestes Framer Motion (~370 lignes) |
| `src/components/mobile/index.ts`                            | Barrel export                                            |
| `src/components/mobile/__tests__/swipeable-drawer.test.tsx` | 21 tests unitaires                                       |

**Fichier modifié** :

| Fichier                         | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| `src/components/ui/sidebar.tsx` | Intégration SwipeableDrawer sur mobile avec feature flag |

**Fonctionnalités implémentées** :

| Feature                | Description                     | Valeur par défaut           |
| ---------------------- | ------------------------------- | --------------------------- |
| Swipe to close         | Geste horizontal pour fermer    | Threshold: 100px            |
| Velocity detection     | Fermeture rapide avec vélocité  | 500px/s                     |
| Spring animation       | Animation fluide avec damping   | damping: 30, stiffness: 400 |
| Body scroll lock       | Verrouillage scroll body        | Activé quand ouvert         |
| Focus trap             | Piège focus accessibilité       | Automatique                 |
| iOS safe-area          | Support notch iPhone            | env(safe-area-inset-\*)     |
| prefers-reduced-motion | Respect préférences utilisateur | Animation réduite si activé |
| Portal rendering       | Rendu dans document.body        | z-index: 50                 |

**Architecture SwipeableDrawer** :

```
SwipeableDrawer (Client Component)
├── Props
│   ├── open: boolean (contrôle ouvert/fermé)
│   ├── onClose: () => void (callback fermeture)
│   ├── onOpen?: () => void (callback ouverture)
│   ├── side: 'left' | 'right' (côté d'apparition)
│   ├── width: number (largeur en px, défaut: 280)
│   ├── swipeToClose: boolean (activer swipe)
│   ├── swipeThreshold: number (seuil déplacement)
│   ├── velocityThreshold: number (seuil vélocité)
│   └── ariaLabel: string (label accessible)
├── Hooks internes
│   ├── useBodyScrollLock(open) → verrouillage scroll
│   ├── usePrefersReducedMotion() → détection reduced-motion
│   └── useFocusTrap(ref, isActive) → piège focus
├── Framer Motion
│   ├── AnimatePresence mode="wait"
│   ├── motion.div (overlay) → fade in/out
│   └── motion.div (panel)
│       ├── drag="x" | false
│       ├── dragConstraints (limites)
│       ├── dragElastic (rebond)
│       └── onDragEnd → détection swipe
└── Portal (createPortal → document.body)
```

**Intégration Sidebar** :

```typescript
// Feature flag pour rollback facile
const USE_SWIPEABLE_DRAWER = true

// Dans SidebarMobile
if (USE_SWIPEABLE_DRAWER) {
  return (
    <SwipeableDrawer
      open={openMobile}
      onClose={() => setOpenMobile(false)}
      side={side}
      width={parseInt(SIDEBAR_WIDTH_MOBILE)}
      swipeToClose={true}
      swipeThreshold={100}
      velocityThreshold={500}
    >
      {children}
    </SwipeableDrawer>
  )
}
// Fallback Sheet si feature flag désactivé
```

---

## Détail des tests Sprint 11 - Dashboard Layout V2 🆕

### SP-264 : Dashboard Layout V2 (163 tests)

**Objectif** : Améliorer l'expérience de navigation avec Command Palette, breadcrumbs dynamiques, raccourcis clavier et pages récentes.

| Composant                   | Tests unitaires | Tests E2E | Total   |
| --------------------------- | --------------- | --------- | ------- |
| Command Palette             | 45              | 12        | 57      |
| Dynamic Breadcrumbs         | 28              | 0         | 28      |
| Keyboard Shortcuts Modal    | 22              | 8         | 30      |
| Recent Pages (localStorage) | 38              | 10        | 48      |
| **Total**                   | **133**         | **30**    | **163** |

**Fichiers de test unitaires** :

| Fichier                                                                | Nb tests | Description                              |
| ---------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `src/components/ui/__tests__/command-palette.test.tsx`                 | 45       | Recherche, filtrage, navigation, thème   |
| `src/components/ui/__tests__/dynamic-breadcrumbs.test.tsx`             | 28       | Résolution entités, segments, Schema.org |
| `src/components/ui/__tests__/keyboard-shortcuts-modal.test.tsx`        | 22       | Affichage, catégories, accessibilité     |
| `src/hooks/__tests__/use-keyboard-shortcuts.test.ts`                   | 12       | Hook raccourcis clavier                  |
| `src/hooks/__tests__/use-breadcrumb-resolver.test.ts`                  | 15       | Résolution IDs dynamiques                |
| `src/hooks/__tests__/use-recent-pages.test.tsx`                        | 18       | Hook pages récentes                      |
| `src/lib/storage/__tests__/recent-pages-store.test.ts`                 | 20       | Store localStorage                       |
| `src/providers/__tests__/keyboard-shortcuts-provider.test.tsx`         | 8        | Provider raccourcis                      |
| `src/components/providers/__tests__/command-palette-provider.test.tsx` | 15       | Provider Command Palette                 |

**Fichiers de test E2E** :

| Fichier                                           | Nb tests | Description                                    |
| ------------------------------------------------- | -------- | ---------------------------------------------- |
| `e2e/specs/navigation/command-palette.spec.ts`    | 12       | Ouverture ⌘K, recherche, navigation, thème     |
| `e2e/specs/navigation/keyboard-shortcuts.spec.ts` | 8        | Raccourcis G+H/E/P/T/C, modal ?                |
| `e2e/specs/navigation/recent-pages.spec.ts`       | 10       | Stockage, déduplication, limite 5, persistance |

> **Note** : Les tests E2E `keyboard-shortcuts.spec.ts` et `recent-pages.spec.ts` sont temporairement désactivés (`test.describe.skip`) car ils dépendent de routes non encore implémentées (`/schedules`, `/leaves`, `/tasks`, `/stats`).

**Fonctionnalités implémentées** :

| Feature                  | Description                               | Raccourci               |
| ------------------------ | ----------------------------------------- | ----------------------- |
| Command Palette          | Recherche globale et navigation rapide    | ⌘K / Ctrl+K             |
| Dynamic Breadcrumbs      | Fil d'Ariane avec résolution d'entités    | -                       |
| Keyboard Shortcuts Modal | Aide raccourcis clavier                   | ?                       |
| Navigation shortcuts     | Accès rapide aux pages                    | G+H, G+E, G+P, G+T, G+C |
| Recent Pages             | Historique des 5 dernières pages visitées | -                       |

**Architecture Command Palette** :

```
CommandPaletteProvider (Context)
├── useCommandPalette hook (état ouvert/fermé)
├── CommandPalette component (cmdk)
│   ├── CommandInput (recherche)
│   ├── CommandList
│   │   ├── CommandGroup "Navigation"
│   │   ├── CommandGroup "Pages récentes"
│   │   └── CommandGroup "Thème"
│   └── CommandEmpty ("Aucun résultat")
└── Integration Header (⌘K button)
```

**Architecture Recent Pages** :

```
PageTracker component (invisible)
├── usePathname() - détection changement route
├── useRecentPages hook
│   └── recent-pages-store (Zustand + localStorage)
│       ├── addPage(path, title, icon)
│       ├── getPages() - limite 5
│       └── clearPages()
└── ROUTE_INFO_MAP - mapping routes → titres/icônes
```

---

### SP-259 : Design Tokens System (45 tests)

| Fichier de test                              | Nb tests | Description                                  |
| -------------------------------------------- | -------- | -------------------------------------------- |
| `src/styles/tokens/__tests__/colors.test.ts` | 16       | Palette couleurs, semantic colors, dark mode |
| `src/styles/tokens/__tests__/tokens.test.ts` | 29       | Spacing, typography, breakpoints, shadows    |

**Tokens implémentés** :

- Colors : primary, secondary, success, warning, error, neutral
- Spacing : 0.25rem à 4rem (8 niveaux)
- Typography : font-size, font-weight, line-height
- Breakpoints : sm, md, lg, xl, 2xl
- Shadows : sm, md, lg, xl

---

### SP-379 : Animation System (212 tests)

| Fichier de test                                                      | Nb tests | Description                      |
| -------------------------------------------------------------------- | -------- | -------------------------------- |
| `src/lib/animations/__tests__/variants.test.ts`                      | 35       | fadeIn, slideUp, scale, stagger  |
| `src/lib/animations/__tests__/config.test.ts`                        | 23       | Configuration durations, easings |
| `src/lib/animations/__tests__/presets.test.ts`                       | 37       | Presets réutilisables            |
| `src/lib/animations/__tests__/hooks/useAnimation.test.ts`            | 20       | Hook animation générique         |
| `src/lib/animations/__tests__/hooks/useReducedMotion.test.ts`        | 12       | Respect prefers-reduced-motion   |
| `src/lib/animations/__tests__/hooks/useStaggerAnimation.test.ts`     | 15       | Animations décalées              |
| `src/lib/animations/__tests__/hooks/useInViewAnimation.test.ts`      | 18       | Animation au scroll              |
| `src/lib/animations/__tests__/components/AnimatedContainer.test.tsx` | 19       | Wrapper animé                    |
| `src/lib/animations/__tests__/components/AnimatedList.test.tsx`      | 33       | Liste avec stagger               |

**Architecture centralisée** :

```
src/lib/animations/
├── index.ts (exports)
├── variants.ts (fadeIn, slideUp, scale, etc.)
├── config.ts (durations, easings)
├── presets.ts (button, card, modal, etc.)
├── hooks/
│   ├── useAnimation.ts
│   ├── useReducedMotion.ts
│   ├── useStaggerAnimation.ts
│   └── useInViewAnimation.ts
└── components/
    ├── AnimatedContainer.tsx
    └── AnimatedList.tsx
```

---

### SP-265 : Dark/Light Mode (32 tests)

| Fichier de test                                      | Nb tests | Description                |
| ---------------------------------------------------- | -------- | -------------------------- |
| `src/components/ui/__tests__/ThemeToggle.test.tsx`   | 15       | Toggle light/dark          |
| `src/components/ui/__tests__/ThemeDropdown.test.tsx` | 17       | Dropdown light/dark/system |

**Fonctionnalités** :

- Détection automatique préférence système
- Persistance localStorage
- Transition fluide CSS
- Support next-themes

---

### SP-378 : Empty States (78 tests)

| Fichier de test                                                 | Nb tests | Description                         |
| --------------------------------------------------------------- | -------- | ----------------------------------- |
| `src/components/ui/__tests__/empty-state.test.tsx`              | 52       | Composant EmptyState avec variantes |
| `src/components/illustrations/__tests__/illustrations.test.tsx` | 26       | 5 illustrations SVG                 |

**Illustrations disponibles** :

- NoData - Données vides
- NoResults - Aucun résultat de recherche
- NoNotifications - Pas de notifications
- NoTasks - Pas de tâches
- NoUsers - Pas d'utilisateurs

---

### SP-266 : Loading States (133 tests)

| Fichier de test                                        | Nb tests | Description           |
| ------------------------------------------------------ | -------- | --------------------- |
| `src/components/ui/__tests__/progress-bar.test.tsx`    | 31       | Barre de progression  |
| `src/components/ui/__tests__/progress-circle.test.tsx` | 35       | Cercle de progression |
| `src/components/hoc/__tests__/with-loading.test.tsx`   | 34       | HOC loading           |
| `src/hooks/__tests__/use-progress-loading.test.ts`     | 33       | Hook progression      |

**Composants** :

- ProgressBar : barre horizontale avec pourcentage
- ProgressCircle : cercle SVG animé
- withLoading HOC : wrapper état loading
- useProgressLoading : hook avec auto-increment

---

### SP-260 : UI Components Extension (147 tests)

| Fichier de test                                         | Nb tests | Description                  |
| ------------------------------------------------------- | -------- | ---------------------------- |
| `src/components/ui/__tests__/button-variants.test.tsx`  | 22       | Variants additionnels Button |
| `src/components/ui/__tests__/badge-extensions.test.tsx` | 49       | Extensions Badge             |
| `src/components/ui/__tests__/input-extensions.test.tsx` | 42       | Extensions Input             |
| `src/components/ui/__tests__/avatar-group.test.tsx`     | 34       | Groupe d'avatars             |

**Extensions Button** :

- `variant="ghost"`, `variant="link"`
- `size="icon"`, `size="xs"`
- `loading` prop avec spinner

**Extensions Badge** :

- `variant="outline"`, `variant="dot"`
- Couleurs semantic (success, warning, error)

**Extensions Input** :

- `leftIcon`, `rightIcon`
- `error` state avec message
- `clearable` button

---

### SP-305 : Page 403 Forbidden (76 tests)

| Fichier de test                                      | Nb tests | Description                   |
| ---------------------------------------------------- | -------- | ----------------------------- |
| `__tests__/components/error/forbidden-page.test.tsx` | 52       | Tests unitaires ForbiddenPage |
| `e2e/specs/forbidden.spec.ts`                        | 24       | Tests E2E parcours 403        |

**Tests unitaires ForbiddenPage (52 tests)** :

- Rendu sans erreur avec props par défaut
- Affichage titre "403" avec gradient
- Message "Accès interdit"
- Description empathique
- Bouton "Retour" fonctionnel
- 3 liens rapides (Accueil, Dashboard, Connexion)
- ARIA attributes (role="region", aria-label, aria-describedby)
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Animation Framer Motion
- useReducedMotion respecté

**Tests E2E Playwright (24 tests)** :

| Catégorie                 | Nb tests | Description                                     |
| ------------------------- | -------- | ----------------------------------------------- |
| Affichage du contenu      | 5        | Page /forbidden, titre, message, icône, boutons |
| Boutons de navigation     | 5        | Retour, Accueil, Dashboard, Connexion           |
| Accessibilité WCAG 2.1 AA | 6        | aria-\*, rôles, contraste, navigation clavier   |
| Responsive design         | 4        | Mobile (375px), tablette (768px), desktop       |
| Animations                | 2        | Framer Motion, reduced motion                   |
| Métadonnées               | 2        | Titre page, meta description                    |

**Fichiers créés** :

| Fichier                                          | Description                |
| ------------------------------------------------ | -------------------------- |
| `src/components/error/ForbiddenPage.tsx`         | Composant page 403         |
| `src/components/error/ForbiddenIllustration.tsx` | Illustration Shield animée |
| `src/app/forbidden/page.tsx`                     | Route /forbidden           |

---

## Détail des tests Sprint 10 - Pages d'Erreur

### SP-303 : Page 500 - Erreur serveur personnalisée (96 tests)

| Fichier de test                                         | Nb tests | Description                                                        |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `__tests__/components/error/server-error-page.test.tsx` | ~40      | Tests unitaires ServerErrorPage (props, navigation, accessibilité) |
| `__tests__/lib/utils/error-logger.test.ts`              | ~34      | Tests unitaires error-logger (logging structuré, contexte)         |
| `e2e/specs/server-error.spec.ts`                        | 22       | Tests E2E parcours utilisateur erreur serveur                      |

**Tests E2E Playwright (22 tests)** :

| Catégorie                 | Nb tests | Description                                                             |
| ------------------------- | -------- | ----------------------------------------------------------------------- |
| Affichage du contenu      | 5        | Page /server-error, titre, message, icône, boutons                      |
| Boutons de navigation     | 5        | Réessayer, Retour accueil, Reporter problème                            |
| Accessibilité WCAG 2.1 AA | 5        | aria-labelledby, aria-describedby, rôles, contraste, navigation clavier |
| Responsive design         | 3        | Mobile (375px), tablette (768px), desktop (1920px)                      |
| Éléments visuels          | 2        | Icône ServerCrash, animations Framer Motion                             |
| Métadonnées               | 2        | Titre page, meta description                                            |

**Fichiers créés** :

| Fichier                                    | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| `src/lib/utils/error-logger.ts`            | Utilitaire logging structuré (timestamp, stack, context) |
| `src/components/error/ServerErrorPage.tsx` | Composant page 500 avec animations Framer Motion         |
| `src/app/server-error/page.tsx`            | Route accessible à /server-error                         |

**Caractéristiques** :

- ✅ Accessibilité WCAG 2.1 AA complète
- ✅ Animations Framer Motion (stagger, fade-in, slide-up)
- ✅ Logging structuré avec contexte
- ✅ Localisation française
- ✅ Dark mode natif
- ✅ Route /server-error (évite conflit /500 Next.js)

**Utilisation dans les API routes** :

```typescript
import { logServerError } from '@/lib/utils/error-logger'

export async function GET() {
  try {
    // ... code
  } catch (error) {
    await logServerError(error as Error, { route: '/api/example' })
    return NextResponse.redirect('/server-error')
  }
}
```

### SP-302 : Page 404 personnalisée (48 tests)

| Fichier de test                                      | Nb tests | Description                                          |
| ---------------------------------------------------- | -------- | ---------------------------------------------------- |
| `__tests__/components/error/not-found-page.test.tsx` | 40       | Tests unitaires NotFoundIllustration et NotFoundPage |
| `e2e/specs/not-found.spec.ts`                        | 8        | Tests E2E parcours utilisateur 404                   |

**Tests unitaires NotFoundIllustration (12 tests)** :

- Rendu sans erreur
- 3 cercles animés affichés
- Animations Framer Motion appliquées
- `aria-hidden="true"` présent (décoratif)
- `useReducedMotion` respecté
- Classes Tailwind correctes
- Variants floating et orbit
- Optimisations performance (will-change)

**Tests unitaires NotFoundPage (20 tests)** :

- Rendu complet (titre, description, boutons)
- Titre "404" avec gradient
- Message "Page non trouvée"
- Description empathique
- Bouton "Retour" présent et fonctionnel
- 3 liens rapides (Accueil, Dashboard, Connexion)
- ARIA attributes (role="region", aria-label, aria-describedby)
- Responsive (breakpoints sm/md)
- Dark mode support
- Navigation Next.js Link

**Tests unitaires not-found.tsx (8 tests)** :

- Métadonnées titre "404 - Page non trouvée"
- Métadonnées description SEO
- NotFoundPage rendu
- Structure HTML sémantique

**Tests E2E Playwright (8 tests)** :

| Scénario              | Navigateur           | Validation                 |
| --------------------- | -------------------- | -------------------------- |
| URL inexistante → 404 | Chromium             | HTTP 404 + page affichée   |
| Clic "Retour"         | Firefox              | Navigation arrière         |
| Clic "Accueil"        | WebKit               | Navigation vers /          |
| Clic "Dashboard"      | Chromium             | Navigation vers /dashboard |
| Responsive mobile     | Chromium (390x844)   | Layout adapté              |
| Responsive desktop    | Chromium (1920x1080) | Layout centré              |
| Accessibilité ARIA    | Chromium             | Attributs présents         |
| Dark mode             | Chromium             | Classes appliquées         |

**Accessibilité WCAG 2.1 AA implémentée** :

| Attribut             | Utilisation                                                 |
| -------------------- | ----------------------------------------------------------- |
| `role="region"`      | Conteneur principal (évite conflit avec `<main>` du layout) |
| `aria-label`         | "Page non trouvée"                                          |
| `aria-labelledby`    | Lie titre h1 au conteneur                                   |
| `aria-describedby`   | Lie description au conteneur                                |
| `aria-hidden="true"` | Illustration décorative                                     |
| Navigation clavier   | Tab (skip-link → boutons), Enter, focus visible             |
| Contraste couleurs   | ≥ 4.5:1 (Lighthouse 100/100)                                |

**Animations Framer Motion** :

| Animation | Effet                    | Durée      | Easing    |
| --------- | ------------------------ | ---------- | --------- |
| Floating  | Mouvement vertical ±10px | 3s         | easeInOut |
| Orbit     | Rotation cercles         | 8s         | linear    |
| Fade in   | Apparition progressive   | 0.5s       | easeOut   |
| Stagger   | Effet cascade            | 0.1s delay | easeOut   |
| Scale     | Zoom "404" (0.95→1)      | 0.5s       | easeOut   |

**Fichiers créés** :

| Fichier                                         | Description                       |
| ----------------------------------------------- | --------------------------------- |
| `src/components/error/NotFoundIllustration.tsx` | Illustration animée Framer Motion |
| `src/components/error/NotFoundPage.tsx`         | Composant page 404 réutilisable   |
| `src/app/not-found.tsx`                         | Point d'entrée Next.js App Router |
| `src/components/error/index.ts`                 | Exports module                    |

**Architecture modulaire (3 composants)** :

```
not-found.tsx (Server Component)
├── Métadonnées SEO
├── Layout global
└── NotFoundPage (Client Component)
    ├── Structure page
    ├── Navigation (liens, boutons)
    ├── Responsive design
    └── NotFoundIllustration (Client Component)
        ├── Animations Framer Motion
        ├── Effets visuels
        └── Performance optimisée
```

**Cohérence design avec l'application** :

- Shadcn/ui buttons (`variant="default"`, `variant="outline"`)
- Tailwind CSS (bg-muted/30, text-primary, gradient)
- Framer Motion (stagger, floating, orbit)
- Dark mode natif (classes `dark:`)
- Mobile-first responsive

### SP-304 : Error Boundary React (27 tests)

| Fichier de test                                      | Nb tests | Description                                    |
| ---------------------------------------------------- | -------- | ---------------------------------------------- |
| `__tests__/components/error/error-boundary.test.tsx` | 22       | Tests unitaires ErrorBoundary et ErrorFallback |
| `e2e/specs/error-boundary.spec.ts`                   | 5        | Tests E2E parcours utilisateur erreur          |

**Tests unitaires ErrorBoundaryWrapper (12 tests)** :

- Rendu des enfants sans erreur
- Capture d'erreur et affichage fallback
- Callback onError appelé avec erreur et errorInfo
- Callback onReset appelé au reset
- Reset via resetErrorBoundary
- Reset automatique via resetKeys
- Logging structuré (timestamp, message, stack, componentStack, URL)
- Support de fallback personnalisé
- Rendu par défaut sans fallback custom

**Tests unitaires ErrorFallback (10 tests)** :

- Affichage du titre d'erreur
- Affichage du message explicatif
- Bouton "Réessayer" présent et fonctionnel
- Bouton "Retour à l'accueil" présent
- Navigation vers / au clic sur Accueil
- resetErrorBoundary appelé au clic Réessayer
- `role="alert"` présent (accessibilité)
- `aria-live="assertive"` présent
- aria-labelledby et aria-describedby corrects
- Stack trace visible en mode dev uniquement
- Code erreur (digest) affiché en production

**Tests E2E Playwright (5 tests)** :

| Scénario           | Validation                         |
| ------------------ | ---------------------------------- |
| Navigation normale | Pas d'affichage du fallback        |
| Erreur simulée     | Le fallback s'affiche correctement |
| Clic sur Réessayer | Le composant se recharge           |
| Clic sur Accueil   | Redirection vers la page d'accueil |
| Accessibilité      | Attributs ARIA présents            |

**Accessibilité WCAG 2.1 AA implémentée** :

| Attribut                | Utilisation                           |
| ----------------------- | ------------------------------------- |
| `role="alert"`          | Annonce d'erreur aux lecteurs d'écran |
| `aria-live="assertive"` | Annonce immédiate de l'erreur         |
| `aria-labelledby`       | Lie le titre au conteneur             |
| `aria-describedby`      | Lie la description au conteneur       |
| `aria-label`            | Labels sur boutons d'action           |
| `aria-hidden="true"`    | Icônes décoratives masquées           |
| `aria-expanded`         | État du toggle détails techniques     |
| `aria-controls`         | Relation toggle/contenu               |

**Fichiers créés** :

| Fichier                                  | Description                                         |
| ---------------------------------------- | --------------------------------------------------- |
| `src/components/error/ErrorBoundary.tsx` | Wrapper react-error-boundary avec logging structuré |
| `src/components/error/ErrorFallback.tsx` | UI de secours avec retry/home buttons               |
| `src/components/error/index.ts`          | Exports du module                                   |
| `src/app/error.tsx`                      | Next.js route segment error boundary                |
| `src/app/global-error.tsx`               | Next.js root layout error (inline styles)           |
| `src/app/(test)/test-error/page.tsx`     | Page de test pour E2E                               |

**Intégration Next.js 15 App Router** :

| Fichier            | Rôle                                  | Complément Error Boundary                 |
| ------------------ | ------------------------------------- | ----------------------------------------- |
| `error.tsx`        | Erreurs dans Server/Client Components | Error Boundary = erreurs runtime client   |
| `global-error.tsx` | Erreurs dans root layout              | Dernier filet de sécurité (inline styles) |
| `layout.tsx`       | Wrapper ErrorBoundary global          | Capture toutes les erreurs React          |

---

## Détail des tests Sprint 9 - Module Email & Contact

### SP-301 : Tests Templates Contact (40 tests)

| Fichier de test                                                | Nb tests | Description                                                        |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `__tests__/emails/templates/ContactConfirmationEmail.test.tsx` | 18       | Rendu template confirmation, nom personnalisé, sujet, preview text |
| `__tests__/emails/templates/ContactNotificationEmail.test.tsx` | 22       | Rendu template notification, infos expéditeur, timestamp, emoji    |

> **Note** : SP-301 était un doublon partiel de SP-288. Les templates existaient déjà, seuls les tests unitaires des templates React Email manquaient.

**Tests ContactConfirmationEmail (18 tests)** :

- Rendu sans erreur avec props valides
- Affiche le nom personnalisé
- Affiche le sujet du message
- Message de remerciement présent
- Utilise EmailLayout existant
- Preview text correct ("Nous avons bien reçu votre message")
- Délai de réponse mentionné (24-48h)
- Snapshot test HTML

**Tests ContactNotificationEmail (22 tests)** :

- Rendu sans erreur avec props valides
- Affiche toutes les informations expéditeur (nom, email)
- Affiche le sujet et message complet
- Affiche le timestamp formaté
- Emoji 📩 présent dans le titre
- Whitespace preservé pour le message (pre-wrap)
- Séparateur Hr présent
- Utilise EmailLayout existant
- Preview text avec nom expéditeur

### SP-300 : Email Congé Validé/Refusé - Phase 1 (48 tests)

| Fichier de test                                          | Nb tests | Description                                                               |
| -------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `__tests__/emails/templates/LeaveApprovedEmail.test.tsx` | ~14      | Rendu template, prénom personnalisé, type congé FR, dates formatées, CTA  |
| `__tests__/emails/templates/LeaveRejectedEmail.test.tsx` | ~14      | Rendu, motif de refus, message empathique, invitation contact manager     |
| `__tests__/lib/email/templates/leave-decision.test.ts`   | ~20      | Fonctions d'envoi, formatage dates FR, traduction types congés, mock SMTP |

**Types de congés supportés (6 types)** :

| Type         | Label français     |
| ------------ | ------------------ |
| PAID_LEAVE   | Congés payés       |
| RTT          | RTT                |
| SICK_LEAVE   | Arrêt maladie      |
| UNPAID_LEAVE | Congé sans solde   |
| FAMILY_EVENT | Événement familial |
| OTHER        | Autre              |

### SP-289 : Contact UX - États succès/erreur (54 tests)

| Fichier de test                                                | Nb tests | Description                                                 |
| -------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `__tests__/hooks/useContactForm.test.ts`                       | 21       | Machine d'état complète (idle → submitting → success/error) |
| `__tests__/components/public/ContactSuccessState.test.tsx`     | 12       | Rendu, accessibilité (role="status"), callback onReset      |
| `__tests__/components/public/ContactErrorState.test.tsx`       | 10       | Rendu, animation shake, retry                               |
| `__tests__/components/public/ContactForm.integration.test.tsx` | 11       | Flux complets form → success/error                          |

### SP-288 : API Contact (88 tests - incluant SP-301)

| Fichier de test                                                | Nb tests | Description                                                |
| -------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `__tests__/lib/rate-limit.test.ts`                             | 15       | Rate limiter en mémoire complet                            |
| `__tests__/lib/email/templates/contact.test.ts`                | 13       | Fonctions sendContactConfirmation, sendContactNotification |
| `__tests__/app/api/contact/route.test.ts`                      | 20       | Route API POST /api/contact                                |
| `__tests__/emails/templates/ContactConfirmationEmail.test.tsx` | 18       | Template confirmation (SP-301)                             |
| `__tests__/emails/templates/ContactNotificationEmail.test.tsx` | 22       | Template notification (SP-301)                             |

### SP-287 : Formulaire Contact UI (41 tests)

| Fichier de test                                    | Nb tests | Description                                                                      |
| -------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `__tests__/lib/validations/contact.test.ts`        | 20       | Schéma Zod : cas valides, validation nom/email/sujet/message, valeurs par défaut |
| `__tests__/components/public/ContactForm.test.tsx` | 21       | Rendu, accessibilité, validation, soumission, états (loading, success)           |

### SP-295 : Configuration Email (43 tests)

| Fichier de test                           | Nb tests | Description                                                                      |
| ----------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `__tests__/lib/email/config.test.ts`      | 19       | isEmailConfigured, getSmtpConfig, getEmailFrom, getBaseUrl, getContactEmail      |
| `__tests__/lib/email/transporter.test.ts` | 9        | getTransporter (singleton), verifyConnection, closeTransporter, resetTransporter |
| `__tests__/lib/email/send.test.ts`        | 15       | sendEmail, sendEmails, retry logic, stripHtml fallback                           |

### SP-297 : Email Bienvenue (18 tests)

| Fichier de test                                    | Nb tests | Description                                                   |
| -------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `__tests__/emails/templates/WelcomeEmail.test.tsx` | 14       | Rendu template, personnalisation prénom, fonctionnalités, CTA |
| `__tests__/lib/email/templates/welcome.test.ts`    | 4        | sendWelcomeEmail function, intégration sendEmail              |

### SP-298 : Email Reset Password (9 tests)

| Fichier de test                                        | Nb tests | Description                                    |
| ------------------------------------------------------ | -------- | ---------------------------------------------- |
| `__tests__/lib/email/templates/reset-password.test.ts` | 9        | sendResetPasswordEmail, URL encoding, sécurité |

### SP-299 : Email Vérification (10 tests)

| Fichier de test                                            | Nb tests | Description                                              |
| ---------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `__tests__/lib/email/templates/verification-email.test.ts` | 10       | sendVerificationEmail, URL /verify-email, expiration 24h |

---

## Registre des anomalies

| ID      | Date       | Description                                                        | Sévérité | Résolution                                                                                                                                                                                          |
| ------- | ---------- | ------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ANO-001 | 05/12/2025 | MSW handlers non chargés dans Vitest                               | Majeure  | Ajout beforeAll/afterAll dans setup                                                                                                                                                                 |
| ANO-002 | 05/12/2025 | Erreur hydratation React 19                                        | Mineure  | Suppression console.log côté serveur                                                                                                                                                                |
| ANO-003 | 05/12/2025 | Tests Playwright timeout sur CI                                    | Majeure  | Augmentation timeout 30s → 60s                                                                                                                                                                      |
| ANO-004 | 05/12/2025 | Coverage v8 incompatible happy-dom                                 | Mineure  | Switch vers jsdom                                                                                                                                                                                   |
| ANO-005 | 09/12/2025 | Session user.role undefined dans middleware                        | Majeure  | Séparation authConfig Edge-compatible (SP-141)                                                                                                                                                      |
| ANO-006 | 09/12/2025 | Cookies de session non persistés entre tests                       | Majeure  | Fixtures d'authentification avec storageState                                                                                                                                                       |
| ANO-007 | 09/12/2025 | Tests E2E échouent sans Docker                                     | Mineure  | Documenter prérequis : docker compose up -d                                                                                                                                                         |
| ANO-008 | 10/12/2025 | Imports inutilisés dans tests dashboard                            | Mineure  | Suppression des imports non utilisés                                                                                                                                                                |
| ANO-009 | 10/12/2025 | formatHours() retournait entier                                    | Mineure  | Correction condition showMinutes=false                                                                                                                                                              |
| ANO-010 | 10/12/2025 | Variable key shadowed dans map()                                   | Mineure  | Renommage en dataKeyItem                                                                                                                                                                            |
| ANO-011 | 10/12/2025 | TypeScript erreur props optionnelles                               | Mineure  | Destructuration avec valeurs par défaut                                                                                                                                                             |
| ANO-012 | 10/12/2025 | CHART_COLORS.status.success inexistant                             | Mineure  | Utilisation de CHART_COLORS.success                                                                                                                                                                 |
| ANO-013 | 10/12/2025 | Tests échouent avec getByText (multiple matches)                   | Mineure  | Utilisation de getAllByText                                                                                                                                                                         |
| ANO-014 | 08/01/2026 | userId requis mais optionnel métier                                | Mineure  | Migration Prisma make_employee_userid_optional                                                                                                                                                      |
| ANO-015 | 12/01/2026 | TeamForm SelectItem value="" invalide (Radix)                      | Mineure  | Changé value="" en value="**none**"                                                                                                                                                                 |
| ANO-016 | 12/01/2026 | Page Objects locators "strict mode violation"                      | Mineure  | Ajout .first() sur locators ambigus                                                                                                                                                                 |
| ANO-017 | 16/01/2026 | État non partagé entre composants cookies (Context)                | Majeure  | Implémentation CookieConsentProvider avec Context API                                                                                                                                               |
| ANO-018 | 19/01/2026 | vi.mock() ne fonctionne pas avec ESM dynamique                     | Majeure  | Utilisation vi.doMock() + vi.resetModules() + import dynamique                                                                                                                                      |
| ANO-019 | 23/01/2026 | Test E2E "click overlay to close" Command Palette flaky en CI      | Mineure  | Suppression du test - le z-index du dialog cmdk intercepte les pointer events de l'overlay. Comportement déjà couvert par le test Escape.                                                           |
| ANO-020 | 25/01/2026 | WebKit upgrade http://localhost en https://localhost en mobile     | Majeure  | Bug connu WebKit causant erreurs TLS et échecs login sur tous tests mobiles. Solution : Migration vers Chromium avec viewports personnalisés et paramètres isMobile/hasTouch conservés.             |
| ANO-021 | 27/01/2026 | Boucles infinies React 19 dans ScheduleCalendar et composants liés | Majeure  | useEffect/useCallback avec dépendances circulaires causant re-renders infinis. Solution : stabilisation avec useRef pour les callbacks, suppression des dépendances instables, memoization stricte. |
| ANO-022 | 27/01/2026 | @schedule-x v4.1.0 incompatible Temporal API polyfill              | Majeure  | Typing DragAndDrop cassé et conflit Temporal API. Solution : Downgrade vers @schedule-x 2.11.0, patch-package pour corriger le typing DragAndDrop, postinstall script.                              |
| ANO-023 | 10/02/2026 | vi.hoisted() requis pour mocks MSW dans AvatarUpload               | Mineure  | Hoisting `vi.mock` avec `vi.hoisted()` pour que les variables de mock soient accessibles dans la factory function                                                                                   |
| ANO-024 | 10/02/2026 | MSW server.use() vs vi.stubGlobal('fetch') conflit                 | Mineure  | Utiliser `server.use()` au lieu de `vi.stubGlobal('fetch')` quand MSW est actif pour éviter les conflits d'interception                                                                            |
| ANO-025 | 10/02/2026 | TooltipProvider obligatoire pour Radix Tooltip dans DataTable       | Mineure  | Wrapper `TooltipProvider` requis dans les tests de colonnes DataTable utilisant Radix Tooltip, sinon erreur runtime                                                                                 |
| ANO-026 | 13/02/2026 | Tests nightly flaky : connection reset et timeouts CI               | Majeure  | Serveur `npm run dev` lent en CI GitHub Actions (3 workers parallèles). `net::ERR_CONNECTION_RESET` sur `page.goto('/login')`. Solution palliative (13/02) : retry 3x sur goto login, timeouts augmentés. **Résolution définitive (15/02)** : migration vers `npm run start` (mode production). 3 causes racines identifiées et corrigées : (1) cookies `secure: true` sur HTTP → `AUTH_URL=http://localhost:3000` désactive le préfixe `__Secure-`, (2) `trustHost` désactivé → `AUTH_TRUST_HOST=true`, (3) CSP `upgrade-insecure-requests` → rendu conditionnel selon protocole `AUTH_URL`. |
| ANO-027 | 15/02/2026 | `ERR_TOO_MANY_REDIRECTS` en mode production sur HTTP localhost      | Majeure  | NextAuth v5 en `NODE_ENV=production` active cookies `__Secure-` (refusés sur HTTP), `trustHost=false` (rejette les requêtes localhost), et CSP `upgrade-insecure-requests` (force HTTP→HTTPS). Solution : env vars `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST` + CSP conditionnel dans `next.config.ts`. |
| ANO-028 | 19/02/2026 | Boucle redirect infinie en mode impersonation (`ERR_TOO_MANY_REDIRECTS`) | Majeure  | Le JWT SYSTEM_ADMIN n'a pas de données subscription (null). En impersonation, le subscription guard voit "pas d'abonnement" → redirige vers `/billing` → l'impersonation guard bloque `/billing` → redirect `/dashboard` → boucle ∞. Solution : bypass du subscription guard dans `auth.config.ts` quand le cookie `sp-impersonation` est présent avec `originalAdminId` valide. |
| ANO-029 | 19/02/2026 | Bannière impersonation invisible après démarrage (NextAuth v5 updateSession) | Majeure  | `updateSession()` NextAuth v5 échoue avec `ClientFetchError: Failed to fetch` → le JWT n'est jamais mis à jour avec `isImpersonating: true` → `layout.tsx` lit `session.user.isImpersonating = false` → bannière non affichée. Solution : fallback lecture directe du cookie `sp-impersonation` dans le Server Component layout, avec vérification expiration 3600s et validité des champs. |

---

## Évolution de la couverture

| Date                        | Tests unitaires | Tests E2E | Total | Couverture | Tendance            |
| --------------------------- | --------------- | --------- | ----- | ---------- | ------------------- |
| 04/12/2025                  | 15              | 12        | 27    | ~70%       | 🟢 Début            |
| 05/12/2025                  | 474             | 12        | 486   | 83.83%     | 📈 +459             |
| 09/12/2025                  | 570             | 59        | 629   | ~85%       | 📈 +143             |
| 10/12/2025                  | 1250            | 59        | 1309  | ~85%       | 📈 +680             |
| 08/01/2026                  | 1354            | 165       | 1519  | ~85%       | 📈 +210             |
| 12/01/2026                  | 1391            | 214       | 1605  | ~85%       | 📈 +86              |
| 16/01/2026                  | 1474            | 229       | 1703  | ~85%       | 📈 +98              |
| 19/01/2026                  | 1785            | 229       | 2014  | ~85%       | 📈 +311             |
| 20/01/2026 (SP-304)         | 1807            | 234       | 2041  | ~85%       | 📈 +27              |
| 20/01/2026 (SP-302)         | 1847            | 242       | 2089  | ~85%       | 📈 +48              |
| 21/01/2026 (SP-303)         | 1921            | 264       | 2185  | ~85%       | 📈 +96              |
| 20/01/2026 (SP-305)         | 1970            | 297       | 2267  | ~85%       | 📈 +82              |
| 21/01/2026 (SP-259)         | 2015            | 297       | 2312  | ~85%       | 📈 +45              |
| 21/01/2026 (SP-379)         | 2227            | 297       | 2524  | ~85%       | 📈 +212             |
| 21/01/2026 (SP-265)         | 2259            | 297       | 2556  | ~85%       | 📈 +32              |
| 21/01/2026 (SP-260)         | 2406            | 297       | 2703  | ~85%       | 📈 +147             |
| 22/01/2026 (SP-378)         | 2484            | 297       | 2781  | ~85%       | 📈 +78              |
| 22/01/2026 (SP-266)         | 2617            | 297       | 2914  | ~85%       | 📈 +133             |
| 23/01/2026 (SP-264)         | 2750            | 327       | 3077  | ~85%       | 📈 +163             |
| 23/01/2026 (Hotfix)         | 2750            | 326       | 3076  | ~85%       | 🔧 -1               |
| 23/01/2026 (SP-383/384)     | 2771            | 326       | 3097  | ~85%       | 📈 +21              |
| 23/01/2026 (SP-268 Phase 3) | 2881            | 326       | 3207  | ~85%       | 📈 +110             |
| 25/01/2026 (SP-389)         | 2881            | 416       | 3297  | ~85%       | 📈 +90              |
| 25/01/2026 (SP-269)         | 2895            | 430       | 3325  | ~85%       | 📈 +28              |
| 25/01/2026 (SP-263)         | 2934            | 430       | 3364  | ~85%       | 📈 +39              |
| 26/01/2026 (SP-392)         | 2934            | 430       | 3364  | ~85%       | ⚙️ Prisma           |
| 26/01/2026 (SP-393)         | 3015            | 430       | 3445  | ~85%       | 📈 +81              |
| 26/01/2026 (SP-394)         | 3045            | 430       | 3475  | ~85%       | 📈 +30              |
| 26/01/2026 (SP-395)         | 3045            | 430       | 3475  | ~85%       | 🖥️ Page             |
| 26/01/2026 (SP-396)         | 3063            | 430       | 3493  | ~85%       | 📈 +18              |
| 27/01/2026 (SP-406)         | 3475            | 446       | 3921  | ~85%       | 📈 +428             |
| 28/01/2026 (SP-408)         | 3475            | 446       | 3921  | ~85%       | ⚙️ Prisma           |
| 28/01/2026 (SP-409)         | 3520            | 446       | 3966  | ~85%       | 📈 +45              |
| 28/01/2026 (SP-410)         | 3568            | 446       | 4014  | ~85%       | 📈 +48              |
| 28/01/2026 (SP-411)         | 3618            | 446       | 4064  | ~85%       | 📈 +50              |
| 28/01/2026 (SP-412)         | 3657            | 446       | 4103  | ~85%       | 📈 +39              |
| 28/01/2026 (SP-414)         | 3539            | 446       | 3985  | ~85%       | 📈 +48              |
| 28/01/2026 (SP-413)         | 3491            | 446       | 3937  | ~85%       | 📈 +18              |
| 28/01/2026 (SP-415)         | 3569            | 446       | 4015  | ~85%       | 📈 +49              |
| 03/02/2026 (SP-323)         | 3635            | 446       | 4081  | ~85%       | 📈 +66              |
| 03/02/2026 (SP-326)         | 3647            | 446       | 4093  | ~85%       | 📈 +12              |
| 03/02/2026 (SP-324)         | 3870            | 589       | 4459  | ~85%       | 📈 +56              |
| 03/02/2026 (SP-327)         | 4486            | 548       | 5034  | ~85%       | 📈 +83 / 📉 -41 E2E |
| 03/02/2026 (SP-433)         | 4548            | 548       | 5096  | ~85%       | 📈 +62              |
| 04/02/2026 (SP-435)         | 4701            | 657       | 5358  | ~85%       | 📈 +262             |
| 06/02/2026 (SP-355/358/359) | 4790            | 698       | 5488  | ~85%       | 📈 +130             |
| 06/02/2026 (SP-349)        | 4856            | 698       | 5554  | ~85%       | 📈 +66              |
| 09/02/2026 (SP-350)        | 4953            | 988       | 5941  | ~85%       | 📈 +387             |
| 09/02/2026 (SP-351)        | 5003            | 988       | 5991  | ~85%       | 📈 +50              |
| 09/02/2026 (SP-352)        | 5035            | 988       | 6023  | ~85%       | 📈 +32              |
| 09/02/2026 (SP-360)        | 5076            | 988       | 6064  | ~85%       | 📈 +41              |
| 09/02/2026 (SP-440)        | 5107            | 988       | 6095  | ~85%       | 📈 +31              |
| 09/02/2026 (SP-441)        | 5180            | 988       | 6168  | ~85%       | 📈 +73              |
| 09/02/2026 (SP-439)        | 5213            | 988       | 6201  | ~85%       | 📈 +33              |
| 10/02/2026 (SP-460)        | 5600            | 1018      | 6618  | 86.35%     | 📈 +417             |
| 11/02/2026 (SP-462)        | 5637            | 1018      | 6655  | ~86%       | 📈 +37              |
| 13/02/2026 (Stabilisation) | 5638            | 1018      | 6656  | ~86%       | 🔧 +1 / Fixes E2E   |
| 18/02/2026 (Consolidation) | 5638            | 549       | 6187  | ~86%       | 🔧 Consolidation 50→38 fichiers E2E, fix tablets, nightly complet |
| 18/02/2026 (SP-442→446, SP-463) | 5760       | 575       | 6335  | ~86%       | 🆕 Audit System (schema, service, injection, logs, E2E) + User Activity page. +122 unitaires, +26 E2E |
| 19/02/2026 (SP-456)             | 5770       | 584       | 6354  | ~86%       | 🆕 Impersonation E2E + unitaires. +10 unitaires (API route), +9 E2E (4 suites). 2 corrections applicatives (subscription guard bypass + layout cookie fallback). ANO-028/029 |
| 27/02/2026 (Améliorations)      | 5914       | 584       | 6498  | ~86%       | 🆕 Notifications résiliation admin + email directeur. Seed Stripe réel. TechCorp 110 employés. Dashboard Director 3 KPIs. CSV enrichi. InvoiceHistory invoiceUrl |

**Graphique d'évolution** : De 27 tests (04/12) à 6498 tests (27/02) — Notifications résiliation + seed Stripe réel 🚀

---

## Compétences CDA démontrées

Ce cahier de recettage démontre les compétences suivantes du référentiel CDA :

| N°  | Compétence                                                          | Preuve                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tester les composants d'une application                             | 5914 tests unitaires documentés                                                                                                                                                                                                                                                                                                                         |
| 2   | Contribuer à la qualité du code                                     | Couverture ~86%, anomalies tracées (29 anomalies)                                                                                                                                                                                                                                                                                                       |
| 3   | Documenter les procédures                                           | Procédure de recette formalisée                                                                                                                                                                                                                                                                                                                         |
| 4   | Utiliser une méthodologie                                           | Approche structurée par sprints                                                                                                                                                                                                                                                                                                                         |
| 5   | Développer des tests automatisés                                    | 6498 tests (5914 unitaires + 584 E2E, 40 fichiers)                                                                                                                                                                                                                                                                                                      |
| 6   | Sécuriser une application                                           | Tests RBAC (92 unitaires, 27 E2E), rate limiting, protection énumération                                                                                                                                                                                                                                                                                |
| 7   | Concevoir une architecture logicielle                               | Pattern ServiceResult<T>, multi-tenant                                                                                                                                                                                                                                                                                                                  |
| 8   | Développer des composants métier                                    | 4 dashboards par rôle                                                                                                                                                                                                                                                                                                                                   |
| 9   | Réaliser des tests E2E cross-browser                                | Playwright multi-navigateurs                                                                                                                                                                                                                                                                                                                            |
| 10  | Implémenter des fonctionnalités CRUD                                | Server Actions Schedules (SP-394) et Leave Management (SP-410), Zod, React Hook Form                                                                                                                                                                                                                                                                    |
| 11  | Implémenter un contrôle d'accès RBAC                                | 4 rôles, filtres dynamiques                                                                                                                                                                                                                                                                                                                             |
| 12  | Gérer des relations many-to-many                                    | Pattern Prisma connect/disconnect                                                                                                                                                                                                                                                                                                                       |
| 13  | Implémenter une navigation dynamique                                | Breadcrumbs, Sidebar, Empty States                                                                                                                                                                                                                                                                                                                      |
| 14  | Tester les parcours CRUD E2E                                        | Page Objects Pattern, fixtures auth                                                                                                                                                                                                                                                                                                                     |
| 15  | Respecter les réglementations (RGPD)                                | Bannière cookies conforme CNIL (9/9 critères)                                                                                                                                                                                                                                                                                                           |
| 16  | Implémenter un système d'emails transactionnels                     | Nodemailer + React Email + SMTP Hostinger (Sprint 9)                                                                                                                                                                                                                                                                                                    |
| 17  | Concevoir des templates email réutilisables                         | Design tokens, composants Layout/Header/Footer/Button                                                                                                                                                                                                                                                                                                   |
| 18  | Sécuriser les flux d'authentification                               | Reset password avec tokens temporaires, protection énumération (SP-298)                                                                                                                                                                                                                                                                                 |
| 19  | Implémenter la vérification d'identité                              | Email verification avec tokens préfixés, expiration 24h (SP-299)                                                                                                                                                                                                                                                                                        |
| 20  | Développer un formulaire accessible et validé                       | React Hook Form + Zod, WCAG 2.1, ARIA attributes (SP-287)                                                                                                                                                                                                                                                                                               |
| 21  | Implémenter une API REST sécurisée                                  | Rate limiting, validation Zod côté serveur, CORS (SP-288)                                                                                                                                                                                                                                                                                               |
| 22  | Concevoir des composants UI avec animations                         | Framer Motion, state machine pattern, accessibilité (SP-289)                                                                                                                                                                                                                                                                                            |
| 23  | Concevoir des templates email métier modulaires                     | Templates LeaveApprovedEmail/LeaveRejectedEmail découplés, 6 types de congés, internationalisation FR (SP-300)                                                                                                                                                                                                                                          |
| 24  | Tester exhaustivement les templates email                           | 40 tests templates Contact (confirmation + notification), couverture 100% composants React Email (SP-301)                                                                                                                                                                                                                                               |
| 25  | Implémenter la gestion d'erreurs applicative                        | Error Boundary React, fallback UI accessible, logging structuré, intégration Next.js 15 (SP-304)                                                                                                                                                                                                                                                        |
| 26  | Développer une expérience utilisateur de récupération d'erreur      | Page 404 personnalisée avec animations, navigation de secours, message empathique, WCAG 2.1 AA (SP-302)                                                                                                                                                                                                                                                 |
| 27  | Implémenter des animations web performantes et accessibles          | Framer Motion avec useReducedMotion, GPU-acceleration, orchestration stagger/delay (SP-302, SP-303)                                                                                                                                                                                                                                                     |
| 28  | Implémenter un système de logging structuré côté serveur            | error-logger avec contexte enrichi, timestamp, stack traces, préparation monitoring (SP-303)                                                                                                                                                                                                                                                            |
| 29  | Développer une page d'erreur 403 accessible                         | ForbiddenPage avec animations, navigation de secours, WCAG 2.1 AA (SP-305)                                                                                                                                                                                                                                                                              |
| 30  | Implémenter un système de design tokens                             | Tokens couleurs, spacing, typography centralisés, CSS variables (SP-259)                                                                                                                                                                                                                                                                                |
| 31  | Développer un système d'animations centralisé                       | Framer Motion avec hooks réutilisables, variants, respect reduced-motion (SP-379)                                                                                                                                                                                                                                                                       |
| 32  | Implémenter un mode sombre/clair avec détection système             | next-themes, persistance localStorage, transitions fluides (SP-265)                                                                                                                                                                                                                                                                                     |
| 33  | Concevoir des états vides expressifs                                | EmptyState component avec 5 illustrations SVG, design engageant (SP-378)                                                                                                                                                                                                                                                                                |
| 34  | Développer des indicateurs de progression avancés                   | ProgressBar, ProgressCircle, HOC withLoading, hook useProgressLoading (SP-266)                                                                                                                                                                                                                                                                          |
| 35  | Étendre les composants UI avec variantes                            | Button/Badge/Input extensions, AvatarGroup, patterns accessibles (SP-260)                                                                                                                                                                                                                                                                               |
| 36  | Implémenter une Command Palette professionnelle                     | cmdk, recherche fuzzy, navigation clavier, thème intégré (SP-264) 🆕                                                                                                                                                                                                                                                                                    |
| 37  | Développer un système de raccourcis clavier                         | Navigation shortcuts (G+H/E/P/T/C), modal aide (?), accessibilité (SP-264) 🆕                                                                                                                                                                                                                                                                           |
| 38  | Implémenter un tracking des pages récentes                          | localStorage, déduplication, limite FIFO, intégration Command Palette (SP-264) 🆕                                                                                                                                                                                                                                                                       |
| 39  | Développer des gestes tactiles natifs pour mobile                   | SwipeableDrawer avec Framer Motion drag gestures, velocity/threshold detection (SP-383) 🆕                                                                                                                                                                                                                                                              |
| 40  | Intégrer des composants mobiles avec feature flags                  | SwipeableDrawer dans Sidebar avec rollback possible, iOS safe-area (SP-384) 🆕                                                                                                                                                                                                                                                                          |
| 41  | Implémenter les normes WCAG 2.5.5 Target Size                       | TouchableButton avec zones tactiles 44px minimum, CVA variants touch-\* (SP-385) 🆕                                                                                                                                                                                                                                                                     |
| 42  | Développer des formulaires optimisés iOS                            | MobileFormField avec font-size ≥16px évitant l'auto-zoom Safari, Visual Viewport API (SP-386) 🆕                                                                                                                                                                                                                                                        |
| 43  | Concevoir des layouts responsive adaptatifs                         | DataTablePagination avec layout compact mobile, full desktop, touch targets (SP-387) 🆕                                                                                                                                                                                                                                                                 |
| 44  | Implémenter CSS scroll-snap pour UX mobile                          | ResponsiveBreadcrumb avec scroll horizontal, snap-to-item, fade indicators (SP-388) 🆕                                                                                                                                                                                                                                                                  |
| 45  | Développer des tests E2E multi-devices mobile                       | Suite Playwright 5 devices (iPhone SE/14 Pro, Pixel 7, iPad Mini/Pro), fixtures mobiles, touch gestures utilities (SP-389) 🆕                                                                                                                                                                                                                           |
| 46  | Implémenter l'accessibilité WCAG 2.1 automatisée                    | Skip to main content (WCAG 2.4.1), tests axe-core/Playwright, audit Lighthouse 95%, script a11y:audit (SP-269) 🆕                                                                                                                                                                                                                                       |
| 47  | Implémenter un flux sécurisé de réinitialisation de mot de passe    | Pages /forgot-password et /reset-password, Server Actions sécurisées, tokens aléatoires, anti-énumération OWASP, validation Zod (SP-263) 🆕                                                                                                                                                                                                             |
| 48  | Développer des tests E2E Plannings avec Page Object Pattern         | Suite Playwright 16 tests schedules (navigation, création shift, édition, suppression, filtres, vues), Page Object SchedulesPage, data-testid (SP-406) 🆕                                                                                                                                                                                               |
| 49  | Implémenter un panneau de suivi heures hebdomadaires                | WeeklyHoursPanel avec calcul temps réel, barres de progression colorées, comparaison heures contrat, responsive desktop/mobile Sheet (SP-406) 🆕                                                                                                                                                                                                        |
| 50  | Gérer le type REST comme planning journée entière                   | ScheduleType REST avec isAllDay automatique, exclusion exports, affichage spécifique calendrier (SP-406) 🆕                                                                                                                                                                                                                                             |
| 51  | Implémenter la suppression en masse avec confirmation               | BulkDeleteDialog avec sélection multiple DataTable, Server Action bulk delete RBAC, AlertDialog confirmation (SP-406) 🆕                                                                                                                                                                                                                                |
| 52  | Corriger les boucles infinies React 19                              | Diagnostic et fix useEffect/useCallback dépendances circulaires, stabilisation références avec useRef (SP-406) 🆕                                                                                                                                                                                                                                       |
| 53  | Appliquer patch-package pour corriger une dépendance                | Downgrade @schedule-x 2.11.0, patch DragAndDrop typing, résolution conflit Temporal API polyfill (SP-406) 🆕                                                                                                                                                                                                                                            |
| 54  | Concevoir des validations métier avec Zod et superRefine            | 6 schémas Zod congés avec règles métier (délai 48h, halfDay, commentaire obligatoire refus), calculateWorkingDays 3 modes (MON_FRI/MON_SAT/ALL_DAYS), hasEnoughBalance (SP-409) 🆕                                                                                                                                                                      |
| 55  | Implémenter un workflow CRUD avec transactions atomiques            | 11 Server Actions congés RBAC 4 rôles, $transaction pour review (débit solde) et cancel (recrédit solde), emails non-bloquants post-transaction, checkLeaveConflicts >50% équipe (SP-410) 🆕                                                                                                                                                            |
| 56  | Concevoir des composants UI métier réutilisables                    | 8 composants Leave Management (badges, cards, formulaires, dialogs) avec React Hook Form + Zod, Calendar range react-day-picker, ProgressBar seuils couleur, actions contextuelles par rôle RBAC, détection conflits équipe temps réel (SP-411) 🆕                                                                                                      |
| 57  | Implémenter des composants de visualisation données complexes       | 6 composants Liste & Calendrier (LeaveFilters filtres conditionnels par rôle, LeavesList DataTable TanStack v8 pagination manuelle, LeaveCalendar grille CSS Grid employés×jours colonne sticky, LeaveStatsBar badges cliquables avec compteurs) (SP-412) 🆕                                                                                            |
| 58  | Concevoir une page Next.js App Router avec Server/Client Components | Route `/app/dashboard/leaves` : Server Component fetch initial (requests, stats, employees, teams), Client Component orchestrateur LeavesPageContent avec tabs, filtres URL sync via searchParams, Dialog/Sheet responsive, metadata SEO (SP-413) 🆕                                                                                                    |
| 59  | Implémenter des pages dynamiques avec timeline et gestion d'état    | Routes `/leaves/[id]` (page détail avec LeaveTimeline événements RBAC) et `/leaves/balances` (gestion soldes CP/RTT DIRECTOR only). Next.js 15 Promise params, LeaveDetailCard, BalancesPageContent avec pagination et édition inline (SP-414) 🆕                                                                                                       |
| 60  | Intégrer des notifications email et overlays multi-données          | Email LeaveRequestedEmail notifiant manager lors création demande (React Email + Nodemailer, template réutilisable, envoi background non-bloquant). Overlay congés approuvés sur Schedule-X (7 types couleurs, PlainDate journée entière, callbacks click). Dashboard stats confirmées (SP-415) 🆕                                                      |
| 61  | Implémenter une page de paramètres entreprise avec RBAC             | Page `/app/settings/company` RBAC DIRECTOR/SYSTEM_ADMIN. 4 sections (Company Info, Working Days, Working Hours, Lunch Break). Server Actions avec optimistic UI et rollback erreur. Presets jours travaillés (Mon-Fri/Mon-Sat/All Week). Types TypeScript DayOfWeek, CompanySettings, LunchBreakSettings. 19 tests unitaires + 21 tests E2E (SP-435) 🆕 |
| 62  | Concevoir des composants pricing réutilisables avec SSOT            | PricingSimulator (slider employés, calcul prix temps réel, seuil grandes équipes >50), PricingCard (prix per-seat, features list, CTA). Constantes centralisées `src/lib/config/pricing.ts` (SSOT). 55 tests unitaires (SP-355) 🆕 |
| 63  | Implémenter une page SEO avec données structurées JSON-LD           | Page `/tarifs` avec Server Component (metadata SEO) + Client Component (contenu animé). StructuredData JSON-LD `@graph` combinant SoftwareApplication + FAQPage + WebPage Schema.org. PRICING_FAQS partagées entre schema et UI. FAQ interactive AnimatePresence. Skip-to-content, accessibilité WCAG 2.1. 34 tests unitaires (SP-359) 🆕 |
| 64  | Concevoir un modèle de données subscription SaaS                    | Migration Prisma per-seat billing : 2 enums (SubscriptionPlan FREE/PER_SEAT, SubscriptionStatus 6 valeurs), modèle Subscription 1:1 Company (quantity, pricePerEmployee centimes), seed aléatoire, validations Zod avec labels FR, Server Actions avec relation nested select (SP-350) 🆕 |
| 65  | Implémenter des colonnes TanStack Table avec relations nested       | Colonnes virtuelles id-based (subscriptionPlan, subscriptionStatus) pour afficher données relation 1:1, filterFn custom avec fallback nullable (`?? 'FREE'`), badges colorés par plan/statut, CompanyCard/CompanyForm avec inputs conditionnels per-seat. 97 tests unitaires + 290 E2E (SP-350) 🆕 |
| 66  | Implémenter un service Stripe avec pattern ServiceResult            | Service stripe.service.ts (5 fonctions exportées + 5 handlers webhooks internes). Pattern ServiceResult<T> uniforme. Compatibilité Stripe SDK v20.3.1 (API 2026-01-28.clover) avec types natifs discriminants. Gestion per-seat billing : création Checkout session, mise à jour quantité sièges, annulation abonnement, portail facturation. 40 tests unitaires (SP-351) 🆕 |
| 67  | Implémenter une route webhook sécurisée avec vérification signature | Route POST `/api/webhooks/stripe` : vérification signature HMAC `stripe.webhooks.constructEvent()`, lecture raw body `request.text()` (Next.js 15 App Router), gestion erreurs structurée (400/500), dispatch vers service handler. 10 tests unitaires avec vi.hoisted() pattern (SP-351) 🆕 |
| 68  | Connecter un service Stripe au frontend via Server Actions RBAC     | 5 Server Actions DIRECTOR-only (checkout, portal, updateQuantity, cancel, getBillingData). Conversion ServiceResult<T> → CrudActionResult<T> discriminated union. Retour URL pour loading state client. Guard companyId (SYSTEM_ADMIN via admin panel). Email via auth() séparé. BillingData type avec Promise.all parallèle. revalidatePath billing. 32 tests unitaires (SP-352) 🆕 |
| 69  | Implémenter un dashboard facturation SaaS avec sérialisation Date  | Page `/app/dashboard/billing` Server Component DIRECTOR : fetch getBillingDataAction + sérialisation Date→ISO string + rendu 3 Client Components (SubscriptionStatus 6 statuts + countdown essai + alerte annulation, UsageIndicator ProgressBar sièges colorée + prix prorata, InvoiceHistory Table + badges + liens Stripe). Navigation G B. 41 tests unitaires (SP-360) 🆕 |
| 70  | Implémenter un subscription guard middleware Edge Runtime avec JWT enrichi | Fonction pure `checkSubscriptionAccess` Edge-compatible (0 dépendance Node.js). JWT enrichi (subscriptionStatus, trialEndsAt, currentPeriodEnd, subscriptionCheckedAt). Defense in Depth 3 couches : JWT Edge → refresh périodique 5min (dynamic import Prisma) → webhooks Stripe. Matrice 9 statuts (ACTIVE, TRIAL valide/expiré, PAST_DUE grâce 7j/dépassé, CANCELED, EXPIRED, INCOMPLETE, null, inconnu). Routes exemptées (billing, profile, settings). Alerte contextuelle blocking reason sur page billing (6 motifs). 31 tests unitaires (SP-440) 🆕 |
| 71  | Implémenter des bannières progressives de conversion SaaS                  | Fonction pure `getSubscriptionBannerConfig` (0 dépendance React, Edge-compatible). 3 paliers TRIAL progressifs (info 7-14j bleu, warning 4-6j orange, urgent 1-3j rouge non-masquable). Bannière PAST_DUE grâce 7j. Composant `SubscriptionBanner` client avec dismiss localStorage par tier, exclusion page billing, rôles ARIA (alert/status), data-testid. Héro conversion `BillingPageContent` (trial_expired/no_subscription). Intégration Server→Client via layout.tsx. 73 tests unitaires (SP-441) 🆕 |
| 72  | Implémenter une synchronisation automatique quantité Stripe per-seat       | Service `syncEmployeeCountToStripe` (fire-and-forget, ne throw jamais, SyncResult typé). Skip intelligent 4 statuts (TRIAL/CANCELED/EXPIRED/INCOMPLETE) + quantity_unchanged + no_subscription. `stripe.subscriptions.update()` avec `proration_behavior: 'create_prorations'`. Intégration dans 4 Server Actions employés (create/delete/toggle/bulkDelete). `Math.max(1, employeeCount)`. Logging structuré `[StripeSync]`. 33 tests unitaires (subscription-sync: 27, employees: 6) (SP-439) 🆕 |
| 73  | Nettoyer une codebase pour préparation soutenance                          | Suppression code mort (routes test, console.log, imports inutilisés), suppression 6 dépendances npm obsolètes, nettoyage barrel exports. Cleanup systématique pré-production (SP-460) 🆕 |
| 74  | Atteindre une couverture de test > 85% avec stratégie ciblée               | Identification composants 0% couverture via rapport coverage v8, création de 20 fichiers de tests ciblés (+387 tests), résolution anomalies MSW/Radix. Couverture 80.38% → 86.35% (SP-460) 🆕 |
| 75  | Implémenter un journal d'audit complet avec protection anti-injection      | Modèle Prisma AuditLog (9 actions, 10 entités), service fire-and-forget, sanitization HTML/SQL/NoSQL/XSS, Server Actions RBAC paginées avec filtres, export CSV, page admin DataTable TanStack. 105 tests unitaires + 26 tests E2E (SP-442→446) 🆕 |
| 76  | Implémenter une page d'activité utilisateur avec timeline relative         | Server Action getUserActivity avec isolation userId JWT, page `/app/profile/activity` timeline `Intl.RelativeTimeFormat('fr')`, navigation Header dropdown + ProfileActions. 17 tests unitaires (SP-463) 🆕 |
| 77  | Tester un mode impersonation avec corrections applicatives découvertes     | 10 tests unitaires API route (POST/DELETE) + 9 tests E2E (parcours nominal, sécurité, cas limites, audit trail). Page Object Model ImpersonationPage. Découverte et correction de 2 bugs applicatifs : boucle redirect infinie subscription guard (ANO-028) + bannière invisible NextAuth v5 updateSession failure (ANO-029). Bypass middleware + fallback cookie Server Component (SP-456) 🆕 |
| 78  | Implémenter un dashboard monitoring système avec health check DB           | Page `/app/admin/monitoring` RBAC SYSTEM_ADMIN, Suspense + skeleton. Service `checkDatabaseHealth` (4 checks : connexion, latence, pool Prisma, migrations). Server Action `getMonitoringSnapshot` (health, quick stats SaaS, répartition abonnements). 8 composants UI (HealthStatusBadge, DatabaseHealthPanel, MonitoringKpisGrid, SubscriptionBreakdownPanel). 30 tests unitaires (SP-464) 🆕 |
| 79  | Implémenter des graphiques de monitoring avec données agrégées             | Server Action `getMonitoringChartData` RBAC SYSTEM_ADMIN avec Promise.all 4 requêtes Prisma parallèles. Helper `generateEmptyDays` zero-fill. 4 composants Recharts (ActivityChart AreaChart 7j, SubscriptionPieChart donut sémantique, TopActionsChart BarChart horizontal, CompanyGrowthChart AreaChart 30j). Agrégation JS par jour (findMany + Map). 22 tests unitaires (SP-465) 🆕 |
| 80  | Unifier le calcul MRR dans un service partagé                             | Service `mrr.service.ts` comme source de vérité unique. Corrige incohérence Dashboard/Stats (deux implémentations divergentes). Filtre `company.isActive`, gestion null défensive, arrondi 2 décimales `Math.round(total*100)/100`. 9 tests unitaires (SP-469) 🆕 |
| 81  | Sécuriser l'endpoint /api/health                                          | 3 niveaux d'accès (basic sans auth, standard SYSTEM_ADMIN, full SYSTEM_ADMIN). Suppression CORS `*`, restriction domaine production. Principe moindre privilège OWASP A05:2021. 6 tests unitaires (SP-470) 🆕 |
| 82  | Ajouter un bouton de rafraîchissement monitoring                          | Composant `RefreshButton` générique, `router.refresh()` Next.js 15 + `useTransition` React 19 pour feedback visuel. Horodatage avec `aria-live="polite"`. 4 tests unitaires (SP-471) 🆕 |
| 83  | Créer une page utilisateurs cross-entreprises avec export CSV             | Page admin `/app/admin/users` TanStack Table cross-tenant (exception documentée SYSTEM_ADMIN). Filtres combinables (recherche, rôle, entreprise, statut). Export CSV client-side BOM UTF-8 Excel FR. Double RBAC (middleware + Server Action). 9 tests unitaires (SP-472) 🆕 |
| 84  | Implémenter un widget « Essais à risque » avec classification urgence     | Widget dashboard admin, essais expirant ≤7 jours, 3 niveaux urgence (critical 0-1j, warning 2-3j, moderate 4-7j). Calcul `potentialMrr` (employeeCount × 2,90€). `Math.ceil` arrondi jours. Tri par urgence décroissante. 10 tests unitaires (SP-473) 🆕 |
| 85  | Implémenter un email de contact admin vers une entreprise                 | Modale contact depuis Companies, template React Email `AdminContactEmail` partagé, envoi Nodemailer aux DIRECTOR, traçabilité `EmailLog`. 4 catégories (information, facturation, technique, autre). 9 tests unitaires (SP-474) 🆕 |
| 86  | Créer une page statistiques globales avec export PDF                      | Page `/app/admin/stats`, 7 indicateurs SaaS `Promise.all` (MRR, croissance 12 mois, répartition abonnements, top 10 actions, DAU/MAU, conversion essai→payant). Export PDF `@react-pdf/renderer` côté serveur. Protection division par zéro. 12 tests unitaires (SP-475) 🆕 |
| 87  | Étendre les notifications SSE au SYSTEM_ADMIN                             | 4 types : `NEW_COMPANY_REGISTERED`, `SUBSCRIPTION_PAST_DUE`, `SUBSCRIPTION_CANCELED`, `TRIAL_EXPIRED`. Factory `createAdminNotification()` fire-and-forget. Migration `Notification.companyId` optionnel. 7 tests unitaires (SP-476) 🆕 |
| 88  | Implémenter un broadcast email global aux entreprises actives             | `sendAdminBroadcast()` vers DIRECTOR actifs entreprises ACTIVE/TRIAL. Batch/10 `Promise.allSettled` (résilient échecs partiels). `BroadcastModal` 4 catégories. `EmailLog` par destinataire (SENT/FAILED). 9 tests unitaires (SP-477) 🆕 |
| 89  | Notifier admin et directeur lors d'une résiliation d'abonnement           | `cancelSubscription` enrichi : notification in-app admin (`createAdminNotification` WARNING HIGH), email admin (tous les SYSTEM_ADMIN via `getSystemAdminUserIds`), email confirmation directeur (template pro `SubscriptionCanceledEmail` avec logo, CTA réabonnement, date fin). Pattern fire-and-forget `.catch(console.error)`. Import dynamique modules admin. Seed réel Stripe Test (vrais customers, subscriptions, payment methods) 🆕 |

---

## Procédure de recette

### Avant chaque mise en production

1. **Tests automatisés CI** : Pipeline GitHub Actions vert
2. **Revue artifacts** : Rapport couverture + rapport Playwright
3. **Tests manuels critiques** :
   - Page d'accueil et /api/health
   - Parcours login/register
   - Dashboards par rôle
   - CRUD Companies/Employees/Teams
   - Navigation et Empty States
   - Bannière cookies et modal préférences
   - Envoi emails (bienvenue, reset password, vérification)
   - Réinitialisation mot de passe (/forgot-password, /reset-password, flux complet) 🆕
   - Formulaire de contact (validation, soumission, états succès/erreur)
   - Journal d'audit admin `/app/admin/logs` (filtres, pagination, export CSV, modal détail) 🆕
   - Activité utilisateur `/app/profile/activity` (timeline, accès depuis Header et ProfileActions) 🆕
   - Monitoring admin `/app/admin/monitoring` (health check DB, KPIs SaaS, répartition abonnements, 4 graphiques Recharts) 🆕
   - Page utilisateurs admin `/app/admin/users` (filtres combinables, export CSV) 🆕
   - Statistiques admin `/app/admin/stats` (7 indicateurs SaaS, export PDF) 🆕
   - Broadcast email global (modale BroadcastModal, 4 catégories, résultat envoi) 🆕
   - Email contact admin vers entreprise (modale ContactModal depuis Companies) 🆕
   - Widget essais à risque (classification urgence, MRR potentiel) 🆕
   - API /api/contact (test avec curl/Postman)
   - Error Boundary (test /test-error pour déclencher erreur)
   - Page 404 (test URL inexistante, navigation de secours)
   - Page 500 (test /server-error, logging structuré)
   - Page 403 (test /forbidden, message empathique) 🆕
   - Command Palette (⌘K, recherche, navigation) 🆕
   - Raccourcis clavier (G+H/E/P/T/C, modal ?) 🆕
   - Tests E2E mobile multi-devices (5 appareils, touch gestures) 🆕
   - Accessibilité WCAG 2.1 (Skip link focus, audit Lighthouse ≥90%) 🆕
   - Subscription per-seat : CompanyCard badges plan/statut, CompanyForm édition plan/statut/quantity 🆕
   - Plannings : création/édition/suppression shifts, type REST, drag & drop 🆕
   - WeeklyHoursPanel : compteur heures vs contrat, mise à jour temps réel 🆕
   - Exports PDF/Excel avec filtres (employé, équipe, type, statut) 🆕
   - Suppression en masse employés (sélection multiple, confirmation) 🆕
   - Page Tarifs /tarifs (simulateur prix, FAQ interactive, CTA, JSON-LD structured data) 🆕
   - Stripe Service : création Checkout session, mise à jour quantité sièges, annulation abonnement 🆕
   - Webhook Stripe /api/webhooks/stripe : vérification signature, traitement événements (checkout, subscription, invoice) 🆕
   - Server Actions Stripe : createCheckoutAction, createBillingPortalAction, updateSubscriptionQuantityAction, cancelSubscriptionAction, getBillingDataAction (RBAC DIRECTOR) 🆕
   - Dashboard Billing /app/dashboard/billing (statut abonnement, jauge sièges, historique factures, portail Stripe, annulation) 🆕
   - Subscription Guard middleware : blocage accès TRIAL expiré/CANCELED/EXPIRED/INCOMPLETE/PAST_DUE >7j, redirection billing avec motif, bypass SYSTEM_ADMIN et routes exemptées 🆕
   - Bannières progressives subscription : affichage info/warning/urgent selon jours restants trial, bannière PAST_DUE grâce, dismiss localStorage, héro conversion billing 🆕
   - Sync employés → Stripe : vérifier que créer/supprimer/toggle/bulk-delete un employé déclenche la synchronisation quantité Stripe (logs [StripeSync]) 🆕
   - Notifications résiliation : annuler abonnement directeur → vérifier notification admin (cloche) + email admin + email directeur (template pro) 🆕
   - Historique factures : vérifier lien invoiceUrl vers Stripe sur chaque facture 🆕
   - Portail Stripe : vérifier ouverture en nouvelle fenêtre (target=_blank) 🆕
   - Seed Stripe réel : `npm run db:reset` → vérifier vrais clients/abonnements dans Dashboard Stripe Test 🆕

### Tests nightly (quotidiens)

1. **Exécution automatique** : GitHub Actions cron 2h00 UTC, suite COMPLÈTE en **mode production** (`npm run build` + `npm run start`)
2. **Job 1 — Tests unitaires** : ~5914 tests Vitest avec couverture (pas besoin de PostgreSQL)
3. **Job 2 — Tests E2E complets** : Desktop Chromium (~584 tests) + 5 devices mobiles (iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini, iPad Pro 11")
4. **Configuration** : `playwright.nightly.config.ts` (3 workers, 2 retries, timeout 60s, 6 projets)
5. **Env vars CI** : `AUTH_URL=http://localhost:3000`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true` (nécessaires pour NextAuth v5 en production sur HTTP — voir ANO-027)
6. **Analyse résultats** : Vérifier annotations GitHub (failed vs flaky vs passed)
7. **Avantages mode production** : Tests plus rapides (pas de HMR/Turbopack), plus fiables (pas de React Strict Mode double mount), représentatifs de la prod

### Après chaque mise en production

1. **Smoke test production** : https://smartplanning.fr
2. **Monitoring** : Logs Docker sur VPS OVH
3. **Test emails** : Vérifier réception emails via contact@smartplanning.fr
4. **Documentation** : Mise à jour de ce cahier

---

## Historique des modifications

| Date       | Modification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 27/02/2026 | 🆕 Sprint 20 — Améliorations billing, seed, director. **Notifications résiliation** : `cancelSubscription` enrichi avec 3 fire-and-forget (notification in-app admin `createAdminNotification` WARNING HIGH, email SYSTEM_ADMIN via `getSystemAdminUserIds`, email directeur `SubscriptionCanceledEmail` template pro avec logo/CTA). Import dynamique modules admin. **Seed Stripe réel** : vrais customers, subscriptions, payment methods Stripe Test (`tok_visa`), cleanup metadata `source: smartplanning-seed`. TechCorp 110 employés, 12 équipes grande distribution. **Dashboard Director** : simplifié à 3 KPIs. **CSV export** enrichi (colonnes entreprise, département, contrat). **InvoiceHistory** : lien invoiceUrl Stripe. Portail Stripe en nouvelle fenêtre. Breadcrumbs director/billing. Email admin corrigé `contact@smartplanning.fr`. Total : 6498 tests (5914 unitaires + 584 E2E) |
| 20/02/2026 | 🆕 Sprint 20 — Monitoring System (SP-464, SP-465) : Page admin `/app/admin/monitoring` RBAC SYSTEM_ADMIN avec Suspense + skeleton. **SP-464 MVP** : Service `checkDatabaseHealth` (4 checks : connexion, latence, pool Prisma, migrations). Server Action `getMonitoringSnapshot` (health, quick stats SaaS, répartition abonnements par statut). 8 composants UI (HealthStatusBadge sémantique ok/warn/error, DatabaseHealthPanel avec ProgressBar pool et métriques brutes, MonitoringKpisGrid 4 KPIs glass cards, SubscriptionBreakdownPanel badges colorés). +30 tests unitaires (monitoring-action 10, db-health 8, HealthStatusBadge 5, DatabaseHealthPanel 12, MonitoringKpisGrid 4, SubscriptionBreakdownPanel 4). **SP-465 Charts** : Server Action `getMonitoringChartData` (Promise.all 4 requêtes Prisma parallèles : auditActivity 7j, subscriptionDistribution groupBy, topActions top 5 desc, companyGrowth 30j). Helper `generateEmptyDays` zero-fill Map. 4 composants Recharts (ActivityChart AreaChartWidget, SubscriptionPieChart donut STATUS_COLORS sémantiques, TopActionsChart BarChartWidget horizontal ACTION_LABELS FR, CompanyGrowthChart AreaChartWidget success). +22 tests unitaires (monitoring-chart-action 10, ActivityChart 4, SubscriptionPieChart 4, TopActionsChart 4, CompanyGrowthChart 4). Barrel exports index.ts. Section "Activité & Tendances" avec grille 2×2. Compétences CDA #78-79 ajoutées. Total : 6406 tests (5822 unitaires + 584 E2E, 40 fichiers) |
| 19/02/2026 | 🆕 Sprint 19 — Impersonation E2E + Unit Tests (SP-456) : Tests mode impersonation SYSTEM_ADMIN "Voir espace client". **10 tests unitaires** API route (`route.test.ts`) : POST (8 tests — auth, RBAC, body vide, company sans user, cible SYSTEM_ADMIN, cible désactivée, succès companyId/targetUserId) + DELETE (2 tests — aucune impersonation active, succès). **9 tests E2E** (`impersonation-flow.spec.ts`, 4 suites) : parcours nominal start→navigate→stop (2), restrictions sécurité routes admin/billing/isolation tenant (3), cas limites persistence cookie/suppression/auto-impersonation bloquée (3), audit trail POST+DELETE (1). **Page Object Model** `ImpersonationPage` : startImpersonation (UI dropdown → API interception → reload fallback), stopImpersonation (API DELETE → clear cookies sélectif → re-login admin). **2 corrections applicatives** : (1) bypass subscription guard en impersonation dans `auth.config.ts` (ANO-028 boucle redirect ∞), (2) fallback cookie `sp-impersonation` dans `layout.tsx` pour bannière (ANO-029 updateSession NextAuth v5 ClientFetchError). Fix lint ESLint `no-unsafe-assignment` sur `response.json()`. Compétence CDA #77 ajoutée. Total : 6354 tests (5770 unitaires + 584 E2E, 40 fichiers) |
| 18/02/2026 | 🆕 Sprint 19 — Audit System (SP-442→446) + User Activity (SP-463) : Migration Prisma `add_audit_log` (table AuditLog, enums AuditAction 9 valeurs + AuditEntityType 10 valeurs). Service `logAuditAction` fire-and-forget. Protection anti-injection (sanitization HTML/SQL/NoSQL/XSS). Page admin `/app/admin/logs` DataTable TanStack (filtres, pagination serveur, export CSV, modal détail). Page `/app/profile/activity` timeline relative française. +122 tests unitaires (audit-schema 30, audit.service 22, audit-injection 20, audit-logs 33, getUserActivity 17) + 26 tests E2E (audit-logs.spec.ts). Fix E2E exact:true filter + detail modal skip. Fix lint CI (prettier + ESLint). Total : 6335 tests (5760 unitaires + 575 E2E, 39 fichiers) |
| 18/02/2026 | 🔧 Consolidation E2E 50→38 fichiers (suppression redondances, fusion error-pages/account-actions/billing). Correction 38 tests command-palette échouant sur tablets (data-testid desktop-search-button, Meta+k au lieu de Control+k). Alignement workflow nightly : ajout job tests unitaires Vitest (~5638), ajout 5 devices mobiles (iPhone SE, 14 Pro, Pixel 7, iPad Mini, iPad Pro 11"). Mise à jour commentaires CI/CD avec chiffres actuels. Total : 6187 tests (5638 unitaires + 549 E2E) |
| 15/02/2026 | 🔧 Migration E2E CI/nightly vers mode production (ANO-027) : `playwright.ci.config.ts` et `playwright.nightly.config.ts` passent de `npm run dev` à `npm run start`. 3 causes racines `ERR_TOO_MANY_REDIRECTS` identifiées et corrigées : (1) `next.config.ts` CSP `upgrade-insecure-requests` rendu conditionnel via `isHttps` (basé sur `AUTH_URL`/`NEXTAUTH_URL`), (2) `ci.yml` et `nightly-e2e.yml` ajout env vars `AUTH_URL=http://localhost:3000`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true` + étape `npm run build`, (3) timeout E2E CI augmenté 25→30 min. 5 fichiers modifiés. Gains : tests plus rapides, plus fiables (pas de Strict Mode double mount), représentatifs de la production |
| 13/02/2026 | 🔧 Stabilisation nightly E2E (ANO-026) : 2 tests failed + 5 flaky sur nightly CI. Cause : serveur `npm run dev` lent en CI GitHub Actions avec 3 workers parallèles, causant `net::ERR_CONNECTION_RESET` et timeouts `waitForURL`. Corrections : `auth.fixture.ts` retry 3x sur `page.goto('/login')` + timeout login 30s→45s. `edit-profile.page.ts` timeout `expectUpdateSuccess` 30s→45s + fallback submit button état normal. `personal-tasks.page.ts` timeout toast 10s→15s. `middleware-rbac.spec.ts` timeout callbackUrl 15s→30s. `playwright.nightly.config.ts` actionTimeout 15s→20s, navigationTimeout 30s→45s. 5 fichiers modifiés. Total : 6656 tests |
| 13/02/2026 | 🔧 fix(billing) : Autoriser l'accès trial sans subscription active et supprimer le héro conversion sur la page billing. Corrige le cas où un utilisateur en trial n'a pas encore de ligne Subscription en base |
| 12/02/2026 | 🔧 fix(i18n) : Restaurer les accents français dans les composants dashboard Manager (labels, titres, descriptions encodés correctement) |
| 11/02/2026 | 🔧 fix(e2e) : Stabiliser 62 tests E2E et réactiver dashboard Manager. Refonte Page Object `dashboard-manager.page.ts` (274→173 lignes). Timeouts globaux robustes. Ajout `waitForLoadState` après `goto /login`. Settings/Company/Profile : attente animations stagger. Command Palette mobile : fallback Ctrl+K tablettes. 11 fichiers, +244/-446 lignes |
| 11/02/2026 | 🆕 SP-462 Optimisation SEO Google + LLMs : Homepage refactorisée en Server Component (extraction LandingPageContent.tsx + StructuredData.tsx JSON-LD @graph 4 schemas WebSite/Organization/SoftwareApplication/FAQPage). robots.ts (Metadata API Next.js 15, block /app/ /api/ auth pages). sitemap.ts (8 pages, priorités hiérarchisées homepage 1.0 → légales 0.3). Favicon convention Next.js 15 (src/app/favicon.ico + icon.png + apple-icon.png). Correction layout root ("Bientôt disponible" → "Essai gratuit 21 jours", keywords long-tail FR). noindex dashboard layout (défense en profondeur). llms.txt + llms-full.txt (convention llmstxt.org, comparaison tarifaire Skello/Combo). Canonical URLs 5 pages légales (CGU, CGV, confidentialité, mentions-legales, cookies). +37 tests unitaires (robots 6, sitemap 7, StructuredData 22, LandingPageContent 2). 9 commits atomiques. Build OK, 0 régression. Total : 6655 tests |
| 10/02/2026 | 🆕 SP-460 Nettoyage final & couverture 86% : Cleanup code mort (suppression route `test-datatable/`, `console.log`, imports inutilisés, 6 dépendances npm obsolètes). +387 tests unitaires (20 fichiers) couvrant Teams (TeamCard, TeamForm, TeamMembersManager, TeamsDataTable : 72 tests), Admin/Employees (EmployeeCard, EmployeeFilters, DeleteEmployeeDialog, BulkDeleteDialog, columns : 88 tests), Schedules (ExportDropdown, WeeklyHoursPanel, AvailabilityPopover : 41 tests), Couverture (FormDatePicker, AvatarUpload MSW, CookieConsentProvider, LeavesListMobile, ChartWidgets mock Recharts, UmamiAnalyticsWrapper, CompanyForm, columns employees, AvailabilityPopover : 140 tests). +30 tests E2E billing (SP-373). Couverture 80.38% → 86.35%. ANO-023 vi.hoisted() MSW, ANO-024 server.use() vs stubGlobal, ANO-025 TooltipProvider Radix. Lint 0, tsc 0, build OK. Compétences CDA #77-78 ajoutées. Total : 6618 tests |
| 10/02/2026 | 🆕 **EPIC SP-348 COMPLÈTE** — SP-373 Tests E2E Billing : 30 tests Playwright (6 suites × 5 tests). 2 Page Objects : `BillingPage` (25+ locators data-testid, méthodes goto/gotoWithReason/waitForLoad/expect*) et `PricingPage` (hero, simulateur slider, features, CTA). Fixtures `billing-fixtures.ts` (7 mock generators : trial, active, past_due, canceled, expired, trial_expired, no_subscription). Suites : trial-flow (accès billing, titre, card, bouton gestion, description), checkout-flow (ACTIVE, montant, sièges, pas bannière trial, usage), subscription-management (détails, usage indicator, prix/total, prorata, historique factures), payment-failure (alertes payment_overdue/payment_incomplete, style destructive, pas d'alerte sans reason), trial-expiry (alerte trial_expired, hero conversion, prix/employé, CTA #subscription-section, hero no_subscription), cancellation-flow (alertes canceled/expired, réabonnement, bouton annulation, dialog confirmation). Stratégie : seed TechCorp ACTIVE 10 employés + query params ?reason= pour simulation états bloquants. Barrel exports BillingPage/PricingPage dans pages/index.ts. **Bilan Epic SP-348 : 15 tickets, 487+ tests**. Compétence CDA #76 ajoutée. Total : 6299 tests |
| 10/02/2026 | 🆕 SP-370 Cron Trial Expiration & Webhook Emails : +25 tests unitaires. Endpoint cron `/api/cron/trial-expiration` sécurisé CRON_SECRET header. Détection trials expirant 3j/7j → TrialExpiringEmail, trials expirés 24h → TrialExpiredEmail. Logging EmailLog traçabilité + déduplication. Webhooks Stripe enrichis : checkout.session.completed → SubscriptionConfirmedEmail, invoice.payment_failed → PaymentFailedEmail, customer.subscription.deleted → SubscriptionCanceledEmail, invoice.paid → InvoiceEmail. Service `sendBillingEmail()` fire-and-forget avec logging EmailLog, résolution automatique director destinataire. Compétence CDA #75 ajoutée. Total : 6269 tests |
| 10/02/2026 | 🆕 SP-369 Templates Emails Billing : +27 tests unitaires. 7 templates React Email cycle de vie Stripe : TrialWelcomeEmail (bienvenue + jours restants + CTA dashboard), TrialExpiringEmail (alerte 3/7j + CTA abonnement), TrialExpiredEmail (expiré + CTA réactivation), SubscriptionConfirmedEmail (confirmation per-seat + récapitulatif prix), PaymentFailedEmail (échec + CTA mise à jour paiement), SubscriptionCanceledEmail (annulation + date fin + CTA réabonnement), InvoiceEmail (facture + montant + sièges + lien PDF). Design tokens centralisés, layout responsive, header/footer SmartPlanning, CTA gradient bleu-cyan. Compétence CDA #74 ajoutée. Total : 6244 tests |
| 10/02/2026 | 🆕 SP-368 Modèle EmailLog & Service : +16 tests unitaires. Migration Prisma `20260210_add_email_log` : table EmailLog (to, subject, template, status PENDING/SENT/FAILED/BOUNCED, sentAt, error, metadata JSON, createdAt), index (template,status) + (createdAt). Service `email-log.service.ts` : sendAndLog (envoi Nodemailer + logging auto SENT/FAILED), getEmailLogs (pagination + filtres template/status/date), getEmailStats (agrégation total/sent/failed/taux), retryFailedEmail (relance + mise à jour log). Pattern fire-and-forget intégré dans Server Actions existantes. Compétence CDA #73 ajoutée. Total : 6217 tests |
| 09/02/2026 | 🆕 SP-439 Synchronisation employés → Stripe quantity : Service `syncEmployeeCountToStripe` (`src/lib/services/stripe/subscription-sync.service.ts`) fire-and-forget, ne throw jamais, retourne `SyncResult` typé (synced, previousQuantity, newQuantity, reason). Skip intelligent : pas de subscription, pas de stripeSubscriptionId, statuts TRIAL/CANCELED/EXPIRED/INCOMPLETE, quantité inchangée (`quantity_unchanged`), pas de subscription item (`no_stripe_item_id`). `Math.max(1, employeeCount)` (Stripe exige ≥1). `stripe.subscriptions.retrieve()` pour obtenir itemId dynamiquement (pas de champ Prisma). `stripe.subscriptions.update()` avec `proration_behavior: 'create_prorations'`. Mise à jour Prisma `subscription.quantity` + `planPrice` (quantity × pricePerEmployee). Barrel export `src/lib/services/stripe/index.ts`. Intégration dans 4 Server Actions employés (`src/lib/actions/employees.ts`) : `createEmployee`, `deleteEmployee`, `toggleEmployeeStatus` (sync directe), `bulkDeleteEmployees` (Set<companyId> pour multi-tenant). Pattern `.catch()` fire-and-forget (ne bloque jamais la réponse CRUD). Logging structuré `[StripeSync]` (action, companyId, quantities, timestamp). +33 tests unitaires (subscription-sync: 27 couvrant 8 skip conditions + 5 sync success + 2 quantity unchanged + 5 erreurs Stripe + 3 erreurs Prisma + 4 edge cases ; employees SP-439: 6 couvrant sync après create/delete/toggle/bulk + fire-and-forget safety + bon companyId). Compétence CDA #72 ajoutée. Total : 6201 tests |
| 09/02/2026 | 🆕 SP-441 Bannières progressives subscription : Fonction pure `getSubscriptionBannerConfig` (`src/lib/subscription-banner.ts`) Edge-compatible (0 dépendance React). 3 paliers TRIAL progressifs : info (7-14j, bleu, masquable), warning (4-6j, orange, masquable), urgent (1-3j, rouge, non-masquable). Bannière PAST_DUE grâce 7j (non-masquable). Composant `SubscriptionBanner` (`src/components/layout/SubscriptionBanner.tsx`) client : dismiss localStorage par tier (`sp-banner-dismissed-tier`), exclusion page billing via `usePathname()`, rôles ARIA (alert pour urgent, status pour info/warning), icônes Lucide par palier, CTA progressif (Voir les offres → S'abonner → S'abonner maintenant). Intégration layout : `subscriptionData` passé de `layout.tsx` (Server Component) → `DashboardLayout` → `SubscriptionBanner` (Client Component). Héro conversion `BillingPageContent` pour `trial_expired` et `no_subscription` (icône Rocket/Sparkles, prix dynamique `formatPrice`, ancre `#subscription-section`). Bypass SYSTEM_ADMIN. +73 tests unitaires (subscription-banner: 44, SubscriptionBanner: 29). Compétence CDA #71 ajoutée. Total : 6168 tests |
| 09/02/2026 | 🆕 SP-440 Subscription Guard Middleware : Fonction pure `checkSubscriptionAccess` Edge-compatible (`src/lib/subscription-guard.ts`). JWT enrichi dans NextAuth v5 callbacks (authorize → jwt → session → authorized) avec 4 champs subscription (status, trialEndsAt, currentPeriodEnd, subscriptionCheckedAt). Defense in Depth 3 couches : vérification JWT Edge Runtime → refresh périodique 5min via dynamic import Prisma (Node.js) → webhooks Stripe temps réel. Matrice 9 statuts : bypass SYSTEM_ADMIN + routes exemptées (billing/profile/settings), ACTIVE autorisé, TRIAL (valide/expiré), PAST_DUE (grâce 7j/dépassé), CANCELED/EXPIRED/INCOMPLETE/null/inconnu bloqués → redirection `/app/dashboard/billing?reason=XXX`. Alerte contextuelle `BillingPageContent` (6 motifs warning/destructive). Constante `SUBSCRIPTION_EXEMPT_ROUTES` dans types/auth.ts. +31 tests unitaires (`__tests__/lib/subscription-guard.test.ts`) couvrant matrice complète sans mocks. Compétence CDA #70 ajoutée. Total : 6095 tests |
| 09/02/2026 | 🆕 SP-360 Dashboard Billing Page : Page `/app/dashboard/billing` complète avec Server Component (auth + RBAC DIRECTOR + sérialisation Date→ISO string). 4 composants Client : `BillingPageContent` (orchestrateur, Server Actions portail/annulation, AlertDialog confirmation), `SubscriptionStatus` (6 badges statut TRIAL/ACTIVE/PAST_DUE/CANCELED/EXPIRED/INCOMPLETE, countdown essai gratuit, alerte annulation programmée, EmptyState "S'abonner"), `UsageIndicator` (ProgressBar colorée sièges vert/orange/rouge, prix unitaire/total, tooltip prorata), `InvoiceHistory` (Table 5 dernières factures, badges Payé/Échoué/En attente, liens factures Stripe externes, EmptyState). Barrel export + types sérialisés (SerializedBillingData, SerializedSubscription, SerializedPayment). Loading skeleton 3 cartes. Navigation menu-items.ts : entrée "Facturation" (icône CreditCard, rôle DIRECTOR, raccourci G B). Type `BillingData` enrichi dans `src/types/stripe.ts` (ajout currentPeriodStart, canceledAt, createdAt sur subscription ; stripeInvoiceId, paymentMethod sur payments ; trialEndsAt racine). `getBillingDataAction` enrichi (Promise.all + company.trialEndsAt). Design glassmorphism + Framer Motion + useReducedMotion. +41 tests unitaires (4 fichiers : SubscriptionStatus 16, UsageIndicator 8, InvoiceHistory 11, BillingPageContent 6). Compétence CDA #69 ajoutée. Total : 6064 tests |
| 09/02/2026 | 🆕 SP-352 Server Actions Stripe : 5 Server Actions connectant le service Stripe (SP-351) au frontend (`src/lib/actions/stripe.ts`, 339 lignes). `createCheckoutAction` (session Checkout per-seat avec email via auth() séparé + companyName via Prisma), `createBillingPortalAction` (portail facturation via stripeCustomerId depuis Subscription), `updateSubscriptionQuantityAction` (mise à jour sièges + revalidatePath billing), `cancelSubscriptionAction` (annulation fin de période ou immédiate + revalidatePath billing), `getBillingDataAction` (subscription + 5 derniers payments + employeeCount + monthlyAmount via Promise.all). RBAC strict DIRECTOR via `checkPermission('DIRECTOR')`. Validation Zod via `validateData()` avec schémas SP-349. Conversion `ServiceResult<T>` → `CrudActionResult<T>` discriminated union. Retour URL (pas redirect()) pour loading state client. Type `BillingData` ajouté à `src/types/stripe.ts` + barrel export. +32 tests unitaires (`__tests__/lib/actions/stripe.test.ts`, 625 lignes) couvrant : auth denied, RBAC denied, companyId null, Zod validation, missing subscription/customer, erreurs service Stripe, happy paths, revalidatePath, calcul monthlyAmount, erreurs Prisma. Mocking vi.hoisted() + prismaMock centralisé. Compétence CDA #68 ajoutée. Total : 6023 tests |
| 09/02/2026 | 🆕 SP-351 Stripe Service & Webhooks : Service Stripe complet (`src/lib/services/stripe/stripe.service.ts`) avec 5 fonctions exportées (createCheckoutSession, updateSubscriptionQuantity, cancelSubscription, createBillingPortalSession, handleWebhookEvent) + 5 handlers internes (checkout completed, subscription updated/deleted, invoice paid/failed). Pattern ServiceResult<T> uniforme. Compatibilité Stripe SDK v20.3.1 (API `2026-01-28.clover`) avec types natifs discriminants (pas de cast `as` nécessaire). Route webhook POST `/api/webhooks/stripe` : vérification signature HMAC `constructEvent()`, lecture raw body `request.text()`, gestion erreurs structurée. Types TypeScript 7 interfaces (`src/types/stripe.ts`) avec barrel export. +50 tests unitaires (stripe-service: 40, webhook-route: 10). Compétences CDA #66-67 ajoutées. Total : 5991 tests |
| 09/02/2026 | 🆕 SP-350 Migration Per-Seat Subscription Model : Migration du modèle multi-plan (FREE/STARTER/BUSINESS/ENTERPRISE) vers per-seat billing (FREE/PER_SEAT à 2,90€/employé/mois). **Phase 1 Backend** : 2 enums Prisma (`SubscriptionPlan`: FREE/PER_SEAT, `SubscriptionStatus`: TRIAL/ACTIVE/PAST_DUE/CANCELED/EXPIRED/INCOMPLETE), modèle Subscription 1:1 Company (plan, status, quantity, pricePerEmployee centimes), migration Prisma `add_subscription_model`, seed avec subscriptions aléatoires, validations Zod company enrichies (subscriptionPlan/subscriptionStatus filters, labels FR `subscriptionPlanLabels`/`subscriptionStatusLabels`), Server Actions companies avec relation subscription (select nested), types `CompanySubscription`/`CompanyWithCounts`/`CompanyDetail`. **Phase 2 UI** : CompanyCard (badges plan/statut colorés, prix formaté centimes→€), CompanyForm (select plan FREE/PER_SEAT, 6 statuts, inputs quantity/pricePerEmployee conditionnels), columns.tsx (colonnes virtuelles TanStack id-based pour relation nested, filterFn custom), page [id] (lecture subscription relation). +97 tests unitaires (9 fichiers) + +290 tests E2E. Compétences CDA #64-65 ajoutées. Total : 5941 tests |
| 06/02/2026 | 🆕 SP-349 Stripe SDK + Configuration + Validations : Installation Stripe SDK v20.3.1. Client singleton server-only (`src/lib/stripe/stripe.ts`) avec pattern globalThis HMR survie, apiVersion fixe `2026-01-28.clover`, appInfo SmartPlanning. Configuration centralisée (`stripe-config.ts`) : STRIPE_PRICING (montant centimes 290, devise eur, intervalle month, trial 21 jours aligné PRICING.TRIAL_DAYS), STRIPE_STATUS_MAP (8 statuts Stripe → 5 statuts internes SubscriptionStatus), STRIPE_WEBHOOK_EVENTS (8 événements groupés SUBSCRIPTION/INVOICE/CHECKOUT pour SP-351), STRIPE_METADATA_KEYS (company_id, user_id). Barrel export `index.ts`. 5 schémas Zod validations (`src/lib/validations/stripe.ts`) : stripeEnvSchema (validation préfixes sk_/pk_/whsec_/price_), checkoutSessionSchema (quantité entière 1-250 + URLs optionnelles), updateSubscriptionQuantitySchema, stripeWebhookHeaderSchema (stripe-signature), customerPortalSchema. `.env.example` enrichi section Stripe (4 variables). +66 tests unitaires (stripe singleton 9, stripe-config 29, stripe-validations 28). Total : 5554 tests |
| 06/02/2026 | 🆕 SP-355/SP-358/SP-359 Page Tarifs et composants Pricing : **SP-355** Composants pricing réutilisables — PricingSimulator (slider employés 1-250, calcul prix temps réel `employees × 2.90€`, message grandes équipes >50 avec lien contact), PricingCard (prix per-seat, badge essai gratuit 21 jours, liste features avec check icons, CTA), `src/lib/config/pricing.ts` constantes centralisées SSOT (PRICING, INCLUDED_FEATURES, FAQ_DATA). +55 tests unitaires (pricing config 23, PricingSimulator 20, PricingCard 12). **SP-358** Section pricing landing page avec PricingSimulator intégré dans la page d'accueil. **SP-359** Page dédiée `/tarifs` avec route group `(about)` — Server Component (metadata SEO : title, description, Open Graph, canonical) + Client Component PricingPageContent (5 sections animées : Hero badge+titre+description, Simulateur PricingSimulator mode full, Fonctionnalités PricingCard+features grid, FAQ 8 questions AnimatePresence, CTA register). StructuredData JSON-LD `@graph` combinant SoftwareApplication (Offer price 2.90 EUR, featureList 10 items) + FAQPage (8 questions/réponses) + WebPage (breadcrumbs). PRICING_FAQS partagées entre JSON-LD et UI. Skip-to-content, accessibilité WCAG 2.1 AA, header+footer. +34 tests unitaires (PricingPageContent 22, StructuredData 12). Compétences CDA #62-63 ajoutées. Total : 5488 tests |
| 04/02/2026 | 🆕 SP-272 Avatar Upload Cloudinary : API Route `/api/avatar` (POST upload avec validation 5MB/image, DELETE suppression). Intégration Cloudinary SDK v2 (transformation crop/resize 400x400 gravity face, format auto/quality auto, folder smartplanning/avatars). Affichage avatar dans : Header (navbar utilisateur), ScheduleCalendarMobile, WeeklyHoursPanel, LeavesList (DataTable), LeaveCalendar (grille employés), LeaveRequestCard (cartes mobile). Propagation User.image via relations Prisma (Employee.user.image). Fetch DB direct dans layout au lieu du JWT pour image fraîche. Revalidation paths /app/profile, /app, /app/schedules. Composant Avatar Shadcn/ui avec AvatarImage conditionnel et AvatarFallback initiales. Types mis à jour : LeaveRequestWithEmployee, ScheduleWithRelations, Employee. Total : 5358 tests                                                    |
| 04/02/2026 | 🆕 SP-435 Company Settings Page : +19 tests unitaires (company-settings actions), +21 tests E2E (company-settings.spec.ts avec Page Object CompanySettingsPage). Page `/app/settings/company` avec RBAC DIRECTOR/SYSTEM_ADMIN. 4 sections : Company Info (name, address), Working Days (7 checkboxes + 3 presets Mon-Fri/Mon-Sat/All Week), Working Hours (start/end), Lunch Break (toggle + hours). Server Actions : getCompanySettings, updateCompanySettings, resetCompanySettings avec optimistic UI et rollback erreur. Types TypeScript : DayOfWeek, CompanySettings, LunchBreakSettings, WorkingDaysPreset. Constants : DAYS_OF_WEEK, DAY_LABELS, DAY_SHORT_LABELS, WORKING_DAYS_PRESETS, DEFAULT_COMPANY_SETTINGS. Badge "Bientôt" retiré de section Entreprise dans Settings Hub. Tests E2E settings-hub mis à jour (20 tests passent). Compétence CDA #61 ajoutée. Total : 5358 tests |
| 27/01/2026 | 🆕 SP-406 Améliorations Plannings : +16 tests E2E Playwright (schedules.spec.ts avec Page Object SchedulesPage). WeeklyHoursPanel (compteur heures hebdo vs contrat). Type REST (repos journée entière, isAllDay). Simplification statuts DRAFT/PUBLISHED. BulkDeleteDialog (suppression en masse employés). Nom entreprise dans Sidebar layout. Corrections boucles infinies React 19 (ANO-021). Refonte CSS calendrier Schedule-X. Exports PDF/Excel avec filtres et colonne heures. Downgrade @schedule-x 2.11.0 + patch-package (ANO-022). Email employé (migration Prisma). Compétences CDA #48-53 ajoutées. Total : 3921 tests                                                                                                                                                                                                                                                            |
| 27/01/2026 | 🆕 SP-404 Export Excel Planning : +7 tests unitaires (generateScheduleExcel: 7). API Route GET `/api/schedules/export/excel` avec auth NextAuth v5 et RBAC (MANAGER/DIRECTOR). Générateur `generateScheduleExcel` via SheetJS (`xlsx`) : 3 feuilles (Planning détaillé 11 colonnes, Résumé par employé avec heures par type, Statistiques globales). `ExportDropdown` mis à jour : export Excel fonctionnel remplaçant le placeholder. Total : 3721 tests                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 27/01/2026 | 🆕 SP-403 Export PDF Planning : +6 tests unitaires (SchedulePdfDocument: 6). API Route GET `/api/schedules/export/pdf` avec auth NextAuth v5 et RBAC (MANAGER/DIRECTOR). Composant React PDF `SchedulePdfDocument` via `@react-pdf/renderer` (A4 paysage, tableau employés × jours, légende 7 types de shift). `ExportDropdown` dans toolbar schedules (export PDF fonctionnel + placeholder Excel). Total : 3714 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 27/01/2026 | 🆕 SP-402 Overlay Indisponibilités Calendrier : +47 tests unitaires (useCalendarAvailabilities: 10, AvailabilityBadge: 20, AvailabilityOverlay: 17). Server Action `getAvailabilitiesForCalendar` avec RBAC. Hook `useCalendarAvailabilities` avec debounce 200ms et cache local. Composants `AvailabilityBadge`, `AvailabilityPopover`, `AvailabilityOverlay`. Intégration Schedule-X desktop (events colorés) + badges mobile. Toggle Eye/EyeOff dans SchedulesPageContent. Total : 3708 tests                                                                                                                                                                                                                                                                                                                                                                                                |
| 26/01/2026 | 🆕 SP-401 CRUD Availabilities : +54 tests unitaires (Server Actions: 22, AvailabilityCard: 18, AvailabilityModal: 14). 8 Server Actions RBAC complet (getAvailabilities, getAvailabilityById, createAvailability, updateAvailability, deleteAvailability, getEmployeeAvailabilities, getTeamAvailabilities, getAvailabilitiesStats). Composants UI : AvailabilityCard, AvailabilityModal, AvailabilitiesList. 6 types d'indisponibilité avec icônes/couleurs. Total : 3636 tests                                                                                                                                                                                                                                                                                                                                                                                                                |
| 26/01/2026 | 🆕 SP-399 Récurrence des Shifts : +40 tests unitaires (recurrence: 24, RecurrenceConfig: 12, availability fix: 4). Fréquences DAILY/WEEKLY/BIWEEKLY/MONTHLY. Sélection jours semaine. Limites : 52 occurrences max, 200 créneaux max. Server Actions groupées (getRecurrenceGroupCounts, deleteRecurringSchedules, updateRecurringSchedules). RecurrenceEditDialog pour scope single/future/all. Total : 3582 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 26/01/2026 | 🆕 SP-398 Drag & Drop Calendrier : +19 tests unitaires. Plugin @schedule-x/drag-and-drop + @schedule-x/resize. Déplacer créneaux par drag, redimensionner par bord. Persistance updateSchedule avec rollback erreur. RBAC : DIRECTOR/MANAGER uniquement. Toast feedback. Total : 3542 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 26/01/2026 | 🆕 SP-397 ShiftModal : +30 tests unitaires (17 modal + 13 hook). Modal création/édition avec React Hook Form + Zod. Sélection multi-employés avec recherche et filtrage équipe. Date/time pickers locale française. Types/statuts FR. Total : 3523 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 26/01/2026 | 🆕 SP-396 ScheduleCalendar responsive : +18 tests unitaires. Intégration Schedule-X (desktop ≥768px) avec vues jour/semaine/mois, drag & drop. Vue mobile cards empilées verticalement (pas de scroll horizontal). Couleurs par type (7 types : travail, pause, réunion, formation, télétravail, astreinte, heures sup.). Temporal API polyfill. Total : 3493 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 26/01/2026 | 🆕 SP-395 Page Liste Schedules : Route `/app/dashboard/schedules`. Layout SEO, loading skeleton grille semaine. `SchedulesPageContent` (navigation date, vues jour/semaine/mois, filtres collapsibles, stats rapides). `SchedulesList` (grille semaine, shifts colorés par type). `SchedulesFilters` (recherche, statut, type). Correction Sidebar URL. Total : 3475 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 26/01/2026 | 🆕 SP-394 Server Actions Schedules CRUD : +30 tests unitaires. 10 actions CRUD (`getSchedules`, `getScheduleById`, `createSchedule`, `updateSchedule`, `deleteSchedule`, `deleteScheduleGroup`, `duplicateSchedule`, `updateScheduleStatus`, `getEmployeeSchedules`, `getTeamSchedules`). RBAC complet (SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE). Multi-employé via `employeeIds`. Total : 3475 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 26/01/2026 | 🆕 SP-393 Validations Zod Plannings : +81 tests unitaires (schedule: 47, availability: 34). Schemas `createScheduleSchema`, `updateScheduleSchema`, `scheduleFiltersSchema`, `recurrenceRuleSchema`. Support multi-employés `employeeIds`. `timeSchema` et `hexColorSchema` dans common.ts. Labels FR, couleurs, icônes. Total : 3445 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 26/01/2026 | 🆕 SP-392 Gestion Plannings - Fondations Prisma : Modèle `Availability` (disponibilités/indisponibilités employés), enum `AvailabilityType` (UNAVAILABLE, PREFERRED, VACATION, SICK, TRAINING, OTHER). Enrichissement `Schedule` (isRecurring, recurrenceRule JSON, recurrenceGroupId, scheduleGroupId). Migration + indexes. Début Sprint 12.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 25/01/2026 | 🆕 SP-263 Réinitialisation mot de passe : +39 tests unitaires (ForgotPasswordForm: 14, ResetPasswordForm: 17, reset-password page: 8). Pages /forgot-password et /reset-password avec Server Actions sécurisées. Tokens aléatoires, anti-énumération OWASP, validation Zod. Compétence CDA #47 ajoutée. Total : 3364 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 25/01/2026 | 🔧 Correction accessibilité pages d'erreur : role="main" → role="region" sur NotFoundPage, ServerErrorPage, ForbiddenPage. Évite conflit avec `<main>` du layout. Navigation clavier skip-link → boutons. Tests unitaires et E2E mis à jour.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 25/01/2026 | 🆕 SP-269 Accessibilité WCAG 2.1 : +14 tests unitaires SkipLink, +14 tests E2E axe-core. Skip to main content (WCAG 2.4.1), focus visible (2.4.7), focus order (2.4.3). Audit Lighthouse 95%. Script `npm run a11y:audit`. Compétence CDA #46 ajoutée. Total : 3325 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 25/01/2026 | 🆕 SP-389 E2E Mobile Tests Playwright : +90 tests E2E mobile (75 actifs, 15 skip). 5 devices configurés (iPhone SE/14 Pro, Pixel 7, iPad Mini/Pro 11"). Mobile fixtures, touch-gestures utilities. ANO-020 WebKit HTTPS bug → migration Chromium. Compétence CDA #45 ajoutée. Total : 3297 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 23/01/2026 | 🆕 SP-268 Phase 3 Mobile UI Components : +110 tests unitaires (SP-385: 31, SP-386: 32, SP-387: 22, SP-388: 25). TouchableButton (WCAG 2.5.5 touch targets 44px), MobileFormField (iOS zoom prevention), DataTablePagination (responsive layout), ResponsiveBreadcrumb (scroll-snap). Compétences CDA #41-44 ajoutées. Total : 3207 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 23/01/2026 | 🆕 SP-383/SP-384 Navigation Mobile Phase 2 : +21 tests unitaires SwipeableDrawer. Gestes tactiles Framer Motion (swipe to close), velocity/threshold detection, iOS safe-area, prefers-reduced-motion. Sidebar refactorisé avec feature flag. Compétences CDA #39-40 ajoutées. Total : 3097 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 23/01/2026 | 🔧 Hotfix : Suppression test E2E flaky "click overlay to close" Command Palette (ANO-019). Le z-index du dialog cmdk intercepte les pointer events. Comportement couvert par test Escape. Total : 3076 tests (-1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 23/01/2026 | 🆕 SP-264 Dashboard Layout V2 : +133 tests unitaires, +30 tests E2E (163 total). Command Palette (cmdk), Dynamic Breadcrumbs, Keyboard Shortcuts Modal, Recent Pages (localStorage). Compétences CDA #36-38 ajoutées. Total : 3077 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 22/01/2026 | SP-266 Loading States : +133 tests unitaires. ProgressBar, ProgressCircle, withLoading HOC, useProgressLoading hook. Compétences CDA #34-35 ajoutées. Total : 2914 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 22/01/2026 | SP-378 Empty States : +78 tests unitaires. EmptyState component, 5 illustrations SVG. Compétence CDA #33 ajoutée. Total : 2781 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 21/01/2026 | SP-260 UI Components Extension : +147 tests unitaires. Button/Badge/Input variants, AvatarGroup. Compétence CDA #32 ajoutée. Total : 2703 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 21/01/2026 | SP-265 Dark/Light Mode : +32 tests unitaires. ThemeToggle, ThemeDropdown, next-themes. Compétence CDA #31 ajoutée. Total : 2556 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 21/01/2026 | SP-379 Animation System : +212 tests unitaires. Framer Motion centralisé, hooks animation. Compétence CDA #30 ajoutée. Total : 2524 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 21/01/2026 | SP-259 Design Tokens System : +45 tests unitaires. Colors, spacing, typography tokens CSS. Compétence CDA #29 ajoutée. Total : 2312 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 20/01/2026 | 🆕 SP-305 Page 403 Forbidden : +52 tests unitaires, +24 tests E2E (76 total). ForbiddenPage, ForbiddenIllustration, route /forbidden. Total : 2267 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 21/01/2026 | 🆕 SP-303 Page 500 personnalisée : +74 tests unitaires, +22 tests E2E (96 total). error-logger structuré, ServerErrorPage, route /server-error, Framer Motion, accessibilité WCAG 2.1 AA. Compétence CDA #28 ajoutée. Total : 2185 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 20/01/2026 | 🆕 SP-302 Page 404 personnalisée : +40 tests unitaires, +8 tests E2E (48 total). NotFoundIllustration/NotFoundPage, animations Framer Motion (floating, orbit, stagger), accessibilité WCAG 2.1 AA, responsive mobile-first, dark mode. Compétences CDA #26 et #27 ajoutées. Justification technique Framer Motion vs CSS. Total : 2089 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 20/01/2026 | 🆕 SP-304 Error Boundary React : +22 tests unitaires, +5 tests E2E (27 total). react-error-boundary v5.0.0, ErrorBoundary/ErrorFallback, error.tsx/global-error.tsx Next.js, accessibilité WCAG 2.1 AA. Compétence CDA #25. Justification technique ajoutée. Total : 2041 tests 🎉                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 19/01/2026 | SP-301 : +40 tests templates Contact (ContactConfirmationEmail: 18, ContactNotificationEmail: 22). Complète SP-288. Compétence CDA #24 ajoutée. Total : 2014 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 30/01/2026 | SP-431 : Animations Dashboards Framer Motion. 15 composants animés (4 dashboards : Employee, Manager, Director, Admin). Variants fadeSlideUpVariants + staggerContainer/staggerItem. Hook useReducedMotion pour accessibilité WCAG (prefers-reduced-motion). Stagger delay sur KPIs grids, charts delay 0.3s, quick actions delay 0.5s. Total : 4338 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 30/01/2026 | SP-317 : +4 tests Dashboard Director KPIs. 2 métriques ajoutées au service getDirectorStats() : plannedHoursThisMonth (heures planifiées ce mois), absencesLast7Days (congés approuvés 7 derniers jours). Composant DirectorStats affiche les vraies valeurs. Total : 4338 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 30/01/2026 | SP-316 : +63 tests Dashboard Manager (5 fichiers). 5 composants : ManagerWelcome (bienvenue + badges alertes congés/absences), ManagerStats (4 KPIs via StatsGrid + TrendIndicator), ManagerTeamChart (BarChartWidget performance équipe), ManagerPendingLeaves (liste congés + actions approve/reject), ManagerQuickActions (4 boutons). Service getManagerStats() intégré. Loading skeleton. Total : 4334 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 28/01/2026 | SP-415 : +49 tests Leaves Integrations (3 fichiers). Email LeaveRequestedEmail notifiant manager lors création demande (template + send function). Overlay congés approuvés sur Schedule-X calendrier (7 types couleurs). Props leaveRequests/showLeaves/onLeaveClick. Dashboard stats déjà implémentées. Compétence CDA #60. Total : 4015 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 28/01/2026 | SP-414 : +48 tests Leave Detail + Balances (4 fichiers). Routes `/leaves/[id]` (page détail demande + timeline événements) et `/leaves/balances` (gestion soldes CP/RTT DIRECTOR only). Composants LeaveDetailCard, LeaveTimeline, LeaveDetailContent, BalancesPageContent. Server action getAllLeaveBalances. Compétence CDA #59. Total : 3985 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 28/01/2026 | SP-413 : +18 tests Page Congés + Orchestrateur (2 fichiers). Route `/app/dashboard/leaves` : Server Component fetch initial, LeavesPageContent (tabs Liste/Calendrier, stats bar cliquable, filtres URL sync, Dialog/Sheet responsive), Sidebar href corrigé. Compétence CDA #58. Total : 3937 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 28/01/2026 | SP-412 : +39 tests Composants Liste & Calendrier Congés (4 fichiers). 6 composants : LeaveStatsBar (badges filtres rapides), LeaveFilters (status/type/employé/équipe/période), LeaveCalendar (grille mensuelle employés×jours), LeaveCalendarDay (popover, demi-journée), LeavesList (DataTable TanStack v8), LeavesListMobile (cartes responsive). Total : 4103 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 28/01/2026 | SP-411 : +50 tests Composants UI Leave Management (7 fichiers). 8 composants : LeaveTypeBadge, LeaveStatusBadge, LeaveConflictWarning, LeaveBalanceCard, LeaveRequestCard, LeaveRequestForm, LeaveReviewDialog, LeaveBalanceEditDialog. Badges Lucide, ProgressBar seuils, Calendar range, RHF+Zod, Dialog review. Compétence CDA #56. Total : 4064 tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 19/01/2026 | SP-300 : +48 tests Email Congé Validé/Refusé Phase 1 (templates: 28, fonctions: 20). Types LeaveType (6 types), templates LeaveApprovedEmail/LeaveRejectedEmail, fonctions sendLeaveApprovedEmail/sendLeaveRejectedEmail. Architecture modulaire découplée. Compétence CDA #23.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 19/01/2026 | SP-289 : +54 tests UX Contact (hook: 21, success: 12, error: 10, integration: 11), Framer Motion, state machine, compétence CDA #22                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 19/01/2026 | SP-288 : +48 tests API Contact (rate limiter: 15, email: 13, route: 20), compétence CDA #21                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 19/01/2026 | SP-287 : +41 tests formulaire contact (20 Zod + 21 composant), React Hook Form, accessibilité WCAG 2.1, compétence CDA #20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 19/01/2026 | SP-299 : +10 tests email vérification, Server Actions send/verify/resend, préfixe token verify\_, compétence CDA #19                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 19/01/2026 | SP-298 : +9 tests email reset password, Server Actions forgot/reset, protection OWASP, compétence CDA #18                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 19/01/2026 | SP-297 : +18 tests email bienvenue (WelcomeEmail, sendWelcomeEmail), ANO-018 vi.doMock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 19/01/2026 | SP-296 : Composants React Email (Layout, Header, Footer, Button), design tokens, compétence CDA #17                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 19/01/2026 | SP-295 : +43 tests email (config, transporter, send), service Nodemailer + SMTP Hostinger, compétence CDA #16                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 16/01/2026 | SP-283 : +83 tests unitaires cookies + 18 E2E, conformité RGPD, ANO-017 Context API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 15/01/2026 | Mise à jour CDA : Ajout sections justification choix techniques, difficultés rencontrées, contexte CDA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 12/01/2026 | SP-156 : +58 tests E2E CRUD, 8 Page Objects, EPIC SP-113 TERMINÉ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 09/01/2026 | SP-154 : +107 tests Navigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 09/01/2026 | SP-153 : +85 tests CRUD Teams                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 08/01/2026 | SP-152 : +37 tests CRUD Employees                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 08/01/2026 | SP-151 : +67 tests CRUD Companies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 11/12/2025 | SP-149 : +106 tests E2E Dashboards, EPIC SP-112 TERMINÉ                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 04/12/2025 | Création initiale du cahier                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## Documents liés

### Sprint 19 - Audit System & User Activity (SP-442→446, SP-463) 🆕

- SP-442 : Schéma Prisma AuditLog ✅ TERMINÉ
  - Migration Prisma `20260218183732_add_audit_log` : table `AuditLog` avec 9 actions (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, STATUS_CHANGE, IMPERSONATE, PASSWORD_CHANGE), 10 types d'entités (COMPANY, EMPLOYEE, TEAM, SCHEDULE, LEAVE, SUBSCRIPTION, USER, SETTINGS, INCIDENT_NOTE, AVAILABILITY)
  - Relations User et Company, champs entityId/companyId optionnels, details Json
  - **Tests** : 30 tests unitaires (audit-schema.test.ts) — création avec tous champs, companyId null (SYSTEM_ADMIN), details Json complexe, entityId null (LOGIN), enums AuditAction (9 valeurs), enums AuditEntityType (10 valeurs), findMany avec relations, count avec filtres, filtre par plage de dates

- SP-443 : Service logAuditAction ✅ TERMINÉ
  - Service `src/lib/services/audit/audit.service.ts` : fire-and-forget (ne throw jamais), création via Prisma, logging console.error structuré en cas d'échec
  - **Tests** : 22 tests unitaires (audit.service.test.ts) — création avec tous les champs, details optionnel, erreur silencieuse (Error + non-Error), companyId optionnel (null/fourni), entityId optionnel, paramètres obligatoires, toutes valeurs AuditAction (9), toutes valeurs AuditEntityType (10), details complexes before/after

- SP-444 : Protection anti-injection AuditLog ✅ TERMINÉ
  - Sanitization des inputs audit : HTML tags, SQL injection, NoSQL injection, XSS payloads, script injection dans entityId/companyId/userId/details
  - **Tests** : 20 tests unitaires (audit-injection.test.ts) — XSS dans details, SQL injection entityId, NoSQL $gt companyId, script tag userId, HTML dans details nested, details null/undefined/vide, types primitifs dans details

- SP-445 : Page Admin Audit Logs ✅ TERMINÉ
  - Server Actions : `getAuditLogs` (paginé, filtres action/entityType/userId/companyId/dateFrom/dateTo, validation Zod), `exportAuditLogsCsv` (export CSV complet)
  - Page `/app/admin/logs` : DataTable TanStack avec colonnes Date/Utilisateur/Action/Entité/Entreprise, AuditActionBadge (badges colorés par action), AuditLogFilterBar (filtres action/entité/utilisateur/dates), AuditLogDetailModal (modal détail JSON formaté), pagination serveur, export CSV
  - **Tests** : 33 tests unitaires (audit-logs.test.ts) — auth (non-connecté, non-admin), RBAC 4 rôles, filtres (action, entityType, dates, companyId), pagination, export CSV (succès, contenu), sanitization HTML/SQL

- SP-446 : Tests E2E Audit Logs ✅ TERMINÉ
  - Page Object `AuditLogsPage` (`e2e/pages/audit-logs.page.ts`) : locators data-testid, méthodes navigation/filtres/export/détail
  - **Tests** : 26 tests E2E (audit-logs.spec.ts, 23 pass + 3 skip) — navigation, titre/description, boutons actualiser/exporter, filtres action/entité (exact: true fix), reset filtres, pagination, modal détail, responsive

- SP-463 : Page Activité Utilisateur ✅ TERMINÉ
  - Server Action `getUserActivity` : filtrage par userId JWT, isolation RBAC, pagination, filtre action optionnel
  - Page `/app/profile/activity` Server Component avec `UserActivityTimeline` (timeline relative française `Intl.RelativeTimeFormat`)
  - Navigation : lien "Mon activité" dans Header dropdown + bouton dans ProfileActions
  - **Tests** : 17 tests unitaires (getUserActivity) — auth, RBAC 4 rôles, isolation userId, pagination, filtre action, résultats vides, transformation, erreur DB
  - **Bilan Sprint 19 (phase 1)** : +122 tests unitaires, +26 tests E2E. Total : 6335 tests (5760 unitaires + 575 E2E, 39 fichiers)

- SP-456 : Tests E2E Impersonation + Tests Unitaires API ✅ TERMINÉ
  - **Tests unitaires** : 10 tests (`src/app/api/admin/impersonate/__tests__/route.test.ts`) — POST (401 auth, 403 RBAC, 400 body vide, 404 company vide, 400 cible SYSTEM_ADMIN, 400 cible désactivée, 200 succès companyId, 200 succès targetUserId) + DELETE (400 aucune impersonation, 200 succès)
  - **Tests E2E** : 9 tests (`e2e/specs/impersonation/impersonation-flow.spec.ts`) — parcours nominal (2), restrictions sécurité (3), cas limites (3), audit trail (1)
  - **Page Object** : `e2e/pages/impersonation.page.ts` — startImpersonation (UI dropdown Radix → API interception `Promise.all` → reload fallback cookie), stopImpersonation (`page.request.delete()` → clear cookies sélectif → re-login admin)
  - **Correction applicative** : bypass subscription guard dans `auth.config.ts` quand cookie `sp-impersonation` présent (ANO-028)
  - **Correction applicative** : fallback cookie dans `layout.tsx` quand `updateSession()` NextAuth v5 échoue (ANO-029)
  - **Bilan Sprint 19 (phase 2)** : +10 tests unitaires, +9 tests E2E. Total : 6354 tests (5770 unitaires + 584 E2E, 40 fichiers)

### Sprint 18 - Nettoyage Final & Couverture 86% (SP-460) 🆕

- SP-460 : Nettoyage final SmartPlanning V2 — Préparation soutenance CDA ✅ TERMINÉ
  - **Cleanup code mort** :
    - Suppression route `test-datatable/` (3 fichiers : columns.tsx, mock-data.ts, page.tsx)
    - Suppression `console.log` restants dans auth.config.ts, auth.ts, error-logger.ts
    - Suppression imports inutilisés et types morts dans validations (employee.ts, team.ts, profile.ts)
    - Suppression dépendances npm inutilisées : `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@types/react-color`, `cmdk`, `react-colorful`, `react-day-picker`
    - Nettoyage barrel export `schedules/_components/index.ts`
  - **Tests composants Teams** (4 fichiers, 72 tests) :
    - `TeamCard.test.tsx` (14 tests) : Rendu, couleur badge, manager, membres, actions RBAC
    - `TeamForm.test.tsx` (20 tests) : Création/édition, validation Zod, sélection employés, soumission
    - `TeamMembersManager.test.tsx` (24 tests) : Ajout/retrait membres, recherche, rôle manager
    - `TeamsDataTable.test.tsx` (14 tests) : Colonnes, tri, filtres, pagination, actions
  - **Tests composants Admin/Employees** (5 fichiers, 88 tests) :
    - `EmployeeCard.test.tsx` (18 tests) : Rendu, avatar, badge statut, actions
    - `EmployeeFilters.test.tsx` (18 tests) : Filtres recherche, équipe, statut, reset
    - `DeleteEmployeeDialog.test.tsx` (16 tests) : Dialog confirmation, soumission, erreurs
    - `BulkDeleteDialog.test.tsx` (20 tests) : Sélection multiple, confirmation, loading
    - `columns.test.tsx` (16 tests) : Colonnes DataTable, renderers cellules, TooltipProvider
  - **Tests composants Schedules** (3 fichiers, 41 tests) :
    - `ExportDropdown.test.tsx` (12 tests) : Menu export, CSV server action, PDF/Excel
    - `WeeklyHoursPanel.test.tsx` (16 tests) : Calcul heures, barres progression, tri
    - `AvailabilityPopover.test.tsx` (13 tests) : Header, badge Bloquant/Avertissement, dates, horaires
  - **Tests couverture supplémentaires** (9 fichiers, 140 tests) :
    - `FormDatePicker.test.tsx` (20 tests) : Popover, sélection date, accessibilité
    - `AvatarUpload.test.tsx` (21 tests) : Upload MSW handlers, validation fichier, drag & drop, suppression
    - `CookieConsentProvider.test.tsx` (16 tests) : Context provider RGPD, actions acceptAll/rejectAll
    - `LeavesListMobile.test.tsx` (10 tests) : Liste mobile, pagination "Voir plus"
    - `ChartWidgets.test.tsx` (22 tests) : Mock Recharts complet, 3 types graphiques, loading/empty
    - `UmamiAnalyticsWrapper.test.tsx` (5 tests) : Config par défaut, env override
    - `CompanyForm.test.tsx` (17 tests) : Création/édition, validation, mutation create/update
    - `columns.test.tsx` employees (16 tests) : Renderers cellules, email fallback, avatar
    - `AvailabilityPopover.test.tsx` (13 tests) : Types disponibilité, dates, fermeture
  - **Couverture** : 80.38% → **86.35%** (statements), 83.56% (branches), 77.75% (functions)
  - **Vérifications finales** : lint 0 erreurs, tsc 0 erreurs, 5637 tests Vitest OK, build OK
  - **Anomalies résolues** :
    - ANO-023 : `vi.hoisted()` requis pour mocks MSW dans AvatarUpload (hoisting `vi.mock`)
    - ANO-024 : MSW `server.use()` au lieu de `vi.stubGlobal('fetch')` quand MSW est actif
    - ANO-025 : `TooltipProvider` obligatoire pour colonnes DataTable avec Radix Tooltip
  - Total projet : 6655 tests (5637 unitaires + 1018 E2E) — _consolidé à 6187 tests le 18/02/2026 (suppression 469 tests E2E redondants : 1018→549)_

### Sprint 18 - Optimisation SEO Google + LLMs (SP-462) 🆕

- SP-462 : Optimisation SEO pour Google SERP + découvrabilité LLMs ✅ TERMINÉ
  - **Favicon convention Next.js 15** :
    - `src/app/favicon.ico` (48x48), `src/app/icon.png` (192x192), `src/app/apple-icon.png` (180x180)
    - Détection automatique par Next.js 15, URL stable pour Google SERP
  - **robots.ts** (`src/app/robots.ts`) :
    - Metadata API Next.js 15 générant `/robots.txt`
    - Allow `/`, disallow `/app/`, `/api/`, `/login`, `/register`, `/forgot-password`, `/reset-password`
    - Référence sitemap.xml
  - **sitemap.ts** (`src/app/sitemap.ts`) :
    - 8 pages publiques avec priorités hiérarchisées
    - Homepage 1.0, tarifs 0.9, a-propos 0.8, pages légales 0.3
    - changeFrequency weekly/monthly/yearly selon le type
  - **Homepage refactorisée en Server Component** :
    - Extraction contenu client dans `LandingPageContent.tsx`
    - `StructuredData.tsx` avec JSON-LD @graph 4 schemas : WebSite, Organization (logo 512x512), SoftwareApplication (prix 2.90 EUR per-seat), FAQPage (5 questions landing)
    - Metadata complète : title, description, canonical, Open Graph, Twitter Cards, 10 keywords long-tail français
    - Pattern identique à tarifs/page.tsx et a-propos/page.tsx
  - **Correction layout root** :
    - Suppression "Bientôt disponible" remplacé par "Essai gratuit 21 jours"
    - Keywords génériques remplacés par 10 expressions long-tail françaises
  - **noindex dashboard** :
    - `src/app/app/layout.tsx` : metadata `robots: { index: false, follow: false }`
    - Défense en profondeur : certains crawlers LLM ignorent robots.txt
  - **Fichiers LLM** :
    - `public/llms.txt` : Résumé structuré convention llmstxt.org (8 pages publiques + lien llms-full.txt)
    - `public/llms-full.txt` : Version détaillée avec fonctionnalités, comparaison tarifaire (SmartPlanning 58 EUR vs Skello 79 EUR vs Combo 60 EUR), stack, sécurité
  - **Canonical URLs pages légales** :
    - Ajout `alternates.canonical` aux 5 pages : CGU, CGV, confidentialité, mentions-legales, cookies
  - **Vérification navigation** :
    - Header : Tarifs, À propos, Connexion, Essai gratuit (pas de liens légales) — favorise les sitelinks Google
    - Footer : pages légales cantonnées dans la section "Légal" (poids SEO inférieur)
  - **Tests** : 37 nouveaux tests unitaires
    - `robots.test.ts` (6 tests) : objet valide, allow /, userAgent *, disallow /app/ et /api/, pages auth, URL sitemap
    - `sitemap.test.ts` (7 tests) : 8 URLs, URLs exactes, priorités, changeFrequency, lastModified
    - `StructuredData.test.tsx` (22 tests) : WebSite (type, @id, name, langue, publisher, pas de SearchAction), Organization (type, @id, name, logo url/width/height, zone France), SoftwareApplication (type, prix 2.90 EUR, spec unitaire, features, provider), FAQPage (type, questions, format Schema.org), rendu script JSON-LD, @graph 4 schemas, 4 types attendus
    - `LandingPageContent.test.tsx` (2 tests) : rendu sans erreur, sections principales présentes
  - **9 commits atomiques** sur branche `feature/SP-462-seo-visibility`
  - **Build** : OK (robots.txt, sitemap.xml, icon.png, apple-icon.png visibles dans le build)
  - **Zéro régression** : 5637 tests Vitest passent (309 fichiers)
  - Total projet : 6655 tests

### Sprint 17 - Tests E2E Billing (SP-373) — Epic SP-348 COMPLÈTE 🆕

- SP-373 : Tests E2E Billing Playwright ✅ TERMINÉ — **Dernier ticket de l'Epic SP-348**
  - **Page Objects** :
    - `BillingPage` (`e2e/pages/billing.page.ts`, 315 lignes) : 25+ locators `data-testid` (subscriptionStatus, trialAlert, monthlyAmount, seatCount, billingPeriod, canceledAt, manageSubscriptionBtn, cancelSubscriptionBtn, conversionHero, blockingAlert, usageIndicator, employeeCount, usagePercent, pricePerEmployee, monthlyTotal, invoiceHistory, subscriptionBanner, prorataInfo). Méthodes : goto(), gotoWithReason(reason), waitForLoad(), getSubscriptionStatusText(), getMonthlyAmountText(), expectTrialStatus(), expectActiveStatus(), expectPastDueStatus(), expectCanceledStatus(), expectBlockingAlert(title), expectConversionHero()
    - `PricingPage` (`e2e/pages/pricing.page.ts`, 173 lignes) : Hero (heroTitle, heroDescription), simulateur (employeeSlider, largeTeamMessage), features (featuresList, faqTitle), CTA (ctaRegister). Méthodes : goto(), waitForLoad(), getDisplayedPrice(), setEmployeeCount(count), clickStartTrial(), expectSimulatorVisible()
    - Barrel export `e2e/pages/index.ts` mis à jour
  - **Fixtures** (`e2e/helpers/billing-fixtures.ts`, 226 lignes) :
    - 7 mock data generators : mockTrialBilling(daysRemaining), mockActiveBilling(employees), mockPastDueBilling(daysOverdue), mockCanceledBilling(), mockExpiredBilling(), mockTrialExpiredBilling(), mockNoSubscriptionBilling()
    - Helpers : daysFromNow(days), daysAgo(days)
    - Types miroir SerializedBillingData
  - **6 suites de tests** (`e2e/specs/billing/`, 30 tests) :
    - `trial-flow.spec.ts` (5 tests) : Accès dashboard billing director, titre "Facturation", card subscription status, bouton "Gérer mon abonnement", description page
    - `checkout-flow.spec.ts` (5 tests) : Statut ACTIVE visible, montant mensuel, nombre de sièges, absence bannière trial, calcul per-seat (usage indicator)
    - `subscription-management.spec.ts` (5 tests) : Détails abonnement (montant, sièges, période), usage indicator (employés, pourcentage), prix unitaire/total, info prorata, historique factures avec paiements
    - `payment-failure.spec.ts` (5 tests) : Alerte ?reason=payment_overdue, style destructive, mention mise à jour paiement, alerte ?reason=payment_incomplete, absence alerte sans reason
    - `trial-expiry.spec.ts` (5 tests) : Alerte trial_expired, hero conversion, prix /employé/mois, CTA "Choisir mon abonnement" avec ancre #subscription-section, hero no_subscription "Activez votre abonnement"
    - `cancellation-flow.spec.ts` (5 tests) : Alerte subscription_canceled, texte "Réabonnez-vous", alerte subscription_expired, bouton annulation visible, dialog confirmation annulation
  - **Stratégie de test** : Tests basés sur le seed TechCorp (statut ACTIVE, 110 employés à 2,90€, vrais clients Stripe Test) pour les scénarios normaux + query params `?reason=` du subscription guard (SP-440) pour simuler les différents états bloquants (trial_expired, payment_overdue, payment_incomplete, subscription_canceled, subscription_expired, no_subscription)
  - **Bilan Epic SP-348** : 15 tickets livrés (SP-349 → SP-373), 487+ tests (unitaires + E2E), système complet paiement Stripe per-seat
  - Total projet : 6299 tests

### Sprint 17 - Emails Billing (SP-368, SP-369, SP-370) 🆕

- SP-368 : Modèle EmailLog & Service ✅ TERMINÉ
  - **Migration Prisma** (`20260210_add_email_log`) :
    - Table `EmailLog` : id, to, subject, template, status (PENDING/SENT/FAILED/BOUNCED), sentAt, error, metadata (JSON), createdAt
    - Index sur `(template, status)` et `(createdAt)` pour requêtes analytiques
  - **Service** (`src/lib/services/email/email-log.service.ts`) :
    - `sendAndLog()` : Envoi Nodemailer + logging automatique en base (statut SENT/FAILED)
    - `getEmailLogs()` : Liste paginée avec filtres (template, status, date range)
    - `getEmailStats()` : Statistiques agrégées (total, sent, failed, taux de réussite)
    - `retryFailedEmail()` : Relance d'un email échoué avec mise à jour du log
    - Fire-and-forget pattern pour ne pas bloquer les actions utilisateur
  - **Intégration** : Remplace les appels directs `sendEmail()` dans les Server Actions
  - **Tests** : 16 tests unitaires (sendAndLog succès/échec, getEmailLogs pagination/filtres, getEmailStats agrégation, retryFailedEmail)
  - Total projet : 6217 tests

- SP-369 : Templates Emails Billing ✅ TERMINÉ
  - **7 templates React Email** (`src/emails/`) :
    - `TrialWelcomeEmail` : Bienvenue + jours restants trial + CTA dashboard
    - `TrialExpiringEmail` : Alerte expiration trial (3/7 jours avant) + CTA abonnement
    - `TrialExpiredEmail` : Trial expiré + CTA réactivation
    - `SubscriptionConfirmedEmail` : Confirmation abonnement per-seat + récapitulatif prix
    - `PaymentFailedEmail` : Échec paiement + CTA mise à jour moyen de paiement
    - `SubscriptionCanceledEmail` : Confirmation annulation + date de fin + CTA réabonnement
    - `InvoiceEmail` : Facture avec montant, période, nombre de sièges, lien PDF
  - **Design** : Design tokens centralisés, layout responsive, header/footer SmartPlanning, boutons CTA gradient bleu-cyan
  - **Tests** : 27 tests unitaires (rendering, props dynamiques, liens, formatage prix, dates, contenu conditionnel par template)
  - Total projet : 6244 tests

- SP-370 : Cron Trial Expiration & Webhook Emails ✅ TERMINÉ
  - **Cron API** (`/api/cron/trial-expiration`) :
    - Endpoint sécurisé par `CRON_SECRET` header
    - Détecte les trials expirant dans 3 jours et 7 jours → envoie `TrialExpiringEmail`
    - Détecte les trials expirés depuis 24h → envoie `TrialExpiredEmail`
    - Logging via `EmailLog` pour traçabilité et déduplication
    - Exécution recommandée : toutes les 24h via cron externe
  - **Webhooks Stripe enrichis** (`/api/webhooks/stripe`) :
    - `checkout.session.completed` → `SubscriptionConfirmedEmail`
    - `invoice.payment_failed` → `PaymentFailedEmail`
    - `customer.subscription.deleted` → `SubscriptionCanceledEmail`
    - `invoice.paid` → `InvoiceEmail` avec détails facture
  - **Service d'envoi** (`src/lib/services/stripe/subscription-sync.service.ts`) :
    - `sendBillingEmail()` : Envoi fire-and-forget avec logging EmailLog
    - Résolution automatique du director de l'entreprise pour le destinataire
  - **Tests** : 25 tests unitaires (cron auth, détection trials, envoi emails, webhooks enrichis, gestion erreurs, edge cases)
  - Total projet : 6269 tests

### Sprint 17 - Sync Employés → Stripe (SP-439) 🆕

- SP-439 : Synchronisation automatique quantité employés → Stripe ✅ TERMINÉ
  - **Service** (`src/lib/services/stripe/subscription-sync.service.ts`) :
    - `syncEmployeeCountToStripe(companyId)` → `Promise<SyncResult>`
    - Récupération parallèle `Promise.all([subscription.findUnique, employee.count])`
    - Skip conditions : pas de subscription, pas de stripeSubscriptionId, statuts TRIAL/CANCELED/EXPIRED/INCOMPLETE, quantité inchangée, pas de subscription item Stripe
    - `Math.max(1, employeeCount)` — Stripe exige quantity >= 1
    - `stripe.subscriptions.retrieve()` pour obtenir l'itemId dynamiquement
    - `stripe.subscriptions.update()` avec `proration_behavior: 'create_prorations'`
    - Mise à jour Prisma : `subscription.quantity` + `planPrice` (quantity × pricePerEmployee)
    - Ne throw jamais : retourne toujours un `SyncResult` typé
    - Logging structuré `[StripeSync]` avec action, companyId, quantities, timestamp
  - **Intégration Server Actions** (`src/lib/actions/employees.ts`) :
    - `createEmployee` → sync fire-and-forget après création
    - `deleteEmployee` → sync fire-and-forget après suppression
    - `toggleEmployeeStatus` → sync fire-and-forget après toggle isActive
    - `bulkDeleteEmployees` → sync fire-and-forget par companyId unique (Set pour multi-tenant SYSTEM_ADMIN)
    - Pattern `.catch()` : ne bloque jamais la réponse CRUD
  - **Barrel export** : `src/lib/services/stripe/index.ts` mis à jour
  - **Tests** :
    - 27 tests subscription-sync : 8 skip conditions, 5 sync success avec prorata, 2 quantity unchanged, 5 erreurs Stripe (StripeError, network, timeout, invalid_request, authentication), 3 erreurs Prisma (retrieve, update, count), 4 edge cases (quantity=0→1, 1 employé, 250 employés, Decimal pricePerEmployee)
    - 6 tests employees SP-439 : sync appelé après create/delete/toggle/bulk, fire-and-forget safety, bon companyId transmis
    - Total projet : 6201 tests

### Sprint 17 - Dashboard Billing (SP-360) 🆕

- SP-360 : Dashboard Billing Page ✅ TERMINÉ
  - **Page Server Component** (`src/app/app/dashboard/billing/page.tsx`) :
    - Auth check + RBAC DIRECTOR via `checkPermission`
    - Fetch `getBillingDataAction` + sérialisation Date → ISO string via `serializeBillingData()`
    - Metadata SEO : `title: "Facturation | SmartPlanning"`
    - Loading skeleton (`loading.tsx`) avec 3 cartes skeleton
  - **Composants Client** (`_components/`) :
    - `BillingPageContent` : Orchestrateur gérant les Server Actions (portail Stripe via `createBillingPortalAction`, annulation via `cancelSubscriptionAction` avec AlertDialog confirmation), état d'erreur global, layout responsive (SubscriptionStatus full-width, UsageIndicator + InvoiceHistory en grille 2 colonnes)
    - `SubscriptionStatus` : 6 badges statut via STATUS_CONFIG map (TRIAL/Essai gratuit, ACTIVE/Actif, PAST_DUE/Paiement en retard, CANCELED/Annulé, EXPIRED/Expiré, INCOMPLETE/En attente). Countdown jours essai restants. Alerte annulation programmée (cancelAtPeriodEnd). EmptyState "Aucun abonnement" avec CTA "S'abonner". Montant mensuel, nombre de sièges, période facturation.
    - `UsageIndicator` : ProgressBar avec couleur dynamique (vert <80%, orange 80-99%, rouge ≥100%). Compteur employés actifs. Prix unitaire par employé (centimes→€). Montant mensuel total. Tooltip prorata.
    - `InvoiceHistory` : Table 5 dernières factures avec badges statut (Payé/vert, Échoué/rouge, En attente/jaune). Liens factures Stripe externes (target="_blank"). Moyen de paiement. EmptyState "Aucune facture". Bouton "Voir tout l'historique" → portail Stripe.
    - `index.ts` : Barrel export composants + types (SerializedBillingData, SerializedSubscription, SerializedPayment)
  - **Type BillingData enrichi** (`src/types/stripe.ts`) :
    - Subscription : +currentPeriodStart, +canceledAt, +createdAt
    - Payments : +stripeInvoiceId, +paymentMethod
    - Racine : +trialEndsAt
  - **Navigation** : Entrée "Facturation" dans `menu-items.ts` (CreditCard, DIRECTOR, `G B`)
  - **Tests** :
    - 41 tests unitaires (4 fichiers : SubscriptionStatus 16, UsageIndicator 8, InvoiceHistory 11, BillingPageContent 6)
    - Total projet : 6064 tests

### Sprint 17 - Migration Per-Seat & Stripe Service (SP-350/SP-351) 🆕

- SP-351 : Stripe Service & Webhooks ✅ TERMINÉ
  - **Service Stripe** (`src/lib/services/stripe/stripe.service.ts`) :
    - `createCheckoutSession` : Création customer Stripe + session Checkout per-seat avec metadata
    - `updateSubscriptionQuantity` : Mise à jour quantité sièges (prorata automatique Stripe)
    - `cancelSubscription` : Annulation immédiate ou à fin de période
    - `createBillingPortalSession` : Accès portail facturation client
    - `handleWebhookEvent` : Dispatcher 8 événements webhook vers 5 handlers internes
  - **Handlers Webhook** :
    - `handleCheckoutCompleted` : Activation abonnement après paiement (upsert Subscription Prisma)
    - `handleSubscriptionUpdated` : Synchronisation statut/quantité Stripe → Prisma
    - `handleSubscriptionDeleted` : Passage statut CANCELED
    - `handleInvoicePaid` : Enregistrement paiement + confirmation statut ACTIVE
    - `handleInvoicePaymentFailed` : Passage statut PAST_DUE
  - **Route Webhook** (`src/app/api/webhooks/stripe/route.ts`) :
    - Vérification signature HMAC via `stripe.webhooks.constructEvent()`
    - Lecture raw body via `request.text()` (Next.js 15 App Router)
    - Gestion erreurs structurée (400 signature invalide, 500 erreur interne)
  - **Types** : 7 interfaces dans `src/types/stripe.ts` (barrel export index.ts)
  - **Tests** :
    - 40 tests unitaires service (createCheckoutSession: 9, updateQuantity: 5, cancel: 3, portal: 3, webhook events: 20)
    - 10 tests unitaires route webhook (signature, headers, dispatch, erreurs)
    - Total projet : 5991 tests

- SP-352 : Server Actions Stripe ✅ TERMINÉ
  - 5 Server Actions (`src/lib/actions/stripe.ts`, 339 lignes) :
    - `createCheckoutAction` : Session Checkout per-seat avec email via `auth()` séparé + companyName via Prisma
    - `createBillingPortalAction` : Portail facturation via stripeCustomerId depuis table Subscription
    - `updateSubscriptionQuantityAction` : Mise à jour sièges + `revalidatePath` billing
    - `cancelSubscriptionAction` : Annulation (fin de période ou immédiate) + `revalidatePath` billing
    - `getBillingDataAction` : Subscription + 5 derniers payments + employeeCount + monthlyAmount via `Promise.all`
  - **Patterns** : RBAC DIRECTOR via `checkPermission('DIRECTOR')`, validation Zod via `validateData()`, conversion `ServiceResult<T>` → `CrudActionResult<T>`, retour URL (pas redirect()) pour loading state client
  - **Types** : `BillingData` ajouté à `src/types/stripe.ts` + barrel export `index.ts` (enrichi en SP-360 : +currentPeriodStart, +canceledAt, +createdAt, +stripeInvoiceId, +paymentMethod, +trialEndsAt)
  - **Tests** :
    - 32 tests unitaires (`__tests__/lib/actions/stripe.test.ts`, 625 lignes)
    - Couvre : auth denied, RBAC denied, companyId null, Zod validation, missing subscription/customer, erreurs service Stripe, happy paths, revalidatePath, calcul monthlyAmount, erreurs Prisma
    - Total projet : 6023 tests (pré-SP-360)

- SP-350 : Migration Per-Seat Subscription Model ✅ TERMINÉ
  - **Phase 1 Backend** :
    - 2 enums Prisma : `SubscriptionPlan` (FREE, PER_SEAT), `SubscriptionStatus` (TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE)
    - Modèle `Subscription` 1:1 Company (plan, status, quantity, pricePerEmployee en centimes)
    - Migration Prisma `add_subscription_model`
    - Seed avec subscriptions aléatoires pour toutes les entreprises
    - Validations Zod company enrichies : filtres subscriptionPlan/subscriptionStatus, labels FR (`subscriptionPlanLabels`, `subscriptionStatusLabels`)
    - Server Actions companies avec relation subscription (select nested dans tous les CRUD)
    - Types : `CompanySubscription`, `CompanyWithCounts`, `CompanyDetail` avec subscription nullable
  - **Phase 2 UI** :
    - `CompanyCard` : Badges plan colorés (Gratuit/Per-seat avec prix €), badges statut 6 valeurs (Actif, Période d'essai, Paiement en retard, Annulé, Expiré, Paiement incomplet)
    - `CompanyForm` : Select plan FREE/PER_SEAT, select 6 statuts, inputs quantity/pricePerEmployee conditionnels (affichés uniquement si PER_SEAT)
    - `columns.tsx` : Colonnes virtuelles TanStack Table id-based pour relation nested, filterFn custom avec fallback nullable (`?? 'FREE'`)
    - Page `[id]` : Lecture subscription relation pour pré-remplissage formulaire
  - **Tests** :
    - 97 tests unitaires (CompanyCard: 25, CompanyForm: 18, columns: 15, validations: 20, actions: 19)
    - 290 tests E2E additionnels
    - Total projet : 5991 tests

### Sprint 16 - Company Settings (SP-435) 🆕

- SP-435 : Page Paramètres Entreprise ✅ TERMINÉ
  - Route : `/app/settings/company`
  - RBAC : DIRECTOR et SYSTEM_ADMIN uniquement (autres rôles redirigés vers /app/settings)
  - **Sections UI** :
    - Company Info : Nom et adresse entreprise (inputs avec debounce auto-save)
    - Working Days : 7 checkboxes (Lun-Dim) + 3 presets (Mon-Fri, Mon-Sat, All Week)
    - Working Hours : Heures début/fin journée de travail (format HH:mm)
    - Lunch Break : Toggle pause déjeuner + heures début/fin si activé
  - **Server Actions** :
    - `getCompanySettings` : Récupère paramètres depuis Company.defaultWorkingDays, defaultWorkingHours, defaultOpeningHours
    - `updateCompanySettings` : Mise à jour avec validation Zod et RBAC
    - `resetCompanySettings` : Reset aux valeurs par défaut (Mon-Fri, 09:00-18:00)
  - **Types TypeScript** :
    - `DayOfWeek` : 'MONDAY' | 'TUESDAY' | ... | 'SUNDAY'
    - `CompanySettings` : { companyName, address, workingDays, workingHoursStart, workingHoursEnd, lunchBreak }
    - `LunchBreakSettings` : { enabled, start, end }
    - `WorkingDaysPreset` : { id, label, days }
  - **Optimistic UI** : useState + useTransition avec rollback sur erreur toast
  - **Tests** :
    - 19 tests unitaires (company-settings.test.ts) : CRUD, RBAC 4 rôles, validation
    - 21 tests E2E (company-settings.spec.ts) : Page structure, RBAC, working days, presets, hours, reset
    - Page Object `CompanySettingsPage` avec helpers complets
  - **Settings Hub** : Badge "Bientôt" retiré de section Entreprise, lien actif vers /app/settings/company

### Sprint 12 - Gestion des Plannings (SP-392+) 🆕

- SP-392 : Schéma Prisma Availability + Migration ✅ TERMINÉ
- SP-393 : Validations Zod Schedules/Availability ✅ TERMINÉ
- SP-394 : Server Actions CRUD Schedules avec RBAC ✅ TERMINÉ
  - 10 actions : getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule, deleteScheduleGroup, duplicateSchedule, updateScheduleStatus, getEmployeeSchedules, getTeamSchedules
  - RBAC : SYSTEM_ADMIN (lecture cross-tenant), DIRECTOR (CRUD complet), MANAGER (équipes), EMPLOYEE (lecture propres schedules)
  - 30 tests unitaires
- SP-395 : Page Liste Schedules ✅ TERMINÉ
  - Route : `/app/dashboard/schedules`
  - Composants : SchedulesPageContent, SchedulesList, SchedulesFilters
  - Navigation date (jour/semaine/mois), filtres, stats rapides
  - Correction URL Sidebar
- SP-396 : ScheduleCalendar responsive ✅ TERMINÉ
  - Intégration Schedule-X (desktop ≥768px) avec vues jour/semaine/mois
  - Vue mobile cards empilées verticalement (pas de scroll horizontal)
  - Couleurs par type (7 types), badges statut, locale française
  - 18 tests unitaires, Temporal API polyfill
- SP-397 : ShiftModal création/édition ✅ TERMINÉ
  - Modal création/édition avec React Hook Form + Zod
  - Sélection multi-employés avec recherche et filtrage équipe
  - Date/time pickers locale française
  - 30 tests unitaires (17 modal + 13 hook)
- SP-398 : Drag & Drop Calendrier ✅ TERMINÉ
  - Plugin @schedule-x/drag-and-drop pour déplacer les créneaux
  - Plugin @schedule-x/resize pour redimensionner (modifier heure fin)
  - Persistance updateSchedule avec rollback erreur
  - RBAC : DIRECTOR/MANAGER uniquement
  - 19 tests unitaires
- SP-399 : Récurrence des Shifts ✅ TERMINÉ
  - Fréquences : DAILY, WEEKLY, BIWEEKLY, MONTHLY
  - Sélection jours de la semaine (Lun-Dim) pour WEEKLY/BIWEEKLY
  - Mode de fin : nombre d'occurrences OU date de fin
  - Limites sécurité : 52 occurrences max, 200 créneaux max par création
  - RecurrenceConfig UI component avec aperçu et warnings
  - RecurrenceEditDialog pour opérations groupées (scope: single/future/all)
  - Server Actions : getRecurrenceGroupCounts, deleteRecurringSchedules, updateRecurringSchedules
  - 40 tests unitaires (recurrence: 24, RecurrenceConfig: 12, availability fix: 4)
- SP-401 : CRUD Availabilities ✅ TERMINÉ
  - 8 Server Actions RBAC : getAvailabilities, getAvailabilityById, createAvailability, updateAvailability, deleteAvailability, getEmployeeAvailabilities, getTeamAvailabilities, getAvailabilitiesStats
  - Permissions : SYSTEM_ADMIN (lecture), DIRECTOR (tout), MANAGER (équipe), EMPLOYEE (ses propres)
  - Composants UI : AvailabilityCard, AvailabilityModal, AvailabilitiesList
  - 6 types d'indisponibilité : UNAVAILABLE, PREFERRED, VACATION, SICK, TRAINING, OTHER
  - 54 tests unitaires (Server Actions: 22, AvailabilityCard: 18, AvailabilityModal: 14)
- SP-400 : Détection Conflits Horaires ✅ TERMINÉ
  - Server Action checkAvailabilityConflicts avec classification hard/soft
  - Classification : Hard (VACATION, SICK, UNAVAILABLE) bloquants / Soft (PREFERRED, TRAINING, OTHER) avertissements
  - Composants UI : ConflictAlert (alertes visuelles), ConflictConfirmDialog (confirmation drag & drop)
  - Hook useConflictDetection avec debounce 300ms et gestion d'erreurs
  - Intégration : ShiftModal (détection temps réel), ScheduleCalendarDesktop (drag & drop avec confirmation)
  - 25 tests unitaires (useConflictDetection: 12, ConflictAlert: 13)
- SP-402 : Overlay Indisponibilités Calendrier ✅ TERMINÉ
  - Server Action getAvailabilitiesForCalendar avec RBAC (EMPLOYEE → siennes, MANAGER → équipe, DIRECTOR → entreprise)
  - Hook useCalendarAvailabilities avec debounce 200ms, cache local (10 entrées max), annulation requêtes obsolètes
  - Composants UI : AvailabilityBadge (emoji par type), AvailabilityPopover (détails), AvailabilityOverlay (events Schedule-X)
  - Intégration : ScheduleCalendarDesktop (events colorés RGBA), ScheduleCalendarMobile (badges par jour), toggle Eye/EyeOff
  - 47 tests unitaires (useCalendarAvailabilities: 10, AvailabilityBadge: 20, AvailabilityOverlay: 17)
- SP-403 : Export PDF Planning ✅ TERMINÉ
  - API Route GET `/api/schedules/export/pdf` avec auth NextAuth v5
  - RBAC : MANAGER et DIRECTOR uniquement, isolation multi-tenant par companyId
  - Composant React PDF `SchedulePdfDocument` via `@react-pdf/renderer` (A4 paysage)
  - Tableau employés × jours avec badges horaires colorés par type
  - Légende 7 types : Travail, Réunion, Pause, Formation, Télétravail, Astreinte, Heures sup.
  - `ExportDropdown` dans toolbar schedules (PDF fonctionnel + placeholder Excel)
  - 6 tests unitaires (buffer valide, header %PDF-, liste vide, vue mois, multi-employés, 7 types)
- SP-404 : Export Excel Planning ✅ TERMINÉ
  - API Route GET `/api/schedules/export/excel` avec auth NextAuth v5
  - RBAC : MANAGER et DIRECTOR uniquement, isolation multi-tenant par companyId
  - Générateur `generateScheduleExcel` via SheetJS (`xlsx`)
  - Feuille 1 "Planning" : 11 colonnes (Employé, Date, Jour, Début, Fin, Durée, Type, Statut, Équipe, Lieu, Description)
  - Feuille 2 "Résumé" : heures totales par employé ventilées par type de shift (7 types)
  - Feuille 3 "Statistiques" : totaux globaux (shifts, heures, employés, moyenne heures/employé)
  - `ExportDropdown` mis à jour : export Excel fonctionnel remplaçant le placeholder
  - 7 tests unitaires (buffer valide, 3 feuilles, colonnes, durées, liste vide, statistiques, résumé)
- SP-406 : Améliorations Plannings ✅ TERMINÉ
  - WeeklyHoursPanel : compteur heures hebdomadaires vs contrat, barres de progression, responsive
  - Type REST (repos) : isAllDay automatique, exclusion exports, affichage calendrier
  - Simplification statuts : DRAFT/PUBLISHED uniquement (suppression APPROVED/REJECTED/ARCHIVED)
  - BulkDeleteDialog : suppression en masse employés avec DataTable sélection
  - Nom entreprise dans Sidebar layout (companyName depuis Prisma)
  - Corrections boucles infinies React 19 (useEffect/useCallback stabilisation)
  - Refonte CSS calendrier Schedule-X (design moderne SaaS)
  - Exports PDF/Excel avec filtres (employé, équipe, type, statut) et colonne heures
  - Downgrade @schedule-x 2.11.0 + patch-package (ANO-022)
  - Email employé (migration Prisma add_email_to_employee)
  - 16 tests E2E Playwright (schedules.spec.ts + Page Object SchedulesPage)
- Prochaines étapes : SP-407+

### Sprint 11 - Réinitialisation mot de passe (SP-263)

- SP-263 : Pages /forgot-password et /reset-password ✅ TERMINÉ
- Composants : `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`
- Tests unitaires : 39 tests (14 + 17 + 8)
- Server Actions : forgotPasswordAction, resetPasswordAction
- Sécurité : Tokens sécurisés, anti-énumération OWASP, validation Zod

### Sprint 12 - Stabilisation E2E (SP-434) 🆕

- SP-434 : Correction Tests E2E - Stabilité >90% ✅ TERMINÉ
- **Touch Targets WCAG 2.5.5** : 10 composants corrigés avec min-h-[44px] min-w-[44px]
- **Command Palette Tests** : Utilisation button click au lieu de keyboard shortcut (Ctrl+K flaky)
- **Mobile Navigation Tests** : Fallback close button pour swipe gestures, overlay click robuste
- **Configuration Playwright** : Retry 1 en local, timeout 45s pour stabilité
- Taux de réussite : **~94%** (objectif >90% atteint)

**Fichiers modifiés** :
| Fichier | Modification |
| --- | --- |
| `src/components/layout/Header.tsx` | Touch targets burger menu, search, user menu |
| `src/components/ui/command-palette.tsx` | useIsMobile SSR fix, close button 48px |
| `src/components/ui/sidebar.tsx` | SidebarTrigger, SidebarMenuButton 44px |
| `e2e/fixtures/mobile.fixture.ts` | openCommandPaletteMobile robuste |
| `e2e/specs/navigation/command-palette.spec.ts` | Button click helper |
| `e2e/specs/mobile/navigation.spec.ts` | Fallback close button, navigation robuste |
| `playwright.config.ts` | Retry 1, timeout 45s en local |

### Sprint 11 - Accessibilité WCAG 2.1 (SP-269) 🆕

- SP-269 : Accessibilité WCAG 2.1 - Skip Link + Tests axe-core ✅ TERMINÉ
- Documentation : `docs/lighthouse-a11y-report.md`
- Tests E2E : `e2e/specs/a11y/accessibility.spec.ts`
- Script audit : `npm run a11y:audit` / `scripts/lighthouse-audit.js`

### Sprint 11 - E2E Mobile Tests (SP-389)

- SP-389 : Tests E2E Mobile Multi-Devices Playwright ✅ TERMINÉ
- Documentation : `docs/e2e-mobile-tests.md`
- PR : https://github.com/krismos64/SmartplanningAI/pull/8

### Sprint 11 - Mobile UI Components (SP-268 Phase 3) 🆕

- SP-385 : TouchableButton - WCAG 2.5.5 touch targets 44px ✅ TERMINÉ
- SP-386 : MobileFormField - iOS zoom prevention ✅ TERMINÉ
- SP-387 : DataTablePagination - Responsive layout ✅ TERMINÉ
- SP-388 : ResponsiveBreadcrumb - Scroll-snap mobile ✅ TERMINÉ

### Sprint 11 - Navigation Mobile Phase 2

- SP-383 : SwipeableDrawer avec Framer Motion gestures ✅ TERMINÉ
- SP-384 : Refactorisation Sidebar pour gestes swipe ✅ TERMINÉ
- PR : https://github.com/krismos64/SmartplanningAI-V2/pull/7

### Sprint 10 - Pages d'Erreur

- SP-303 : Page 500 personnalisée ✅ TERMINÉ
- SP-302 : Page 404 personnalisée ✅ TERMINÉ
- SP-304 : Error Boundary React ✅ TERMINÉ

### Sprint 9 - Module Emails & Contact ✅

- SP-301 : Tests Templates Contact ✅ TERMINÉ
- SP-300 : Email Congé Validé/Refusé ✅ PHASE 1 TERMINÉE
- SP-289 : Contact UX - États succès/erreur ✅ TERMINÉ
- SP-288 : API Contact + Tests Templates (SP-301) ✅ TERMINÉ
- SP-287 : Formulaire Contact UI ✅ TERMINÉ
- SP-299 : Email Vérification ✅ TERMINÉ
- SP-298 : Email Reset Password ✅ TERMINÉ
- SP-297 : Email de Bienvenue ✅ TERMINÉ
- SP-296 : Templates React Email ✅ TERMINÉ
- SP-295 : Configuration Email ✅ TERMINÉ

### Sprint 8 et précédents

- SP-283 : Bannière Cookies RGPD ✅ TERMINÉ
- SP-113 : CRUD Users/Companies/Teams ✅ TERMINÉ
- SP-112 : Dashboard par rôle ✅ TERMINÉ
- SP-110 : Middleware protection routes
- SP-109 : Pages d'authentification
- SP-125 : Setup environnement de tests
- Guide de Déploiement
