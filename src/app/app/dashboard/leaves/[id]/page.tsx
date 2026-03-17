/**
 * Page détail d'une demande de congé - Server Component
 *
 * @description Affiche les détails d'une demande avec timeline et actions
 * @ticket SP-414
 */

import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getLeaveRequestById } from '@/lib/actions/leaves'
import { LeaveDetailContent } from './_components/LeaveDetailContent'
import LeaveDetailLoading from './loading'
import type { TimelineEvent } from '@/components/leaves'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Demande de congé ${id.slice(0, 8)} | SmartPlanning`,
    description: 'Détails de la demande de congé',
  }
}

export default async function LeaveDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  const { id } = await params
  const result = await getLeaveRequestById(id)

  if (!result.success) {
    notFound()
  }

  const request = result.data

  // Construire les événements de la timeline
  const timelineEvents: TimelineEvent[] = [
    {
      type: 'created',
      date: new Date(request.createdAt),
      actor: {
        name: `${request.employee.firstName} ${request.employee.lastName}`,
      },
    },
  ]

  // Ajouter l'événement de review si présent
  if (request.reviewedAt && request.status !== 'PENDING') {
    const eventType =
      request.status === 'APPROVED'
        ? 'approved'
        : request.status === 'REJECTED'
          ? 'rejected'
          : 'cancelled'

    timelineEvents.push({
      type: eventType,
      date: new Date(request.reviewedAt),
      actor: { name: 'Manager' },
      comment: request.reviewComment,
    })
  }

  return (
    <Suspense fallback={<LeaveDetailLoading />}>
      <LeaveDetailContent
        request={request}
        timelineEvents={timelineEvents}
        currentUser={{
          id: session.user.id,
          role: session.user.role,
        }}
      />
    </Suspense>
  )
}
