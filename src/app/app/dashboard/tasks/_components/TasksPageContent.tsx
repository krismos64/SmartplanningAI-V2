/**
 * TasksPageContent - Composant orchestrateur pour la page tâches
 *
 * @description Gère l'état, les interactions et le formulaire modal
 * @ticket SP-419
 */

'use client'

import { useState, useCallback, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { PersonalTask } from '@prisma/client'

import { Button } from '@/components/ui/button'
import type { PersonalTaskCreateInput } from '@/lib/validations/personal-task'

import {
  createPersonalTask,
  updatePersonalTask,
  deletePersonalTask,
  togglePersonalTask,
  reorderPersonalTasks,
} from '@/lib/actions/personal-tasks'

import { PrivacyBadge } from './PrivacyBadge'
import { PersonalTaskList } from './PersonalTaskList'
import { PersonalTaskForm } from './PersonalTaskForm'

interface TasksPageContentProps {
  initialTasks: PersonalTask[]
}

export function TasksPageContent({ initialTasks }: TasksPageContentProps) {
  // État local des tâches (optimistic updates)
  const [tasks, setTasks] = useState<PersonalTask[]>(initialTasks)

  // État du formulaire modal
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Transition pour les mutations
  const [isPending, startTransition] = useTransition()

  // ─── Handlers ───────────────────────────────────────────────────────

  const handleCreateTask = useCallback(() => {
    setEditingTask(null)
    setIsFormOpen(true)
  }, [])

  const handleEditTask = useCallback((task: PersonalTask) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: PersonalTaskCreateInput) => {
      setIsSubmitting(true)

      try {
        if (editingTask) {
          // Mode édition
          const result = await updatePersonalTask(editingTask.id, data)

          if (result.success) {
            setTasks((prev) =>
              prev.map((t) => (t.id === editingTask.id ? result.data : t))
            )
            toast.success('Tâche modifiée')
            setIsFormOpen(false)
          } else {
            toast.error(result.error || 'Erreur lors de la modification')
          }
        } else {
          // Mode création
          const result = await createPersonalTask(data)

          if (result.success) {
            setTasks((prev) => [...prev, result.data])
            toast.success('Tâche créée')
            setIsFormOpen(false)
          } else {
            toast.error(result.error || 'Erreur lors de la création')
          }
        }
      } catch {
        toast.error('Une erreur est survenue')
      } finally {
        setIsSubmitting(false)
      }
    },
    [editingTask]
  )

  const handleToggle = useCallback((id: string) => {
    startTransition(async () => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      )

      const result = await togglePersonalTask(id)

      if (!result.success) {
        // Rollback
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        )
        toast.error(result.error || 'Erreur lors de la mise à jour')
      }
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    // Sauvegarder pour rollback
    let deletedTask: PersonalTask | undefined

    startTransition(async () => {
      // Optimistic update
      setTasks((prev) => {
        deletedTask = prev.find((t) => t.id === id)
        return prev.filter((t) => t.id !== id)
      })

      const result = await deletePersonalTask(id)

      if (result.success) {
        toast.success('Tâche supprimée')
      } else {
        // Rollback
        if (deletedTask) {
          setTasks((prev) => [...prev, deletedTask!])
        }
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    })
  }, [])

  const handleReorder = useCallback((orderedIds: string[]) => {
    startTransition(async () => {
      // Optimistic update
      setTasks((prev) => {
        const taskMap = new Map(prev.map((t) => [t.id, t]))
        return orderedIds
          .map((id) => taskMap.get(id))
          .filter((t): t is PersonalTask => !!t)
      })

      const result = await reorderPersonalTasks(orderedIds)

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la réorganisation')
        // Note: pas de rollback simple ici, on laisse l'état local
      }
    })
  }, [])

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" data-testid="tasks-page-content">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes perso</h1>
          <p className="text-muted-foreground">
            Organisez vos notes par glisser-déposer
          </p>
        </div>
        <Button onClick={handleCreateTask} data-testid="create-task-button">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nouvelle note
        </Button>
      </div>

      {/* Privacy badge */}
      <PrivacyBadge />

      {/* Tasks list */}
      <PersonalTaskList
        tasks={tasks}
        onReorder={handleReorder}
        onToggle={handleToggle}
        onEdit={handleEditTask}
        onDelete={handleDelete}
        onCreateTask={handleCreateTask}
      />

      {/* Form modal */}
      <PersonalTaskForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Loading indicator pour transitions */}
      {isPending && (
        <div
          className="fixed bottom-4 right-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg"
          role="status"
          aria-live="polite"
        >
          Mise à jour...
        </div>
      )}
    </div>
  )
}
