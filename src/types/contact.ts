/**
 * Types pour l'API Contact
 *
 * @ticket SP-288
 * @description Types TypeScript pour le formulaire et l'API de contact
 */

/**
 * Données du formulaire de contact
 * Correspond au contactSchema Zod (SP-287)
 */
export interface ContactFormData {
  /** Nom complet de l'expéditeur */
  name: string
  /** Adresse email de l'expéditeur */
  email: string
  /** Sujet du message */
  subject: string
  /** Contenu du message */
  message: string
}

/**
 * Réponse de l'API Contact
 */
export interface ContactApiResponse {
  /** Indique si l'envoi a réussi */
  success: boolean
  /** Message de confirmation ou d'erreur */
  message: string
  /** Erreurs de validation par champ (optionnel) */
  errors?: Record<string, string[]>
}

/**
 * Résultat de l'envoi d'email de contact
 */
export interface ContactEmailResult {
  /** Indique si l'envoi a réussi */
  success: boolean
  /** ID du message si succès */
  messageId?: string
  /** Message d'erreur si échec */
  error?: string
}

/**
 * Paramètres pour l'email de confirmation à l'expéditeur
 */
export interface ContactConfirmationParams {
  /** Nom de l'expéditeur */
  name: string
  /** Email de l'expéditeur */
  email: string
  /** Sujet du message original */
  subject: string
  /** Contenu du message original */
  message: string
}

/**
 * Paramètres pour l'email de notification à l'admin
 */
export interface ContactNotificationParams {
  /** Nom de l'expéditeur */
  name: string
  /** Email de l'expéditeur */
  email: string
  /** Sujet du message */
  subject: string
  /** Contenu du message */
  message: string
  /** Date de soumission */
  submittedAt: Date
}

/**
 * Configuration du rate limiter
 */
export interface RateLimitConfig {
  /** Nombre maximum de requêtes */
  maxRequests: number
  /** Fenêtre de temps en millisecondes */
  windowMs: number
}

/**
 * Résultat de la vérification du rate limit
 */
export interface RateLimitResult {
  /** Indique si la requête est autorisée */
  allowed: boolean
  /** Nombre de requêtes restantes */
  remaining: number
  /** Timestamp de reset de la fenêtre */
  resetAt: number
}
