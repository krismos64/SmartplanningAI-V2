/**
 * Utilitaires globaux pour SmartPlanning
 *
 * ✅ Source : Best practices Next.js + Shadcn/ui (Context7)
 *
 * Ce fichier contient des fonctions utilitaires réutilisables
 * dans toute l'application, suivant les conventions modernes 2025.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fonction cn() - Combinaison intelligente de classes Tailwind
 *
 * PROBLÉMATIQUE (CDA) :
 * Tailwind CSS peut avoir des conflits de classes (ex: "p-4 p-2").
 * La dernière classe devrait gagner mais l'ordre CSS peut varier.
 *
 * SOLUTION :
 * - clsx : Combine les classes conditionnelles
 * - tailwind-merge : Résout les conflits Tailwind intelligemment
 *
 * UTILISATION :
 * ```tsx
 * <div className={cn("p-4 text-center", isActive && "bg-blue-500")} />
 * ```
 *
 * RÉFÉRENCE CDA :
 * - Pattern standard de Shadcn/ui
 * - Utilisé par Vercel, Next.js templates officiels
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formater une date en français
 *
 * @param date - Date à formater
 * @param options - Options Intl.DateTimeFormat
 * @returns Date formatée en français
 *
 * @example
 * formatDate(new Date()) // "7 novembre 2025"
 * formatDate(new Date(), { dateStyle: 'short' }) // "07/11/2025"
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', options).format(dateObj)
}

/**
 * Formater un montant en euros
 *
 * @param amount - Montant en centimes
 * @param showCurrency - Afficher le symbole €
 * @returns Montant formaté
 *
 * @example
 * formatCurrency(29900) // "299,00 €"
 * formatCurrency(29900, false) // "299,00"
 */
export function formatCurrency(
  amount: number,
  showCurrency: boolean = true
): string {
  const euros = amount / 100
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euros)

  return showCurrency ? `${formatted} €` : formatted
}

/**
 * Capitaliser la première lettre d'une chaîne
 *
 * @param str - Chaîne à capitaliser
 * @returns Chaîne capitalisée
 *
 * @example
 * capitalize("bonjour") // "Bonjour"
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Générer des initiales à partir d'un nom complet
 *
 * @param name - Nom complet (prénom nom)
 * @returns Initiales en majuscules
 *
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Marie-Claude Dupont") // "MD"
 */
export function getInitials(name: string): string {
  if (!name) return '??'

  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'

  if (parts.length === 1) {
    return parts[0]!.substring(0, 2).toUpperCase()
  }

  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/**
 * Attendre un délai en millisecondes (pour tests, démos, etc.)
 *
 * @param ms - Délai en millisecondes
 * @returns Promise qui se résout après le délai
 *
 * @example
 * await sleep(1000) // Attendre 1 seconde
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Vérifier si une chaîne est un email valide (simple)
 *
 * @param email - Email à valider
 * @returns true si l'email semble valide
 *
 * Note : Pour une validation complète, utiliser Zod dans les formulaires
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Tronquer un texte avec ellipse
 *
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué avec "..."
 *
 * @example
 * truncate("Hello World", 5) // "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
