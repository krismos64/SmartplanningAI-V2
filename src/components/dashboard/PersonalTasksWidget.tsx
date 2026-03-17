/**
 * PersonalTasksWidget - Widget de tâches personnelles pour les dashboards
 *
 * @description Affiche les N dernières tâches non complétées avec actions rapides
 * @ticket SP-420
 */

'use client'

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { format, isToday, isPast, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ListTodo,
  Plus,
  Calendar,
  Lock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import type { PersonalTask } from '@prisma/client'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { togglePersonalTask } from '@/lib/actions/personal-tasks'

// ============================================================================
// Types
// ============================================================================

interface PersonalTasksWidgetProps {
  /** Tâches initiales (depuis Server Component) */
  initialTasks: PersonalTask[]
  /** Nombre total de tâches non complétées */
  totalPendingCount?: number
  /** Classes CSS additionnelles */
  className?: string
}

// ============================================================================
// Skeleton
// ============================================================================

export function PersonalTasksWidgetSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 text-center"
      data-testid="widget-empty-state"
    >
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Aucune tâche en cours
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Créez votre première tâche !
      </p>
    </div>
  )
}

// ============================================================================
// Task Item (version simplifiée pour widget)
// ============================================================================

interface TaskItemProps {
  task: PersonalTask
  onToggle: (id: string) => void
  isPending: boolean
}

function TaskItem({ task, onToggle, isPending }: TaskItemProps) {
  // Déterminer le style du badge de date
  const getDateBadge = (): {
    variant: 'destructive' | 'secondary' | 'outline'
    label: string
  } | null => {
    if (!task.dueDate) return null

    const dueDate = new Date(task.dueDate)

    if (isPast(dueDate) && !isToday(dueDate)) {
      return { variant: 'destructive', label: 'En retard' }
    }
    if (isToday(dueDate)) {
      return { variant: 'secondary', label: "Aujourd'hui" }
    }
    if (isFuture(dueDate)) {
      return {
        variant: 'outline',
        label: format(dueDate, 'd MMM', { locale: fr }),
      }
    }
    return null
  }

  const dateBadge = getDateBadge()

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50',
        isPending && 'opacity-60'
      )}
      data-testid={`widget-task-${task.id}`}
    >
      <Checkbox
        checked={false}
        onCheckedChange={() => onToggle(task.id)}
        disabled={isPending}
        aria-label={`Marquer "${task.title}" comme fait`}
        data-testid={`widget-checkbox-${task.id}`}
      />
      <span
        className="flex-1 truncate text-sm"
        data-testid={`widget-task-title-${task.id}`}
      >
        {task.title}
      </span>
      {dateBadge && (
        <Badge
          variant={dateBadge.variant}
          className="flex items-center gap-1 text-xs"
          data-testid={`widget-date-badge-${task.id}`}
        >
          <Calendar className="h-3 w-3" />
          {dateBadge.label}
        </Badge>
      )}
    </div>
  )
}

// ============================================================================
// Main Widget Component
// ============================================================================

export function PersonalTasksWidget({
  initialTasks,
  totalPendingCount,
  className,
}: PersonalTasksWidgetProps) {
  const [tasks, setTasks] = useState<PersonalTask[]>(initialTasks)
  const [isPending, startTransition] = useTransition()
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  // Toggle optimiste
  const handleToggle = useCallback(
    (taskId: string) => {
      setLoadingTaskId(taskId)

      // Retirer optimistiquement de la liste
      setTasks((prev) => prev.filter((t) => t.id !== taskId))

      startTransition(async () => {
        try {
          const result = await togglePersonalTask(taskId)

          if (!result.success) {
            // Rollback en cas d'erreur
            setTasks(initialTasks)
            toast.error(result.error || 'Erreur lors de la mise à jour')
          } else {
            toast.success('Tâche terminée !')
          }
        } catch {
          // Rollback en cas d'erreur
          setTasks(initialTasks)
          toast.error('Erreur inattendue')
        } finally {
          setLoadingTaskId(null)
        }
      })
    },
    [initialTasks]
  )

  const remainingCount = totalPendingCount
    ? totalPendingCount - initialTasks.length
    : 0

  return (
    <Card
      className={cn('overflow-hidden', className)}
      data-testid="tasks-widget"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5">
            <ListTodo className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-base font-medium">Notes perso</CardTitle>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link
            href="/app/tableau-de-bord/taches"
            className="flex items-center gap-1"
            data-testid="widget-add-task-link"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {/* Badge de confidentialité */}
        <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span>Vos notes sont privées</span>
        </div>

        {/* Liste des tâches ou empty state */}
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1" data-testid="widget-task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                isPending={isPending && loadingTaskId === task.id}
              />
            ))}
          </div>
        )}

        {/* Lien "Voir toutes" si plus de tâches */}
        {remainingCount > 0 && (
          <div className="mt-4 border-t pt-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-between text-sm text-muted-foreground"
            >
              <Link
                href="/app/tableau-de-bord/taches"
                data-testid="widget-view-all-link"
              >
                <span>
                  +{remainingCount} autre{remainingCount > 1 ? 's' : ''} tâche
                  {remainingCount > 1 ? 's' : ''}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Lien pour voir la page complète même si pas de tâches restantes */}
        {tasks.length > 0 && remainingCount === 0 && (
          <div className="mt-4 border-t pt-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-center text-sm text-muted-foreground"
            >
              <Link
                href="/app/tableau-de-bord/taches"
                data-testid="widget-manage-link"
              >
                Gérer mes tâches
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PersonalTasksWidget
