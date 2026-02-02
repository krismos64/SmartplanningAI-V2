'use client'

/**
 * Bouton d'export CSV réutilisable
 *
 * @description Composant générique pour déclencher un export CSV via une Server Action.
 * Gère automatiquement :
 * - L'état de chargement avec spinner
 * - Le téléchargement du fichier via Blob/URL.createObjectURL
 * - Le nettoyage de la mémoire après téléchargement
 *
 * @ticket SP-333
 */

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast/use-toast'
import type { CsvExportActionResult } from '@/types'

interface ExportCsvButtonProps<TFilters> {
  /** Server Action d'export */
  action: (filters?: TFilters) => Promise<CsvExportActionResult>
  /** Filtres optionnels à passer à l'action */
  filters?: TFilters
  /** Label du bouton */
  label?: string
  /** Variante du bouton */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** Taille du bouton */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Classe CSS additionnelle */
  className?: string
  /** Désactivé */
  disabled?: boolean
}

export function ExportCsvButton<TFilters>({
  action,
  filters,
  label = 'Exporter CSV',
  variant = 'outline',
  size = 'default',
  className,
  disabled,
}: ExportCsvButtonProps<TFilters>) {
  const [isExporting, setIsExporting] = useState(false)
  const { success, error } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const result = await action(filters)

      if (!result.success) {
        error(result.error ?? "Une erreur s'est produite", {
          description: "Erreur d'export",
        })
        return
      }

      if (result.data) {
        // Créer un blob et déclencher le téléchargement
        const blob = new Blob([result.data.data], {
          type: result.data.mimeType,
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Nettoyer l'URL blob
        URL.revokeObjectURL(url)

        success('Export réussi', {
          description: `Le fichier ${result.data.filename} a été téléchargé`,
        })
      }
    } catch (err) {
      console.error('[ExportCsvButton] Error:', err)
      error("Une erreur inattendue s'est produite", {
        description: "Erreur d'export",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const onClickHandler = () => {
    void handleExport()
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClickHandler}
      disabled={isExporting || disabled}
      className={className}
      data-testid="export-csv-button"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Export en cours...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
