/**
 * ExportPdfButton — Bouton d'export PDF des stats admin
 *
 * @ticket SP-475
 */
'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast/use-toast'

export function ExportPdfButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { error: toastError } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/stats/export/pdf')

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        toastError(data.error ?? 'Erreur lors de la generation du PDF')
        return
      }

      // Telecharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        response.headers
          .get('Content-Disposition')
          ?.match(/filename="(.+)"/)?.[1] ?? 'smartplanning-stats.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toastError('Erreur lors du telechargement du PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void handleExport()}
      disabled={isExporting}
      data-testid="export-pdf-button"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <FileDown className="mr-2 h-4 w-4" aria-hidden />
      )}
      Exporter PDF
    </Button>
  )
}
