/**
 * PersonalTaskList - Liste des tâches avec drag & drop
 *
 * @description Gère le contexte DnD et l'ordre des tâches
 * @ticket SP-419
 */

'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import type { PersonalTask } from '@prisma/client'

import { PersonalTaskCard } from './PersonalTaskCard'
import { EmptyState } from './EmptyState'

interface PersonalTaskListProps {
  tasks: PersonalTask[]
  onReorder: (orderedIds: string[]) => void
  onToggle: (id: string) => void
  onEdit: (task: PersonalTask) => void
  onDelete: (id: string) => void
  onCreateTask: () => void
}

export function PersonalTaskList({
  tasks,
  onReorder,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
}: PersonalTaskListProps) {
  // Sensors pour pointer (souris/touch) et clavier (accessibilité)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Évite les clics accidentels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = tasks.findIndex((t) => t.id === active.id)
        const newIndex = tasks.findIndex((t) => t.id === over.id)

        const newTasks = arrayMove(tasks, oldIndex, newIndex)
        const orderedIds = newTasks.map((t) => t.id)

        onReorder(orderedIds)
      }
    },
    [tasks, onReorder]
  )

  if (tasks.length === 0) {
    return <EmptyState onCreateTask={onCreateTask} />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3" data-testid="task-list">
          {tasks.map((task) => (
            <PersonalTaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
