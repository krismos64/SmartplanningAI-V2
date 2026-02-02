/**
 * Utilitaire de génération CSV générique
 *
 * @description Génère des fichiers CSV avec :
 * - Séparateur point-virgule (;) pour Excel FR
 * - UTF-8 BOM pour accents Windows
 * - Échappement automatique des guillemets et retours à la ligne
 * - Typage générique pour réutilisation
 *
 * @ticket SP-333
 */

export interface CsvColumn<T> {
  /** Clé de l'objet ou fonction d'extraction */
  key: keyof T | ((item: T) => string | number | boolean | null | undefined)
  /** En-tête de colonne affiché */
  header: string
  /** Fonction de formatage optionnelle */
  format?: (value: unknown, item: T) => string
}

export interface CsvOptions {
  /** Séparateur de colonnes (défaut: ';' pour Excel FR) */
  separator?: string
  /** Ajouter BOM UTF-8 pour Excel Windows (défaut: true) */
  includeBom?: boolean
  /** Nom du fichier sans extension */
  filename: string
}

export interface CsvResult {
  filename: string
  data: string
  mimeType: string
}

/**
 * Échappe une valeur pour CSV
 * - Entoure de guillemets si contient séparateur, guillemet ou retour ligne
 * - Double les guillemets internes
 */
function escapeCsvValue(value: unknown, separator: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  // Convertir en string de manière sécurisée
  let stringValue: string
  if (typeof value === 'object') {
    stringValue = JSON.stringify(value)
  } else if (typeof value === 'string') {
    stringValue = value
  } else {
    stringValue = String(value as string | number | boolean)
  }

  // Si contient séparateur, guillemet ou retour à la ligne, échapper
  if (
    stringValue.includes(separator) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Doubler les guillemets et entourer de guillemets
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Génère un fichier CSV à partir d'un tableau d'objets
 */
export function generateCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  options: CsvOptions
): CsvResult {
  const separator = options.separator ?? ';'
  const includeBom = options.includeBom ?? true

  // Générer l'en-tête
  const headerRow = columns
    .map((col) => escapeCsvValue(col.header, separator))
    .join(separator)

  // Générer les lignes de données
  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        // Extraire la valeur
        let value: unknown
        if (typeof col.key === 'function') {
          value = col.key(item)
        } else {
          value = item[col.key]
        }

        // Appliquer le formatage si défini
        if (col.format) {
          value = col.format(value, item)
        }

        // Convertir en string et échapper
        return escapeCsvValue(value, separator)
      })
      .join(separator)
  })

  // Assembler le CSV
  const csvContent = [headerRow, ...dataRows].join('\n')

  // Ajouter BOM UTF-8 si demandé (pour Excel Windows)
  const bom = includeBom ? '\uFEFF' : ''

  // Générer le nom de fichier avec date
  const dateStr = new Date().toISOString().split('T')[0] ?? ''
  const filename = `${options.filename}-${dateStr}.csv`

  return {
    filename,
    data: bom + csvContent,
    mimeType: 'text/csv;charset=utf-8',
  }
}

/**
 * Formate une date en DD/MM/YYYY
 */
export function formatDateFr(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formate une date avec heure en DD/MM/YYYY HH:mm
 */
export function formatDateTimeFr(
  date: Date | string | null | undefined
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formate un booléen en Oui/Non
 */
export function formatBooleanFr(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  return value ? 'Oui' : 'Non'
}

/**
 * Formate un jour de la semaine
 */
export function formatDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', { weekday: 'long' })
}
