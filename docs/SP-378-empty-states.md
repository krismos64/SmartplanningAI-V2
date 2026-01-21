# SP-378 - Empty States

## Description

Implémentation des composants d'états vides pour les listes, tableaux et recherches dans SmartPlanning V2.

## Composants créés

### EmptyState (`src/components/ui/empty-state.tsx`)

Composant principal pour afficher des états vides avec animations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Titre affiché sous l'illustration |
| `description` | `string` | - | Description additionnelle |
| `variant` | `'default' \| 'search' \| 'error' \| 'no-permission'` | `'default'` | Variante avec illustration adaptée |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Taille du composant |
| `illustration` | `ReactNode` | - | Illustration personnalisée (override la variante) |
| `action` | `{ label: string, onClick: () => void, variant?: ButtonVariant }` | - | Bouton d'action optionnel |
| `animated` | `boolean` | `true` | Active les animations Framer Motion |
| `hideIllustration` | `boolean` | `false` | Masque l'illustration |
| `aria-live` | `'polite' \| 'assertive' \| 'off'` | `'polite'` | Accessibilité pour lecteurs d'écran |

#### Exemples d'utilisation

```tsx
import { EmptyState } from '@/components/ui/empty-state'

// État vide par défaut
<EmptyState
  title="Aucune donnée"
  description="Ajoutez des éléments pour commencer"
/>

// État de recherche sans résultat
<EmptyState
  variant="search"
  title="Aucun résultat"
  description="Modifiez vos critères de recherche"
  action={{
    label: 'Réinitialiser',
    onClick: () => resetFilters(),
    variant: 'secondary'
  }}
/>

// État d'erreur
<EmptyState
  variant="error"
  title="Erreur de chargement"
  description="Impossible de charger les données"
  action={{
    label: 'Réessayer',
    onClick: () => refetch()
  }}
/>

// Permission refusée
<EmptyState
  variant="no-permission"
  title="Accès refusé"
  description="Vous n'avez pas les droits nécessaires"
/>
```

### Illustrations (`src/components/illustrations/`)

4 illustrations SVG accessibles :

- `EmptyBoxIllustration` - État vide par défaut
- `SearchNotFoundIllustration` - Recherche sans résultat
- `ErrorIllustration` - Erreur
- `NoPermissionIllustration` - Permission refusée

#### Props communes

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `200` | Largeur SVG |
| `height` | `number` | `200` | Hauteur SVG |
| `className` | `string` | - | Classes CSS additionnelles |
| `title` | `string` | - | Titre accessible |

## Intégration DataTable

Le composant DataTable supporte maintenant une prop `emptyState` pour personnaliser l'état vide :

```tsx
<DataTable
  columns={columns}
  data={data}
  emptyState={{
    title: "Aucun utilisateur",
    description: "Commencez par ajouter votre premier utilisateur",
    variant: "default",
    action: {
      label: "Ajouter un utilisateur",
      onClick: () => router.push('/users/new')
    }
  }}
/>
```

## Architecture technique

### Design Tokens utilisés

- Couleurs : `muted`, `muted-foreground`, `destructive`, `warning`, `background`
- Espacements : `gap-3`, `gap-4`, `gap-6`, `py-8`, `py-12`, `py-16`
- Typographie : `text-base`, `text-lg`, `text-xl`, `text-xs`, `text-sm`

### Animations

- Utilise `fadeSlideUpVariants` de `@/lib/animations`
- Support de `prefers-reduced-motion` via `useReducedMotion()`
- Animations désactivables via prop `animated={false}`

### Accessibilité

- `role="status"` sur le conteneur
- `aria-live="polite"` par défaut (configurable)
- `aria-hidden="true"` sur les illustrations
- `aria-labelledby` sur les SVG avec `<title>`
- Support keyboard navigation sur les boutons d'action

## Tests

- **55 tests unitaires** : `src/components/ui/__tests__/empty-state.test.tsx` + `src/components/illustrations/__tests__/illustrations.test.tsx`
- Couverture des variants, tailles, illustrations, actions, accessibilité et animations

## Fichiers créés/modifiés

### Nouveaux fichiers

- `src/components/ui/empty-state.tsx`
- `src/components/illustrations/EmptyBoxIllustration.tsx`
- `src/components/illustrations/SearchNotFoundIllustration.tsx`
- `src/components/illustrations/ErrorIllustration.tsx`
- `src/components/illustrations/NoPermissionIllustration.tsx`
- `src/components/illustrations/index.ts`
- `src/components/ui/__tests__/empty-state.test.tsx`
- `src/components/illustrations/__tests__/illustrations.test.tsx`

### Fichiers modifiés

- `src/components/ui/data-table/index.tsx` - Intégration EmptyState
- `src/components/ui/data-table/data-table-types.ts` - Ajout prop `emptyState`

## Validation

- ✅ ESLint : 0 erreur, 0 warning
- ✅ Tests : 2433 tests passent
- ✅ Build : Production build réussi
