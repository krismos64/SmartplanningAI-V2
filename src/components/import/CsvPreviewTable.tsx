/**
 * Tableau de preview des donnees CSV importees
 *
 * Affiche les N premieres lignes avec indication du mapping des colonnes.
 *
 * @ticket SP-496
 */

'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PreviewData } from '@/hooks/use-csv-import'

interface CsvPreviewTableProps {
  preview: PreviewData
}

export function CsvPreviewTable({ preview }: CsvPreviewTableProps) {
  const { headers, headerMapping, unmappedHeaders, rows, totalRows } = preview

  return (
    <div className="space-y-3">
      {/* Resume du mapping */}
      <div className="flex flex-wrap gap-2">
        {headers.map((header) => {
          const mapped = headerMapping[header]
          return (
            <Badge
              key={header}
              variant={mapped ? 'success' : 'warning'}
              size="sm"
              icon={mapped ? <CheckCircle2 /> : <AlertCircle />}
            >
              {header}
              {mapped && mapped !== header.toLowerCase() && (
                <span className="ml-1 opacity-70">→ {mapped}</span>
              )}
            </Badge>
          )
        })}
      </div>

      {unmappedHeaders.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Colonnes ignorées : {unmappedHeaders.join(', ')}
        </p>
      )}

      {/* Tableau de preview */}
      <ScrollArea className="max-h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className={
                    headerMapping[header]
                      ? ''
                      : 'text-muted-foreground line-through'
                  }
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    className={
                      headerMapping[header]
                        ? ''
                        : 'text-muted-foreground opacity-50'
                    }
                  >
                    {row[header] || (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <p className="text-sm text-muted-foreground">
        Aperçu de {rows.length} ligne{rows.length > 1 ? 's' : ''} sur{' '}
        {totalRows} au total
      </p>
    </div>
  )
}
