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
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
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
