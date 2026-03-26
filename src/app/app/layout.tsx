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
import { getEffectiveSessionData } from '@/lib/impersonation'

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
    redirect('/login')
  }

  // SP-453/456 : résoudre les données effectives en tenant compte du
  // race condition updateSession() / navigation (cookie fallback)
  const effective = await getEffectiveSessionData(session)

  // SP-453 : données impersonation pour la bannière
  // Détection via JWT (session.user.isImpersonating) OU cookie fallback
  // Note: on ne peut PAS comparer effective.userId !== session.user.id car
  // le JWT callback modifie token.id vers l'utilisateur impersonné, donc
  // session.user.id == effective.userId dans tous les cas.
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
    // SP-456 : fallback cookie quand updateSession() n'a pas encore pris effet
    try {
      const cookieStore = await cookies()
      const impCookie = cookieStore.get(IMPERSONATION_COOKIE_NAME)
      if (impCookie?.value) {
        const ctx = JSON.parse(
          decodeURIComponent(impCookie.value)
        ) as ImpersonationContext
        if (ctx.originalAdminId && ctx.targetCompanyName) {
          impersonationData = {
            isImpersonating: true,
            impersonatedCompanyName: ctx.targetCompanyName ?? 'Entreprise',
            impersonatedUserEmail: ctx.targetEmail ?? '',
          }
        }
      }
    } catch {
      // Cookie invalide — ignorer
    }
  }

  // Récupérer les données utilisateur fraîches depuis la DB (dont l'avatar)
  const dbUser = await prisma.user.findUnique({
    where: { id: effective.userId },
    select: {
      image: true,
      name: true,
      email: true,
      company: {
        select: { name: true },
      },
    },
  })

  const companyName = dbUser?.company?.name || 'SmartPlanning'

  const user = {
    id: effective.userId,
    name:
      dbUser?.name ||
      session.user.name ||
      session.user.email?.split('@')[0] ||
      'Utilisateur',
    email: dbUser?.email || session.user.email || '',
    image: dbUser?.image || null,
    role: effective.role as
      | 'SYSTEM_ADMIN'
      | 'DIRECTOR'
      | 'MANAGER'
      | 'EMPLOYEE',
    organizationId: effective.companyId || undefined,
    companyName,
  }

  // SP-441 : données subscription pour la bannière progressive
  const subscriptionData = {
    subscriptionStatus: session.user.subscriptionStatus ?? null,
    trialEndsAt: session.user.trialEndsAt ?? null,
    currentPeriodEnd: session.user.currentPeriodEnd ?? null,
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
