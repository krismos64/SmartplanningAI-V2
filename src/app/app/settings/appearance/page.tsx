/**
 * Page des préférences d'affichage
 *
 * @ticket SP-276 - Préférences Affichage (Thème, Date, Heure)
 *
 * Server Component qui récupère les préférences initiales
 * et les passe au Client Component pour l'interactivité.
 */

import type { Metadata } from 'next'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDisplayPreferences } from '@/lib/actions/display-preferences'
import { DEFAULT_DISPLAY_PREFERENCES } from '@/types/preferences'
import { AppearancePageContent } from './_components/AppearancePageContent'

export const metadata: Metadata = {
  title: 'Apparence | SmartPlanning',
  description:
    "Personnalisez le thème, le format de date et d'heure de votre interface SmartPlanning",
}

export default async function AppearancePage() {
  // Vérifier l'authentification
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Récupérer les préférences initiales
  const result = await getDisplayPreferences()
  const initialPreferences = result.success
    ? result.data
    : { ...DEFAULT_DISPLAY_PREFERENCES }

  return <AppearancePageContent initialPreferences={initialPreferences} />
}
