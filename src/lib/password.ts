/**
 * Utilitaires de gestion des mots de passe
 *
 * @description Fonctions sécurisées pour le hash et la vérification
 * des mots de passe avec bcrypt.
 *
 * @security
 * - bcryptjs utilise un salt aléatoire par défaut
 * - 10 rounds de hashing (recommandé OWASP)
 * - Comparaison timing-safe contre les attaques temporelles
 *
 * @ticket SP-108
 */

import bcrypt from 'bcryptjs'

/**
 * Nombre de rounds pour le hashing bcrypt
 *
 * 10 rounds = ~100ms sur un CPU moderne
 * Bon compromis entre sécurité et performance
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const SALT_ROUNDS = 10

/**
 * Hash un mot de passe en clair avec bcrypt
 *
 * @param password - Mot de passe en clair à hasher
 * @returns Promise<string> - Hash bcrypt du mot de passe
 *
 * @example
 * ```typescript
 * const hash = await hashPassword('monMotDePasse123!')
 * // $2a$10$... (60 caractères)
 * ```
 *
 * @security Le salt est généré automatiquement et inclus dans le hash
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Vérifie si un mot de passe correspond à son hash
 *
 * @param password - Mot de passe en clair à vérifier
 * @param hashedPassword - Hash bcrypt stocké en base
 * @returns Promise<boolean> - true si le mot de passe est correct
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword('monMotDePasse123!', user.password)
 * if (!isValid) {
 *   throw new Error('Invalid credentials')
 * }
 * ```
 *
 * @security Utilise une comparaison timing-safe pour éviter
 * les attaques par analyse temporelle
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Génère un salt bcrypt (usage avancé)
 *
 * @param rounds - Nombre de rounds (défaut: SALT_ROUNDS)
 * @returns Promise<string> - Salt généré
 *
 * @note Normalement non nécessaire car hashPassword génère le salt
 */
export async function generateSalt(rounds: number = SALT_ROUNDS): Promise<string> {
  return bcrypt.genSalt(rounds)
}
