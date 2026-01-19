/**
 * Configuration SMTP pour l'envoi d'emails
 *
 * @ticket SP-295
 * @description Configuration Nodemailer avec SMTP Hostinger
 *
 * Variables d'environnement requises :
 * - SMTP_HOST : Serveur SMTP (smtp.hostinger.com)
 * - SMTP_PORT : Port SMTP (587 pour TLS)
 * - SMTP_USER : Email d'authentification
 * - SMTP_PASSWORD : Mot de passe SMTP (attention: pas SMTP_PASS)
 * - SMTP_FROM : Adresse d'expédition formatée (attention: pas EMAIL_FROM)
 * - CONTACT_EMAIL : Email de contact (attention: pas EMAIL_CONTACT)
 */

import type { SmtpConfig } from './types'

/**
 * Vérifie les noms de variables obsolètes et affiche un warning
 * Appelé une seule fois au démarrage
 */
let deprecationWarningShown = false

export function checkDeprecatedEnvVars(): void {
  if (deprecationWarningShown) return
  deprecationWarningShown = true

  const deprecatedMappings = [
    { old: 'SMTP_PASS', new: 'SMTP_PASSWORD' },
    { old: 'EMAIL_FROM', new: 'SMTP_FROM' },
    { old: 'EMAIL_CONTACT', new: 'CONTACT_EMAIL' },
  ]

  for (const { old, new: newVar } of deprecatedMappings) {
    if (process.env[old] && !process.env[newVar]) {
      console.warn(
        `[Email] ⚠️ Variable "${old}" détectée mais "${newVar}" attendue. Renommez la variable dans votre .env`
      )
    }
  }
}

/**
 * Vérifie que toutes les variables d'environnement SMTP sont définies
 *
 * @returns true si la configuration est complète
 */
export function isEmailConfigured(): boolean {
  // Vérifier les variables obsolètes au premier appel
  checkDeprecatedEnvVars()

  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  )
}

/**
 * Récupère la configuration SMTP depuis les variables d'environnement
 *
 * @throws Error si les variables d'environnement ne sont pas définies
 * @returns Configuration SMTP pour Nodemailer
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    throw new Error(
      'Configuration SMTP incomplète. Vérifiez les variables SMTP_HOST, SMTP_USER, SMTP_PASSWORD.'
    )
  }

  return {
    host,
    port,
    // Port 465 = SSL (secure: true), Port 587 = STARTTLS (secure: false)
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Connection pooling pour performance (recommandé Context7)
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  }
}

/**
 * Récupère l'adresse d'expédition des emails
 *
 * @returns Adresse formatée "Nom <email>"
 */
export function getEmailFrom(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'SmartPlanning <contact@smartplanning.fr>'
  )
}

/**
 * Récupère l'URL de base de l'application
 *
 * @returns URL de base pour les liens dans les emails
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'
}

/**
 * Récupère l'email de contact pour les notifications admin
 *
 * @returns Email du destinataire des notifications
 */
export function getContactEmail(): string {
  return (
    process.env.CONTACT_EMAIL ||
    process.env.SMTP_USER ||
    'contact@smartplanning.fr'
  )
}
