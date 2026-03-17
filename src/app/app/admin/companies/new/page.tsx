/**
 * Page création d'une nouvelle Company (SUPER_ADMIN)
 *
 * @description Formulaire de création d'entreprise avec validation.
 *
 * @ticket SP-151
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { CompanyForm } from '@/components/admin/companies'

export const metadata: Metadata = {
  title: 'Nouvelle entreprise | SmartPlanning',
  description: 'Créer une nouvelle entreprise sur la plateforme',
}

export default async function NewCompanyPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/admin/companies">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Retour à la liste</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouvelle entreprise
          </h1>
          <p className="text-sm text-muted-foreground">
            Créer une nouvelle entreprise sur la plateforme
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl">
        <CompanyForm />
      </div>
    </div>
  )
}
