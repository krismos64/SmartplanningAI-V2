/**
 * Bouton d'export PDF réutilisable
 *
 * @description Composant générique pour déclencher un export PDF via une API route.
 * Gère le chargement, le téléchargement et le nettoyage mémoire.
 */

'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast/use-toast'

interface ExportPdfButtonProps {
  /** URL de l'API route d'export PDF */
  href: string
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

export function ExportPdfButton({
  href,
  label = 'Export PDF',
  variant = 'outline',
  size = 'default',
  className,
  disabled,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { success, error } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(href)

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        error(data.error ?? 'Erreur lors de la génération du PDF')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        response.headers
          .get('Content-Disposition')
          ?.match(/filename="(.+)"/)?.[1] ?? 'export.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      success('Export réussi', {
        description: `Le fichier PDF a été téléchargé`,
      })
    } catch {
      error('Erreur lors du téléchargement du PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => void handleExport()}
      disabled={isExporting || disabled}
      className={className}
      data-testid="export-pdf-button"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Export en cours...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
