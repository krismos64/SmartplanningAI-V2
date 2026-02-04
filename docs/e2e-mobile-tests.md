# Tests E2E Mobile - SmartPlanning

> **Ticket**: SP-389 - E2E Mobile Tests with Playwright
> **Phase**: SP-268 Phase 4 - Tests E2E Mobile
> **Dernière mise à jour**: 4 février 2026

## Vue d'ensemble

Suite de tests E2E validant l'expérience utilisateur mobile sur 5 devices différents :

| Device        | Viewport  | OS      | Caractéristiques                      |
| ------------- | --------- | ------- | ------------------------------------- |
| iPhone SE     | 320×568   | iOS     | Petit écran, contraintes espace       |
| iPhone 14 Pro | 393×852   | iOS     | Écran moderne, notch dynamique        |
| Pixel 7       | 412×915   | Android | Chrome mobile, référence Android      |
| iPad Mini     | 768×1024  | iPadOS  | Tablette petite, mode intermédiaire   |
| iPad Pro 11"  | 834×1194  | iPadOS  | Grande tablette, layout quasi-desktop |

**Note importante** : Tous les projets mobiles utilisent Chromium au lieu de WebKit car WebKit a un bug connu qui upgrade `http://localhost` en `https://`, causant des erreurs TLS.

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Fichiers de tests mobile | 5 |
| Total lignes de code | ~1900 |
| Devices testés | 5 |
| Fichiers specs totaux (projet) | 43 |

## Structure des fichiers

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts       # Authentification (modifié pour mobile)
│   ├── consent.fixture.ts    # Consentement cookies
│   └── mobile.fixture.ts     # Helpers mobiles + détection device
├── utils/
│   └── touch-gestures.ts     # Utilitaires swipe/tap (9KB)
├── pages/
│   ├── avatar-upload.page.ts # Page Object avatar (SP-272)
│   ├── leaves.page.ts        # Page Object congés
│   ├── personal-tasks.page.ts # Page Object notes perso
│   └── ...                   # 18 Page Objects au total
├── specs/
│   └── mobile/
│       ├── navigation.spec.ts           # SwipeableDrawer, burger menu
│       ├── command-palette.spec.ts      # Full-screen search
│       ├── touch-targets.mobile.spec.ts # WCAG 2.5.5 validation (44px)
│       ├── breadcrumbs.spec.ts          # Scroll horizontal
│       └── data-table.spec.ts           # Pagination responsive
```

## Exécution des tests

### Tous les tests mobile

```bash
npx playwright test --project=mobile-iphone-se --project=mobile-iphone-14-pro --project=mobile-pixel-7 --project=tablet-ipad-mini --project=tablet-ipad-pro-11
```

### Un device spécifique

```bash
npx playwright test --project=mobile-iphone-se
```

### Un fichier de test

```bash
npx playwright test e2e/specs/mobile/navigation.spec.ts
```

### Mode UI (debug visuel)

```bash
npx playwright test --ui --project=mobile-iphone-se
```

### Tests desktop uniquement (exclut mobile)

```bash
npx playwright test --project=chromium
```

## Fixtures mobiles

### MobileHelpers (mobile.fixture.ts)

```typescript
import { test, expect } from '../../fixtures/mobile.fixture'

test('exemple test mobile', async ({ directorPage, mobile }) => {
  // Détection device
  console.log(mobile.isMobile) // true pour phones/tablets
  console.log(mobile.isTablet) // true pour iPad
  console.log(mobile.hasTouch) // true si touch supporté
  console.log(mobile.viewportWidth) // largeur viewport
  console.log(mobile.deviceName) // ex: "mobile-iphone-se"

  // Gestes tactiles
  await mobile.swipeLeft(200) // swipe depuis centre viewport
  await mobile.swipeRight(150)
  await mobile.swipeLeftOn(locator, 200) // swipe sur élément

  // Validation touch targets
  const result = await mobile.checkTouchTarget(button)
  expect(result.isValid).toBe(true) // >= 44x44px
})
```

### Helpers disponibles

```typescript
import {
  waitForDrawerOpen,
  waitForDrawerClosed,
  openMobileDrawer,
  openCommandPaletteMobile,
  closeCommandPalette,
  getBurgerMenuButton,
  isMobileViewport,
} from '../../fixtures/mobile.fixture'
```

## Utilitaires Touch (touch-gestures.ts)

```typescript
import {
  swipe,
  swipeLeftOnElement,
  swipeRightOnElement,
  checkTouchTargetSize,
  longPress,
  scrollHorizontal,
} from '../../utils/touch-gestures'

// Swipe avec options
await swipe(page, 'left', {
  startX: 300,
  startY: 400,
  distance: 200,
  duration: 300,
  steps: 15,
})

// Validation WCAG 2.5.5
const result = await checkTouchTargetSize(locator)
// { isValid: boolean, width: number, height: number, minRequired: 44 }
```

## Tests par catégorie

### 1. Navigation (navigation.spec.ts)

- Burger menu visibility sur mobile
- SwipeableDrawer ouverture/fermeture
- Swipe gesture pour fermer le drawer
- Navigation entre pages depuis drawer
- Focus trap et accessibilité

### 2. Command Palette (command-palette.spec.ts)

- Mode full-screen sur mobile
- Bouton X au lieu du badge ESC
- Font-size 16px (prévention zoom iOS)
- Search icon button trigger
- Touch targets des résultats

### 3. Touch Targets (touch-targets.mobile.spec.ts)

- WCAG 2.5.5 compliance (44×44px minimum)
- Burger menu, search, theme toggle
- Boutons navigation pagination
- Contrôles drawer et command palette

### 4. Breadcrumbs (breadcrumbs.spec.ts)

- Scroll horizontal sur mobile
- Scroll-snap entre items
- Fade indicators (left/right)
- Auto-scroll vers page courante

### 5. DataTable Pagination (data-table.spec.ts)

- Format compact "X/Y" (vs "Page X sur Y")
- First/Last buttons masqués sur mobile
- Page size selector 44px height
- Layout vertical centré

## Configuration Playwright

La configuration dans `playwright.config.ts` :

```typescript
projects: [
  // ==================== DESKTOP ====================
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    // Exclure les tests mobile-only sur le projet desktop
    testIgnore: /.*mobile.*\.spec\.ts/,
  },

  // ==================== MOBILE - SMARTPHONES ====================
  {
    name: 'mobile-iphone-se',
    use: {
      viewport: { width: 320, height: 568 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...',
    },
    testMatch: /.*mobile.*\.spec\.ts/,
  },
  {
    name: 'mobile-iphone-14-pro',
    use: {
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: '...',
    },
    testMatch: /.*mobile.*\.spec\.ts/,
  },
  {
    name: 'mobile-pixel-7',
    use: {
      ...devices['Pixel 7'],
      // Android référence 412x915, Chrome mobile
    },
    testMatch: /.*mobile.*\.spec\.ts/,
  },

  // ==================== MOBILE - TABLETS ====================
  {
    name: 'tablet-ipad-mini',
    use: {
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: '...',
    },
    testMatch: /.*mobile.*\.spec\.ts/,
  },
  {
    name: 'tablet-ipad-pro-11',
    use: {
      viewport: { width: 834, height: 1194 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: '...',
    },
    testMatch: /.*mobile.*\.spec\.ts/,
  },
]
```

## Best practices

### 1. Conditionnel mobile-only

```typescript
test.beforeEach(async ({ mobile }) => {
  test.skip(!mobile.isMobile, 'Test only runs on mobile devices')
})
```

### 2. Skip gracieux si composant absent

```typescript
if (!(await element.isVisible({ timeout: 3000 }).catch(() => false))) {
  test.skip()
  return
}
```

### 3. Attente animations

```typescript
// Après swipe/navigation
await page.waitForTimeout(300) // animation fluide
```

### 4. Touch target validation

```typescript
const result = await mobile.checkTouchTarget(button)
expect(result.width).toBeGreaterThanOrEqual(44)
expect(result.height).toBeGreaterThanOrEqual(44)
```

### 5. Retries et stabilité

```typescript
// En CI : 2 retries, 1 worker pour stabilité DB
// En local : 1 retry, workers auto
retries: process.env.CI ? 2 : 1,
workers: process.env.CI ? 1 : undefined,
```

## Timeouts configurés

| Type | CI | Local |
|------|-----|-------|
| Test global | 60s | 45s |
| Assertions expect() | 15s | 5s |
| Actions (click, fill) | 15s | 10s |
| Navigation | 30s | 15s |
| WebServer startup | 120s | 120s |

## Intégration CI/CD

Les tests mobile sont exécutés dans le pipeline CI GitHub Actions :
- Les tests `*mobile*.spec.ts` sont exécutés uniquement sur les projets mobile
- Les tests desktop (`chromium`) ignorent les fichiers `*mobile*.spec.ts`
- Traces et screenshots capturés sur échec
- Videos enregistrées sur premier retry en CI

## Page Objects disponibles

| Page Object | Fichier | Description |
|-------------|---------|-------------|
| AvatarUploadPage | avatar-upload.page.ts | Upload avatar (SP-272) |
| LeavesPage | leaves.page.ts | Gestion congés |
| PersonalTasksPage | personal-tasks.page.ts | Notes personnelles |
| AppearancePage | appearance.page.ts | Préférences affichage |
| ChangePasswordPage | change-password.page.ts | Mot de passe |
| DeleteAccountPage | delete-account.page.ts | Suppression compte |
| EditProfilePage | edit-profile.page.ts | Édition profil |
| CompanySettingsPage | company-settings.page.ts | Paramètres entreprise |
| NotificationsPreferencesPage | notifications-preferences.page.ts | Préférences notifications |
| SchedulesPage | schedules.page.ts | Plannings |
| ProfilePage | profile.page.ts | Affichage profil |
| Dashboard*Page | dashboard-*.page.ts | Dashboards par rôle (4) |
| CRUD Pages | crud/*.ts | Employés, Teams, Companies |

## Références

- [Playwright Mobile Emulation](https://playwright.dev/docs/emulation)
- [Playwright Devices](https://playwright.dev/docs/emulation#devices)
- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [SP-383 - SwipeableDrawer](./swipeable-drawer.md)
- [SP-387 - DataTablePagination](./data-table-pagination.md)
- [SP-388 - ResponsiveBreadcrumb](./responsive-breadcrumb.md)
- [SP-272 - Avatar Upload](./SP-272-avatar-upload.md)

## Historique

| Date | Description |
|------|-------------|
| 04/02/2026 | Mise à jour documentation, ajout Page Objects, stats |
| 01/2026 | Ajout avatar-upload.page.ts (SP-272) |
| 01/2026 | Migration vers Chromium (bug WebKit https) |
| 01/2026 | Création initiale (SP-389) |
