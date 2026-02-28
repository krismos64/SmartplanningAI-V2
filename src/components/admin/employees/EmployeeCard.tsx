'use client'

import {
  User,
  Users,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

interface EmployeeCardProps {
  employee: EmployeeWithCounts
  selected: boolean
  onSelectChange: (selected: boolean) => void
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  canDelete?: boolean
}

export function EmployeeCard({
  employee,
  selected,
  onSelectChange,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  canDelete = true,
}: EmployeeCardProps) {
  const email = employee.email || employee.user?.email

  return (
    <Card
      className={`transition-all ${selected ? 'border-primary ring-1 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectChange(!!v)}
            aria-label={`Sélectionner ${employee.firstName} ${employee.lastName}`}
            className="mt-1"
          />

          {/* Avatar */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            {employee.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={employee.user.image}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Name + status + menu */}
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">
                {employee.firstName} {employee.lastName}
              </span>
              <div className="flex items-center gap-1">
                <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                  {employee.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menu actions</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onView && (
                      <DropdownMenuItem onClick={onView}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {onToggleStatus && (
                      <DropdownMenuItem onClick={onToggleStatus}>
                        {employee.isActive ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onDelete && canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={onDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Team */}
            {employee.team && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="truncate">{employee.team.name}</span>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{email}</span>
              </div>
            )}

            {/* Phone */}
            {employee.phone && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{employee.phone}</span>
              </div>
            )}

            {/* Footer: hours + hire date */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="font-medium">{employee.weeklyHours}h/sem</span>
              {employee.hireDate && (
                <>
                  <span>&middot;</span>
                  <span>
                    Depuis{' '}
                    {format(new Date(employee.hireDate), 'MMM yyyy', {
                      locale: fr,
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
