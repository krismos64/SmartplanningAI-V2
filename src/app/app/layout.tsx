/**
 * Layout pour les routes /app/* protegees
 *
 * Inclut le DashboardLayout avec Header, Sidebar et Footer
 *
 * @ticket SP-110
 */
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
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

  return (
    <DashboardLayout user={user} subscriptionData={subscriptionData}>
      {children}
    </DashboardLayout>
  )
}
