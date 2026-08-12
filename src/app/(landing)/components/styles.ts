/**
 * Shared styles constants for landing pages
 * Centralizes repeated class patterns to avoid duplication
 *
 * @see SP-285 - Page À propos refactoring
 */

/**
 * CTA principal des pages publiques.
 *
 * Repris a l'identite de SP-565 : aplat bleu nuit, angles vifs, aucune ombre
 * portee. La version precedente etait un bouton bleu arrondi avec ombre,
 * heritee d'avant la refonte, restee en place sur les hubs `/solutions` et
 * `/guides` et sur les formulaires d'authentification pendant que le reste
 * des pages publiques passait aux aplats francs.
 *
 * Utilise par : hubs secteur et guides, formulaires auth. Les autres CTA
 * publics portent leurs classes en propre.
 *
 * @see SP-574
 */
export const PRIMARY_BUTTON_CLASSES =
  'h-14 rounded-none bg-public-content px-8 font-geist text-base font-semibold text-public-content-on-dark transition-colors hover:bg-public-accent hover:text-public-content-on-dark focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2'

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
