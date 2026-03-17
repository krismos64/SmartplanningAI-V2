/**
 * Page Notifications - Server Component
 *
 * @ticket SP-324
 * @description Page historique complet des notifications avec pagination et filtres
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { auth } from '@/lib/auth'
import { NotificationsPageContent } from './_components/NotificationsPageContent'
import NotificationsLoading from './loading'

export const metadata: Metadata = {
  title: 'Notifications | SmartPlanning',
  description: 'Historique complet de vos notifications',
}

export default async function NotificationsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsPageContent />
    </Suspense>
  )
}
