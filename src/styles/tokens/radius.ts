/**
 * Design Tokens - Border Radius SmartPlanning V2
 *
 * Direction esthétique : "Precision Engineering"
 * - Coins arrondis modérés pour un look professionnel mais moderne
 * - Cohérence avec les composants Shadcn/ui
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// BORDER RADIUS SCALE
// =============================================================================

/**
 * Échelle de border-radius
 */
export const borderRadius = {
  // Aucun arrondi
  none: '0',

  // Extra small - Badges, tags très compacts
  xs: '0.125rem', // 2px

  // Small - Inputs, badges
  sm: '0.25rem', // 4px

  // Medium - Défaut Shadcn/ui (--radius)
  md: '0.375rem', // 6px

  // Default - Cards, boutons
  DEFAULT: '0.5rem', // 8px

  // Large - Cards principales, modals
  lg: '0.75rem', // 12px

  // Extra large - Sections, containers
  xl: '1rem', // 16px

  // 2XL - Grandes sections
  '2xl': '1.5rem', // 24px

  // 3XL - Hero sections
  '3xl': '2rem', // 32px

  // Full - Cercles, pills
  full: '9999px',
} as const

// =============================================================================
// SEMANTIC RADIUS
// =============================================================================

/**
 * Border-radius sémantiques par type de composant
 * Utilise les valeurs de l'échelle ci-dessus
 */
export const semanticRadius = {
  // Boutons
  button: {
    xs: borderRadius.sm, // Boutons très petits
    sm: borderRadius.DEFAULT, // Boutons compacts
    md: borderRadius.DEFAULT, // Boutons standards
    lg: borderRadius.lg, // Grands boutons
    pill: borderRadius.full, // Boutons pill
  },

  // Inputs & Form elements
  input: {
    DEFAULT: borderRadius.md, // Input standard
    sm: borderRadius.sm, // Input compact
    lg: borderRadius.DEFAULT, // Input large
  },

  // Cards
  card: {
    sm: borderRadius.DEFAULT, // Petites cards
    DEFAULT: borderRadius.lg, // Cards standard
    lg: borderRadius.xl, // Grandes cards
  },

  // Badges & Tags
  badge: {
    DEFAULT: borderRadius.sm, // Badge standard
    rounded: borderRadius.full, // Badge arrondi
  },

  // Avatars
  avatar: {
    DEFAULT: borderRadius.full, // Avatar rond
    square: borderRadius.DEFAULT, // Avatar carré arrondi
  },

  // Modals & Dialogs
  modal: {
    DEFAULT: borderRadius.xl, // Modal standard
    lg: borderRadius['2xl'], // Grande modal
  },

  // Dropdowns & Popovers
  dropdown: borderRadius.lg,
  popover: borderRadius.lg,

  // Tooltips
  tooltip: borderRadius.md,

  // Alerts & Toasts
  alert: borderRadius.DEFAULT,
  toast: borderRadius.lg,

  // Navigation
  navItem: borderRadius.DEFAULT,
  tab: borderRadius.DEFAULT,

  // Tables
  table: borderRadius.lg,
  tableCell: borderRadius.sm,

  // Images & Media
  image: {
    sm: borderRadius.DEFAULT,
    DEFAULT: borderRadius.lg,
    lg: borderRadius.xl,
  },

  // Progress & Sliders
  progress: borderRadius.full,
  slider: borderRadius.full,
  sliderThumb: borderRadius.full,

  // Switches & Checkboxes
  switch: borderRadius.full,
  checkbox: borderRadius.sm,
  radio: borderRadius.full,

  // Skeletons
  skeleton: borderRadius.DEFAULT,
  skeletonText: borderRadius.sm,
  skeletonCircle: borderRadius.full,
} as const

// =============================================================================
// CORNER RADIUS (for specific corners)
// =============================================================================

/**
 * Utilitaires pour coins spécifiques
 * Utilisables avec les propriétés CSS individuelles
 */
export const cornerRadius = {
  // Top corners
  top: {
    sm: {
      topLeft: borderRadius.sm,
      topRight: borderRadius.sm,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.none,
    },
    md: {
      topLeft: borderRadius.DEFAULT,
      topRight: borderRadius.DEFAULT,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.none,
    },
    lg: {
      topLeft: borderRadius.lg,
      topRight: borderRadius.lg,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.none,
    },
  },

  // Bottom corners
  bottom: {
    sm: {
      topLeft: borderRadius.none,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.sm,
      bottomRight: borderRadius.sm,
    },
    md: {
      topLeft: borderRadius.none,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.DEFAULT,
      bottomRight: borderRadius.DEFAULT,
    },
    lg: {
      topLeft: borderRadius.none,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.lg,
      bottomRight: borderRadius.lg,
    },
  },

  // Left corners
  left: {
    sm: {
      topLeft: borderRadius.sm,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.sm,
      bottomRight: borderRadius.none,
    },
    md: {
      topLeft: borderRadius.DEFAULT,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.DEFAULT,
      bottomRight: borderRadius.none,
    },
    lg: {
      topLeft: borderRadius.lg,
      topRight: borderRadius.none,
      bottomLeft: borderRadius.lg,
      bottomRight: borderRadius.none,
    },
  },

  // Right corners
  right: {
    sm: {
      topLeft: borderRadius.none,
      topRight: borderRadius.sm,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.sm,
    },
    md: {
      topLeft: borderRadius.none,
      topRight: borderRadius.DEFAULT,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.DEFAULT,
    },
    lg: {
      topLeft: borderRadius.none,
      topRight: borderRadius.lg,
      bottomLeft: borderRadius.none,
      bottomRight: borderRadius.lg,
    },
  },
} as const

// =============================================================================
// BORDER WIDTH TOKENS
// =============================================================================

/**
 * Épaisseurs de bordures
 */
export const borderWidth = {
  0: '0px',
  DEFAULT: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

// =============================================================================
// RING TOKENS (focus rings)
// =============================================================================

/**
 * Tokens pour les anneaux de focus
 */
export const ring = {
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    DEFAULT: '3px',
    4: '4px',
    8: '8px',
  },
  offset: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
} as const

// =============================================================================
// OUTLINE TOKENS
// =============================================================================

/**
 * Tokens pour les outlines
 */
export const outline = {
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  offset: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
} as const

// =============================================================================
// EXPORTS
// =============================================================================

export const radiusTokens = {
  borderRadius,
  semantic: semanticRadius,
  corner: cornerRadius,
  borderWidth,
  ring,
  outline,
} as const

export type BorderRadiusSize = keyof typeof borderRadius
export type BorderWidthSize = keyof typeof borderWidth
export type RingWidthSize = keyof typeof ring.width
export type SemanticRadiusCategory = keyof typeof semanticRadius

export default radiusTokens
