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

  // Récupérer le nom de l'entreprise
  let companyName = 'SmartPlanning'
  if (session.user.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { name: true },
    })
    if (company?.name) {
      companyName = company.name
    }
  }

  const user = {
    id: session.user.id,
    name:
      session.user.name || session.user.email?.split('@')[0] || 'Utilisateur',
    email: session.user.email || '',
    role: session.user.role as
      | 'SYSTEM_ADMIN'
      | 'DIRECTOR'
      | 'MANAGER'
      | 'EMPLOYEE',
    organizationId: session.user.companyId || undefined,
    companyName,
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
