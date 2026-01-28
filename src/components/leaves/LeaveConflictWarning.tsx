'use client'

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaveConflictWarningProps {
  conflictPercentage: number
  className?: string
}

export function LeaveConflictWarning({
  conflictPercentage,
  className,
}: LeaveConflictWarningProps) {
  if (conflictPercentage <= 50) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Attention : {conflictPercentage}% de l&apos;équipe sera absente sur
        cette période
      </span>
    </div>
  )
}
