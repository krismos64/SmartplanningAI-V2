/**
 * Constantes de style pour les emails SmartPlanning
 *
 * @ticket SP-296
 * @description Couleurs, typographie et styles cohérents avec la charte graphique
 */

// =============================================================================
// COULEURS
// =============================================================================

export const colors = {
  // Couleurs principales SmartPlanning
  primary: '#2979f8', // Bleu SmartPlanning
  primaryDark: '#1c62e3', // Bleu foncé
  primaryLight: '#4c91fa', // Bleu clair

  // Couleurs de texte
  text: {
    primary: '#1a1a2e', // Texte principal
    secondary: '#64748b', // Texte secondaire (gris)
    muted: '#94a3b8', // Texte atténué
    inverse: '#ffffff', // Texte sur fond foncé
  },

  // Couleurs de fond
  background: {
    primary: '#ffffff', // Fond principal
    secondary: '#f8fafc', // Fond secondaire (gris très clair)
    dark: '#1a1a2e', // Fond foncé (header/footer)
  },

  // Couleurs d'état
  status: {
    success: '#22c55e', // Vert succès
    error: '#ef4444', // Rouge erreur
    warning: '#f59e0b', // Orange avertissement
    info: '#3b82f6', // Bleu info
  },

  // Bordures
  border: {
    light: '#e2e8f0', // Bordure claire
    medium: '#cbd5e1', // Bordure moyenne
  },
} as const

// =============================================================================
// TYPOGRAPHIE
// =============================================================================

export const typography = {
  // Famille de polices (fallback safe pour les clients email)
  fontFamily:
    "'Rajdhani', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyFallback:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // Tailles de police
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },

  // Hauteurs de ligne
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Poids de police
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// =============================================================================
// ESPACEMENTS
// =============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

// =============================================================================
// BORDURES ET OMBRES
// =============================================================================

export const borders = {
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  width: {
    thin: '1px',
    medium: '2px',
  },
} as const

// =============================================================================
// DIMENSIONS
// =============================================================================

export const dimensions = {
  // Largeur max du contenu email (600px standard pour emails)
  maxWidth: '600px',

  // Hauteur du logo
  logoHeight: '120px',

  // Taille des boutons
  buttonHeight: '44px',
  buttonPaddingX: '24px',
  buttonPaddingY: '12px',
} as const

// =============================================================================
// STYLES PRÉDÉFINIS
// =============================================================================

export const presetStyles = {
  // Container principal
  container: {
    maxWidth: dimensions.maxWidth,
    margin: '0 auto',
    backgroundColor: colors.background.primary,
  },

  // Section avec padding
  section: {
    padding: `${spacing.lg} ${spacing.md}`,
  },

  // Titre principal
  heading1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight,
    margin: `0 0 ${spacing.md} 0`,
  },

  // Titre secondaire
  heading2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight,
    margin: `0 0 ${spacing.sm} 0`,
  },

  // Paragraphe standard
  paragraph: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal,
    margin: `0 0 ${spacing.md} 0`,
  },

  // Lien
  link: {
    color: colors.primary,
    textDecoration: 'underline',
  },

  // Séparateur
  divider: {
    borderTop: `${borders.width.thin} solid ${colors.border.light}`,
    margin: `${spacing.lg} 0`,
  },
} as const
