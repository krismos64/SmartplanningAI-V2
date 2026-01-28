'use client'

import type { LeaveBalance } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProgressBarColor } from '@/components/ui/progress-bar'

interface LeaveBalanceCardProps {
  balance: LeaveBalance
  showEdit?: boolean
  onEdit?: () => void
  className?: string
}

function getProgressColor(usedPercent: number): ProgressBarColor {
  if (usedPercent > 100) return 'destructive'
  if (usedPercent >= 80) return 'warning'
  return 'success'
}

export function LeaveBalanceCard({
  balance,
  showEdit = false,
  onEdit,
  className,
}: LeaveBalanceCardProps) {
  const cpRemaining = balance.paidLeaveTotal - balance.paidLeaveUsed
  const rttRemaining = balance.rttTotal - balance.rttUsed

  const cpPercent =
    balance.paidLeaveTotal > 0
      ? (balance.paidLeaveUsed / balance.paidLeaveTotal) * 100
      : 0
  const rttPercent =
    balance.rttTotal > 0 ? (balance.rttUsed / balance.rttTotal) * 100 : 0

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Solde de congés</CardTitle>
        {showEdit && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label="Modifier les soldes"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Congés payés</span>
            <span className="text-muted-foreground">
              {cpRemaining} / {balance.paidLeaveTotal} jours
            </span>
          </div>
          <ProgressBar
            value={Math.min(cpPercent, 100)}
            color={getProgressColor(cpPercent)}
            size="sm"
            aria-label="Solde congés payés"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">RTT</span>
            <span className="text-muted-foreground">
              {rttRemaining} / {balance.rttTotal} jours
            </span>
          </div>
          <ProgressBar
            value={Math.min(rttPercent, 100)}
            color={getProgressColor(rttPercent)}
            size="sm"
            aria-label="Solde RTT"
          />
        </div>
      </CardContent>
    </Card>
  )
}
