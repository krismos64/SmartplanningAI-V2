/**
 * Page Dashboard principale - Redirection selon le role
 *
 * Redirige automatiquement vers le dashboard adapte au role de l'utilisateur.
 * Cette page sert de point d'entree unique pour /dashboard.
 *
 * @ticket SP-145
 */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard | SmartPlanning',
  description: 'Tableau de bord SmartPlanning',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Redirection selon le role
  switch (session.user.role) {
    case 'EMPLOYEE':
      redirect('/dashboard/employee')
    case 'MANAGER':
      redirect('/dashboard/manager')
    case 'DIRECTOR':
      redirect('/dashboard/director')
    case 'SYSTEM_ADMIN':
      redirect('/dashboard/admin')
    default:
      redirect('/dashboard/employee')
  }
}
