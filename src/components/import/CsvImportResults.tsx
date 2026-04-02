/**
 * Affichage des résultats d'un import CSV
 *
 * Montre les compteurs (créés, ignorés, erreurs) et le détail par ligne.
 * Les lignes en erreur sont dépliables pour voir les données brutes.
 *
 * @ticket SP-497, SP-511
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle2,
  SkipForward,
  AlertTriangle,
  Clock,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { CsvImportResult } from '@/lib/validations/csv-import'

interface CsvImportResultsProps {
  results: CsvImportResult
}

export function CsvImportResults({ results }: CsvImportResultsProps) {
  const { totalRows, created, skipped, errors, teamsCreated, durationMs } =
    results

  // SP-511 : État pour gérer les lignes dépliées
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Compteurs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRows}</p>
              <p className="text-xs text-muted-foreground">Lignes traitées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-success/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {created.length}
              </p>
              <p className="text-xs text-muted-foreground">Créés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-warning/10 p-2">
              <SkipForward className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">
                {skipped.length}
              </p>
              <p className="text-xs text-muted-foreground">Ignorés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {errors.length}
              </p>
              <p className="text-xs text-muted-foreground">Erreurs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Méta-infos */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {durationMs < 1000
            ? `${durationMs} ms`
            : `${(durationMs / 1000).toFixed(1)} s`}
        </span>
        {teamsCreated.length > 0 && (
          <span>Équipes créées : {teamsCreated.join(', ')}</span>
        )}
      </div>

      {/* Détail des employés créés */}
      {created.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Collaborateurs créés ({created.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ligne</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Équipe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {created.map((item) => (
                    <TableRow key={item.employeeId}>
                      <TableCell className="text-muted-foreground">
                        {item.row}
                      </TableCell>
                      <TableCell>{item.employeeName}</TableCell>
                      <TableCell>
                        {item.teamName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Détail des lignes ignorées */}
      {skipped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SkipForward className="h-4 w-4 text-warning" />
              Lignes ignorées ({skipped.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ligne</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skipped.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">
                        {item.row}
                      </TableCell>
                      <TableCell>{item.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="warning" size="sm">
                          {item.reason}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* SP-511 : Détail des erreurs avec expand/collapse */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Erreurs ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="w-16">Ligne</TableHead>
                    <TableHead>Champ</TableHead>
                    <TableHead>Erreur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((item, i) => {
                    const isExpanded = expandedErrors.has(i)
                    const hasRawData =
                      item.rawData && Object.keys(item.rawData).length > 0

                    return (
                      <>
                        <TableRow
                          key={`error-${i}`}
                          className={hasRawData ? 'cursor-pointer' : ''}
                          onClick={
                            hasRawData ? () => toggleExpanded(i) : undefined
                          }
                        >
                          <TableCell className="w-10 p-2 text-center">
                            {hasRawData &&
                              (isExpanded ? (
                                <ChevronDown className="mx-auto h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="mx-auto h-4 w-4 text-muted-foreground" />
                              ))}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.row}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs">{item.field}</code>
                          </TableCell>
                          <TableCell className="text-destructive">
                            {item.message}
                          </TableCell>
                        </TableRow>

                        {/* SP-511 : Données brutes dépliées */}
                        {isExpanded && item.rawData && (
                          <TableRow key={`raw-${i}`}>
                            <TableCell colSpan={4} className="bg-muted/30 p-3">
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                {Object.entries(item.rawData).map(
                                  ([key, value]) => (
                                    <span
                                      key={key}
                                      className={
                                        key === item.field ||
                                        item.field === key.toLowerCase()
                                          ? 'text-destructive'
                                          : 'text-muted-foreground'
                                      }
                                    >
                                      <strong className="text-foreground">
                                        {key}
                                      </strong>{' '}
                                      : {value || <em>vide</em>}
                                    </span>
                                  )
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
