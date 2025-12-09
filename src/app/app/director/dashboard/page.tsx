/**
 * Dashboard Director - Route /app/director/dashboard
 *
 * Page d'accueil pour les utilisateurs avec role DIRECTOR ou superieur.
 *
 * @ticket SP-110
 */
import { auth } from '@/lib/auth'

export default async function DirectorDashboardPage() {
  const session = await auth()

  // Note: Le middleware gère l'authentification et le RBAC.
  // Si on arrive ici, l'utilisateur est forcément DIRECTOR ou superieur.

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Director</h1>
      <p className="text-gray-600">
        Bienvenue, {session?.user?.name || session?.user?.email || 'Utilisateur'}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Role: {session?.user?.role || 'N/A'}
      </p>
    </main>
  )
}
