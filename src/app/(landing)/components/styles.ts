/**
 * Shared styles constants for landing pages
 * Centralizes repeated class patterns to avoid duplication
 *
 * @see SP-285 - Page À propos refactoring
 */

/**
 * Primary CTA button — solid blue-600 for WCAG AA contrast on white text
 * (token --primary at HSL 217 91% 60% = #5593f7 fails AA 4.5:1 with white text).
 * Used in: HeroSection, CTASection, AboutContent, Auth pages.
 */
export const PRIMARY_BUTTON_CLASSES =
  'h-14 bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700'

/**
 * Highlight text — blue-600 in light / blue-400 in dark for WCAG AA contrast.
 * Used in titles to emphasize a keyword.
 *
 * Reserve aux pages d'authentification, qui suivent encore le theme.
 * Les pages publiques utilisent HIGHLIGHT_TEXT_CLASSES_PUBLIC (SP-573).
 */
export const HIGHLIGHT_TEXT_CLASSES = 'text-blue-600 dark:text-blue-400'

/**
 * Variante publique du texte mis en avant.
 *
 * Les pages publiques n'ont pas de mode sombre (SP-573) : la variante
 * `dark:` y ferait varier la couleur selon un theme que le visiteur ne
 * peut plus choisir sur ces pages.
 */
export const HIGHLIGHT_TEXT_CLASSES_PUBLIC = 'text-blue-600'
