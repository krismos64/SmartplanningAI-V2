import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getNotificationPreferences } from '@/lib/actions/notification-preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/preferences'

import { NotificationsPageContent } from './_components'

/**
 * Page des préférences de notifications
 *
 * @ticket SP-275
 */

export const metadata: Metadata = {
  title: 'Notifications | Paramètres | SmartPlanning',
  description: 'Configurez vos préférences de notifications email et in-app.',
}

export default async function NotificationsSettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  const result = await getNotificationPreferences()

  const initialPreferences = result.success
    ? result.data
    : DEFAULT_NOTIFICATION_PREFERENCES

  return <NotificationsPageContent initialPreferences={initialPreferences} />
}
