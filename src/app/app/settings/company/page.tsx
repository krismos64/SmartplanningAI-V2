import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getCompanySettings } from '@/lib/actions/company-settings'
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company'

import { CompanySettingsPageContent } from './_components'

/**
 * Page des paramètres entreprise
 *
 * @ticket SP-435
 *
 * RBAC : Accessible uniquement aux DIRECTOR et SYSTEM_ADMIN
 */

export const metadata: Metadata = {
  title: 'Paramètres Entreprise | SmartPlanning',
  description:
    'Configurez les paramètres de votre entreprise : nom, adresse, jours et horaires de travail.',
}

const ALLOWED_ROLES = ['DIRECTOR', 'SYSTEM_ADMIN']

export default async function CompanySettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // RBAC : Redirection si rôle non autorisé
  if (!ALLOWED_ROLES.includes(session.user.role || '')) {
    redirect('/app/settings')
  }

  const result = await getCompanySettings()

  const initialSettings = result.success
    ? result.data
    : { ...DEFAULT_COMPANY_SETTINGS, name: '' }

  return <CompanySettingsPageContent initialSettings={initialSettings} />
}
