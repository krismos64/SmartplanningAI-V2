/**
 * Dropdown d'export du planning (PDF / Excel)
 *
 * @ticket SP-403, SP-404
 */

'use client'

import { useState } from 'react'
import { Download, FileText, Table, Loader2, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/toast/use-toast'
import { exportSchedulesCsv } from '@/lib/actions/schedules'

interface ExportDropdownProps {
  startDate: Date
  endDate: Date
  teamId?: string
  viewMode: 'week' | 'month'
  filters?: Record<string, unknown>
}

type ExportFormat = 'pdf' | 'excel' | 'csv' | null

export function ExportDropdown({
  startDate,
  endDate,
  teamId,
  viewMode,
  filters = {},
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat>(null)
  const { success, error: toastError } = useToast()

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const buildParams = () => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
    if (teamId) params.set('teamId', teamId)
    // Passer les filtres actifs de la vue planning
    const filterKeys = [
      'teamId',
      'employeeId',
      'status',
      'type',
      'search',
    ] as const
    for (const key of filterKeys) {
      const value = filters[key]
      if (value && typeof value === 'string') {
        params.set(key, value)
      }
    }
    return params
  }

  const dateSuffix = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`

  const handleExportPdf = async () => {
    setIsExporting('pdf')
    try {
      const params = buildParams()
      params.set('view', viewMode)

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
      downloadBlob(blob, `planning-${dateSuffix}.pdf`)
      success('Le planning PDF a été téléchargé.')
    } catch (err) {
      console.error('[ExportDropdown] PDF error:', err)
      toastError(
        err instanceof Error ? err.message : 'Impossible de générer le PDF'
      )
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting('excel')
    try {
      const params = buildParams()

      const response = await fetch(
        `/api/schedules/export/excel?${params.toString()}`
      )

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(data.error || "Erreur lors de l'export")
      }

      const blob = await response.blob()
      downloadBlob(blob, `planning-${dateSuffix}.xlsx`)
      success('Le fichier Excel a été téléchargé.')
    } catch (err) {
      console.error('[ExportDropdown] Excel error:', err)
      toastError(
        err instanceof Error
          ? err.message
          : 'Impossible de générer le fichier Excel'
      )
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportCsv = async () => {
    setIsExporting('csv')
    try {
      const result = await exportSchedulesCsv({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        teamId: (filters.teamId as string) || teamId,
        employeeId: filters.employeeId as string,
      })

      if (!result.success) {
        throw new Error(
          ('error' in result ? result.error : null) || "Erreur lors de l'export"
        )
      }

      const blob = new Blob([result.data.data], { type: result.data.mimeType })
      downloadBlob(blob, result.data.filename)
      success('Le fichier CSV a été téléchargé.')
    } catch (err) {
      console.error('[ExportDropdown] CSV error:', err)
      toastError(
        err instanceof Error
          ? err.message
          : 'Impossible de générer le fichier CSV'
      )
    } finally {
      setIsExporting(null)
    }
  }

  const isLoading = isExporting !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          data-testid="export-button"
        >
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
          data-testid="export-pdf"
          onClick={() => void handleExportPdf()}
          disabled={isLoading}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="export-excel"
          onClick={() => void handleExportExcel()}
          disabled={isLoading}
        >
          <Table className="mr-2 h-4 w-4" />
          Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="export-csv"
          onClick={() => void handleExportCsv()}
          disabled={isLoading}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
