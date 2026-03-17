'use client'

/**
 * DataTable des logs d'audit avec pagination serveur
 *
 * @ticket SP-445
 */

import { useCallback, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Eye, Download, RefreshCw, ScrollText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AuditLogEntry } from '@/types/audit'
import type { PaginatedResult } from '@/types'
import { AuditActionBadge, ENTITY_TYPE_LABELS } from './audit-action-badge'
import { AuditLogDetailModal } from './audit-log-detail-modal'
import { AuditLogFilterBar } from './audit-log-filter-bar'
import { exportAuditLogsCsv } from '@/lib/actions/audit-logs'

// ============================================================================
// TYPES
// ============================================================================

interface AuditLogsDataTableProps {
  data: PaginatedResult<AuditLogEntry>
}

// ============================================================================
// COLONNES
// ============================================================================

function createColumns(
  onViewDetail: (log: AuditLogEntry) => void
): ColumnDef<AuditLogEntry>[] {
  return [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <span className="whitespace-nowrap text-sm">
            {new Intl.DateTimeFormat('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(date)}
          </span>
        )
      },
    },
    {
      accessorKey: 'user',
      header: 'Utilisateur',
      cell: ({ row }) => {
        const user = row.original.user
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.name ?? user.email}
            </p>
            {user.name && (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
    },
    {
      accessorKey: 'entityType',
      header: 'Entité',
      cell: ({ row }) => (
        <span className="text-sm">
          {ENTITY_TYPE_LABELS[row.original.entityType] ??
            row.original.entityType}
        </span>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Entreprise',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.company?.name ?? '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail(row.original)}
          aria-label="Voir les détails"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]
}

// ============================================================================
// COMPOSANT
// ============================================================================

export function AuditLogsDataTable({ data }: AuditLogsDataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Modal détail
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Colonnes
  const columns = useMemo(() => createColumns(setSelectedLog), [])

  // Navigation pagination
  const updateSearchParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const goToPage = useCallback(
    (page: number) => updateSearchParam('page', String(page)),
    [updateSearchParam]
  )

  const changePageSize = useCallback(
    (size: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('pageSize', size)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  // Export CSV
  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const filters: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        if (key !== 'page' && key !== 'pageSize') {
          filters[key] = value
        }
      })
      const result = await exportAuditLogsCsv(filters)
      if (result.success) {
        const blob = new Blob([result.data], {
          type: 'text/csv;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Silently fail export
    } finally {
      setIsExporting(false)
    }
  }, [searchParams])

  // TanStack Table
  const table = useReactTable({
    data: data.data,
    columns,
    pageCount: data.totalPages,
    state: {
      pagination: {
        pageIndex: data.page - 1,
        pageSize: data.pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Journal d&apos;audit
            </h1>
            <p className="text-sm text-muted-foreground">
              {data.total} entrée{data.total > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            disabled={isExporting || data.total === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Export...' : 'Exporter CSV'}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <AuditLogFilterBar />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun log d&apos;audit trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lignes par page</span>
          <Select value={String(data.pageSize)} onValueChange={changePageSize}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Page {data.page} sur {data.totalPages || 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(data.page - 1)}
            disabled={data.page <= 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(data.page + 1)}
            disabled={data.page >= data.totalPages}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Modal détail */}
      <AuditLogDetailModal
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  )
}
