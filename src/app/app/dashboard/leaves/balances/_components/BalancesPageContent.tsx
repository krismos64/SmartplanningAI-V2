/**
 * BalancesPageContent - Client Component pour la page soldes congés
 *
 * @description Liste des soldes avec édition inline (DIRECTOR only)
 * @ticket SP-414
 */

'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import type { LeaveBalance } from '@prisma/client'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Pencil, ChevronLeft, ChevronRight, Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { LeaveBalanceEditDialog } from '@/components/leaves'
import { getAllLeaveBalances } from '@/lib/actions/leaves'
import { cn } from '@/lib/utils'

type LeaveBalanceWithEmployee = LeaveBalance & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    team: { id: string; name: string } | null
  }
  paidLeaveRemaining: number
  rttRemaining: number
}

interface BalancesPageContentProps {
  initialBalances: LeaveBalanceWithEmployee[]
  initialPagination: { page: number; pageSize: number; total: number }
  employees: { id: string; firstName: string; lastName: string }[]
  currentYear: number
}

/** Barre de progression simple */
function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const percent = Math.max(0, Math.min(100, value))
  const colorClass =
    percent > 50
      ? 'bg-green-500'
      : percent > 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className={cn('h-1.5 w-16 rounded-full bg-muted', className)}>
      <div
        className={cn('h-full rounded-full transition-all', colorClass)}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function BalancesPageContent({
  initialBalances,
  initialPagination,
  currentYear,
}: BalancesPageContentProps) {
  const [isPending, startTransition] = useTransition()
  const [balances, setBalances] =
    useState<LeaveBalanceWithEmployee[]>(initialBalances)
  const [pagination, setPagination] = useState(initialPagination)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [editingBalance, setEditingBalance] =
    useState<LeaveBalanceWithEmployee | null>(null)

  const years = useMemo(() => {
    const result = []
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      result.push(y)
    }
    return result
  }, [currentYear])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  const fetchBalances = useCallback(
    (year: number, page: number) => {
      startTransition(async () => {
        const result = await getAllLeaveBalances(year, {
          page,
          pageSize: pagination.pageSize,
        })
        if (result.success) {
          setBalances(result.data.data)
          setPagination({
            page: result.data.page,
            pageSize: result.data.pageSize,
            total: result.data.total,
          })
        } else {
          toast.error(result.error)
        }
      })
    },
    [pagination.pageSize]
  )

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year, 10)
    setSelectedYear(yearNum)
    fetchBalances(yearNum, 1)
  }

  const handlePageChange = (newPage: number) => {
    fetchBalances(selectedYear, newPage)
  }

  const handleEditSuccess = () => {
    setEditingBalance(null)
    fetchBalances(selectedYear, pagination.page)
    toast.success('Solde mis à jour avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Calculator className="h-6 w-6" />
            Soldes congés
          </h1>
          <p className="text-muted-foreground">
            Gérez les soldes de congés payés et RTT de vos employés
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="year-select">Année</Label>
          <Select value={String(selectedYear)} onValueChange={handleYearChange}>
            <SelectTrigger id="year-select" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {balances.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calculator className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Aucun solde trouvé pour {selectedYear}</p>
              <p className="mt-1 text-sm">
                Les soldes sont créés automatiquement lors de la première
                demande de congé
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead className="text-center">CP Total</TableHead>
                    <TableHead className="text-center">CP Utilisés</TableHead>
                    <TableHead className="text-center">CP Restants</TableHead>
                    <TableHead className="text-center">RTT Total</TableHead>
                    <TableHead className="text-center">RTT Utilisés</TableHead>
                    <TableHead className="text-center">RTT Restants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">
                        {balance.employee.firstName} {balance.employee.lastName}
                      </TableCell>
                      <TableCell>
                        {balance.employee.team ? (
                          <Badge variant="outline">
                            {balance.employee.team.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {balance.paidLeaveTotal}
                      </TableCell>
                      <TableCell className="text-center">
                        {balance.paidLeaveUsed}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">
                            {balance.paidLeaveRemaining}
                          </span>
                          <ProgressBar
                            value={
                              balance.paidLeaveTotal > 0
                                ? (balance.paidLeaveRemaining /
                                    balance.paidLeaveTotal) *
                                  100
                                : 0
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {balance.rttTotal}
                      </TableCell>
                      <TableCell className="text-center">
                        {balance.rttUsed}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">
                            {balance.rttRemaining}
                          </span>
                          <ProgressBar
                            value={
                              balance.rttTotal > 0
                                ? (balance.rttRemaining / balance.rttTotal) *
                                  100
                                : 0
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingBalance(balance)}
                          aria-label={`Modifier le solde de ${balance.employee.firstName} ${balance.employee.lastName}`}
                          data-testid={`edit-balance-${balance.employee.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {pagination.total} employé{pagination.total > 1 ? 's' : ''} au
                  total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1 || isPending}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Précédent
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} sur {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages || isPending}
                  >
                    Suivant
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingBalance && (
        <LeaveBalanceEditDialog
          balance={editingBalance}
          open={!!editingBalance}
          onOpenChange={(open) => !open && setEditingBalance(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
