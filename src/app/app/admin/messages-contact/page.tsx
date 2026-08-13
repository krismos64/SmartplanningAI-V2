/**
 * Page Admin - Messages du formulaire de contact public
 *
 * Server Component avec filtres URL (searchParams) pour bookmarkability,
 * meme pattern que le journal des emails (SP-545). Double protection RBAC :
 * middleware (/app/admin) + hasRequiredRole.
 *
 * `contact_messages` ne porte pas de `companyId` : l'expediteur est un
 * visiteur anonyme. La restriction au SYSTEM_ADMIN est donc la seule
 * protection de ces donnees, et elle est verifiee des deux cotes.
 *
 * L'ecran existe surtout pour les demandes en `emailStatus FAILED` : arrivees
 * en base sans qu'aucun email ne previenne l'equipe, elles seraient invisibles
 * autrement (defaut corrige en SP-576).
 *
 * @ticket SP-577
 */

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { Inbox } from 'lucide-react'

import {
  getContactMessagesAdmin,
  getContactMessagesKpisAdmin,
} from '@/lib/actions/admin-contact-messages'
import {
  ContactMessagesKpis,
  ContactMessagesFilterBar,
  ContactMessagesDataTable,
} from './_components'

export const metadata: Metadata = {
  title: 'Messages de contact | SmartPlanning',
  description:
    'Suivi des demandes envoyées depuis le formulaire de contact public',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // 1. Authentification
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 2. RBAC cote page (double protection avec middleware)
  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  // 3. Lire les filtres depuis l'URL (Next.js 15 : searchParams est une Promise)
  const params = await searchParams

  const filters: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value) {
      filters[key] = value
    }
  }

  // 4. Donnees et compteurs en parallele
  const [messagesResult, kpisResult] = await Promise.all([
    getContactMessagesAdmin(filters),
    getContactMessagesKpisAdmin(),
  ])

  const data =
    messagesResult.success && messagesResult.data
      ? messagesResult.data
      : { messages: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }

  return (
    <div className="space-y-6" data-testid="admin-contact-messages-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Inbox className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Messages de contact
          </h1>
          <p className="text-sm text-muted-foreground">
            Demandes reçues depuis le formulaire public
          </p>
        </div>
      </div>

      {/* Compteurs */}
      {kpisResult.success && kpisResult.data && (
        <ContactMessagesKpis kpis={kpisResult.data} />
      )}

      {/* Filtres URL bookmarkables */}
      <ContactMessagesFilterBar />

      {/* Table + pagination */}
      <ContactMessagesDataTable data={data} />
    </div>
  )
}
