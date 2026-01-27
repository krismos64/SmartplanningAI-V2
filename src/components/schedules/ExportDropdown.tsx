/**
 * Dropdown d'export du planning (PDF / Excel)
 *
 * @ticket SP-403
 */

'use client'

import { useState } from 'react'
import { Download, FileText, Table, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/toast/use-toast'

interface ExportDropdownProps {
  startDate: Date
  endDate: Date
  teamId?: string
  viewMode: 'week' | 'month'
}

export function ExportDropdown({
  startDate,
  endDate,
  teamId,
  viewMode,
}: ExportDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: toastError, info } = useToast()

  const handleExportPdf = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        view: viewMode,
      })
      if (teamId) params.set('teamId', teamId)

      const response = await fetch(
        `/api/schedules/export/pdf?${params.toString()}`
      )

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(data.error || "Erreur lors de l'export")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `planning-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      success('Le planning PDF a été téléchargé.')
    } catch (err) {
      console.error('[ExportDropdown] PDF error:', err)
      toastError(
        err instanceof Error ? err.message : 'Impossible de générer le PDF'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExcel = () => {
    info("L'export Excel sera disponible prochainement.")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => void handleExportPdf()}
          disabled={isLoading}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <Table className="mr-2 h-4 w-4" />
          Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
