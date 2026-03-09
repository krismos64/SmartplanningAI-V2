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
| Dernière mise à jour | 9 mars 2026 (2 passes de rationalisation : 156 fichiers Vitest / 2 814 tests unitaires + 13 fichiers E2E / 189 tests = 3 003 total) |

---

## Contexte CDA - Justification de la démarche qualité

### Pourquoi ce cahier de recettage ?

Dans le cadre du diplôme **CDA**, ce cahier démontre ma capacité à :

- Mettre en place une **stratégie de tests complète** couvrant unitaires, intégration et E2E
- **Justifier mes choix techniques** avec une réflexion argumentée
- **Documenter les problèmes rencontrés** et leurs résolutions
- Maintenir une **qualité de code professionnelle** avec une couverture > 80%

### Objectifs qualité fixés

| Métrique              | Objectif  | Atteint  |
| --------------------- | --------- | -------- |
| Couverture globale    | ≥ 70%     | ✅ ~86%   |
| Tests unitaires       | ≥ 500     | ✅ 2 814 (156 fichiers) |
| Tests E2E             | ≥ 50      | ✅ 189 (13 fichiers, workflows critiques) |
| Score Lighthouse A11y | ≥ 90%     | ✅ 95%   |
| Anomalies critiques   | 0 en prod | ✅ 0     |

---

## Justification des choix techniques (CDA)

### Pourquoi Vitest plutôt que Jest ?

| Critère                       | Jest                      | Vitest              | Mon choix |
| ----------------------------- | ------------------------- | ------------------- | --------- |
| Support ESM natif             | ❌ Configuration complexe | ✅ Natif            | Vitest    |
| Vitesse d'exécution           | ~20s pour 1000 tests      | ~8s pour 1000 tests | Vitest    |
| Compatibilité Vite/Next.js 15 | ⚠️ Nécessite babel        | ✅ Natif            | Vitest    |
| Hot Module Reload tests       | ❌ Non                    | ✅ Oui              | Vitest    |

**Conclusion** : Vitest offre une meilleure DX avec Next.js 15 et son support Turbopack, tout en restant compatible avec l'API Jest.

### Pourquoi Playwright plutôt que Cypress ?

| Critère                  | Cypress                             | Playwright                          | Mon choix  |
| ------------------------ | ----------------------------------- | ----------------------------------- | ---------- |
| Multi-navigateurs        | ⚠️ Limité (Chromium, Firefox, Edge) | ✅ Tous (Chromium, Firefox, WebKit) | Playwright |
| Tests parallèles         | 💰 Payant (Dashboard)               | ✅ Gratuit natif                    | Playwright |
| Vitesse                  | Plus lent                           | 2-3x plus rapide                    | Playwright |
| Support mobile viewports | ⚠️ Limité                           | ✅ Excellent                        | Playwright |

**Conclusion** : Pour un SaaS multi-navigateurs (y compris Safari/WebKit), Playwright est optimal. Gratuit et rapide.

### Pourquoi MSW plutôt que des mocks classiques ?

| Critère                    | Mocks Jest/Vitest    | MSW                     | Mon choix |
| -------------------------- | -------------------- | ----------------------- | --------- |
| Interception réseau réelle | ❌ Non               | ✅ Oui (Service Worker) | MSW       |
| Tests plus réalistes       | ❌ Mocks artificiels | ✅ Simule vraie API     | MSW       |
| Réutilisable E2E           | ❌ Non               | ✅ Oui                  | MSW       |
| Maintenance                | ⚠️ Mocks éparpillés  | ✅ Handlers centralisés | MSW       |

### Pourquoi react-error-boundary plutôt qu'un Error Boundary natif ?

| Critère               | Class Component natif | react-error-boundary                 | Mon choix            |
| --------------------- | --------------------- | ------------------------------------ | -------------------- |
| Syntaxe               | Verbeuse (Class)      | Moderne (Hooks + HOC)                | react-error-boundary |
| API Reset             | ❌ À implémenter      | ✅ resetErrorBoundary natif          | react-error-boundary |
| onError callback      | ❌ componentDidCatch  | ✅ Prop déclarative                  | react-error-boundary |
| Maintenance           | Manuel                | Maintenu par React Core Team member  | react-error-boundary |

**Conclusion** : react-error-boundary v5.0.0 encapsule la complexité des Class Components avec une API moderne et déclarative. Coût de 2kb négligeable.

### Pourquoi Framer Motion plutôt que CSS Animations ?

| Critère              | CSS Animations           | Framer Motion               | Mon choix     |
| -------------------- | ------------------------ | --------------------------- | ------------- |
| API déclarative      | ❌ Keyframes impératives | ✅ Variants déclaratifs     | Framer Motion |
| Accessibilité        | ⚠️ Manuel                | ✅ useReducedMotion intégré | Framer Motion |
| Stagger/Delay        | ❌ Complexe              | ✅ API simple               | Framer Motion |
| Bundle size          | 0kb                      | ~35kb (gzipped)             | ⚠️ CSS        |

**Conclusion** : Pour les pages d'erreur et les UI engageantes, Framer Motion offre le meilleur rapport expressivité/maintenance. L'accessibilité native (`useReducedMotion`) justifie ce choix.

### Pourquoi @axe-core/playwright plutôt que pa11y ou Lighthouse CI ?

| Critère                | pa11y           | Lighthouse CI   | @axe-core/playwright    | Mon choix |
| ---------------------- | --------------- | --------------- | ----------------------- | --------- |
| Intégration Playwright | ❌ Outil séparé | ❌ CLI distinct | ✅ API native           | axe-core  |
| Granularité tests      | ❌ Page entière | ❌ Page entière | ✅ Par composant/zone   | axe-core  |
| Filtrage violations    | ⚠️ Limité       | ⚠️ Limité       | ✅ Par impact/règle     | axe-core  |
| Maintenance            | ⚠️ Communauté   | ✅ Google       | ✅ Deque (experts a11y) | axe-core  |

### Pourquoi React Email plutôt que MJML ou HTML brut ?

| Critère                     | HTML brut               | MJML             | React Email               | Mon choix   |
| --------------------------- | ----------------------- | ---------------- | ------------------------- | ----------- |
| Syntaxe                     | Verbose, difficile      | XML propriétaire | JSX natif (même stack)    | React Email |
| Typage TypeScript           | ❌ Non                  | ❌ Non           | ✅ Props typées           | React Email |
| Composants réutilisables    | ❌ Copy-paste           | ⚠️ Limité        | ✅ Pattern React          | React Email |

**Conclusion** : React Email capitalise sur les compétences React/TypeScript existantes tout en générant des emails compatibles tous clients.

### Pourquoi React Hook Form plutôt que Formik ?

| Critère        | Formik                  | React Hook Form       | Mon choix       |
| -------------- | ----------------------- | --------------------- | --------------- |
| Performance    | ⚠️ Re-renders fréquents | ✅ Minimal re-renders | React Hook Form |
| Bundle size    | 12.7kb                  | 8.5kb                 | React Hook Form |
| Validation Zod | ⚠️ Config manuelle      | ✅ zodResolver natif  | React Hook Form |

### Pourquoi un Rate Limiter en mémoire plutôt que Redis ?

Pour le MVP avec une seule instance VPS, un rate limiter en mémoire est suffisant et évite la complexité d'un service externe. Migration vers Redis/Upstash possible si besoin de scaling horizontal.

### Pourquoi le Pattern Page Object pour les tests E2E ?

```typescript
// AVANT (mauvais) - Sélecteurs répétés partout
await page.fill('[data-testid="email"]', 'user@test.com')

// APRÈS (Page Object) - Abstraction réutilisable
await loginPage.login('user@test.com', 'password')
```

**Bénéfices** : -40% de lignes de code, maintenance centralisée, lisibilité user stories.

### Pourquoi Design Tokens plutôt que CSS-in-JS ?

| Critère              | CSS-in-JS (Emotion) | Design Tokens TypeScript   | Mon choix     |
| -------------------- | ------------------- | -------------------------- | ------------- |
| Performance          | ⚠️ Runtime overhead | ✅ CSS statique            | Design Tokens |
| Intégration Tailwind | ❌ Conflits         | ✅ tailwindTheme natif     | Design Tokens |
| Dark mode            | ⚠️ Context API      | ✅ CSS Variables .dark     | Design Tokens |

### Pourquoi SSE plutôt que WebSocket ?

| Critère                   | WebSocket                     | SSE                            | Mon choix |
| ------------------------- | ----------------------------- | ------------------------------ | --------- |
| Direction communication   | ✅ Bidirectionnelle           | ⚠️ Serveur → Client uniquement | SSE       |
| Reconnexion automatique   | ❌ À implémenter              | ✅ Natif (EventSource)         | SSE       |
| Intégration Next.js API   | ⚠️ Nécessite serveur custom   | ✅ API Routes natives          | SSE       |

**Conclusion** : Les notifications sont du push serveur uniquement. SSE est optimal avec reconnexion native et compatibilité HTTP standard.

---

## Difficultés rencontrées et résolutions (CDA)

### Difficulté 1 : Authentification NextAuth v5 en Edge Runtime

**Symptôme** : `auth?.user?.role` retournait `undefined` dans le middleware (ANO-005).

**Cause** : Le middleware Next.js s'exécute en Edge Runtime, qui ne supporte pas toutes les APIs Node.js.

**Solution** : Séparation `auth.config.ts` (Edge-compatible) et `auth.ts` (Node.js). Les callbacks JWT/Session sont dans `authConfig` pour être accessibles en Edge.

### Difficulté 2 : Tests E2E flaky avec Radix UI

**Symptôme** : `strict mode violation: locator resolved to X elements` (ANO-015, ANO-016).

**Cause** : Radix UI génère des portaux DOM → plusieurs éléments avec le même `data-testid`.

**Solution** : Utiliser `.first()` sur les locators ambigus. Toujours anticiper les portails DOM avec les composants headless UI.

### Difficulté 3 : Migration Prisma pour userId optionnel

**Symptôme** : Impossible de créer un employé "planning only" sans compte utilisateur (ANO-014).

**Solution** : Migration `make_employee_userid_optional` : `userId String?` avec relation optionnelle.

### Difficulté 4 : État non partagé entre composants cookies

**Symptôme** : Le bouton "Gérer les cookies" dans le footer ne déclenchait aucune action (ANO-017).

**Cause** : Chaque composant instanciait son propre hook `useCookieConsent()` → états React indépendants.

**Solution** : Context API avec `CookieConsentProvider` centralisant l'état partagé. Pattern essentiel pour les systèmes de consentement multi-points d'entrée.

### Difficulté 5 : Mocking ESM avec vi.doMock()

**Symptôme** : Les mocks `vi.mock()` ne fonctionnaient pas avec les modules ESM (ANO-018).

**Solution** : `vi.doMock()` (non hoisté) + `vi.resetModules()` + import dynamique `await import()`.

### Difficulté 6 : Boucle redirect infinie en impersonation

**Symptôme 1** : `ERR_TOO_MANY_REDIRECTS` lors du démarrage de l'impersonation (ANO-028).

**Cause** : Le JWT SYSTEM_ADMIN n'a pas de données subscription → subscription guard redirige vers `/billing` → impersonation guard bloque `/billing` → boucle ∞.

**Solution** : Bypass du subscription guard dans `auth.config.ts` quand le cookie `sp-impersonation` est présent avec `originalAdminId` valide.

**Symptôme 2** : Bannière impersonation invisible après démarrage (ANO-029).

**Cause** : `updateSession()` NextAuth v5 échoue silencieusement → JWT non mis à jour.

**Solution** : Fallback lecture directe du cookie `sp-impersonation` dans le Server Component layout, avec vérification expiration (3600s).

### Difficulté 7 : Tests E2E impersonation flaky en CI

**Symptôme** : Tests passent en local, échouent aléatoirement en CI nightly (ANO-033).

**Causes** : Race conditions signout, cookies consentement perdus, parallélisme sur session partagée.

**Solution** : Signout via API CSRF (`POST /api/auth/signout`), injection forcée cookie consentement, mode série obligatoire (`test.describe.configure({ mode: 'serial' })`), timeout 90s.

---

## Historique des campagnes de test

| Date         | Sprint    | Ticket         | Unitaires     | E2E        | Couv.  | Statut  | Description |
| ------------ | --------- | -------------- | ------------- | ---------- | ------ | ------- | ----------- |
| 04/12/2025   | Sprint 4  | SP-125         | 15            | 12         | ~70%   | ✅ PASS | Setup initial Vitest + RTL + Playwright + MSW |
| 05/12/2025   | Sprint 4  | SP-126         | 474           | 12         | 83.83% | ✅ PASS | Tests UI 6 catégories |
| 09/12/2025   | Sprint 5  | SP-141/145     | 570           | 59         | ~85%   | ✅ PASS | Dashboard Employee + E2E Auth |
| 10/12/2025   | Sprint 5  | SP-147/148     | 1250          | 59         | ~85%   | ✅ PASS | Dashboard Director + Admin |
| 12/01/2026   | Sprint 7  | SP-113         | 1391          | 214        | ~85%   | ✅ PASS | CRUD Users/Companies/Teams + E2E |
| 19/01/2026   | Sprint 8  | SP-283+288+289 | 1785          | 229        | ~85%   | ✅ PASS | Cookies RGPD, Contact UX, API |
| 20/01/2026   | Sprint 9  | SP-295→301     | 1847          | 242        | ~85%   | ✅ PASS | Module Email complet |
| 21/01/2026   | Sprint 10 | SP-302→305     | 2015          | 297        | ~85%   | ✅ PASS | Pages erreur (404/500/403/ErrorBoundary) |
| 22/01/2026   | Sprint 11 | SP-259→266     | 2617          | 297        | ~85%   | ✅ PASS | Design tokens, animations, loading states, dark mode, empty states, UI extensions |
| 23/01/2026   | Sprint 11 | SP-264         | 2750          | 327        | ~85%   | ✅ PASS | Command Palette, breadcrumbs, raccourcis clavier |
| 25/01/2026   | Sprint 11 | SP-268→389     | 2895          | 430        | ~85%   | ✅ PASS | Mobile UI, touch targets WCAG 2.5.5, E2E mobile 5 devices |
| 27/01/2026   | Sprint 12 | SP-392→406     | 3475          | 446        | ~85%   | ✅ PASS | Plannings complet (CRUD, calendrier, drag&drop, récurrence, conflits, exports) |
| 28/01/2026   | Sprint 13 | SP-407→415     | 3569          | 446        | ~85%   | ✅ PASS | Module congés (workflow, soldes, overlay, RBAC) |
| 03/02/2026   | Sprint 14 | SP-323→327     | 4486          | 548        | ~85%   | ✅ PASS | Notes perso, incidents, notifications SSE |
| 04/02/2026   | Sprint 16 | SP-435         | 4701          | 657        | ~85%   | ✅ PASS | Settings entreprise, CRUD avancé |
| 06/02/2026   | Sprint 16 | SP-349→355     | 4856          | 698        | ~85%   | ✅ PASS | Landing page, tarifs, auth activation |
| 09/02/2026   | Sprint 17 | SP-350→441     | 5213          | 988        | ~85%   | ✅ PASS | Stripe complet (service, webhooks, billing page, subscription guard, bannières) |
| 10/02/2026   | Sprint 18 | SP-460         | 5600          | 1018       | 86.35% | ✅ PASS | Avatar Cloudinary, RGPD export/delete |
| 18/02/2026   | Sprint 19 | SP-442→463     | 5770          | 584        | ~86%   | ✅ PASS | Audit System, impersonation, consolidation E2E |
| 27/02/2026   | Sprint 20 | Améliorations  | 5914          | 584        | ~86%   | ✅ PASS | Notifications admin, seed Stripe, KPIs Director |
| 02/03/2026   | Sprint 20 | Stabilisation  | 5914          | 584        | ~86%   | ✅ PASS | Audit billing, i18n FR, fix E2E flaky |
| 07/03/2026   | —         | Rationalisation| ~2910         | ~221       | ~86%   | ✅ PASS | 1re passe : suppression ~208 fichiers cosmétiques |
| 09/03/2026   | —         | SP-494         | 2 814         | 189        | ~86%   | ✅ PASS | 2e passe : -96 tests (8 fichiers), architecture fixes, kebab-case hooks |

**Graphique d'évolution** : 27 tests (04/12) → pic 6 498 (02/03) → rationalisation 3 003 (09/03). La rationalisation supprime les tests cosmétiques pour ne conserver que les tests à forte valeur métier.

---

## Détail des tests par module (après rationalisation)

### Tests conservés — focus logique métier critique

| Domaine | Fichiers | Tests | Description |
|---------|----------|-------|-------------|
| **Auth + RBAC** | ~15 | ~350 | Credentials Provider, permissions, subscription guard, impersonation API |
| **Congés (Leave)** | ~12 | ~300 | Validation Zod, calcul jours ouvrés, transactions ACID, RBAC par rôle |
| **Stripe Billing** | ~8 | ~250 | Service Stripe, webhooks idempotents, sync seats, bannières trial |
| **Server Actions** | ~30 | ~600 | CRUD employees/teams/companies, checkPermission, withRoleCheck |
| **Services métier** | ~15 | ~400 | Dashboard stats, MRR, audit, notifications SSE, health check |
| **Validations Zod** | ~10 | ~200 | Schemas auth, schedule, leave, stripe, common |
| **Hooks + UI** | ~20 | ~350 | Hooks complexes, composants avec logique conditionnelle |
| **Plannings** | ~15 | ~350 | Calendrier, récurrence, conflits, exports PDF/Excel |
| **Total Vitest** | **156** | **2 814** | |

### Tests E2E — workflows critiques uniquement

| Fichier spec | Tests | Description |
|-------------|-------|-------------|
| auth-flow.spec.ts | 21 | Login, register, mot de passe oublié, activation |
| crud-employees.spec.ts | 18 | CRUD employés avec RBAC |
| crud-teams.spec.ts | 16 | CRUD équipes avec affectation membres |
| schedules.spec.ts | 16 | Plannings : création, calendrier, exports |
| leaves.spec.ts | 14 | Congés : workflow PENDING→APPROVED/REJECTED |
| billing-subscription.spec.ts | 20 | Stripe : checkout, portail, annulation |
| audit-logs.spec.ts | 15 | Journal d'audit admin, filtres, export |
| impersonation-flow.spec.ts | 9 | Mode support SYSTEM_ADMIN complet |
| accessibility.spec.ts | 14 | WCAG 2.1 AA, skip link, axe-core |
| company-settings.spec.ts | 21 | Paramètres entreprise, presets |
| not-found.spec.ts | 8 | Page 404 responsive |
| server-error.spec.ts | 8 | Page 500 responsive |
| error-boundary.spec.ts | 5 | Error boundary React |
| Mobile (5 specs) | 4 | Navigation, touch targets (skip partiel) |
| **Total E2E** | **189** | |

---

## Registre des anomalies

| ID | Date | Description | Sévérité | Résolution |
| --- | --- | --- | --- | --- |
| ANO-001 | 05/12/2025 | MSW handlers non chargés dans Vitest | Majeure | Ajout beforeAll/afterAll dans setup |
| ANO-002 | 05/12/2025 | Erreur hydratation React 19 | Mineure | Suppression console.log côté serveur |
| ANO-003 | 05/12/2025 | Tests Playwright timeout sur CI | Majeure | Augmentation timeout 30s → 60s |
| ANO-004 | 05/12/2025 | Coverage v8 incompatible happy-dom | Mineure | Switch vers jsdom |
| ANO-005 | 09/12/2025 | Session user.role undefined dans middleware | Majeure | Séparation authConfig Edge-compatible |
| ANO-006 | 09/12/2025 | Cookies de session non persistés entre tests | Majeure | Fixtures d'authentification avec storageState |
| ANO-007 | 09/12/2025 | Tests E2E échouent sans Docker | Mineure | Documenter prérequis : docker compose up -d |
| ANO-008 | 10/12/2025 | Imports inutilisés dans tests dashboard | Mineure | Suppression imports non utilisés |
| ANO-009 | 10/12/2025 | formatHours() retournait entier | Mineure | Correction condition showMinutes=false |
| ANO-010 | 10/12/2025 | Variable key shadowed dans map() | Mineure | Renommage en dataKeyItem |
| ANO-011 | 10/12/2025 | TypeScript erreur props optionnelles | Mineure | Destructuration avec valeurs par défaut |
| ANO-012 | 10/12/2025 | CHART_COLORS.status.success inexistant | Mineure | Utilisation de CHART_COLORS.success |
| ANO-013 | 10/12/2025 | Tests échouent avec getByText (multiple matches) | Mineure | Utilisation de getAllByText |
| ANO-014 | 08/01/2026 | userId requis mais optionnel métier | Mineure | Migration Prisma make_employee_userid_optional |
| ANO-015 | 12/01/2026 | TeamForm SelectItem value="" invalide (Radix) | Mineure | Changé value="" en value="**none**" |
| ANO-016 | 12/01/2026 | Page Objects locators "strict mode violation" | Mineure | Ajout .first() sur locators ambigus |
| ANO-017 | 16/01/2026 | État non partagé entre composants cookies | Majeure | CookieConsentProvider avec Context API |
| ANO-018 | 19/01/2026 | vi.mock() ne fonctionne pas avec ESM dynamique | Majeure | vi.doMock() + vi.resetModules() + import dynamique |
| ANO-019 | 23/01/2026 | Command Palette click overlay flaky en CI | Mineure | Suppression du test (couvert par test Escape) |
| ANO-020 | 25/01/2026 | WebKit upgrade http→https sur localhost en mobile | Majeure | Migration vers Chromium avec viewports personnalisés |
| ANO-021 | 27/01/2026 | Boucles infinies React 19 (useEffect/useCallback) | Majeure | Stabilisation avec useRef, memoization stricte |
| ANO-022 | 27/01/2026 | @schedule-x v4.1.0 incompatible Temporal API | Majeure | Downgrade v2.11.0 + patch-package |
| ANO-023 | 10/02/2026 | vi.hoisted() requis pour mocks MSW | Mineure | Hoisting vi.mock avec vi.hoisted() |
| ANO-024 | 10/02/2026 | MSW server.use() vs vi.stubGlobal conflit | Mineure | Utiliser server.use() quand MSW actif |
| ANO-025 | 10/02/2026 | TooltipProvider obligatoire pour Radix Tooltip | Mineure | Wrapper TooltipProvider dans les tests |
| ANO-026 | 13/02/2026 | Tests nightly flaky : connection reset CI | Majeure | Migration `npm run start` (production). Fix cookies secure, trustHost, CSP |
| ANO-027 | 15/02/2026 | ERR_TOO_MANY_REDIRECTS en production HTTP | Majeure | Env vars AUTH_URL, AUTH_SECRET, AUTH_TRUST_HOST + CSP conditionnel |
| ANO-028 | 19/02/2026 | Boucle redirect infinie en impersonation | Majeure | Bypass subscription guard avec cookie sp-impersonation |
| ANO-029 | 19/02/2026 | Bannière impersonation invisible (updateSession) | Majeure | Fallback lecture cookie dans Server Component layout |
| ANO-030 | 28/02/2026 | Accents français manquants dans toute l'app | Majeure | Audit i18n complet, 32+ fichiers corrigés |
| ANO-031 | 28/02/2026 | Sidebar collapse toggle nécessitant refresh | Mineure | Suppression toggle, navigation toujours étendue |
| ANO-032 | 28/02/2026 | Plannings à horaires affichés comme all-day | Mineure | Correction mapping événements isAllDay vs horaires |
| ANO-033 | 02/03/2026 | Tests E2E impersonation flaky en CI nightly | Majeure | Signout API CSRF, mode série, injection cookie consentement |

---

## Rationalisation des tests — Mars 2026

### Contexte et justification

En mars 2026, deux passes de rationalisation ont été effectuées pour préparer la soutenance CDA. L'objectif : **supprimer les tests cosmétiques et triviaux** pour ne conserver que les tests validant la logique critique.

### Évolution

| Métrique | Avant (02/03) | Après passe 1 (07/03) | Après passe 2 (09/03) |
|----------|---------------|----------------------|----------------------|
| Tests unitaires | 5 914 | ~2 910 | 2 814 |
| Tests E2E | 584 | ~221 | 189 |
| Fichiers Vitest | ~372 | 164 | 156 |
| Fichiers E2E | 40 | 13 | 13 |
| **Total** | **6 498** | **~3 131** | **3 003** |

### Critères de suppression

- Tests de rendu pur (« le composant s'affiche sans erreur ») sans logique métier
- Tests de snapshots CSS/className sans valeur fonctionnelle
- Tests dupliqués entre composants et pages
- Tests d'accessibilité redondants avec l'audit axe-core E2E
- Tests de design tokens/animations sans logique conditionnelle

### Passe 2 (09/03/2026 — SP-494)

8 fichiers supprimés, 96 tests en moins :

| Fichier supprimé | Tests | Raison |
|-----------------|-------|--------|
| illustrations.test.tsx | 23 | Vérification attributs SVG uniquement |
| design-system/page.test.tsx | 14 | Page démo, rendu texte |
| SettingsHeader.test.tsx | 5 | En-tête statique |
| SettingsSection.test.tsx | 10 | Section statique |
| DirectorStats.test.tsx | 18 | Props passthrough |
| TrendIndicator.test.tsx | 14 | Vérification classes CSS |
| IncidentNotesEmptyState.test.tsx | 7 | Conditionnel trivial |
| PersonalTaskList.test.tsx | 5 | Structure DndContext uniquement |

### Justification CDA

Cette rationalisation démontre une compétence de **maturité technique** :
- Un test n'a de valeur que s'il teste de la logique métier ou de la sécurité
- Préférer ~3 000 tests pertinents à ~6 500 dont la moitié est cosmétique
- Réduire le temps de CI sans perdre en confiance
- Focus sur les tests qui **cassent quand le comportement métier change**, pas quand le CSS change

---

## Audit technique — Préparation soutenance CDA (7 mars 2026)

Audit approfondi des 4 fonctionnalités clés pour préparer les explications orales devant le jury.

### Fonctionnalité 1 : Authentification + Middleware RBAC

**Fichiers clés** : `auth.ts`, `auth.config.ts`, `middleware.ts`, `permissions.ts`, `subscription-guard.ts`, `impersonation.ts`, `crud-utils.ts`

**Flux complet** : Formulaire login → CSRF auto → Zod safeParse → Prisma findUnique (+ subscription) → bcrypt.compare timing-safe → vérifications isActive/company → lastLoginAt → audit fire-and-forget → JWT enrichi → cookie HttpOnly → Edge middleware authorized() (8 étapes) → Server Action checkPermission() (double vérification)

**Patterns** : Middleware Chain, Strategy (RBAC hiérarchique), HOF (withRoleCheck), Fire-and-Forget (audit), Module Augmentation (NextAuth types), Lazy Import (Prisma en Edge)

**Choix techniques** :
- JWT plutôt que DB sessions → VPS simple, Edge Runtime compatible
- Split auth.ts / auth.config.ts → Pattern officiel NextAuth v5
- bcrypt SALT_ROUNDS=10 → OWASP recommandé, timing-safe compare
- companyId dans JWT → Isolation multi-tenant sans requête DB
- Double vérification middleware + Server Action → Defense in depth

### Fonctionnalité 2 : Workflow de congés (LeaveRequest)

**Fichiers clés** : `actions/leaves.ts` (1603 lignes, 11 Server Actions), `validations/leave.ts`, `leave-utils.ts`, `LeaveRequestForm.tsx`

**Flux complet** : Demande (PENDING) → Validation triple (Zod + métier + Prisma) → Notification manager (email + SSE, fallback DIRECTOR) → Décision → Transaction ACID (update status + débit/crédit LeaveBalance) → Email approved/rejected → SSE notification employé

**Patterns** : Strategy (buildLeaveRBACWhere par rôle), Transaction ACID ($transaction interactive), Fire-and-Forget (email + SSE hors transaction), Observer (SSE notifications), Upsert idempotent (LeaveBalance), Fallback (manager → DIRECTOR)

**Choix techniques** :
- Transaction interactive → Logique conditionnelle (débit seulement si APPROVED + type décomptable)
- Email hors transaction → Un email fail ne doit pas rollback l'approbation
- superRefine Zod → Validation cross-field (endDate vs startDate, 48h, halfDay + period)

### Fonctionnalité 3 : Intégration Stripe per-seat + Webhooks

**Fichiers clés** : `stripe.service.ts` (1052 lignes), `subscription-sync.service.ts`, `api/webhooks/stripe/route.ts`, `subscription-guard.ts`, `subscription-banner.ts`

**Flux complet** : Checkout → Stripe → webhook checkout.session.completed → upsert Subscription ACTIVE → fire-and-forget email. Récurrent : invoice.paid → Payment SUCCEEDED. Échec : invoice.payment_failed → $transaction Payment FAILED + Subscription PAST_DUE → grâce 7j → middleware bloque.

**Patterns** : Singleton Lazy (Proxy), Fire-and-Forget (sync seats, emails), Idempotence (upsert + no_change check), Adapter (SDK v20), Strategy (dispatch eventType), ServiceResult<T>

**Choix techniques** :
- Raw body pour webhook → Intégrité signature HMAC
- Fire-and-forget sync seats → CRUD employee ne doit jamais bloquer sur Stripe
- Idempotence upsert → Stripe peut renvoyer le même webhook 2x (retry 3 jours)
- Fonction pure subscription-guard → Edge-compatible, 0 dépendance Node.js

### Fonctionnalité 4 : Patterns POO et Architecture

**Fichiers clés** : `e2e/pages/*.page.ts` (7 classes POM), `sse-emitter.ts` (Singleton + Observer), `types/crud.ts` (Union discriminée), `actions/crud-utils.ts` (HOF)

**Patterns POO identifiés** :

| Pattern | Implémentation | Fichier |
|---------|---------------|---------|
| Page Object Model | 7 classes avec encapsulation, héritage implicite | e2e/pages/ |
| Singleton | NotificationSSEManager.getInstance() | sse-emitter.ts |
| Observer | Map<userId, Set<WritableStreamDefaultWriter>> | sse-emitter.ts |
| Strategy | buildLeaveRBACWhere par rôle | leaves.ts |
| HOF | withRoleCheck<T>(fn, minRole) | crud-utils.ts |
| Union discriminée | CrudActionResult<T> success/error (type narrowing) | crud.ts |
| Composition | User ↔ Employee (relation optionnelle 1:1) | schema.prisma |
| Fire-and-Forget | .catch() sur sync Stripe, emails, audit | Server Actions |
| Adapter | ServiceResult<T> → CrudActionResult<T> | stripe.ts |
| Middleware Chain | 8 étapes authorized() | auth.config.ts |

---

## Compétences CDA couvertes

| # | Compétence CDA | Implémentation |
|---|---------------|----------------|
| 1 | Développer des composants d'accès aux données SQL | Prisma ORM, 18 modèles, transactions ACID |
| 2 | Développer des composants métier | Server Actions RBAC, validation Zod |
| 3 | Contribuer à la mise en production | CI/CD GitHub Actions, Docker, VPS OVH |
| 4 | Développer une application en couches | Architecture App Router (page/layout/loading/error) |
| 5 | Mettre en place une solution de gestion de projet | Jira SP-XXX, Confluence, GitHub |
| 6 | Spécifier les besoins techniques | CLAUDE.md, docs/, cahier de recettage |
| 7 | Implémenter une solution sécurisée | RBAC 4 niveaux, OWASP, CSRF, rate limiting |
| 8 | Tests et validation | Vitest + Playwright, 3 003 tests, couverture ~86% |
