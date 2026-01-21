/**
 * Design Tokens - Couleurs SmartPlanning V2
 *
 * Architecture : Primitive tokens → Semantic tokens
 * Direction esthétique : "Precision Engineering" - Professionnel et sophistiqué
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// PRIMITIVE TOKENS - Couleurs de base (ne pas utiliser directement dans les composants)
// =============================================================================

/**
 * Palette Slate - Gris neutres avec une touche froide
 * Utilisé pour : backgrounds, textes, bordures
 */
export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const

/**
 * Palette Blue - Bleu SmartPlanning signature
 * Couleur principale de l'application
 */
export const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6', // Primary - Bleu SmartPlanning
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const

/**
 * Palette Cyan - Accent moderne et technologique
 * Utilisé pour : highlights, liens, éléments interactifs
 */
export const cyan = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4',
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
} as const

/**
 * Palette Emerald - Succès et validation
 */
export const emerald = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
} as const

/**
 * Palette Amber - Alertes et avertissements
 */
export const amber = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const

/**
 * Palette Rose - Erreurs et destructif
 * Rose plutôt que rouge pur pour plus de sophistication
 */
export const rose = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
  950: '#4c0519',
} as const

/**
 * Palette Violet - Accent secondaire premium
 * Utilisé pour : éléments premium, badges spéciaux
 */
export const violet = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
} as const

// =============================================================================
// SEMANTIC TOKENS - Couleurs fonctionnelles (utiliser dans les composants)
// =============================================================================

/**
 * Tokens sémantiques Light Mode
 * Format HSL pour compatibilité avec Tailwind CSS et CSS variables
 */
export const semanticLight = {
  // Backgrounds
  background: {
    DEFAULT: '0 0% 100%', // #ffffff
    subtle: '210 40% 98%', // Légèrement teinté
    muted: '210 40% 96.1%', // Plus prononcé
    emphasis: '222.2 84% 4.9%', // Inversé pour emphasis
  },

  // Foreground (textes)
  foreground: {
    DEFAULT: '222.2 84% 4.9%', // Presque noir
    muted: '215.4 16.3% 46.9%', // Gris moyen
    subtle: '215 20% 65%', // Gris clair
  },

  // Primary - Bleu SmartPlanning
  primary: {
    DEFAULT: '217 91% 60%', // #3b82f6
    hover: '217 91% 55%', // Plus foncé au hover
    active: '217 91% 50%', // Plus foncé au clic
    foreground: '210 40% 98%', // Texte sur primary
    muted: '217 91% 95%', // Background léger
  },

  // Secondary - Bleu foncé
  secondary: {
    DEFAULT: '217 78% 51%', // #1c62e3
    hover: '217 78% 46%',
    active: '217 78% 41%',
    foreground: '210 40% 98%',
    muted: '217 78% 95%',
  },

  // Accent - Cyan moderne
  accent: {
    DEFAULT: '189 94% 43%', // #06b6d4
    hover: '189 94% 38%',
    active: '189 94% 33%',
    foreground: '222.2 47.4% 11.2%',
    muted: '189 94% 95%',
  },

  // Success - Emerald
  success: {
    DEFAULT: '160 84% 39%', // #10b981
    hover: '160 84% 34%',
    active: '160 84% 29%',
    foreground: '210 40% 98%',
    muted: '160 84% 95%',
    border: '160 60% 45%',
  },

  // Warning - Amber
  warning: {
    DEFAULT: '38 92% 50%', // #f59e0b
    hover: '38 92% 45%',
    active: '38 92% 40%',
    foreground: '222.2 47.4% 11.2%',
    muted: '38 92% 95%',
    border: '38 75% 55%',
  },

  // Error/Destructive - Rose
  destructive: {
    DEFAULT: '347 77% 50%', // #e11d48
    hover: '347 77% 45%',
    active: '347 77% 40%',
    foreground: '210 40% 98%',
    muted: '347 77% 95%',
    border: '347 60% 55%',
  },

  // Info - Blue clair
  info: {
    DEFAULT: '199 89% 48%', // #0ea5e9
    hover: '199 89% 43%',
    active: '199 89% 38%',
    foreground: '210 40% 98%',
    muted: '199 89% 95%',
    border: '199 70% 55%',
  },

  // Surfaces (Cards, Popovers)
  card: {
    DEFAULT: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    hover: '210 40% 98%',
  },

  popover: {
    DEFAULT: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
  },

  // Éléments UI
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '217 91% 60%',

  // Sidebar
  sidebar: {
    background: '0 0% 98%',
    foreground: '240 5.3% 26.1%',
    primary: '217 91% 60%',
    primaryForeground: '0 0% 98%',
    accent: '240 4.8% 95.9%',
    accentForeground: '240 5.9% 10%',
    border: '220 13% 91%',
    ring: '217 91% 60%',
  },
} as const

/**
 * Tokens sémantiques Dark Mode
 */
export const semanticDark = {
  // Backgrounds
  background: {
    DEFAULT: '222.2 84% 4.9%', // Bleu très foncé
    subtle: '217 32.6% 10%',
    muted: '217 32.6% 17.5%',
    emphasis: '210 40% 98%',
  },

  // Foreground (textes)
  foreground: {
    DEFAULT: '210 40% 98%',
    muted: '215 20.2% 65.1%',
    subtle: '215 20% 45%',
  },

  // Primary - Bleu plus lumineux en dark
  primary: {
    DEFAULT: '217 91% 65%',
    hover: '217 91% 70%',
    active: '217 91% 75%',
    foreground: '222.2 47.4% 11.2%',
    muted: '217 91% 15%',
  },

  // Secondary
  secondary: {
    DEFAULT: '217 78% 60%',
    hover: '217 78% 65%',
    active: '217 78% 70%',
    foreground: '222.2 47.4% 11.2%',
    muted: '217 78% 15%',
  },

  // Accent - Cyan
  accent: {
    DEFAULT: '189 94% 50%',
    hover: '189 94% 55%',
    active: '189 94% 60%',
    foreground: '222.2 47.4% 11.2%',
    muted: '189 94% 15%',
  },

  // Success
  success: {
    DEFAULT: '160 84% 45%',
    hover: '160 84% 50%',
    active: '160 84% 55%',
    foreground: '222.2 47.4% 11.2%',
    muted: '160 84% 15%',
    border: '160 60% 35%',
  },

  // Warning
  warning: {
    DEFAULT: '38 92% 55%',
    hover: '38 92% 60%',
    active: '38 92% 65%',
    foreground: '222.2 47.4% 11.2%',
    muted: '38 92% 15%',
    border: '38 75% 40%',
  },

  // Destructive
  destructive: {
    DEFAULT: '347 77% 55%',
    hover: '347 77% 60%',
    active: '347 77% 65%',
    foreground: '210 40% 98%',
    muted: '347 77% 15%',
    border: '347 60% 40%',
  },

  // Info
  info: {
    DEFAULT: '199 89% 55%',
    hover: '199 89% 60%',
    active: '199 89% 65%',
    foreground: '222.2 47.4% 11.2%',
    muted: '199 89% 15%',
    border: '199 70% 40%',
  },

  // Surfaces
  card: {
    DEFAULT: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    hover: '217 32.6% 10%',
  },

  popover: {
    DEFAULT: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
  },

  // Éléments UI
  border: '217 32.6% 17.5%',
  input: '217 32.6% 17.5%',
  ring: '217 91% 65%',

  // Sidebar
  sidebar: {
    background: '240 5.9% 10%',
    foreground: '240 4.8% 95.9%',
    primary: '217 91% 65%',
    primaryForeground: '0 0% 100%',
    accent: '240 3.7% 15.9%',
    accentForeground: '240 4.8% 95.9%',
    border: '240 3.7% 15.9%',
    ring: '217 91% 65%',
  },
} as const

// =============================================================================
// EXPORTS & UTILITIES
// =============================================================================

/**
 * Toutes les palettes primitives
 */
export const primitiveColors = {
  slate,
  blue,
  cyan,
  emerald,
  amber,
  rose,
  violet,
} as const

/**
 * Tokens sémantiques par thème
 */
export const semanticColors = {
  light: semanticLight,
  dark: semanticDark,
} as const

/**
 * Type pour les couleurs primitives
 */
export type PrimitiveColor = keyof typeof primitiveColors
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

/**
 * Fonction utilitaire pour obtenir une couleur avec opacité
 * @param hsl - Valeur HSL (ex: "217 91% 60%")
 * @param opacity - Opacité (0-1)
 */
export function withOpacity(hsl: string, opacity: number): string {
  return `hsl(${hsl} / ${opacity})`
}

/**
 * Fonction pour convertir HSL en valeur CSS variable
 */
export function toHslVar(name: string): string {
  return `hsl(var(--${name}))`
}

export default {
  primitive: primitiveColors,
  semantic: semanticColors,
  withOpacity,
  toHslVar,
}
