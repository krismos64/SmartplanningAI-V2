/**
 * Hook custom pour le flow d'import CSV
 *
 * @description Gere l'etat complet du flow d'import :
 * file selection → parsing → preview → import → results
 *
 * Supporte .csv et .xlsx (conversion via xlsx package)
 *
 * @ticket SP-496
 */

'use client'

import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import {
  normalizeHeaders,
  MAX_IMPORT_ROWS,
  PREVIEW_ROW_COUNT,
} from '@/components/import/csv-import.utils'
import { importEmployeesFromCsv } from '@/lib/actions/csv-import'
import type { CsvImportResult, CsvImportOptions } from '@/lib/validations/csv-import'

// ============================================================================
// Types
// ============================================================================

export type ImportStep = 'upload' | 'preview' | 'importing' | 'results'

export interface PreviewData {
  /** En-tetes originaux du fichier */
  headers: string[]
  /** Mapping en-tetes → champs normalises */
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
  })

  /**
   * Reset l'etat pour un nouvel import
   */
  const reset = useCallback(() => {
    setState({
      step: 'upload',
      error: null,
      preview: null,
      results: null,
      isLoading: false,
    })
  }, [])

  /**
   * Convertit un fichier Excel en CSV string
   */
  const excelToCsv = useCallback(async (buffer: ArrayBuffer): Promise<string> => {
    // Import dynamique de xlsx (deja installe dans le projet)
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.SheetNames[0]
    if (!firstSheet) throw new Error('Le fichier Excel est vide')
    const worksheet = workbook.Sheets[firstSheet]
    if (!worksheet) throw new Error('Feuille de calcul introuvable')
    return XLSX.utils.sheet_to_csv(worksheet, { FS: ';' })
  }, [])

  /**
   * Traite un fichier uploade (CSV ou XLSX)
   */
  const processFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      let csvContent: string

      const ext = file.name.split('.').pop()?.toLowerCase()

      if (ext === 'xlsx' || ext === 'xls') {
        // Fichier Excel → convertir en CSV
        const buffer = await file.arrayBuffer()
        csvContent = await excelToCsv(buffer)
      } else if (ext === 'csv' || ext === 'txt') {
        // Fichier CSV → lire comme texte
        csvContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
          reader.readAsText(file, 'UTF-8')
        })
      } else {
        throw new Error('Format de fichier non supporté. Utilisez .csv, .xlsx ou .xls')
      }

      // Parser pour la preview (cote client)
      const parseResult = Papa.parse<Record<string, string>>(csvContent, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim(),
        preview: MAX_IMPORT_ROWS + 1, // +1 pour detecter le depassement
      })

      if (!parseResult.meta.fields || parseResult.meta.fields.length === 0) {
        throw new Error('Impossible de détecter les colonnes du fichier')
      }

      const rawHeaders = parseResult.meta.fields
      const { mapping, unmapped: unmappedHeaders, missingRequired } = normalizeHeaders(rawHeaders)

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

      setState({
        step: 'preview',
        error: null,
        preview: {
          headers: rawHeaders,
          headerMapping: mapping,
          unmappedHeaders: unmappedHeaders,
          rows: parseResult.data.slice(0, PREVIEW_ROW_COUNT),
          totalRows,
          csvContent,
          fileName: file.name,
        },
        results: null,
        isLoading: false,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        step: 'upload',
        error: err instanceof Error ? err.message : 'Erreur lors du traitement du fichier',
        isLoading: false,
      }))
    }
  }, [excelToCsv])

  /**
   * Lance l'import en envoyant le CSV brut a la Server Action
   */
  const startImport = useCallback(async (options: CsvImportOptions) => {
    if (!state.preview) return

    setState((prev) => ({ ...prev, step: 'importing', isLoading: true, error: null }))

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
  }, [state.preview])

  return {
    ...state,
    processFile,
    startImport,
    reset,
  }
}
