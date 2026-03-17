/**
 * Page Notes perso - Server Component
 *
 * @description Page principale de gestion des notes personnelles privées
 * @ticket SP-419
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getPersonalTasks } from '@/lib/actions/personal-tasks'
import { TasksPageContent } from './_components/TasksPageContent'
import TasksLoading from './loading'

export const metadata: Metadata = {
  title: 'Notes perso | SmartPlanning',
  description:
    'Gérez vos notes personnelles privées avec drag & drop pour réorganiser',
}

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  // Fetch initial tasks
  const result = await getPersonalTasks()
  const initialTasks = result.success ? result.data : []

  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksPageContent initialTasks={initialTasks} />
    </Suspense>
  )
}
