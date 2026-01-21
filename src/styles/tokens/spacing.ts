/**
 * Design Tokens - Espacements SmartPlanning V2
 *
 * Échelle basée sur une unité de base de 4px (0.25rem)
 * Permet une cohérence visuelle et un rythme vertical harmonieux
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// SPACING SCALE - Échelle d'espacement
// =============================================================================

/**
 * Échelle d'espacement en rem (base 4px)
 * Valeurs calculées : n * 0.25rem
 */
export const spacing = {
  // Micro spacings
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px

  // Standard spacings
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px

  // Large spacings
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px

  // Extra large spacings
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// =============================================================================
// SEMANTIC SPACING - Espacements sémantiques
// =============================================================================

/**
 * Espacements sémantiques pour une utilisation cohérente
 */
export const semanticSpacing = {
  // Padding interne des composants
  component: {
    xs: spacing[1], // 4px - Très compact
    sm: spacing[2], // 8px - Compact
    md: spacing[3], // 12px - Standard
    lg: spacing[4], // 16px - Confortable
    xl: spacing[6], // 24px - Spacieux
  },

  // Gaps entre éléments
  gap: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
    '2xl': spacing[12], // 48px
  },

  // Sections de page
  section: {
    sm: spacing[8], // 32px
    md: spacing[12], // 48px
    lg: spacing[16], // 64px
    xl: spacing[24], // 96px
    '2xl': spacing[32], // 128px
  },

  // Container padding
  container: {
    sm: spacing[4], // 16px - Mobile
    md: spacing[6], // 24px - Tablet
    lg: spacing[8], // 32px - Desktop
  },

  // Inline spacing (texte et icônes)
  inline: {
    xs: spacing[0.5], // 2px
    sm: spacing[1], // 4px
    md: spacing[2], // 8px
    lg: spacing[3], // 12px
  },

  // Stack spacing (éléments empilés)
  stack: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
  },

  // Card internal spacing
  card: {
    padding: {
      sm: spacing[3], // 12px
      md: spacing[4], // 16px
      lg: spacing[6], // 24px
    },
    gap: {
      sm: spacing[2], // 8px
      md: spacing[4], // 16px
      lg: spacing[6], // 24px
    },
  },

  // Form elements
  form: {
    labelGap: spacing[1.5], // 6px - Espace entre label et input
    inputPadding: {
      x: spacing[3], // 12px
      y: spacing[2], // 8px
    },
    fieldGap: spacing[4], // 16px - Entre les champs
    groupGap: spacing[6], // 24px - Entre les groupes
    sectionGap: spacing[8], // 32px - Entre les sections
  },

  // Table
  table: {
    cellPadding: {
      x: spacing[4], // 16px
      y: spacing[3], // 12px
    },
    headerPadding: {
      x: spacing[4], // 16px
      y: spacing[3], // 12px
    },
  },

  // Modal / Dialog
  modal: {
    padding: spacing[6], // 24px
    headerGap: spacing[4], // 16px
    footerGap: spacing[4], // 16px
    contentGap: spacing[4], // 16px
  },

  // Navigation
  nav: {
    itemPadding: {
      x: spacing[4], // 16px
      y: spacing[2], // 8px
    },
    groupGap: spacing[6], // 24px
    sectionGap: spacing[8], // 32px
  },

  // Sidebar
  sidebar: {
    padding: spacing[4], // 16px
    itemGap: spacing[1], // 4px
    sectionGap: spacing[6], // 24px
  },
} as const

// =============================================================================
// SIZE TOKENS - Dimensions fixes
// =============================================================================

/**
 * Tailles fixes pour éléments spécifiques
 */
export const sizes = {
  // Icons
  icon: {
    xs: '0.75rem', // 12px
    sm: '1rem', // 16px
    md: '1.25rem', // 20px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
  },

  // Avatars
  avatar: {
    xs: '1.5rem', // 24px
    sm: '2rem', // 32px
    md: '2.5rem', // 40px
    lg: '3rem', // 48px
    xl: '4rem', // 64px
    '2xl': '6rem', // 96px
  },

  // Buttons height
  button: {
    xs: '1.75rem', // 28px
    sm: '2rem', // 32px
    md: '2.5rem', // 40px
    lg: '2.75rem', // 44px
    xl: '3rem', // 48px
  },

  // Input height
  input: {
    sm: '2rem', // 32px
    md: '2.5rem', // 40px
    lg: '2.75rem', // 44px
  },

  // Badge
  badge: {
    sm: '1.25rem', // 20px
    md: '1.5rem', // 24px
    lg: '1.75rem', // 28px
  },

  // Sidebar
  sidebar: {
    collapsed: '4rem', // 64px
    expanded: '16rem', // 256px
    wide: '20rem', // 320px
  },

  // Header
  header: {
    sm: '3rem', // 48px
    md: '4rem', // 64px
    lg: '5rem', // 80px
  },
} as const

// =============================================================================
// CONTAINER WIDTHS
// =============================================================================

export const containerWidths = {
  xs: '20rem', // 320px
  sm: '24rem', // 384px
  md: '28rem', // 448px
  lg: '32rem', // 512px
  xl: '36rem', // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
  '6xl': '72rem', // 1152px
  '7xl': '80rem', // 1280px
  full: '100%',
  screen: '100vw',
} as const

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// =============================================================================
// EXPORTS
// =============================================================================

export const spacingTokens = {
  spacing,
  semantic: semanticSpacing,
  sizes,
  containerWidths,
  breakpoints,
} as const

export type SpacingKey = keyof typeof spacing
export type SemanticSpacingCategory = keyof typeof semanticSpacing
export type SizeCategory = keyof typeof sizes
export type Breakpoint = keyof typeof breakpoints

export default spacingTokens
