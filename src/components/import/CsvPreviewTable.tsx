/**
 * Tableau de preview des données CSV importées
 *
 * Affiche les N premières lignes avec :
 * - Badges de mapping des colonnes
 * - Compteur lignes valides/invalides
 * - Cellules invalides colorées en rouge avec tooltip d'erreur
 *
 * @ticket SP-496, SP-509
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { PreviewData, RowValidationResult } from '@/hooks/use-csv-import'

interface CsvPreviewTableProps {
  preview: PreviewData
  validationResults: RowValidationResult[]
  validRowsCount: number
  invalidRowsCount: number
}

export function CsvPreviewTable({
  preview,
  validationResults,
  validRowsCount,
  invalidRowsCount,
}: CsvPreviewTableProps) {
  const { headers, headerMapping, unmappedHeaders, rows, totalRows } = preview

  // Créer une map rapide : row → { field → message }
  const errorMap = new Map<number, Map<string, string>>()
  for (const result of validationResults) {
    if (!result.valid) {
      const fieldErrors = new Map<string, string>()
      for (const err of result.errors) {
        fieldErrors.set(err.field, err.message)
      }
      errorMap.set(result.row, fieldErrors)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Badges mapping colonnes */}
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

        {/* SP-509 : Compteur lignes valides / invalides */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" size="sm" icon={<CheckCircle2 />}>
            {validRowsCount} ligne{validRowsCount > 1 ? 's' : ''} valide
            {validRowsCount > 1 ? 's' : ''} sur {totalRows}
          </Badge>
          {invalidRowsCount > 0 && (
            <Badge variant="destructive" size="sm" icon={<AlertCircle />}>
              {invalidRowsCount} ligne{invalidRowsCount > 1 ? 's' : ''} avec
              erreur{invalidRowsCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* SP-509 : Avertissement si erreurs détectées */}
        {invalidRowsCount > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-muted-foreground">
              Les lignes contenant des erreurs ne seront pas importées. Vous
              pouvez corriger votre fichier et le recharger.
            </p>
          </div>
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
              {rows.map((row, index) => {
                const rowNumber = index + 1
                const rowErrors = errorMap.get(rowNumber)

                return (
                  <TableRow key={index}>
                    <TableCell className="text-center text-muted-foreground">
                      {rowErrors ? (
                        <span className="text-destructive">{rowNumber}</span>
                      ) : (
                        rowNumber
                      )}
                    </TableCell>
                    {headers.map((header) => {
                      const mappedField = headerMapping[header]
                      const cellError =
                        mappedField && rowErrors
                          ? rowErrors.get(mappedField)
                          : undefined

                      if (!mappedField) {
                        // Colonne non mappée
                        return (
                          <TableCell
                            key={header}
                            className="text-muted-foreground opacity-50"
                          >
                            {row[header] || '—'}
                          </TableCell>
                        )
                      }

                      if (cellError) {
                        // SP-509 : Cellule en erreur avec tooltip
                        return (
                          <TableCell key={header} className="p-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-help rounded bg-destructive/10 px-4 py-2 text-destructive">
                                  {row[header] || (
                                    <span className="italic">vide</span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{cellError}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        )
                      }

                      // Cellule valide
                      return (
                        <TableCell key={header}>
                          {row[header] || (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        <p className="text-sm text-muted-foreground">
          Aperçu de {rows.length} ligne{rows.length > 1 ? 's' : ''} sur{' '}
          {totalRows} au total
        </p>
      </div>
    </TooltipProvider>
  )
}
