/**
 * Types pour le service d'envoi d'emails
 *
 * @ticket SP-295
 * @description Types TypeScript pour la configuration SMTP et les options d'envoi
 */

/**
 * Configuration SMTP pour Nodemailer
 */
export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  pool?: boolean
  maxConnections?: number
  maxMessages?: number
}

/**
 * Options pour l'envoi d'un email
 */
export interface EmailOptions {
  /** Adresse email du destinataire */
  to: string
  /** Sujet de l'email */
  subject: string
  /** Contenu HTML de l'email (généré par React Email) */
  html: string
  /** Contenu texte brut (fallback) */
  text?: string
  /** Adresse de réponse (optionnel) */
  replyTo?: string
  /** Pièces jointes (optionnel) */
  attachments?: EmailAttachment[]
}

/**
 * Pièce jointe d'un email
 */
export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

/**
 * Résultat de l'envoi d'un email
 *
 * SP-579 : `success: false` ne distinguait pas une panne technique (SMTP
 * injoignable, authentification refusée) d'un destinataire refusé par le
 * serveur distant. Le champ `outcome` porte cette distinction, parce qu'elle
 * n'appelle pas la même réaction : une panne se retente, une adresse invalide
 * doit être corrigée par un humain.
 */
export type EmailOutcome =
  /** Accepté par le relais SMTP. Ne préjuge pas de la livraison finale. */
  | 'SENT'
  /** Destinataire refusé par le serveur, l'adresse est invalide. */
  | 'BOUNCED'
  /** Échec technique : configuration, réseau, authentification. */
  | 'FAILED'

/**
 * Résultat de l'envoi d'un email
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  /**
   * Nature du résultat, alimente le statut de `EmailLog`.
   *
   * Un envoi `SENT` reste susceptible de rebondir plus tard : le relais
   * accepte avant que le serveur du destinataire se prononce. Ces bounces
   * asynchrones ne sont pas visibles ici.
   */
  outcome?: EmailOutcome
  /** Adresses explicitement refusées par le serveur SMTP. */
  rejected?: string[]
  /** Dernière réponse SMTP brute, conservée pour le diagnostic. */
  smtpResponse?: string
}

/**
 * Props communes pour tous les templates email
 */
export interface BaseEmailProps {
  /** Prénom du destinataire */
  firstName?: string
  /** URL de base de l'application */
  baseUrl?: string
}
