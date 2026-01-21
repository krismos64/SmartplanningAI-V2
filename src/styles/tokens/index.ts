/**
 * Design Tokens - Index SmartPlanning V2
 *
 * Point d'entrée centralisé pour tous les design tokens
 * Import unique : import { tokens } from '@/styles/tokens'
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// IMPORTS
// =============================================================================

import colors, {
  primitiveColors,
  semanticColors,
  semanticLight,
  semanticDark,
  slate,
  blue,
  cyan,
  emerald,
  amber,
  rose,
  violet,
  withOpacity,
  toHslVar,
  type PrimitiveColor,
  type ColorShade,
} from './colors'

import typography, {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  googleFontsConfig,
  type FontSize,
  type FontWeight,
  type LineHeight,
  type LetterSpacing,
  type TextStyle,
} from './typography'

import spacing, {
  spacing as spacingScale,
  semanticSpacing,
  sizes,
  containerWidths,
  breakpoints,
  type SpacingKey,
  type SemanticSpacingCategory,
  type SizeCategory,
  type Breakpoint,
} from './spacing'

import shadows, {
  boxShadowLight,
  boxShadowDark,
  semanticShadows,
  dropShadow,
  textShadow,
  glow,
  type BoxShadowSize,
  type DropShadowSize,
  type TextShadowSize,
  type GlowColor,
  type GlowSize,
} from './shadows'

import radius, {
  borderRadius,
  semanticRadius,
  cornerRadius,
  borderWidth,
  ring,
  outline,
  type BorderRadiusSize,
  type BorderWidthSize,
  type RingWidthSize,
  type SemanticRadiusCategory,
} from './radius'

// =============================================================================
// MAIN EXPORT - Design Tokens Object
// =============================================================================

/**
 * Objet principal contenant tous les design tokens
 *
 * @example
 * ```tsx
 * import { tokens } from '@/styles/tokens'
 *
 * // Accès aux couleurs
 * const primaryColor = tokens.colors.blue[500]
 *
 * // Accès à la typographie
 * const headingStyle = tokens.typography.textStyles.h1
 *
 * // Accès aux espacements
 * const padding = tokens.spacing.scale[4]
 * ```
 */
export const tokens = {
  // Couleurs
  colors: {
    primitive: primitiveColors,
    semantic: semanticColors,
    // Accès direct aux palettes
    slate,
    blue,
    cyan,
    emerald,
    amber,
    rose,
    violet,
  },

  // Typographie
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textStyles,
    googleFontsConfig,
  },

  // Espacements
  spacing: {
    scale: spacingScale,
    semantic: semanticSpacing,
    sizes,
    containerWidths,
    breakpoints,
  },

  // Ombres
  shadows: {
    boxShadow: {
      light: boxShadowLight,
      dark: boxShadowDark,
    },
    semantic: semanticShadows,
    dropShadow,
    textShadow,
    glow,
  },

  // Border Radius
  radius: {
    scale: borderRadius,
    semantic: semanticRadius,
    corner: cornerRadius,
    borderWidth,
    ring,
    outline,
  },
} as const

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Utilitaires pour manipuler les tokens
 */
export const utils = {
  /**
   * Ajoute une opacité à une couleur HSL
   */
  withOpacity,

  /**
   * Convertit un nom en variable CSS HSL
   */
  toHslVar,

  /**
   * Génère une valeur CSS var pour un token
   */
  cssVar: (name: string): string => `var(--${name})`,

  /**
   * Génère une valeur HSL avec CSS var
   */
  hslVar: (name: string): string => `hsl(var(--${name}))`,
} as const

// =============================================================================
// THEME EXPORTS (for Tailwind config)
// =============================================================================

/**
 * Export formaté pour tailwind.config.ts
 * Prêt à être spread dans la configuration Tailwind
 */
export const tailwindTheme = {
  colors: {
    // Couleurs primitives
    slate,
    blue,
    cyan,
    emerald,
    amber,
    rose,
    violet,
  },

  fontFamily: {
    display: fontFamily.display,
    sans: fontFamily.sans,
    mono: fontFamily.mono,
    serif: fontFamily.serif,
  },

  fontSize: Object.fromEntries(
    Object.entries(fontSize).map(([key, value]) => [
      key,
      [
        value.size,
        { lineHeight: value.lineHeight, letterSpacing: value.letterSpacing },
      ],
    ])
  ),

  spacing: spacingScale,

  borderRadius,

  boxShadow: boxShadowLight,

  dropShadow: Object.fromEntries(
    Object.entries(dropShadow).map(([key, value]) => [
      key,
      value.replace('drop-shadow(', '').replace(')', ''),
    ])
  ),
} as const

// =============================================================================
// CSS VARIABLES EXPORT (for globals.css)
// =============================================================================

/**
 * Génère les CSS variables pour le thème light
 */
export const cssVariablesLight = semanticLight

/**
 * Génère les CSS variables pour le thème dark
 */
export const cssVariablesDark = semanticDark

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Colors
  PrimitiveColor,
  ColorShade,
  // Typography
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TextStyle,
  // Spacing
  SpacingKey,
  SemanticSpacingCategory,
  SizeCategory,
  Breakpoint,
  // Shadows
  BoxShadowSize,
  DropShadowSize,
  TextShadowSize,
  GlowColor,
  GlowSize,
  // Radius
  BorderRadiusSize,
  BorderWidthSize,
  RingWidthSize,
  SemanticRadiusCategory,
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

export {
  // Colors module
  colors,
  primitiveColors,
  semanticColors,
  semanticLight,
  semanticDark,
  slate,
  blue,
  cyan,
  emerald,
  amber,
  rose,
  violet,
  withOpacity,
  toHslVar,
  // Typography module
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  googleFontsConfig,
  // Spacing module
  spacing,
  spacingScale,
  semanticSpacing,
  sizes,
  containerWidths,
  breakpoints,
  // Shadows module
  shadows,
  boxShadowLight,
  boxShadowDark,
  semanticShadows,
  dropShadow,
  textShadow,
  glow,
  // Radius module
  radius,
  borderRadius,
  semanticRadius,
  cornerRadius,
  borderWidth,
  ring,
  outline,
}

// Default export
export default tokens
