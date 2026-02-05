/**
 * Shared styles constants for landing pages
 * Centralizes repeated class patterns to avoid duplication
 *
 * @see SP-285 - Page À propos refactoring
 */

/**
 * Primary CTA button with gradient (blue to cyan)
 * Used in: HeroSection, CTASection, AboutContent, Auth pages
 */
export const GRADIENT_BUTTON_CLASSES =
  'h-14 border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500'

/**
 * Gradient text (cyan to blue) for highlighted words
 * Adapts to light/dark mode
 */
export const GRADIENT_TEXT_CLASSES =
  'bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400'

/**
 * Badge styles for section headers
 * Color variants are handled by SectionHeader component
 */
export const BADGE_BASE_CLASSES =
  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'
