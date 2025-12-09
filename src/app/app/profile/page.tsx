/**
 * Page Profil - Route /app/profile
 *
 * Page de profil utilisateur accessible a tous les utilisateurs authentifies.
 *
 * @ticket SP-110
 */
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth()

  // Note: Le middleware gère l'authentification.
  // Si on arrive ici, l'utilisateur est forcément connecté.

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
      <div className="space-y-2">
        <p>
          <strong>Nom:</strong> {session?.user?.name || 'Non defini'}
        </p>
        <p>
          <strong>Email:</strong> {session?.user?.email || 'N/A'}
        </p>
        <p>
          <strong>Role:</strong> {session?.user?.role || 'N/A'}
        </p>
      </div>
    </main>
  )
}
