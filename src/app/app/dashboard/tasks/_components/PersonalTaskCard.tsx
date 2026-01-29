/**
 * PersonalTaskCard - Carte individuelle d'une tâche avec drag & drop
 *
 * @description Affiche une tâche avec checkbox, actions et support drag
 * @ticket SP-419
 */

'use client'

import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isToday, isPast, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GripVertical, Pencil, Trash2, Calendar } from 'lucide-react'
import type { PersonalTask } from '@prisma/client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PersonalTaskCardProps {
  task: PersonalTask
  onToggle: (id: string) => void
  onEdit: (task: PersonalTask) => void
  onDelete: (id: string) => void
}

function PersonalTaskCardComponent({
  task,
  onToggle,
  onEdit,
  onDelete,
}: PersonalTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Déterminer le style du badge de date
  const getDateBadgeVariant = (): {
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

  const dateBadge = getDateBadgeVariant()

  // Tronquer la description
  const truncatedDescription =
    task.description && task.description.length > 100
      ? `${task.description.slice(0, 100)}...`
      : task.description

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200',
        isDragging && 'scale-[1.02] opacity-50 shadow-lg',
        task.completed && 'bg-muted/50'
      )}
      data-testid={`task-card-${task.id}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none"
          {...attributes}
          {...listeners}
          aria-label="Glisser pour réorganiser"
          data-testid={`drag-handle-${task.id}`}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          aria-label={
            task.completed ? 'Marquer comme non fait' : 'Marquer comme fait'
          }
          data-testid={`checkbox-${task.id}`}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-medium',
              task.completed && 'text-muted-foreground line-through'
            )}
            data-testid={`task-title-${task.id}`}
          >
            {task.title}
          </p>
          {truncatedDescription && (
            <p
              className={cn(
                'mt-1 text-sm text-muted-foreground',
                task.completed && 'line-through'
              )}
              data-testid={`task-description-${task.id}`}
            >
              {truncatedDescription}
            </p>
          )}
        </div>

        {/* Date badge */}
        {dateBadge && !task.completed && (
          <Badge
            variant={dateBadge.variant}
            className="flex items-center gap-1"
            data-testid={`date-badge-${task.id}`}
          >
            <Calendar className="h-3 w-3" />
            {dateBadge.label}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            aria-label="Modifier la tâche"
            data-testid={`edit-button-${task.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            aria-label="Supprimer la tâche"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-testid={`delete-button-${task.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const PersonalTaskCard = memo(PersonalTaskCardComponent)
