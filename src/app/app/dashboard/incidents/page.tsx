/**
 * Page Incidents - Server Component
 *
 * @description Page principale de gestion des notes d'incident (suivi comportemental)
 * @ticket SP-426
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import {
  getIncidentNotes,
  getMyIncidentNotes,
  type IncidentNoteWithRelations,
} from '@/lib/actions/incident-notes'
import { IncidentNotesPageContent } from './_components/IncidentNotesPageContent'
import IncidentsLoading from './loading'

export const metadata: Metadata = {
  title: "Notes d'incident | SmartPlanning",
  description:
    'Gérez les notes de suivi comportemental avec contrôle de visibilité RBAC',
}

export default async function IncidentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  const userRole = session.user.role

  // Fetch initial notes based on role
  // EMPLOYEE voit uniquement ses propres notes avec visibility=ALL
  // MANAGER/DIRECTOR voient les notes filtrées par RBAC
  let initialNotes: IncidentNoteWithRelations[] = []

  if (userRole === 'EMPLOYEE') {
    const result = await getMyIncidentNotes()
    initialNotes = result.success ? result.data : []
  } else {
    const result = await getIncidentNotes()
    // getIncidentNotes returns paginated result
    initialNotes = result.success ? result.data.data : []
  }

  return (
    <Suspense fallback={<IncidentsLoading />}>
      <IncidentNotesPageContent
        initialNotes={initialNotes}
        userRole={userRole}
      />
    </Suspense>
  )
}
