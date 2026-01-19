/**
 * Transporter Nodemailer avec singleton pattern
 *
 * @ticket SP-295
 * @description Crée et réutilise une instance unique du transporter Nodemailer
 *
 * ✅ Source : Context7 - Nodemailer Best Practices
 * - Connection pooling activé pour performance
 * - Singleton pattern pour éviter les fuites de connexion
 * - Vérification de la connexion disponible
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { getSmtpConfig, isEmailConfigured } from './config'

/** Instance singleton du transporter */
let transporter: Transporter | null = null

/**
 * Récupère ou crée le transporter Nodemailer
 *
 * Utilise le pattern singleton pour réutiliser la même connexion
 * et bénéficier du connection pooling.
 *
 * @returns Instance du transporter Nodemailer
 * @throws Error si la configuration SMTP est incomplète
 */
export function getTransporter(): Transporter {
  if (!isEmailConfigured()) {
    throw new Error(
      'Service email non configuré. Définissez les variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.'
    )
  }

  if (!transporter) {
    const config = getSmtpConfig()
    transporter = nodemailer.createTransport(config)
  }

  return transporter
}

/**
 * Vérifie la connexion au serveur SMTP
 *
 * Utile pour diagnostiquer les problèmes de configuration.
 *
 * @returns true si la connexion est établie avec succès
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    if (!isEmailConfigured()) {
      console.warn('[Email] Configuration SMTP manquante')
      return false
    }

    const transport = getTransporter()
    await transport.verify()
    console.info('[Email] Connexion SMTP vérifiée avec succès')
    return true
  } catch (error) {
    console.error('[Email] Échec de la vérification SMTP:', error)
    return false
  }
}

/**
 * Ferme le transporter et libère les ressources
 *
 * À appeler lors de l'arrêt de l'application si nécessaire.
 */
export function closeTransporter(): void {
  if (transporter) {
    transporter.close()
    transporter = null
    console.info('[Email] Transporter fermé')
  }
}

/**
 * Réinitialise le transporter (utile pour les tests)
 *
 * @internal
 */
export function resetTransporter(): void {
  transporter = null
}
