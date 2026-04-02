/**
 * Server Action pour l'import CSV d'employes
 *
 * @description Import bulk d'employes depuis un fichier CSV.
 * Le CSV brut est parse cote serveur avec papaparse (defense-in-depth).
 * Seuls SYSTEM_ADMIN et DIRECTOR peuvent importer.
 *
 * Flow :
 * 1. Auth + impersonation guard + RBAC
 * 2. Parse CSV cote serveur (papaparse)
 * 3. Normalise les en-tetes
 * 4. Valide chaque ligne avec Zod
 * 5. Resout/cree les equipes
 * 6. Detecte les doublons
 * 7. Insere les employes dans une $transaction
 * 8. Sync Stripe + cache + audit + revalidate
 *
 * @ticket SP-497
 */

'use server'

import { revalidatePath } from 'next/cache'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  getEffectiveSessionData,
  assertNotImpersonating,
} from '@/lib/impersonation'
import { validateData, handlePrismaError } from './crud-helpers'
import { logAuditAction } from '@/lib/services/audit'
import { syncEmployeeCountToStripe } from '@/lib/services/stripe/subscription-sync.service'
import { invalidateDashboardCache, invalidateEmployeesCache } from '@/lib/cache'
import {
  csvImportPayloadSchema,
  csvEmployeeRowSchema,
  validateRowCount,
  type CsvImportResult,
  type CsvImportRowError,
  type CsvImportSkipped,
  type CsvImportCreated,
  type CsvImportOptions,
  type CsvEmployeeRow,
} from '@/lib/validations/csv-import'
import {
  normalizeHeaders,
  type CsvField,
  ACCEPTED_FIELDS,
} from '@/components/import/csv-import.utils'
import type { CrudActionResult } from '@/types'

// ============================================================================
// Types internes
// ============================================================================

interface ParsedRow {
  rowIndex: number
  raw: Record<string, string>
  normalized: Record<string, string>
}

// ============================================================================
// Server Action principale
// ============================================================================

export async function importEmployeesFromCsv(
  csvContent: string,
  options: CsvImportOptions
): Promise<CrudActionResult<CsvImportResult>> {
  const startTime = Date.now()

  // ------------------------------------------------------------------
  // 1. AUTH — Recuperer session utilisateur
  // ------------------------------------------------------------------
  const session = await auth()
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Vous devez être connecté pour effectuer cette action',
    }
  }

  // ------------------------------------------------------------------
  // 2. IMPERSONATION GUARD
  // ------------------------------------------------------------------
  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  // ------------------------------------------------------------------
  // 3. RBAC — Seuls SYSTEM_ADMIN et DIRECTOR peuvent importer
  // ------------------------------------------------------------------
  const effective = await getEffectiveSessionData(session)
  const role = effective.role
  const userId = effective.userId
  const companyId = effective.companyId

  if (role !== 'SYSTEM_ADMIN' && role !== 'DIRECTOR') {
    return {
      success: false,
      error: "Vous n'avez pas les permissions pour importer des employés",
    }
  }

  // DIRECTOR doit avoir un companyId
  if (role === 'DIRECTOR' && !companyId) {
    return { success: false, error: 'Utilisateur sans entreprise associée' }
  }

  // Pour SYSTEM_ADMIN sans companyId, on ne peut pas importer (il faudrait specifier la company)
  if (!companyId) {
    return {
      success: false,
      error: "Veuillez sélectionner une entreprise avant d'importer",
    }
  }

  // ------------------------------------------------------------------
  // 4. VALIDATION DU PAYLOAD
  // ------------------------------------------------------------------
  const payloadValidation = validateData(csvImportPayloadSchema, {
    csvContent,
    options,
  })
  if (!payloadValidation.success) {
    return { success: false, error: payloadValidation.error }
  }

  const validOptions = payloadValidation.data.options

  // ------------------------------------------------------------------
  // 5. PARSE CSV COTE SERVEUR (defense-in-depth)
  // ------------------------------------------------------------------
  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string) => header.trim(),
    // Ne pas utiliser dynamicTyping — on veut des strings pour Zod
  })

  if (parseResult.errors.length > 0) {
    const criticalErrors = parseResult.errors.filter(
      (e) => e.type === 'Delimiter' || e.type === 'FieldMismatch'
    )
    if (criticalErrors.length > 0) {
      return {
        success: false,
        error: `Erreur de parsing CSV : ${criticalErrors[0]?.message ?? 'format invalide'}`,
      }
    }
  }

  const rawRows = parseResult.data
  const rawHeaders = parseResult.meta.fields ?? []

  // ------------------------------------------------------------------
  // 6. NORMALISATION DES EN-TETES
  // ------------------------------------------------------------------
  const { mapping, missingRequired } = normalizeHeaders(rawHeaders)

  if (missingRequired.length > 0) {
    return {
      success: false,
      error: `Colonnes obligatoires manquantes : ${missingRequired.join(', ')}. Téléchargez le template CSV pour le format attendu.`,
    }
  }

  // ------------------------------------------------------------------
  // 7. VALIDATION DU NOMBRE DE LIGNES
  // ------------------------------------------------------------------
  const rowCountError = validateRowCount(rawRows.length)
  if (rowCountError) {
    return { success: false, error: rowCountError }
  }

  // ------------------------------------------------------------------
  // 8. NORMALISER LES DONNEES (remapper les colonnes)
  // ------------------------------------------------------------------
  const normalizedRows: ParsedRow[] = rawRows.map((raw, index) => {
    const normalized: Record<string, string> = {}
    for (const [originalHeader, value] of Object.entries(raw)) {
      const field = mapping[originalHeader]
      if (field && ACCEPTED_FIELDS.includes(field as CsvField)) {
        normalized[field] = value ?? ''
      }
    }
    return { rowIndex: index + 1, raw, normalized }
  })

  // ------------------------------------------------------------------
  // 9. VALIDATION ZOD LIGNE PAR LIGNE
  // ------------------------------------------------------------------
  const validatedRows: { rowIndex: number; data: CsvEmployeeRow }[] = []
  const validationErrors: CsvImportRowError[] = []

  for (const row of normalizedRows) {
    const result = csvEmployeeRowSchema.safeParse(row.normalized)
    if (result.success) {
      validatedRows.push({ rowIndex: row.rowIndex, data: result.data })
    } else {
      for (const issue of result.error.issues) {
        validationErrors.push({
          row: row.rowIndex,
          field: issue.path.join('.') || 'inconnu',
          message: issue.message,
          rawData: row.raw,
        })
      }
    }
  }

  // Si TOUTES les lignes sont en erreur, on n'insere rien
  if (validatedRows.length === 0) {
    return {
      success: true,
      data: {
        totalRows: normalizedRows.length,
        created: [],
        skipped: [],
        errors: validationErrors,
        teamsCreated: [],
        durationMs: Date.now() - startTime,
      },
    }
  }

  // ------------------------------------------------------------------
  // 10. INSERTION EN BASE (dans une $transaction)
  // ------------------------------------------------------------------
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 10a. Charger les employes existants pour detection de doublons
      const existingEmployees = await tx.employee.findMany({
        where: { companyId },
        select: { id: true, firstName: true, lastName: true, email: true },
      })

      // Map pour detection rapide
      const emailMap = new Map<string, string>()
      const nameMap = new Map<string, string>()
      for (const emp of existingEmployees) {
        if (emp.email) {
          emailMap.set(emp.email.toLowerCase(), emp.id)
        }
        nameMap.set(
          `${emp.firstName.toLowerCase()}|${emp.lastName.toLowerCase()}`,
          emp.id
        )
      }

      // 10b. Resoudre/creer les equipes
      const teamNames = new Set<string>()
      for (const { data } of validatedRows) {
        if (data.teamName) teamNames.add(data.teamName)
      }

      const teamMap = new Map<string, string>()
      const teamsCreated: string[] = []

      if (teamNames.size > 0) {
        // Chercher les equipes existantes
        const existingTeams = await tx.team.findMany({
          where: {
            companyId,
            name: { in: Array.from(teamNames), mode: 'insensitive' },
          },
          select: { id: true, name: true },
        })

        for (const team of existingTeams) {
          teamMap.set(team.name.toLowerCase(), team.id)
        }

        // Creer les equipes manquantes si option activee
        if (validOptions.autoCreateTeams) {
          for (const name of teamNames) {
            if (!teamMap.has(name.toLowerCase())) {
              const newTeam = await tx.team.create({
                data: { name, companyId },
              })
              teamMap.set(name.toLowerCase(), newTeam.id)
              teamsCreated.push(name)
            }
          }
        }
      }

      // 10c. Inserer les employes un par un (pour rapport detaille)
      const created: CsvImportCreated[] = []
      const skipped: CsvImportSkipped[] = []

      for (const { rowIndex, data } of validatedRows) {
        // Detection de doublons
        if (validOptions.skipDuplicates) {
          const employeeName = `${data.firstName} ${data.lastName}`

          // Par email si present
          if (data.email && emailMap.has(data.email)) {
            skipped.push({
              row: rowIndex,
              reason: `Doublon détecté (email : ${data.email})`,
              employeeName,
            })
            continue
          }

          // Par nom complet si email absent
          const nameKey = `${data.firstName.toLowerCase()}|${data.lastName.toLowerCase()}`
          if (!data.email && nameMap.has(nameKey)) {
            skipped.push({
              row: rowIndex,
              reason: `Doublon détecté (nom : ${employeeName})`,
              employeeName,
            })
            continue
          }
        }

        // Resoudre le teamId
        let teamId: string | null = null
        if (data.teamName) {
          teamId = teamMap.get(data.teamName.toLowerCase()) ?? null
        }

        try {
          const employee = await tx.employee.create({
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              jobTitle: data.jobTitle,
              department: data.department,
              weeklyHours: data.weeklyHours ?? 35,
              hireDate: data.hireDate ? new Date(data.hireDate) : null,
              skills: data.skills ?? [],
              companyId,
              teamId,
              isActive: true,
            },
          })

          created.push({
            row: rowIndex,
            employeeId: employee.id,
            employeeName: `${data.firstName} ${data.lastName}`,
            teamName: data.teamName ?? undefined,
          })

          // Ajouter au map pour eviter les doublons intra-CSV
          if (data.email) {
            emailMap.set(data.email, employee.id)
          }
          nameMap.set(
            `${data.firstName.toLowerCase()}|${data.lastName.toLowerCase()}`,
            employee.id
          )
        } catch (error) {
          const prismaError = handlePrismaError(error)
          validationErrors.push({
            row: rowIndex,
            field: prismaError.field ?? 'inconnu',
            message: prismaError.error,
          })
        }
      }

      return { created, skipped, teamsCreated }
    })

    // ------------------------------------------------------------------
    // 11. POST-IMPORT : Sync Stripe + Cache + Audit + Revalidate
    // ------------------------------------------------------------------

    // Sync Stripe (fire-and-forget)
    if (result.created.length > 0) {
      syncEmployeeCountToStripe(companyId).catch(console.error)
    }

    // Invalidation cache (fire-and-forget)
    invalidateEmployeesCache(companyId).catch(console.error)
    invalidateDashboardCache(companyId).catch(console.error)

    // Audit log
    logAuditAction({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: 'bulk-import-csv',
      userId,
      companyId,
      details: {
        totalRows: normalizedRows.length,
        created: result.created.length,
        skipped: result.skipped.length,
        errors: validationErrors.length,
        teamsCreated: result.teamsCreated,
      },
    }).catch(console.error)

    // Revalidation des pages
    revalidatePath('/app/dashboard/employees')
    revalidatePath('/app/dashboard/import')

    return {
      success: true,
      data: {
        totalRows: normalizedRows.length,
        created: result.created,
        skipped: result.skipped,
        errors: validationErrors,
        teamsCreated: result.teamsCreated,
        durationMs: Date.now() - startTime,
      },
    }
  } catch (error) {
    console.error('[importEmployeesFromCsv] Transaction error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: `Erreur lors de l'import : ${prismaError.error}`,
    }
  }
}
