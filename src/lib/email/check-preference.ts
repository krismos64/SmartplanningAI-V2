/**
 * Vérification des préférences email avant envoi
 *
 * Fonction utilitaire centralisée qui vérifie si un utilisateur
 * a activé les notifications email pour une catégorie donnée
 * (planning, leaves, tasks, system) avant d'envoyer un email.
 *
 * Les catégories correspondent aux toggles dans la page
 * /app/settings > Préférences notifications.
 *
 * Emails qui NE DOIVENT PAS vérifier les préférences (toujours envoyés) :
 * - Sécurité : PasswordChangedEmail
 * - RGPD : AccountDeletedEmail, DataExportEmail
 * - Billing : tous les emails Stripe
 * - Auth : WelcomeEmail, ResetPasswordEmail, InvitationEmail, VerificationEmail
 * - Admin : NewRegistrationEmail, ContactNotificationEmail
 *
 * @ticket SP-480
 */

import { prisma } from '@/lib/prisma'
import { parseUserPreferences } from '@/lib/utils/preferences'
import { isEmailNotificationEnabled } from '@/lib/utils/preferences'
import type { NotificationChannelPreferences } from '@/types/preferences'

/**
 * Vérifie si un utilisateur accepte les emails pour une catégorie donnée.
 *
 * Recherche le User en base, parse ses préférences, et vérifie
 * si la catégorie email est activée.
 *
 * Retourne true si :
 * - L'utilisateur n'existe pas (on envoie par sécurité)
 * - Les préférences sont null (tout activé par défaut)
 * - La catégorie est explicitement activée
 *
 * Retourne false uniquement si l'utilisateur a explicitement
 * désactivé cette catégorie dans ses préférences.
 *
 * @param userId - L'id de l'utilisateur destinataire
 * @param category - La catégorie d'email (planning, leaves, tasks, system)
 * @returns true si l'email peut être envoyé
 */
export async function canSendEmailToUser(
  userId: string,
  category: keyof NotificationChannelPreferences
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    })

    // Utilisateur introuvable : on envoie par sécurité
    if (!user) return true

    const prefs = parseUserPreferences(user.preferences)
    return isEmailNotificationEnabled(prefs, category)
  } catch {
    // Erreur de requête : on envoie par sécurité plutôt que de bloquer
    return true
  }
}

/**
 * Même vérification mais à partir de l'email de l'employé
 * (quand on n'a pas directement le userId).
 *
 * Cherche le User via Employee.email → Employee.userId → User.
 *
 * @param employeeEmail - L'email de l'employé
 * @param category - La catégorie d'email
 * @returns true si l'email peut être envoyé
 */
export async function canSendEmailToEmployee(
  employeeEmail: string,
  category: keyof NotificationChannelPreferences
): Promise<boolean> {
  try {
    const employee = await prisma.employee.findFirst({
      where: { email: employeeEmail },
      select: {
        user: {
          select: { preferences: true },
        },
      },
    })

    // Pas d'employé ou pas de user lié : on envoie par sécurité
    if (!employee?.user) return true

    const prefs = parseUserPreferences(employee.user.preferences)
    return isEmailNotificationEnabled(prefs, category)
  } catch {
    return true
  }
}
