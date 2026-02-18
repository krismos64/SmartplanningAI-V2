'use server'

/**
 * Server Actions pour les paramètres entreprise
 *
 * @ticket SP-435 - Paramètres Entreprise
 *
 * Architecture :
 * - RBAC : Accessible uniquement aux DIRECTOR et SYSTEM_ADMIN
 * - Mapping Prisma Company → CompanySettings UI
 * - Stockage pause déjeuner dans Company.defaultOpeningHours (JSON)
 */

import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAuditAction } from '@/lib/services/audit'
import {
  updateCompanySettingsSchema,
  type UpdateCompanySettingsInput,
} from '@/lib/validations/company-settings'
import type { CrudActionResult } from '@/types'
import type {
  CompanySettings,
  DayOfWeek,
  LunchBreakSettings,
} from '@/types/company'
import { DEFAULT_COMPANY_SETTINGS, DEFAULT_LUNCH_BREAK } from '@/types/company'

// ============================================================================
// TYPES INTERNES
// ============================================================================

/**
 * Structure du JSON defaultOpeningHours en base
 */
interface DefaultOpeningHoursJson {
  lunchBreak?: LunchBreakSettings
}

/**
 * Rôles autorisés à modifier les paramètres entreprise
 */
const ALLOWED_ROLES = ['DIRECTOR', 'SYSTEM_ADMIN']

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Parse le JSON defaultOpeningHours de la base
 */
function parseDefaultOpeningHours(
  json: Prisma.JsonValue | null
): DefaultOpeningHoursJson {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {}
  }
  return json as unknown as DefaultOpeningHoursJson
}

/**
 * Résultat de la vérification d'accès
 */
type AccessCheckResult =
  | { allowed: false; error: string }
  | { allowed: true; companyId: string }

/**
 * Vérifie que l'utilisateur a accès aux paramètres entreprise
 */
async function checkAccess(
  userId: string,
  userRole: string
): Promise<AccessCheckResult> {
  if (!ALLOWED_ROLES.includes(userRole)) {
    return { allowed: false, error: 'Accès non autorisé' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  })

  if (!user?.companyId) {
    return { allowed: false, error: 'Entreprise non trouvée' }
  }

  return { allowed: true, companyId: user.companyId }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère les paramètres de l'entreprise de l'utilisateur connecté
 *
 * @returns Paramètres entreprise ou erreur
 */
export async function getCompanySettings(): Promise<
  CrudActionResult<CompanySettings>
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const accessCheck = await checkAccess(
      session.user.id,
      session.user.role || ''
    )
    if (!accessCheck.allowed) {
      return { success: false, error: accessCheck.error }
    }

    const company = await prisma.company.findUnique({
      where: { id: accessCheck.companyId },
      select: {
        name: true,
        address: true,
        workingDays: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        defaultOpeningHours: true,
      },
    })

    if (!company) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    // Parse le JSON pour la pause déjeuner
    const openingHours = parseDefaultOpeningHours(company.defaultOpeningHours)

    const settings: CompanySettings = {
      name: company.name,
      address: company.address,
      workingDays: company.workingDays as DayOfWeek[],
      workingHoursStart: company.workingHoursStart,
      workingHoursEnd: company.workingHoursEnd,
      lunchBreak: openingHours.lunchBreak ?? { ...DEFAULT_LUNCH_BREAK },
    }

    return { success: true, data: settings }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCompanySettings] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la récupération des paramètres',
    }
  }
}

/**
 * Met à jour les paramètres de l'entreprise (merge partiel)
 *
 * @param input - Paramètres à mettre à jour (partiels)
 * @returns Paramètres complets après mise à jour
 *
 * @example
 * // Mettre à jour uniquement le nom
 * await updateCompanySettings({ name: 'Ma Nouvelle Entreprise' })
 *
 * // Mettre à jour les jours travaillés
 * await updateCompanySettings({
 *   workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
 * })
 */
export async function updateCompanySettings(
  input: UpdateCompanySettingsInput
): Promise<CrudActionResult<CompanySettings>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const accessCheck = await checkAccess(
      session.user.id,
      session.user.role || ''
    )
    if (!accessCheck.allowed) {
      return { success: false, error: accessCheck.error }
    }

    // Validation Zod
    const validation = updateCompanySettingsSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Données invalides',
        field: (firstError?.path[0] as string) ?? undefined,
      }
    }

    const updates = validation.data

    // Récupérer les paramètres actuels
    const company = await prisma.company.findUnique({
      where: { id: accessCheck.companyId },
      select: {
        name: true,
        address: true,
        workingDays: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        defaultOpeningHours: true,
      },
    })

    if (!company) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    // Parse les horaires actuels
    const currentOpeningHours = parseDefaultOpeningHours(
      company.defaultOpeningHours
    )

    // Construire les données de mise à jour Prisma
    const updateData: Prisma.CompanyUpdateInput = {}

    if (updates.name !== undefined) {
      updateData.name = updates.name
    }

    if (updates.address !== undefined) {
      updateData.address = updates.address
    }

    if (updates.workingDays !== undefined) {
      updateData.workingDays = updates.workingDays
    }

    if (updates.workingHoursStart !== undefined) {
      updateData.workingHoursStart = updates.workingHoursStart
    }

    if (updates.workingHoursEnd !== undefined) {
      updateData.workingHoursEnd = updates.workingHoursEnd
    }

    if (updates.lunchBreak !== undefined) {
      // Merge avec les données existantes du JSON
      const updatedOpeningHours: DefaultOpeningHoursJson = {
        ...currentOpeningHours,
        lunchBreak: updates.lunchBreak,
      }
      updateData.defaultOpeningHours =
        updatedOpeningHours as unknown as Prisma.InputJsonValue
    }

    // Mettre à jour en base
    await prisma.company.update({
      where: { id: accessCheck.companyId },
      data: updateData,
    })

    // Récupérer les données fraîches pour le retour
    const updatedCompany = await prisma.company.findUnique({
      where: { id: accessCheck.companyId },
      select: {
        name: true,
        address: true,
        workingDays: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        defaultOpeningHours: true,
      },
    })

    if (!updatedCompany) {
      return { success: false, error: 'Erreur lors de la mise à jour' }
    }

    const updatedOpeningHours = parseDefaultOpeningHours(
      updatedCompany.defaultOpeningHours
    )

    const settings: CompanySettings = {
      name: updatedCompany.name,
      address: updatedCompany.address,
      workingDays: updatedCompany.workingDays as DayOfWeek[],
      workingHoursStart: updatedCompany.workingHoursStart,
      workingHoursEnd: updatedCompany.workingHoursEnd,
      lunchBreak: updatedOpeningHours.lunchBreak ?? { ...DEFAULT_LUNCH_BREAK },
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'SETTINGS',
      entityId: accessCheck.companyId,
      userId: session.user.id,
      companyId: accessCheck.companyId,
      details: updates as unknown as Prisma.InputJsonValue,
    }).catch(console.error)

    revalidatePath('/app/settings')
    revalidatePath('/app/settings/company')

    return { success: true, data: settings }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[updateCompanySettings] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la mise à jour des paramètres',
    }
  }
}

/**
 * Réinitialise les paramètres entreprise aux valeurs par défaut
 *
 * Note : Ne modifie pas le nom de l'entreprise
 *
 * @returns Paramètres par défaut (sauf nom)
 */
export async function resetCompanySettings(): Promise<
  CrudActionResult<CompanySettings>
> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const accessCheck = await checkAccess(
      session.user.id,
      session.user.role || ''
    )
    if (!accessCheck.allowed) {
      return { success: false, error: accessCheck.error }
    }

    // Récupérer le nom actuel (on ne le réinitialise pas)
    const company = await prisma.company.findUnique({
      where: { id: accessCheck.companyId },
      select: { name: true },
    })

    if (!company) {
      return { success: false, error: 'Entreprise non trouvée' }
    }

    // Réinitialiser aux valeurs par défaut
    const defaultOpeningHours: DefaultOpeningHoursJson = {
      lunchBreak: { ...DEFAULT_LUNCH_BREAK },
    }

    await prisma.company.update({
      where: { id: accessCheck.companyId },
      data: {
        address: DEFAULT_COMPANY_SETTINGS.address,
        workingDays: DEFAULT_COMPANY_SETTINGS.workingDays,
        workingHoursStart: DEFAULT_COMPANY_SETTINGS.workingHoursStart,
        workingHoursEnd: DEFAULT_COMPANY_SETTINGS.workingHoursEnd,
        defaultOpeningHours:
          defaultOpeningHours as unknown as Prisma.InputJsonValue,
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'SETTINGS',
      entityId: accessCheck.companyId,
      userId: session.user.id,
      companyId: accessCheck.companyId,
      details: { action: 'reset', restoredDefaults: true },
    }).catch(console.error)

    revalidatePath('/app/settings')
    revalidatePath('/app/settings/company')

    const settings: CompanySettings = {
      name: company.name, // Garder le nom actuel
      address: DEFAULT_COMPANY_SETTINGS.address,
      workingDays: DEFAULT_COMPANY_SETTINGS.workingDays,
      workingHoursStart: DEFAULT_COMPANY_SETTINGS.workingHoursStart,
      workingHoursEnd: DEFAULT_COMPANY_SETTINGS.workingHoursEnd,
      lunchBreak: { ...DEFAULT_LUNCH_BREAK },
    }

    return { success: true, data: settings }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[resetCompanySettings] Error:', error)
    }

    return {
      success: false,
      error: 'Erreur lors de la réinitialisation des paramètres',
    }
  }
}
