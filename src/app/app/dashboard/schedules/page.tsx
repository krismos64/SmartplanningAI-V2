/**
 * Page liste des Schedules (RBAC multi-role)
 *
 * @description Liste des plannings avec vue calendrier, filtres et actions CRUD.
 * Accessible à tous les rôles avec accès différenciés.
 *
 * @ticket SP-395
 */

import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSchedules } from '@/lib/actions/schedules'
import { SchedulesPageContent } from './_components/SchedulesPageContent'
import SchedulesLoading from './loading'

export default async function SchedulesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role as
    | 'SYSTEM_ADMIN'
    | 'DIRECTOR'
    | 'MANAGER'
    | 'EMPLOYEE'

  // Calculer les dates de la semaine courante
  const today = new Date()
  const dayOfWeek = today.getDay()
  // Ajuster pour que la semaine commence le lundi (0 = dimanche en JS)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  // Charger les schedules de la semaine courante
  const result = await getSchedules({
    startDate: startOfWeek,
    endDate: endOfWeek,
    limit: 100,
  })

  const schedules = result.success ? (result.data?.schedules ?? []) : []
  const totalCount = result.success ? (result.data?.total ?? 0) : 0

  return (
    <Suspense fallback={<SchedulesLoading />}>
      <SchedulesPageContent
        initialSchedules={schedules}
        initialTotal={totalCount}
        userRole={userRole}
        initialStartDate={startOfWeek}
        initialEndDate={endOfWeek}
      />
    </Suspense>
  )
}
