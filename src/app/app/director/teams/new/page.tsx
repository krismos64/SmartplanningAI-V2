/**
 * Page creation Team
 *
 * @description Formulaire de creation d'une nouvelle equipe.
 * Accessible a SYSTEM_ADMIN et DIRECTOR uniquement.
 *
 * @ticket SP-153
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { TeamForm } from '@/components/teams'
import { Button } from '@/components/ui/button'
import { getManagersForSelect } from '@/lib/actions/teams'

export const metadata: Metadata = {
  title: 'Nouvelle équipe | SmartPlanning',
  description: 'Créer une nouvelle équipe',
}

export default async function NewTeamPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN et DIRECTOR peuvent creer
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR'].includes(role)) {
    redirect('/app/director/teams')
  }

  // Recuperer le companyId
  const companyId = session.user.companyId
  if (!companyId) {
    redirect('/app/director/teams')
  }

  // Charger les managers disponibles
  const managersResult = await getManagersForSelect(companyId)
  const managers = managersResult.success ? (managersResult.data ?? []) : []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/director/teams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle équipe</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle équipe pour organiser vos employés
          </p>
        </div>
      </div>

      {/* Form */}
      <TeamForm companyId={companyId} managers={managers} />
    </div>
  )
}
