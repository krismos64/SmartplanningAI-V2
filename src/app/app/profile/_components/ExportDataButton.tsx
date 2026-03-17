'use client'

/**
 * ExportDataButton - Bouton d'export des données personnelles
 *
 * Conforme RGPD Article 20 - Droit à la portabilité des données.
 * Déclenche un téléchargement JSON de toutes les données de l'utilisateur.
 *
 * @ticket SP-278
 */

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import { exportUserData, type ExportDataResult } from '@/lib/actions/profile'

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false)

  const { mutate, isPending } = useCrudMutation<
    Record<string, never>,
    ExportDataResult
  >(exportUserData, {
    successMessage: 'Export réussi !',
    onSuccess: (exportData) => {
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([exportData.data], {
        type: exportData.mimeType,
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = exportData.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Nettoyer l'URL blob
      URL.revokeObjectURL(url)
      setIsExporting(false)
    },
    onError: () => {
      setIsExporting(false)
    },
  })

  const handleExport = () => {
    setIsExporting(true)
    void mutate({})
  }

  const loading = isPending || isExporting

  return (
    <Button
      variant="default"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
      data-testid="export-data-button"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Export en cours...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exporter mes données
        </>
      )}
    </Button>
  )
}
