/**
 * Utilitaires pour l'import CSV d'employes
 *
 * @description Helpers de parsing et normalisation pour le flow d'import CSV.
 * Ce fichier est utilise cote client (preview) et ses fonctions pures
 * sont aussi reutilisees par le schema Zod cote serveur.
 *
 * @ticket SP-496
 */

// ============================================================================
// Normalisation des en-tetes CSV
// ============================================================================

/**
 * Map des en-tetes CSV acceptes vers les champs Employee
 *
 * Supporte les variantes FR, EN, avec/sans accents, abbreviations
 */
const HEADER_ALIASES: Record<string, string> = {
  // firstName
  firstname: 'firstName',
  first_name: 'firstName',
  prenom: 'firstName',
  prénom: 'firstName',

  // lastName
  lastname: 'lastName',
  last_name: 'lastName',
  nom: 'lastName',
  'nom de famille': 'lastName',

  // email
  email: 'email',
  'e-mail': 'email',
  mail: 'email',
  'adresse email': 'email',
  'adresse e-mail': 'email',

  // phone
  phone: 'phone',
  telephone: 'phone',
  téléphone: 'phone',
  tel: 'phone',
  tél: 'phone',
  mobile: 'phone',
  portable: 'phone',

  // jobTitle
  jobtitle: 'jobTitle',
  job_title: 'jobTitle',
  poste: 'jobTitle',
  fonction: 'jobTitle',
  'intitule du poste': 'jobTitle',
  'intitulé du poste': 'jobTitle',
  titre: 'jobTitle',

  // department
  department: 'department',
  departement: 'department',
  département: 'department',
  service: 'department',

  // teamName
  teamname: 'teamName',
  team_name: 'teamName',
  team: 'teamName',
  equipe: 'teamName',
  équipe: 'teamName',
  'nom equipe': 'teamName',
  "nom d'equipe": 'teamName',
  "nom d'équipe": 'teamName',

  // weeklyHours
  weeklyhours: 'weeklyHours',
  weekly_hours: 'weeklyHours',
  heures: 'weeklyHours',
  'heures hebdomadaires': 'weeklyHours',
  'heures/semaine': 'weeklyHours',
  'h/sem': 'weeklyHours',

  // hireDate
  hiredate: 'hireDate',
  hire_date: 'hireDate',
  "date d'embauche": 'hireDate',
  'date embauche': 'hireDate',
  embauche: 'hireDate',

  // role
  role: 'role',
  rôle: 'role',

  // skills
  skills: 'skills',
  competences: 'skills',
  compétences: 'skills',
}

/**
 * Les champs obligatoires qui doivent etre presents dans le CSV
 */
export const REQUIRED_HEADERS = ['firstName', 'lastName'] as const

/**
 * Tous les champs acceptes dans le CSV
 */
export const ACCEPTED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'jobTitle',
  'department',
  'teamName',
  'weeklyHours',
  'hireDate',
  'role',
  'skills',
] as const

export type CsvField = (typeof ACCEPTED_FIELDS)[number]

/**
 * Supprime les accents d'une chaine
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Normalise un en-tete CSV en champ Employee
 *
 * @returns Le nom du champ normalise ou null si non reconnu
 */
export function normalizeHeader(header: string): string | null {
  const cleaned = removeAccents(header.trim().toLowerCase())
    .replace(/\s*\(.*?\)\s*/g, '') // Supprime les annotations entre parentheses ex: "(obligatoire)"
    .replace(/\s*\*\s*/g, '')      // Supprime les asterisques ex: "Prénom *"
    .replace(/[_\-\s]+/g, ' ')
    .trim()

  // Chercher d'abord dans les alias avec la version sans accents
  for (const [alias, field] of Object.entries(HEADER_ALIASES)) {
    if (removeAccents(alias) === cleaned) {
      return field
    }
  }

  // Fallback : chercher un match direct dans ACCEPTED_FIELDS
  const directMatch = ACCEPTED_FIELDS.find(
    (f) => f.toLowerCase() === cleaned.replace(/\s/g, '')
  )
  if (directMatch) return directMatch

  return null
}

/**
 * Normalise tous les en-tetes d'un CSV et retourne le mapping
 *
 * @returns Map<original header, normalized field> + erreurs
 */
export function normalizeHeaders(headers: string[]): {
  mapping: Record<string, string>
  unmapped: string[]
  missingRequired: string[]
} {
  const mapping: Record<string, string> = {}
  const unmapped: string[] = []
  const mappedFields = new Set<string>()

  for (const header of headers) {
    const normalized = normalizeHeader(header)
    if (normalized && !mappedFields.has(normalized)) {
      mapping[header] = normalized
      mappedFields.add(normalized)
    } else if (normalized && mappedFields.has(normalized)) {
      // Doublon de colonne — on ignore la deuxieme
      unmapped.push(header)
    } else {
      unmapped.push(header)
    }
  }

  const missingRequired = REQUIRED_HEADERS.filter(
    (field) => !mappedFields.has(field)
  )

  return { mapping, unmapped, missingRequired }
}

// ============================================================================
// Parsing de dates flexibles
// ============================================================================

/**
 * Parse une date depuis differents formats
 *
 * Supporte :
 * - ISO 8601 : 2024-01-15, 2024-01-15T00:00:00Z
 * - Francais : 15/01/2024, 15-01-2024
 * - Excel serial number : 45307 (jours depuis 1899-12-30)
 * - Vide/null : retourne null
 */
export function parseDateFlexible(
  value: string | null | undefined
): string | null {
  if (!value || value.trim() === '') return null

  const trimmed = value.trim()

  // Format ISO : 2024-01-15 ou 2024-01-15T...
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] ?? null
  }

  // Format FR : dd/mm/yyyy ou dd-mm-yyyy
  const frMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
  if (frMatch) {
    const [, day, month, year] = frMatch
    const d = new Date(`${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] ?? null
  }

  // Excel serial number : nombre entier (ex: 45307)
  if (/^\d{4,5}$/.test(trimmed)) {
    const serial = parseInt(trimmed, 10)
    if (serial > 1 && serial < 100000) {
      // Epoch Excel : 1899-12-30 (Excel date serial origin)
      const excelEpoch = new Date(1899, 11, 30)
      const d = new Date(excelEpoch.getTime() + serial * 86400000)
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0] ?? null
    }
  }

  return null
}

// ============================================================================
// Matching de departements
// ============================================================================

/**
 * Map des noms courants de departements vers les valeurs de l'enum Prisma
 */
const DEPARTMENT_ALIASES: Record<string, string> = {
  direction: 'DIRECTION',
  dir: 'DIRECTION',
  'ressources humaines': 'RESSOURCES_HUMAINES',
  rh: 'RESSOURCES_HUMAINES',
  'human resources': 'RESSOURCES_HUMAINES',
  hr: 'RESSOURCES_HUMAINES',
  commercial: 'COMMERCIAL',
  vente: 'COMMERCIAL',
  ventes: 'COMMERCIAL',
  sales: 'COMMERCIAL',
  marketing: 'MARKETING',
  communication: 'MARKETING',
  technique: 'TECHNIQUE',
  tech: 'TECHNIQUE',
  it: 'TECHNIQUE',
  informatique: 'TECHNIQUE',
  dsi: 'TECHNIQUE',
  production: 'PRODUCTION',
  fabrication: 'PRODUCTION',
  logistique: 'LOGISTIQUE',
  supply: 'LOGISTIQUE',
  'supply chain': 'LOGISTIQUE',
  transport: 'LOGISTIQUE',
  finance: 'FINANCE',
  comptabilite: 'FINANCE',
  comptabilité: 'FINANCE',
  compta: 'FINANCE',
  accounting: 'FINANCE',
  juridique: 'JURIDIQUE',
  legal: 'JURIDIQUE',
  droit: 'JURIDIQUE',
  support: 'SUPPORT',
  'service client': 'SUPPORT',
  sav: 'SUPPORT',
  accueil: 'AUTRE',
  autre: 'AUTRE',
  other: 'AUTRE',
}

/**
 * Matche un nom de departement libre vers la valeur enum
 *
 * @returns La valeur enum ou null si non reconnu
 */
export function matchDepartment(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const cleaned = removeAccents(value.trim().toLowerCase())

  // Match direct dans les alias
  const match = DEPARTMENT_ALIASES[cleaned]
  if (match) return match

  // Match partiel : chercher si le cleaned contient un alias
  for (const [alias, dept] of Object.entries(DEPARTMENT_ALIASES)) {
    if (cleaned.includes(removeAccents(alias)) || removeAccents(alias).includes(cleaned)) {
      return dept
    }
  }

  return null
}

// ============================================================================
// Matching de roles
// ============================================================================

const ROLE_ALIASES: Record<string, string> = {
  employee: 'EMPLOYEE',
  employé: 'EMPLOYEE',
  employe: 'EMPLOYEE',
  collaborateur: 'EMPLOYEE',
  manager: 'MANAGER',
  responsable: 'MANAGER',
  'chef d\'equipe': 'MANAGER',
  'chef d\'équipe': 'MANAGER',
  director: 'DIRECTOR',
  directeur: 'DIRECTOR',
  directrice: 'DIRECTOR',
}

/**
 * Matche un role libre vers la valeur enum
 */
export function matchRole(
  value: string | null | undefined
): 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR' | null {
  if (!value || value.trim() === '') return null

  const cleaned = removeAccents(value.trim().toLowerCase())

  // Match direct
  const match = ROLE_ALIASES[cleaned]
  if (match) return match as 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR'

  // Match par valeur enum directe (EMPLOYEE, MANAGER, DIRECTOR)
  const upper = value.trim().toUpperCase()
  if (['EMPLOYEE', 'MANAGER', 'DIRECTOR'].includes(upper)) {
    return upper as 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR'
  }

  return null
}

// ============================================================================
// Parsing des skills
// ============================================================================

/**
 * Parse une chaine de competences en tableau
 *
 * Supporte separateurs : virgule, point-virgule, pipe
 */
export function parseSkills(value: string | null | undefined): string[] {
  if (!value || value.trim() === '') return []

  return value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// ============================================================================
// Parsing des heures hebdomadaires
// ============================================================================

/**
 * Parse les heures hebdomadaires depuis une string CSV
 *
 * Supporte : "35", "35.0", "35,5" (notation FR), vide → 35
 */
export function parseWeeklyHours(
  value: string | null | undefined
): number | null {
  if (!value || value.trim() === '') return null

  const normalized = value.trim().replace(',', '.')
  const n = parseFloat(normalized)

  if (isNaN(n)) return null
  return n
}

// ============================================================================
// Constantes d'import
// ============================================================================

/** Nombre maximum de lignes acceptees par import */
export const MAX_IMPORT_ROWS = 1000

/** Nombre de lignes affichees dans la preview */
export const PREVIEW_ROW_COUNT = 10
