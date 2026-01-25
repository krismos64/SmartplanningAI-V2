# Tests E2E Mobile - SmartPlanning

> **Ticket**: SP-389 - E2E Mobile Tests with Playwright
> **Phase**: SP-268 Phase 4 - Tests E2E Mobile
> **Date**: Janvier 2026

## Vue d'ensemble

Suite de tests E2E validant l'expérience utilisateur mobile sur 5 devices différents :

| Device | Viewport | OS | Caractéristiques |
|--------|----------|-----|-----------------|
| iPhone SE | 375×667 | iOS | Petit écran, contraintes espace |
| iPhone 14 Pro | 393×852 | iOS | Écran moderne, notch dynamique |
| Pixel 7 | 412×915 | Android | Chrome mobile, référence Android |
| iPad Mini | 768×1024 | iPadOS | Tablette petite, mode intermédiaire |
| iPad Pro 11" | 834×1194 | iPadOS | Grande tablette, layout quasi-desktop |

## Structure des fichiers

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts       # Authentification (modifié pour mobile)
│   └── mobile.fixture.ts     # Helpers mobiles + détection device
├── utils/
│   └── touch-gestures.ts     # Utilitaires swipe/tap
├── specs/
│   └── mobile/
│       ├── navigation.spec.ts      # SwipeableDrawer, burger menu
│       ├── command-palette.spec.ts # Full-screen search
│       ├── touch-targets.spec.ts   # WCAG 2.5.5 validation (44px)
│       ├── breadcrumbs.spec.ts     # Scroll horizontal
│       └── data-table.spec.ts      # Pagination responsive
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

## Fixtures mobiles

### MobileHelpers (mobile.fixture.ts)

```typescript
import { test, expect } from '../../fixtures/mobile.fixture'

test('exemple test mobile', async ({ directorPage, mobile }) => {
  // Détection device
  console.log(mobile.isMobile)      // true pour phones/tablets
  console.log(mobile.isTablet)      // true pour iPad
  console.log(mobile.hasTouch)      // true si touch supporté
  console.log(mobile.viewportWidth) // largeur viewport
  console.log(mobile.deviceName)    // ex: "mobile-iphone-se"

  // Gestes tactiles
  await mobile.swipeLeft(200)       // swipe depuis centre viewport
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

### 3. Touch Targets (touch-targets.spec.ts)
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
  // Desktop (exclut les tests mobile)
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    testIgnore: /.*mobile.*\.spec\.ts/,
  },
  // Mobile projects (incluent seulement les tests mobile)
  {
    name: 'mobile-iphone-se',
    use: { ...devices['iPhone SE'] },
    testMatch: /.*mobile.*\.spec\.ts/,
  },
  // ... autres devices
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

## Références

- [Playwright Mobile Emulation](https://playwright.dev/docs/emulation)
- [Playwright Devices](https://playwright.dev/docs/emulation#devices)
- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [SP-383 - SwipeableDrawer](./swipeable-drawer.md)
- [SP-387 - DataTablePagination](./data-table-pagination.md)
- [SP-388 - ResponsiveBreadcrumb](./responsive-breadcrumb.md)
