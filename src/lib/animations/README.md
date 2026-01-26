# Animation System - SmartPlanning V2

Système d'animations standardisé basé sur **Framer Motion** avec support complet de l'accessibilité.

## SP-379 - Animations System

---

## Installation

Le système est prêt à l'emploi. Framer Motion est déjà installé dans le projet.

```tsx
import {
  useAnimation,
  AnimatedContainer,
  fadeVariants,
  hoverScale,
} from '@/lib/animations'
```

---

## Structure

```
src/lib/animations/
├── config.ts          # Durées, easings, springs
├── variants.ts        # Variants réutilisables
├── presets.ts         # Micro-interactions
├── hooks/
│   ├── useReducedMotion.ts
│   ├── useAnimation.ts
│   ├── useStaggerAnimation.ts
│   ├── useInViewAnimation.ts
│   └── index.ts
├── components/
│   ├── AnimatedContainer.tsx
│   ├── AnimatedList.tsx
│   ├── AnimatedPresence.tsx
│   └── index.ts
├── index.ts           # Export centralisé
└── README.md
```

---

## Configuration

### Durées

```tsx
import { durations } from '@/lib/animations'

// Valeurs disponibles (en secondes)
durations.instant // 0.1  - Micro-interactions
durations.fast // 0.15 - Hover, focus
durations.quick // 0.2  - Tooltips, dropdowns
durations.normal // 0.3  - Standard
durations.medium // 0.4  - Sidebars, panels
durations.slow // 0.5  - Modals, pages
durations.slower // 0.8  - Animations complexes
durations.slowest // 1.0  - Onboarding
```

### Easings

```tsx
import { easings } from '@/lib/animations'

// Courbes cubic-bezier
easings.easeOut // Entrées naturelles
easings.easeInOut // Transitions fluides
easings.easeIn // Sorties progressives
easings.sharp // Interactions rapides
easings.anticipate // Léger recul avant mouvement
easings.overshoot // Dépassement puis retour
```

### Springs

```tsx
import { springs } from '@/lib/animations'

springs.gentle // Doux - Boutons, cards
springs.default // Standard - Usage général
springs.snappy // Réactif - Toggles
springs.bouncy // Rebondissant - Notifications
springs.slow // Lent - Modals, pages
```

---

## Variants

### Fade

```tsx
import { fadeVariants, fadeDelayedVariants } from '@/lib/animations'

<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
/>

// Avec délai personnalisé
<motion.div
  variants={fadeDelayedVariants}
  initial="hidden"
  animate="visible"
  custom={0.3} // délai en secondes
/>
```

### Slide

```tsx
import {
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
} from '@/lib/animations'

// Entrée par le bas (modals, toasts)
<motion.div variants={slideUpVariants} />

// Entrée par le haut (dropdowns)
<motion.div variants={slideDownVariants} />

// Entrée par la droite (sidebars)
<motion.div variants={slideLeftVariants} />
```

### Scale

```tsx
import { scaleVariants, scaleSpringVariants, popVariants } from '@/lib/animations'

// Scale classique
<motion.div variants={scaleVariants} />

// Scale avec spring
<motion.div variants={scaleSpringVariants} />

// Effet pop rebondissant
<motion.div variants={popVariants} />
```

### Stagger (listes)

```tsx
import { staggerContainer, staggerItem } from '@/lib/animations'

;<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={staggerItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Factory Functions

```tsx
import {
  createSlideVariant,
  createScaleVariant,
  createStaggerContainer,
} from '@/lib/animations'

// Slide personnalisé
const customSlide = createSlideVariant('up', 50) // 50px

// Scale personnalisé
const customScale = createScaleVariant(0.8) // from 0.8

// Stagger personnalisé
const customStagger = createStaggerContainer(0.2, 0.5) // delay, initial
```

---

## Presets (Micro-interactions)

### Hover

```tsx
import { hoverScale, hoverLift, hoverGlow } from '@/lib/animations'

<motion.button whileHover={hoverScale}>
  Hover me
</motion.button>

<motion.div whileHover={hoverLift}>
  Card avec lift
</motion.div>
```

### Tap / Click

```tsx
import { tapScale, tapPush } from '@/lib/animations'

;<motion.button whileHover={hoverScale} whileTap={tapScale}>
  Click me
</motion.button>
```

### Button Presets

```tsx
import { buttonPrimary, buttonIcon, buttonLift } from '@/lib/animations'

// Preset complet (hover + tap + focus)
<motion.button {...buttonPrimary}>
  Primary Button
</motion.button>

<motion.button {...buttonIcon}>
  <Icon />
</motion.button>
```

### Card Presets

```tsx
import { cardInteractive, cardSubtle } from '@/lib/animations'

;<motion.div {...cardInteractive}>
  <Card />
</motion.div>
```

---

## Hooks

### useReducedMotion

```tsx
import { useReducedMotion } from '@/lib/animations'

function MyComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
    />
  )
}
```

### useAnimation

```tsx
import { useAnimation } from '@/lib/animations'

function MyComponent() {
  // Utilise un variant prédéfini avec options
  const animationProps = useAnimation('fadeSlideUp', {
    delay: 0.2,
    duration: 0.5,
  })

  return <motion.div {...animationProps}>Contenu animé</motion.div>
}
```

### useWhileAnimation

```tsx
import { useWhileAnimation } from '@/lib/animations'

function Button() {
  const whileProps = useWhileAnimation({
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    focus: { scale: 1.01 },
  })

  return <motion.button {...whileProps}>Click me</motion.button>
}
```

### useStaggerAnimation

```tsx
import { useStaggerAnimation } from '@/lib/animations'

function MyList({ items }) {
  const { containerProps, itemProps } = useStaggerAnimation(items.length, {
    staggerDelay: 0.1,
    itemVariant: 'scale',
  })

  return (
    <motion.ul {...containerProps}>
      {items.map((item) => (
        <motion.li key={item.id} {...itemProps}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### useInViewAnimation

```tsx
import { useInViewAnimation } from '@/lib/animations'

function Section() {
  const { animationProps, isInView } = useInViewAnimation({
    threshold: 0.2,
    once: true,
    variant: 'fadeSlideUp',
  })

  return (
    <motion.section {...animationProps}>
      <h2>Cette section s'anime au scroll</h2>
    </motion.section>
  )
}
```

---

## Composants

### AnimatedContainer

```tsx
import { AnimatedContainer } from '@/lib/animations'

// Animation simple
<AnimatedContainer variant="fadeSlideUp">
  <h1>Titre</h1>
</AnimatedContainer>

// Avec stagger pour les enfants
<AnimatedContainer variant="fade" stagger>
  <Card />
  <Card />
  <Card />
</AnimatedContainer>

// Conditionnel avec AnimatePresence
<AnimatedContainer variant="fadeScale" show={isOpen}>
  <Modal />
</AnimatedContainer>

// Avec un tag personnalisé
<AnimatedContainer as="section" variant="slideUp">
  <Content />
</AnimatedContainer>
```

### AnimatedList

```tsx
import { AnimatedList } from '@/lib/animations'

;<AnimatedList
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />}
  staggerDelay={0.1}
  itemVariant="scale"
/>

// Pour les grilles
import { GridAnimatedList } from '@/lib/animations'

;<GridAnimatedList
  items={products}
  keyExtractor={(p) => p.id}
  renderItem={(p) => <ProductCard product={p} />}
  className="grid grid-cols-3 gap-4"
/>
```

### AnimatedPresence

```tsx
import { AnimatedPresence, AnimatedPresenceWait } from '@/lib/animations'

// Mode sync (défaut)
<AnimatedPresence>
  {isOpen && <Modal />}
</AnimatedPresence>

// Mode wait (séquentiel)
<AnimatedPresenceWait>
  {step === 1 && <Step1 />}
  {step === 2 && <Step2 />}
</AnimatedPresenceWait>
```

---

## Accessibilité

### prefers-reduced-motion

Le système respecte automatiquement `prefers-reduced-motion: reduce` :

- Les hooks (`useReducedMotion`) détectent la préférence
- Les composants (`AnimatedContainer`, `AnimatedList`) s'adaptent
- Les animations sont réduites ou remplacées par des fades simples

```tsx
// Force l'animation même en reduced-motion
<AnimatedContainer variant="slideUp" ignoreReducedMotion>
  <Content />
</AnimatedContainer>
```

### Guidelines WCAG 2.1

- **Critère 2.3.3** : Les animations respectent les préférences utilisateur
- **Durées** : Toutes les animations < 5 secondes
- **Contrôle** : L'utilisateur peut désactiver via les préférences système

---

## Performance

### Best Practices

1. **GPU Acceleration** : Utilise uniquement `transform` et `opacity`
2. **Will-change** : Géré automatiquement par Framer Motion
3. **Layout animations** : Utilise `layout` prop avec parcimonie

```tsx
// ✅ Bon - GPU accelerated
<motion.div animate={{ opacity: 1, x: 0 }} />

// ❌ Éviter - Déclenche des repaints
<motion.div animate={{ width: 200, height: 200 }} />
```

### LazyMotion

Pour réduire la taille du bundle :

```tsx
import { LazyMotion, domAnimation, m } from '@/lib/animations'

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  )
}
```

---

## Exemples complets

### Modal avec backdrop

```tsx
import {
  AnimatedPresence,
  overlayVariants,
  fadeScaleVariants,
  motion,
} from '@/lib/animations'

function Modal({ isOpen, onClose }) {
  return (
    <AnimatedPresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            variants={fadeScaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="rounded-lg bg-white p-6">Modal content</div>
          </motion.div>
        </>
      )}
    </AnimatedPresence>
  )
}
```

### Liste avec ajouts/suppressions animés

```tsx
import { AnimatedList } from '@/lib/animations'

function TodoList({ todos, onRemove }) {
  return (
    <AnimatedList
      items={todos}
      keyExtractor={(todo) => todo.id}
      renderItem={(todo) => (
        <div className="flex justify-between rounded bg-white p-4">
          <span>{todo.text}</span>
          <button onClick={() => onRemove(todo.id)}>Remove</button>
        </div>
      )}
      animatePresence
      presenceMode="popLayout"
      className="space-y-2"
    />
  )
}
```

### Page avec sections animées au scroll

```tsx
import { useInViewAnimation } from '@/lib/animations'

function Section({ title, children }) {
  const { animationProps } = useInViewAnimation({
    variant: 'fadeSlideUp',
    threshold: 0.2,
    once: true,
  })

  return (
    <motion.section {...animationProps} className="py-16">
      <h2>{title}</h2>
      {children}
    </motion.section>
  )
}

function Page() {
  return (
    <main>
      <Section title="Section 1">Content 1</Section>
      <Section title="Section 2">Content 2</Section>
      <Section title="Section 3">Content 3</Section>
    </main>
  )
}
```

---

## Changelog

### v1.0.0 (SP-379)

- Configuration initiale (durations, easings, springs)
- Variants complets (fade, slide, scale, stagger)
- Presets micro-interactions
- Hooks (useReducedMotion, useAnimation, useStaggerAnimation, useInViewAnimation)
- Composants (AnimatedContainer, AnimatedList, AnimatedPresence)
- Support complet de prefers-reduced-motion
- Documentation complète
