/**
 * Dashboard Admin - Route /app/admin/dashboard
 *
 * Page d'accueil pour les utilisateurs avec role SYSTEM_ADMIN uniquement.
 *
 * @ticket SP-110
 */
import { auth } from '@/lib/auth'

export default async function AdminDashboardPage() {
  const session = await auth()

  // Note: Le middleware gère l'authentification et le RBAC.
  // Si on arrive ici, l'utilisateur est forcément SYSTEM_ADMIN.

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-4 text-2xl font-bold">Dashboard Admin</h1>
      <p className="text-gray-600">
        Bienvenue,{' '}
        {session?.user?.name || session?.user?.email || 'Utilisateur'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Role: {session?.user?.role || 'N/A'}
      </p>
    </main>
  )
}
