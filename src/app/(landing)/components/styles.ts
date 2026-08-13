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
 *
 * SP-574 : la couleur passe du `blue-600` de Tailwind au token public.
 * Le bleu brut etait reste apres la refonte, et le garde-fou des tokens ne
 * pouvait pas le voir, `text-blue-600` etant une classe valide, simplement
 * hors palette. C'est le meme motif que `PRIMARY_BUTTON_CLASSES`, restee
 * elle aussi en style d'avant refonte alors qu'elle servait des pages
 * refondues.
 */
export const HIGHLIGHT_TEXT_CLASSES_PUBLIC = 'text-public-brand-on-light'

/**
 * CTA des formulaires d'authentification.
 *
 * Aplat lime a texte bleu nuit, comme le prototype : sur `/login` et
 * `/register` le bouton est le point de bascule de la page, le lime le
 * detache du creme de la carte bien mieux qu'un aplat sombre.
 *
 * `content-on-vivid` est le token prevu pour un texte sur aplat vif, le blanc
 * n'y tiendrait pas le contraste AA.
 *
 * Distinct de PRIMARY_BUTTON_CLASSES, qui sert les hubs publics : les deux
 * ont vecu confondus jusqu'a SP-574, ce qui avait laisse un bouton bleu
 * arrondi sur les hubs longtemps apres la refonte.
 *
 * @see SP-574
 */
export const AUTH_BUTTON_CLASSES =
  'h-14 rounded-[2px] bg-public-highlight-surface px-8 font-geist text-base font-semibold text-public-content-on-vivid transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-public-content focus-visible:ring-offset-2'
