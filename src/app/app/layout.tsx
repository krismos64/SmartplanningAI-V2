/**
 * Layout pour les routes /app/* protegees
 *
 * Inclut le DashboardLayout avec Header, Sidebar et Footer
 *
 * @ticket SP-110
 */
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
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

  const user = {
    id: session.user.id,
    name: session.user.name || session.user.email?.split('@')[0] || 'Utilisateur',
    email: session.user.email || '',
    role: session.user.role as 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE',
    organizationId: session.user.companyId || undefined,
  }

  return (
    <DashboardLayout user={user} notificationsCount={0}>
      {children}
    </DashboardLayout>
  )
}
