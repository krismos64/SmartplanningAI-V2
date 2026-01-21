/**
 * Design Tokens - Typographie SmartPlanning V2
 *
 * Direction esthétique : "Precision Engineering"
 * - Titres : Rajdhani (déjà configuré) - Moderne, technique, distinctif
 * - Corps : Plus Jakarta Sans - Lisible, professionnel, caractère
 * - Code : JetBrains Mono - Développeur-friendly
 *
 * @see SP-259 - Design Tokens
 */

// =============================================================================
// FONT FAMILIES
// =============================================================================

/**
 * Familles de polices avec fallbacks
 */
export const fontFamily = {
  // Police display pour titres - Rajdhani
  display: ['Rajdhani', 'system-ui', 'sans-serif'],

  // Police principale pour le corps - Plus Jakarta Sans
  sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],

  // Police pour code - JetBrains Mono
  mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],

  // Police serif pour citations ou textes spéciaux
  serif: ['Merriweather', 'Georgia', 'Times New Roman', 'serif'],
} as const

/**
 * Configuration Google Fonts pour Next.js
 */
export const googleFontsConfig = {
  rajdhani: {
    family: 'Rajdhani',
    weights: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
  },
  plusJakartaSans: {
    family: 'Plus Jakarta Sans',
    weights: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
  },
  jetbrainsMono: {
    family: 'JetBrains Mono',
    weights: ['400', '500', '600'],
    subsets: ['latin'],
    display: 'swap',
  },
} as const

// =============================================================================
// FONT SIZES - Échelle typographique modulaire (ratio 1.25 - Major Third)
// =============================================================================

/**
 * Tailles de police avec line-height optimisé
 * Basé sur une échelle modulaire ratio 1.25
 */
export const fontSize = {
  // Extra small - Labels, captions
  xs: {
    size: '0.75rem', // 12px
    lineHeight: '1rem', // 16px
    letterSpacing: '0.025em',
  },

  // Small - Texte secondaire, hints
  sm: {
    size: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    letterSpacing: '0.01em',
  },

  // Base - Corps de texte principal
  base: {
    size: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
    letterSpacing: '0',
  },

  // Large - Texte mis en avant
  lg: {
    size: '1.125rem', // 18px
    lineHeight: '1.75rem', // 28px
    letterSpacing: '-0.01em',
  },

  // Extra Large - Sous-titres
  xl: {
    size: '1.25rem', // 20px
    lineHeight: '1.75rem', // 28px
    letterSpacing: '-0.01em',
  },

  // 2XL - Titres de section
  '2xl': {
    size: '1.5rem', // 24px
    lineHeight: '2rem', // 32px
    letterSpacing: '-0.02em',
  },

  // 3XL - Titres de page
  '3xl': {
    size: '1.875rem', // 30px
    lineHeight: '2.25rem', // 36px
    letterSpacing: '-0.02em',
  },

  // 4XL - Titres majeurs
  '4xl': {
    size: '2.25rem', // 36px
    lineHeight: '2.5rem', // 40px
    letterSpacing: '-0.025em',
  },

  // 5XL - Hero titles
  '5xl': {
    size: '3rem', // 48px
    lineHeight: '1.1',
    letterSpacing: '-0.025em',
  },

  // 6XL - Display large
  '6xl': {
    size: '3.75rem', // 60px
    lineHeight: '1',
    letterSpacing: '-0.03em',
  },

  // 7XL - Display extra large
  '7xl': {
    size: '4.5rem', // 72px
    lineHeight: '1',
    letterSpacing: '-0.03em',
  },

  // 8XL - Display jumbo
  '8xl': {
    size: '6rem', // 96px
    lineHeight: '1',
    letterSpacing: '-0.04em',
  },

  // 9XL - Display massive
  '9xl': {
    size: '8rem', // 128px
    lineHeight: '1',
    letterSpacing: '-0.04em',
  },
} as const

// =============================================================================
// FONT WEIGHTS
// =============================================================================

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// =============================================================================
// LINE HEIGHTS
// =============================================================================

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
  // Valeurs spécifiques pour titres display
  display: '1.1',
  heading: '1.2',
  body: '1.6',
} as const

// =============================================================================
// LETTER SPACING
// =============================================================================

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
  // Spécifiques
  heading: '-0.02em',
  display: '-0.03em',
  caps: '0.1em', // Pour texte en majuscules
} as const

// =============================================================================
// TEXT STYLES - Combinaisons prédéfinies
// =============================================================================

/**
 * Styles de texte prêts à l'emploi
 * Utilisables directement dans les composants
 */
export const textStyles = {
  // Display - Hero sections
  displayLarge: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['6xl'].size,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.display,
    fontWeight: fontWeight.bold,
  },

  displayMedium: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['5xl'].size,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.display,
    fontWeight: fontWeight.bold,
  },

  displaySmall: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['4xl'].size,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.heading,
    fontWeight: fontWeight.bold,
  },

  // Headings
  h1: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['3xl'].size,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.heading,
    fontWeight: fontWeight.bold,
  },

  h2: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['2xl'].size,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.heading,
    fontWeight: fontWeight.semibold,
  },

  h3: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl.size,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
    fontWeight: fontWeight.semibold,
  },

  h4: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg.size,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
    fontWeight: fontWeight.medium,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg.size,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  bodyBase: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base.size,
    lineHeight: lineHeight.body,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm.size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  // Labels & Captions
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.medium,
  },

  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.normal,
  },

  overline: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.caps,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase' as const,
  },

  // Code
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm.size,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  codeBlock: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm.size,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
    fontWeight: fontWeight.normal,
  },

  // Buttons
  buttonLarge: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.semibold,
  },

  buttonBase: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.semibold,
  },

  buttonSmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs.size,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
    fontWeight: fontWeight.semibold,
  },
} as const

// =============================================================================
// EXPORTS
// =============================================================================

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  googleFontsConfig,
} as const

export type FontSize = keyof typeof fontSize
export type FontWeight = keyof typeof fontWeight
export type LineHeight = keyof typeof lineHeight
export type LetterSpacing = keyof typeof letterSpacing
export type TextStyle = keyof typeof textStyles

export default typography
