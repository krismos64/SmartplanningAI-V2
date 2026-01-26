# Design Tokens - SmartPlanning V2

> **Direction esthétique : "Precision Engineering"**
>
> Un système de design professionnel, sophistiqué et distinctif pour une application SaaS de planification RH.

## Vue d'ensemble

Les design tokens sont les valeurs atomiques du design system de SmartPlanning. Ils assurent la cohérence visuelle à travers toute l'application et facilitent le maintien d'une identité de marque forte.

### Structure des fichiers

```
src/styles/tokens/
├── __tests__/           # Tests unitaires
│   ├── colors.test.ts
│   ├── typography.test.ts
│   ├── spacing.test.ts
│   └── tokens.test.ts
├── colors.ts            # Palette de couleurs
├── typography.ts        # Typographie
├── spacing.ts           # Espacements et tailles
├── shadows.ts           # Ombres et effets
├── radius.ts            # Border radius et bordures
├── index.ts             # Export centralisé
└── README.md            # Cette documentation
```

## Installation et utilisation

### Import recommandé

```tsx
// Import de tous les tokens
import { tokens } from '@/styles/tokens'

// Import spécifique
import { blue, semanticLight } from '@/styles/tokens'

// Import des utilitaires
import { utils, withOpacity } from '@/styles/tokens'
```

## Couleurs

### Palettes primitives

| Palette   | Usage                      | Couleur principale |
| --------- | -------------------------- | ------------------ |
| `blue`    | Couleur primaire           | `#3b82f6`          |
| `cyan`    | Accents modernes           | `#06b6d4`          |
| `slate`   | Gris neutres               | `#64748b`          |
| `emerald` | Succès, validation         | `#10b981`          |
| `amber`   | Alertes, avertissements    | `#f59e0b`          |
| `rose`    | Erreurs, destructif        | `#e11d48`          |
| `violet`  | Premium, éléments spéciaux | `#8b5cf6`          |

### Exemple d'utilisation

```tsx
import { blue, tokens } from '@/styles/tokens'

// Accès direct
const primaryColor = blue[500] // '#3b82f6'

// Via l'objet tokens
const accentColor = tokens.colors.cyan[400] // '#22d3ee'

// Couleurs sémantiques (format HSL pour Tailwind)
const bgPrimary = tokens.colors.semantic.light.primary.DEFAULT // '217 91% 60%'
```

### Tokens sémantiques

Les tokens sémantiques utilisent le format HSL pour compatibilité avec Tailwind CSS :

```tsx
// Light mode
const semanticLight = {
  primary: {
    DEFAULT: '217 91% 60%', // Couleur principale
    hover: '217 91% 55%', // État hover
    active: '217 91% 50%', // État actif
    foreground: '210 40% 98%', // Texte sur primary
    muted: '217 91% 95%', // Background léger
  },
  // ... autres tokens
}
```

## Typographie

### Familles de polices

| Famille   | Usage               | Polices           |
| --------- | ------------------- | ----------------- |
| `display` | Titres, hero        | Rajdhani          |
| `sans`    | Corps de texte      | Plus Jakarta Sans |
| `mono`    | Code                | JetBrains Mono    |
| `serif`   | Citations, spéciaux | Merriweather      |

### Échelle typographique

```tsx
import { fontSize, textStyles } from '@/styles/tokens'

// Échelle de tailles
fontSize.xs // 12px
fontSize.sm // 14px
fontSize.base // 16px
fontSize.lg // 18px
fontSize.xl // 20px
fontSize['2xl'] // 24px
// ... jusqu'à 9xl

// Styles prédéfinis
textStyles.h1 // { fontFamily, fontSize, lineHeight, letterSpacing, fontWeight }
textStyles.bodyBase
textStyles.label
textStyles.buttonBase
```

### Exemple dans un composant

```tsx
<h1 className="font-display text-3xl font-bold tracking-tight">
  Titre principal
</h1>
<p className="font-sans text-base leading-relaxed">
  Corps de texte
</p>
```

## Espacements

### Échelle de base

L'échelle utilise une unité de base de 4px (0.25rem) :

```tsx
import { spacingScale } from '@/styles/tokens'

spacingScale[0] // '0'
spacingScale[1] // '0.25rem' (4px)
spacingScale[2] // '0.5rem'  (8px)
spacingScale[4] // '1rem'    (16px)
spacingScale[8] // '2rem'    (32px)
spacingScale[16] // '4rem'    (64px)
// ...
```

### Espacements sémantiques

```tsx
import { semanticSpacing } from '@/styles/tokens'

// Padding des composants
semanticSpacing.component.md // '0.75rem' (12px)

// Gaps
semanticSpacing.gap.lg // '1.5rem' (24px)

// Sections
semanticSpacing.section.xl // '6rem' (96px)

// Formulaires
semanticSpacing.form.fieldGap // '1rem' (16px)
```

## Ombres

### Ombres de boîte

```tsx
import { boxShadowLight, semanticShadows } from '@/styles/tokens'

// Échelle générique
boxShadowLight.sm // Subtle
boxShadowLight.md // Cards
boxShadowLight.lg // Dropdowns
boxShadowLight.xl // Modals

// Sémantiques
semanticShadows.light.card.DEFAULT
semanticShadows.light.button.primary
semanticShadows.light.input.focus
```

### Effets de glow

```tsx
import { glow } from '@/styles/tokens'

// Glow colorés
glow.primary.md // Glow bleu
glow.accent.lg // Glow cyan
glow.success.sm // Glow vert
```

## Border Radius

### Échelle

```tsx
import { borderRadius } from '@/styles/tokens'

borderRadius.none // '0'
borderRadius.sm // '0.25rem' (4px)
borderRadius.DEFAULT // '0.5rem'  (8px)
borderRadius.lg // '0.75rem' (12px)
borderRadius.xl // '1rem'    (16px)
borderRadius.full // '9999px'
```

### Sémantiques

```tsx
import { semanticRadius } from '@/styles/tokens'

semanticRadius.button.md // Boutons
semanticRadius.card.DEFAULT // Cards
semanticRadius.modal.DEFAULT // Modals
semanticRadius.avatar.DEFAULT // Avatars (full)
```

## Intégration Tailwind

Les tokens sont automatiquement intégrés dans `tailwind.config.ts` :

```tsx
// tailwind.config.ts
import { tailwindTheme } from '@/styles/tokens'

export default {
  theme: {
    extend: {
      colors: tailwindTheme.colors,
      fontFamily: tailwindTheme.fontFamily,
      spacing: tailwindTheme.spacing,
      borderRadius: tailwindTheme.borderRadius,
      boxShadow: tailwindTheme.boxShadow,
    },
  },
}
```

## CSS Variables

Les tokens sont également disponibles en CSS variables dans `globals.css` :

```css
:root {
  --primary: 217 91% 60%;
  --primary-foreground: 210 40% 98%;
  --secondary: 217 78% 51%;
  /* ... */
}

.dark {
  --primary: 217 91% 65%;
  /* ... */
}
```

Utilisation :

```css
.my-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

## Utilitaires

### withOpacity

Ajoute une opacité à une couleur HSL :

```tsx
import { withOpacity } from '@/styles/tokens'

const color = withOpacity('217 91% 60%', 0.5)
// 'hsl(217 91% 60% / 0.5)'
```

### toHslVar

Convertit un nom en variable CSS :

```tsx
import { toHslVar } from '@/styles/tokens'

const color = toHslVar('primary')
// 'hsl(var(--primary))'
```

## Tests

Lancer les tests des tokens :

```bash
npm run test src/styles/tokens
```

## Contribution

Lors de l'ajout de nouveaux tokens :

1. Ajouter les valeurs dans le fichier approprié
2. Exporter depuis `index.ts`
3. Mettre à jour `tailwind.config.ts` si nécessaire
4. Ajouter les tests correspondants
5. Mettre à jour cette documentation

---

**SmartPlanning V2** - Design System
Ticket Jira : SP-259
