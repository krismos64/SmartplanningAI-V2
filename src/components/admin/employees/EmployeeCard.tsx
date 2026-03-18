'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

interface EmployeeCardProps {
  employee: EmployeeWithCounts
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  canDelete?: boolean
}

export function EmployeeCard({ employee, onView }: EmployeeCardProps) {
  const initials =
    `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div
      onClick={onView}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3 transition-all',
        onView && 'cursor-pointer active:scale-[0.98]'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        {employee.user?.image && (
          <AvatarImage
            src={employee.user.image}
            alt={`${employee.firstName} ${employee.lastName}`}
          />
        )}
        <AvatarFallback className="text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {employee.firstName} {employee.lastName}
          </span>
          <Badge
            variant={employee.isActive ? 'default' : 'secondary'}
            className="shrink-0 text-[10px]"
          >
            {employee.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
        {employee.team && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="truncate">{employee.team.name}</span>
            <span className="mx-1">·</span>
            <span>{employee.weeklyHours}h/sem</span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </div>
  )
}
