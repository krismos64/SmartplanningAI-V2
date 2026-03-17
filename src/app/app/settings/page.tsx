/**
 * Page Paramètres - Hub central des préférences utilisateur
 *
 * Server Component qui vérifie l'authentification et passe le rôle
 * au composant client pour le filtrage RBAC des sections.
 *
 * @ticket SP-274
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SettingsPageContent } from './_components'

export const metadata: Metadata = {
  title: 'Paramètres | SmartPlanning',
  description: 'Gérez vos préférences et paramètres de compte',
  robots: { index: false },
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <SettingsPageContent userRole={session.user.role as string} />
}
