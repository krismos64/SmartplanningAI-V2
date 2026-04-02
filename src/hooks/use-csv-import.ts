/**
 * Hook custom pour le flow d'import CSV
 *
 * @description Gère l'état complet du flow d'import :
 * file selection → parsing → validation preview → import → résultats
 *
 * Supporte .csv et .xlsx (conversion via xlsx package)
 *
 * @ticket SP-496, SP-509
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import Papa from 'papaparse'
import {
  normalizeHeaders,
  MAX_IMPORT_ROWS,
  PREVIEW_ROW_COUNT,
  ACCEPTED_FIELDS,
  type CsvField,
} from '@/components/import/csv-import.utils'
import { importEmployeesFromCsv } from '@/lib/actions/csv-import'
import { csvEmployeeRowSchema } from '@/lib/validations/csv-import'
import type {
  CsvImportResult,
  CsvImportOptions,
} from '@/lib/validations/csv-import'

// ============================================================================
// Types
// ============================================================================

export type ImportStep = 'upload' | 'preview' | 'importing' | 'results'

export interface RowValidationError {
  field: string
  message: string
}

export interface RowValidationResult {
  row: number
  valid: boolean
  errors: RowValidationError[]
}

export interface PreviewData {
  /** En-têtes originaux du fichier */
  headers: string[]
  /** Mapping en-têtes → champs normalisés */
  headerMapping: Record<string, string>
  /** Colonnes non reconnues */
  unmappedHeaders: string[]
  /** Lignes de preview (max PREVIEW_ROW_COUNT) */
  rows: Record<string, string>[]
  /** Nombre total de lignes */
  totalRows: number
  /** Contenu CSV brut (pour envoyer au serveur) */
  csvContent: string
  /** Nom du fichier */
  fileName: string
}

export interface ImportState {
  step: ImportStep
  error: string | null
  preview: PreviewData | null
  results: CsvImportResult | null
  isLoading: boolean
  /** Résultats de validation Zod côté client (toutes les lignes) */
  validationResults: RowValidationResult[]
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Normalise une ligne brute CSV en objet avec les champs attendus
 * (même logique que la Server Action, pour validation côté client)
 */
function normalizeRow(
  raw: Record<string, string>,
  mapping: Record<string, string>
): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [originalHeader, value] of Object.entries(raw)) {
    const field = mapping[originalHeader]
    if (field && ACCEPTED_FIELDS.includes(field as CsvField)) {
      normalized[field] = value ?? ''
    }
  }
  return normalized
}

/**
 * Valide toutes les lignes parsées avec le schéma Zod côté client
 */
function validateAllRows(
  allRows: Record<string, string>[],
  mapping: Record<string, string>
): RowValidationResult[] {
  return allRows.map((raw, index) => {
    const normalized = normalizeRow(raw, mapping)
    const result = csvEmployeeRowSchema.safeParse(normalized)

    if (result.success) {
      return { row: index + 1, valid: true, errors: [] }
    }

    return {
      row: index + 1,
      valid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'inconnu',
        message: issue.message,
      })),
    }
  })
}

// ============================================================================
// Hook
// ============================================================================

export function useCsvImport() {
  const [state, setState] = useState<ImportState>({
    step: 'upload',
    error: null,
    preview: null,
    results: null,
    isLoading: false,
    validationResults: [],
  })

  // Compteurs dérivés de la validation
  const validRowsCount = useMemo(
    () => state.validationResults.filter((r) => r.valid).length,
    [state.validationResults]
  )
  const invalidRowsCount = useMemo(
    () => state.validationResults.filter((r) => !r.valid).length,
    [state.validationResults]
  )

  /**
   * Reset l'état pour un nouvel import
   */
  const reset = useCallback(() => {
    setState({
      step: 'upload',
      error: null,
      preview: null,
      results: null,
      isLoading: false,
      validationResults: [],
    })
  }, [])

  /**
   * Convertit un fichier Excel en CSV string
   */
  const excelToCsv = useCallback(
    async (buffer: ArrayBuffer): Promise<string> => {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      if (!firstSheet) throw new Error('Le fichier Excel est vide')
      const worksheet = workbook.Sheets[firstSheet]
      if (!worksheet) throw new Error('Feuille de calcul introuvable')
      return XLSX.utils.sheet_to_csv(worksheet, { FS: ';' })
    },
    []
  )

  /**
   * Traite un fichier uploadé (CSV ou XLSX)
   */
  const processFile = useCallback(
    async (file: File) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        let csvContent: string

        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'xlsx' || ext === 'xls') {
          const buffer = await file.arrayBuffer()
          csvContent = await excelToCsv(buffer)
        } else if (ext === 'csv' || ext === 'txt') {
          csvContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () =>
              reject(new Error('Erreur de lecture du fichier'))
            reader.readAsText(file, 'UTF-8')
          })
        } else {
          throw new Error(
            'Format de fichier non supporté. Utilisez .csv, .xlsx ou .xls'
          )
        }

        // Parser toutes les lignes (côté client)
        const parseResult = Papa.parse<Record<string, string>>(csvContent, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header: string) => header.trim(),
          preview: MAX_IMPORT_ROWS + 1,
        })

        if (!parseResult.meta.fields || parseResult.meta.fields.length === 0) {
          throw new Error('Impossible de détecter les colonnes du fichier')
        }

        const rawHeaders = parseResult.meta.fields
        const {
          mapping,
          unmapped: unmappedHeaders,
          missingRequired,
        } = normalizeHeaders(rawHeaders)

        if (missingRequired.length > 0) {
          throw new Error(
            `Colonnes obligatoires manquantes : ${missingRequired.join(', ')}. Téléchargez le template CSV pour le format attendu.`
          )
        }

        const totalRows = parseResult.data.length

        if (totalRows === 0) {
          throw new Error('Le fichier ne contient aucune ligne de données')
        }

        if (totalRows > MAX_IMPORT_ROWS) {
          throw new Error(
            `Le fichier contient ${totalRows} lignes. Maximum autorisé : ${MAX_IMPORT_ROWS}.`
          )
        }

        // SP-509 : Validation Zod côté client de TOUTES les lignes
        const validationResults = validateAllRows(parseResult.data, mapping)

        setState({
          step: 'preview',
          error: null,
          preview: {
            headers: rawHeaders,
            headerMapping: mapping,
            unmappedHeaders,
            rows: parseResult.data.slice(0, PREVIEW_ROW_COUNT),
            totalRows,
            csvContent,
            fileName: file.name,
          },
          results: null,
          isLoading: false,
          validationResults,
        })
      } catch (err) {
        setState((prev) => ({
          ...prev,
          step: 'upload',
          error:
            err instanceof Error
              ? err.message
              : 'Erreur lors du traitement du fichier',
          isLoading: false,
        }))
      }
    },
    [excelToCsv]
  )

  /**
   * Lance l'import en envoyant le CSV brut à la Server Action
   */
  const startImport = useCallback(
    async (options: CsvImportOptions) => {
      if (!state.preview) return

      setState((prev) => ({
        ...prev,
        step: 'importing',
        isLoading: true,
        error: null,
      }))

      try {
        const result = await importEmployeesFromCsv(
          state.preview.csvContent,
          options
        )

        if (result.success) {
          setState((prev) => ({
            ...prev,
            step: 'results',
            results: result.data,
            isLoading: false,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            step: 'preview',
            error: result.error,
            isLoading: false,
          }))
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          step: 'preview',
          error: err instanceof Error ? err.message : "Erreur lors de l'import",
          isLoading: false,
        }))
      }
    },
    [state.preview]
  )

  return {
    ...state,
    validRowsCount,
    invalidRowsCount,
    processFile,
    startImport,
    reset,
  }
}
