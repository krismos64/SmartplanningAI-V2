/**
 * Design Tokens - Identite visuelle des pages publiques
 *
 * Direction : editoriale, aplats pleine largeur, typographie contrastee.
 * Ces tokens ne concernent QUE les pages publiques (landing, secteurs,
 * guides, tarifs, a-propos, legal). L'application privee conserve la
 * direction « Precision Engineering » definie dans colors.ts et
 * typography.ts.
 *
 * Format HSL sans fonction hsl(), aligne sur colors.ts et Shadcn/ui :
 * les valeurs sont consommees via hsl(var(--token)).
 *
 * @see SP-565 - Socle visuel public
 */

// =============================================================================
// PRIMITIVE TOKENS - Les cinq aplats
// =============================================================================

/**
 * Palette publique. Chaque teinte porte des variantes de luminosite,
 * necessaires pour tenir le contraste WCAG AA selon le fond.
 *
 * Ratios mesures (voir publicContrastReference en bas de fichier) :
 * - ink 900 sur cream 100    : 14.67:1
 * - cream 100 sur ink 900    : 14.67:1
 * - ink 900 sur lime 400     : 13.90:1
 * - ink 900 sur coral 500    : 5.41:1
 * - coral 500 sur ink 900    : 5.41:1
 * - blanc sur blue 500       : 4.88:1
 */
export const publicPalette = {
  /** Bleu nuit, fond principal des sections sombres (#0f1b2d) */
  ink: {
    700: '216 50% 22%',
    800: '216 50% 16%',
    900: '216 50% 11.8%', // #0f1b2d
    950: '216 52% 7%', // Fond du mode sombre, plus profond
  },

  /** Creme, fond principal des sections claires (#f0ece4) */
  cream: {
    50: '40 30% 96%',
    100: '40 28.6% 91.8%', // #f0ece4
    200: '40 24% 86%',
    300: '38 18% 76%',
  },

  /**
   * Corail, accent principal.
   * 500 est la teinte du prototype, lisible sur fond sombre.
   * 700 est la variante assombrie, obligatoire pour du texte sur creme :
   * le corail 500 n'y atteint que 2.71:1, sous le seuil AA.
   */
  coral: {
    400: '9 100% 68%',
    500: '9 100% 60.6%', // #ff5436
    600: '9 100% 50%',
    700: '9 100% 40%', // #cc1f00, 4.74:1 sur creme
  },

  /**
   * Lime, accent secondaire.
   * Utilise en aplat de fond ou en label sur fond sombre.
   * Jamais en texte sur fond clair : la teinte est trop lumineuse.
   */
  lime: {
    300: '75.8 90% 75%',
    400: '75.8 89.9% 65.1%', // #ccf656
    500: '75.8 85% 55%',
  },

  /**
   * Bleu franc, aplat de section et liens.
   * 600 est la variante requise pour du texte sur creme (4.65:1),
   * le 500 n'y atteignant que 4.18:1.
   */
  blue: {
    500: '222.9 100% 57.3%', // #2563ff
    600: '222.9 100% 54%', // #1457ff, 4.65:1 sur creme
    700: '222.9 100% 45%',
  },
} as const

// =============================================================================
// SEMANTIC TOKENS - Mode clair
// =============================================================================

/**
 * Le mode clair est la lecture de reference : fond creme, texte bleu nuit.
 */
export const publicSemanticLight = {
  /** Fond des sections claires */
  surface: publicPalette.cream[100],
  /** Fond legerement contraste, cartes sur fond creme */
  surfaceSubtle: publicPalette.cream[50],
  /** Fond des sections sombres, en alternance */
  surfaceInverted: publicPalette.ink[900],

  /** Texte courant sur surface */
  content: publicPalette.ink[900],
  /** Texte secondaire */
  contentMuted: publicPalette.ink[700],
  /** Texte sur surfaceInverted */
  contentInverted: publicPalette.cream[100],

  /** Accent sur fond clair, variante assombrie pour tenir AA */
  accent: publicPalette.coral[700],
  /** Accent sur fond sombre */
  accentOnDark: publicPalette.coral[500],
  /** Aplat corail pleine section, texte bleu nuit par-dessus */
  accentSurface: publicPalette.coral[500],

  /** Aplat lime pleine section, texte bleu nuit par-dessus */
  highlightSurface: publicPalette.lime[400],
  /** Label lime, uniquement sur fond sombre */
  highlightOnDark: publicPalette.lime[400],

  /** Aplat bleu pleine section, texte blanc par-dessus */
  brandSurface: publicPalette.blue[500],
  /** Lien bleu sur fond clair, variante assombrie pour tenir AA */
  brandOnLight: publicPalette.blue[600],

  /** Filets et separateurs */
  border: publicPalette.cream[300],
  borderInverted: publicPalette.ink[700],
} as const

// =============================================================================
// SEMANTIC TOKENS - Mode sombre
// =============================================================================

/**
 * Le prototype ne gere qu'un seul mode. La declinaison sombre est une
 * decision de conception : le creme cede la place au bleu nuit, et le
 * bleu nuit descend vers un noir plus profond. Corail et lime restent
 * les accents, leur lisibilite etant deja acquise sur fond sombre.
 */
export const publicSemanticDark = {
  surface: publicPalette.ink[950],
  surfaceSubtle: publicPalette.ink[900],
  surfaceInverted: publicPalette.cream[100],

  content: publicPalette.cream[100],
  contentMuted: publicPalette.cream[300],
  contentInverted: publicPalette.ink[900],

  accent: publicPalette.coral[500],
  accentOnDark: publicPalette.coral[500],
  accentSurface: publicPalette.coral[500],

  highlightSurface: publicPalette.lime[400],
  highlightOnDark: publicPalette.lime[400],

  brandSurface: publicPalette.blue[500],
  brandOnLight: publicPalette.blue[500],

  border: publicPalette.ink[700],
  borderInverted: publicPalette.cream[300],
} as const

// =============================================================================
// TYPOGRAPHIE PUBLIQUE
// =============================================================================

/**
 * Familles dediees aux pages publiques.
 *
 * IMPORTANT : `sans` et `display` de typography.ts ne sont PAS modifiees.
 * Elles sont partagees avec l'application privee, ou 65 fichiers en
 * dependent, et layout.tsx applique font-rajdhani au <body>. Basculer ces
 * familles repeindrait tout le back-office, hors du perimetre de SP-565.
 */
export const publicFontFamily = {
  /** Sans-serif des pages publiques, titres et corps */
  geist: ['var(--font-geist)', 'system-ui', '-apple-system', 'sans-serif'],

  /**
   * Serif italique de la seconde ligne des titres.
   * Geste signature de la direction editoriale.
   */
  editorial: ['var(--font-editorial)', 'Georgia', 'Times New Roman', 'serif'],
} as const

// =============================================================================
// REFERENCE DE CONTRASTE
// =============================================================================

/**
 * Ratios mesures a la creation des tokens, conserves comme reference pour
 * les tickets suivants. Verifies par publicContrast.test.ts, qui recalcule
 * ces valeurs depuis la palette : une teinte modifiee fera rougir le test.
 *
 * Les paires marquees `largeOnly` ne sont autorisees que sur du texte de
 * 24px, ou 18.66px en gras.
 */
export const publicContrastReference = {
  /** Paires valides pour du texte courant (AA, 4.5:1 minimum) */
  textPairs: [
    { background: 'cream.100', foreground: 'ink.900', ratio: 14.67 },
    { background: 'ink.900', foreground: 'cream.100', ratio: 14.67 },
    { background: 'lime.400', foreground: 'ink.900', ratio: 13.9 },
    { background: 'coral.500', foreground: 'ink.900', ratio: 5.41 },
    { background: 'ink.900', foreground: 'coral.500', ratio: 5.41 },
    { background: 'cream.100', foreground: 'coral.700', ratio: 4.74 },
    { background: 'cream.100', foreground: 'blue.600', ratio: 4.65 },
  ],

  /** Paires reservees aux grands titres (AA large, 3:1 minimum) */
  largeOnly: [
    { background: 'coral.500', foreground: 'white', ratio: 3.19 },
  ],

  /** Paires interdites, documentees pour eviter leur reintroduction */
  forbidden: [
    {
      background: 'cream.100',
      foreground: 'coral.500',
      ratio: 2.71,
      use: 'coral.700 a la place',
    },
  ],
} as const

export const brandPublic = {
  palette: publicPalette,
  semantic: {
    light: publicSemanticLight,
    dark: publicSemanticDark,
  },
  fontFamily: publicFontFamily,
  contrast: publicContrastReference,
} as const

export default brandPublic
