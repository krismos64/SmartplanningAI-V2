/**
 * Design Tokens - Ombres SmartPlanning V2
 *
 * Direction esthétique : "Precision Engineering"
 * - Ombres avec une légère teinte bleue pour cohérence avec la marque
 * - Ombres douces et sophistiquées pour un look premium
 * - Support complet du dark mode
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// BOX SHADOWS - Light Mode
// =============================================================================

/**
 * Ombres de boîte pour le mode clair
 * Teinte bleue subtile (rgba blue) pour cohérence avec la marque
 */
export const boxShadowLight = {
  // Aucune ombre
  none: 'none',

  // Extra small - Subtile elevation
  xs: '0 1px 2px 0 rgba(59, 130, 246, 0.03)',

  // Small - Boutons, badges
  sm: '0 1px 3px 0 rgba(59, 130, 246, 0.06), 0 1px 2px -1px rgba(59, 130, 246, 0.06)',

  // Medium - Cards au repos
  md: '0 4px 6px -1px rgba(59, 130, 246, 0.07), 0 2px 4px -2px rgba(59, 130, 246, 0.05)',

  // Large - Cards hover, dropdowns
  lg: '0 10px 15px -3px rgba(59, 130, 246, 0.08), 0 4px 6px -4px rgba(59, 130, 246, 0.05)',

  // Extra large - Modals, popovers
  xl: '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.05)',

  // 2XL - Éléments flottants majeurs
  '2xl': '0 25px 50px -12px rgba(59, 130, 246, 0.15)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(59, 130, 246, 0.04)',
  innerLg: 'inset 0 4px 8px 0 rgba(59, 130, 246, 0.06)',
} as const

// =============================================================================
// BOX SHADOWS - Dark Mode
// =============================================================================

/**
 * Ombres de boîte pour le mode sombre
 * Plus prononcées pour créer du contraste sur fond sombre
 */
export const boxShadowDark = {
  none: 'none',

  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',

  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',

  md: '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -2px rgba(0, 0, 0, 0.25)',

  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.25)',

  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',

  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
} as const

// =============================================================================
// SEMANTIC SHADOWS
// =============================================================================

/**
 * Ombres sémantiques par type de composant
 */
export const semanticShadows = {
  light: {
    // Cards
    card: {
      DEFAULT: boxShadowLight.md,
      hover: boxShadowLight.lg,
      active: boxShadowLight.sm,
    },

    // Buttons
    button: {
      DEFAULT: boxShadowLight.sm,
      hover: boxShadowLight.md,
      active: 'none',
      // Bouton primary avec glow bleu
      primary: '0 4px 14px 0 rgba(59, 130, 246, 0.35)',
      primaryHover: '0 6px 20px 0 rgba(59, 130, 246, 0.45)',
    },

    // Inputs
    input: {
      DEFAULT: boxShadowLight.xs,
      focus: '0 0 0 3px rgba(59, 130, 246, 0.15)',
      error: '0 0 0 3px rgba(225, 29, 72, 0.15)',
      success: '0 0 0 3px rgba(16, 185, 129, 0.15)',
    },

    // Dropdowns & Popovers
    dropdown: boxShadowLight.lg,
    popover: boxShadowLight.xl,

    // Modal & Dialog
    modal: boxShadowLight['2xl'],
    dialog: boxShadowLight.xl,

    // Navigation
    header: '0 1px 3px 0 rgba(59, 130, 246, 0.05)',
    sidebar: '1px 0 3px 0 rgba(59, 130, 246, 0.05)',

    // Floating elements
    tooltip: boxShadowLight.md,
    toast: boxShadowLight.lg,

    // Tables
    tableRow: {
      hover: boxShadowLight.xs,
      selected: boxShadowLight.sm,
    },

    // Avatars
    avatar: boxShadowLight.sm,
    avatarHover: boxShadowLight.md,
  },

  dark: {
    card: {
      DEFAULT: boxShadowDark.md,
      hover: boxShadowDark.lg,
      active: boxShadowDark.sm,
    },

    button: {
      DEFAULT: boxShadowDark.sm,
      hover: boxShadowDark.md,
      active: 'none',
      primary: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
      primaryHover: '0 6px 20px 0 rgba(59, 130, 246, 0.35)',
    },

    input: {
      DEFAULT: boxShadowDark.xs,
      focus: '0 0 0 3px rgba(96, 165, 250, 0.25)',
      error: '0 0 0 3px rgba(251, 113, 133, 0.25)',
      success: '0 0 0 3px rgba(52, 211, 153, 0.25)',
    },

    dropdown: boxShadowDark.lg,
    popover: boxShadowDark.xl,

    modal: boxShadowDark['2xl'],
    dialog: boxShadowDark.xl,

    header: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    sidebar: '1px 0 3px 0 rgba(0, 0, 0, 0.3)',

    tooltip: boxShadowDark.md,
    toast: boxShadowDark.lg,

    tableRow: {
      hover: boxShadowDark.xs,
      selected: boxShadowDark.sm,
    },

    avatar: boxShadowDark.sm,
    avatarHover: boxShadowDark.md,
  },
} as const

// =============================================================================
// DROP SHADOWS (pour filter: drop-shadow)
// =============================================================================

/**
 * Drop shadows pour les éléments avec formes complexes (SVG, images)
 */
export const dropShadow = {
  none: 'drop-shadow(0 0 0 transparent)',
  xs: 'drop-shadow(0 1px 1px rgba(59, 130, 246, 0.05))',
  sm: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.1))',
  md: 'drop-shadow(0 3px 3px rgba(59, 130, 246, 0.1))',
  lg: 'drop-shadow(0 4px 4px rgba(59, 130, 246, 0.12))',
  xl: 'drop-shadow(0 9px 7px rgba(59, 130, 246, 0.08))',
  '2xl': 'drop-shadow(0 25px 25px rgba(59, 130, 246, 0.1))',
} as const

// =============================================================================
// TEXT SHADOWS
// =============================================================================

/**
 * Ombres de texte pour effet de profondeur
 */
export const textShadow = {
  none: 'none',
  xs: '0 1px 1px rgba(0, 0, 0, 0.1)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.15)',
  md: '0 2px 4px rgba(0, 0, 0, 0.15)',
  lg: '0 4px 8px rgba(0, 0, 0, 0.2)',
  // Glow effect pour titres hero
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
  glowSoft: '0 0 40px rgba(59, 130, 246, 0.3)',
} as const

// =============================================================================
// GLOW EFFECTS
// =============================================================================

/**
 * Effets de glow colorés pour éléments interactifs
 */
export const glow = {
  // Primary glow
  primary: {
    sm: '0 0 10px rgba(59, 130, 246, 0.3)',
    md: '0 0 20px rgba(59, 130, 246, 0.4)',
    lg: '0 0 40px rgba(59, 130, 246, 0.5)',
  },

  // Accent glow (cyan)
  accent: {
    sm: '0 0 10px rgba(6, 182, 212, 0.3)',
    md: '0 0 20px rgba(6, 182, 212, 0.4)',
    lg: '0 0 40px rgba(6, 182, 212, 0.5)',
  },

  // Success glow
  success: {
    sm: '0 0 10px rgba(16, 185, 129, 0.3)',
    md: '0 0 20px rgba(16, 185, 129, 0.4)',
    lg: '0 0 40px rgba(16, 185, 129, 0.5)',
  },

  // Error glow
  error: {
    sm: '0 0 10px rgba(225, 29, 72, 0.3)',
    md: '0 0 20px rgba(225, 29, 72, 0.4)',
    lg: '0 0 40px rgba(225, 29, 72, 0.5)',
  },

  // Warning glow
  warning: {
    sm: '0 0 10px rgba(245, 158, 11, 0.3)',
    md: '0 0 20px rgba(245, 158, 11, 0.4)',
    lg: '0 0 40px rgba(245, 158, 11, 0.5)',
  },
} as const

// =============================================================================
// EXPORTS
// =============================================================================

export const shadows = {
  boxShadow: {
    light: boxShadowLight,
    dark: boxShadowDark,
  },
  semantic: semanticShadows,
  dropShadow,
  textShadow,
  glow,
} as const

export type BoxShadowSize = keyof typeof boxShadowLight
export type DropShadowSize = keyof typeof dropShadow
export type TextShadowSize = keyof typeof textShadow
export type GlowColor = keyof typeof glow
export type GlowSize = 'sm' | 'md' | 'lg'

export default shadows
