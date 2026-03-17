/**
 * Layout pour les routes /app/* protegees
 *
 * Inclut le DashboardLayout avec Header, Sidebar et Footer
 *
 * @ticket SP-110
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { IMPERSONATION_COOKIE_NAME } from '@/types/auth'
import type { ImpersonationContext } from '@/types/auth'

// Defense en profondeur : noindex meme si robots.txt bloque /app/
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  // Récupérer les données utilisateur fraîches depuis la DB (dont l'avatar)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      image: true,
      company: {
        select: { name: true },
      },
    },
  })

  const companyName = dbUser?.company?.name || 'SmartPlanning'

  const user = {
    id: session.user.id,
    name:
      session.user.name || session.user.email?.split('@')[0] || 'Utilisateur',
    email: session.user.email || '',
    image: dbUser?.image || null,
    role: session.user.role as
      | 'SYSTEM_ADMIN'
      | 'DIRECTOR'
      | 'MANAGER'
      | 'EMPLOYEE',
    organizationId: session.user.companyId || undefined,
    companyName,
  }

  // SP-441 : données subscription pour la bannière progressive
  const subscriptionData = {
    subscriptionStatus: session.user.subscriptionStatus ?? null,
    trialEndsAt: session.user.trialEndsAt ?? null,
    currentPeriodEnd: session.user.currentPeriodEnd ?? null,
  }

  // SP-453 : données impersonation pour la bannière
  // Source primaire : JWT (session.user.isImpersonating)
  // Fallback : cookie sp-impersonation (plus fiable si updateSession() échoue)
  let impersonationData:
    | {
        isImpersonating: boolean
        impersonatedCompanyName: string
        impersonatedUserEmail: string
      }
    | undefined

  if (session.user.isImpersonating) {
    impersonationData = {
      isImpersonating: true,
      impersonatedCompanyName:
        session.user.impersonatedCompanyName ?? 'Entreprise',
      impersonatedUserEmail: session.user.impersonatedUserEmail ?? '',
    }
  } else {
    // SP-456 : fallback cookie pour robustesse (updateSession peut échouer)
    try {
      const cookieStore = await cookies()
      const impCookie = cookieStore.get(IMPERSONATION_COOKIE_NAME)
      if (impCookie?.value) {
        const ctx = JSON.parse(
          decodeURIComponent(impCookie.value)
        ) as ImpersonationContext
        // Vérifier que le cookie n'est pas expiré (IMPERSONATION_MAX_AGE = 3600s)
        const isExpired =
          ctx.startedAt && Date.now() - ctx.startedAt > 3600 * 1000
        if (ctx.originalAdminId && ctx.targetCompanyName && !isExpired) {
          impersonationData = {
            isImpersonating: true,
            impersonatedCompanyName: ctx.targetCompanyName,
            impersonatedUserEmail: ctx.targetEmail ?? '',
          }
        }
      }
    } catch {
      // Cookie invalide — ignorer
    }
  }

  return (
    <DashboardLayout
      user={user}
      subscriptionData={subscriptionData}
      impersonationData={impersonationData}
    >
      {children}
    </DashboardLayout>
  )
}
