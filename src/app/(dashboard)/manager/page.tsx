/**
 * Manager Dashboard - Dashboard Manager
 *
 * ✅ Source : Next.js 15 Server Components + Role-based access (Context7)
 *
 * OBJECTIF (CDA) :
 * Dashboard pour utilisateurs avec le rôle MANAGER.
 * Gestion de SON/SES équipes uniquement (scope limité).
 *
 * FONCTIONNALITÉS PRÉVUES :
 * - Statistiques de l'équipe gérée
 * - Plannings de l'équipe
 * - Validation des demandes de congés
 * - Gestion des shifts
 *
 * RÉFÉRENCE CDA :
 * - Server Component avec filtres Prisma (teamId)
 * - Role-based data access
 * - Permissions limitées vs DIRECTOR
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Manager',
  description: 'Gérez votre équipe SmartPlanning',
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function ManagerDashboardPage() {
  // TODO (SP-105) : Vérifier session et role MANAGER
  // TODO (SP-106+) : Fetch data Prisma avec filtre teamId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Manager
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gérez votre équipe Engineering
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Membres d&apos;équipe
            </p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="mt-2 text-3xl font-bold">12</p>
          <p className="mt-1 text-xs text-green-600">Tous actifs</p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Shifts cette semaine
            </p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="mt-2 text-3xl font-bold">36</p>
          <p className="mt-1 text-xs text-muted-foreground">
            12 par jour en moyenne
          </p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Demandes en attente
            </p>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="mt-2 text-3xl font-bold">3</p>
          <p className="mt-1 text-xs text-orange-600">À traiter</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base">
        <h2 className="mb-4 text-lg font-semibold">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Créer un shift</p>
            <p className="text-xs text-muted-foreground">
              Assigner un planning
            </p>
          </button>
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Valider des congés</p>
            <p className="text-xs text-muted-foreground">
              Approuver ou rejeter
            </p>
          </button>
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Vue équipe</p>
            <p className="text-xs text-muted-foreground">
              Voir tous les membres
            </p>
          </button>
        </div>
      </div>

      {/* Team Schedule */}
      <div className="card-base">
        <h2 className="mb-4 text-lg font-semibold">
          Planning de l&apos;équipe cette semaine
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">Employé</th>
                <th className="pb-2 text-left font-medium">Lun</th>
                <th className="pb-2 text-left font-medium">Mar</th>
                <th className="pb-2 text-left font-medium">Mer</th>
                <th className="pb-2 text-left font-medium">Jeu</th>
                <th className="pb-2 text-left font-medium">Ven</th>
              </tr>
            </thead>
            <tbody>
              {['Alice', 'Bob', 'Charlie'].map((name) => (
                <tr key={name} className="border-b last:border-0">
                  <td className="py-3 font-medium">{name}</td>
                  <td className="py-3">
                    <span className="badge-base bg-green-100 text-green-800">
                      9h-17h
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="badge-base bg-green-100 text-green-800">
                      9h-17h
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="badge-base bg-blue-100 text-blue-800">
                      Remote
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="badge-base bg-green-100 text-green-800">
                      9h-17h
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="badge-base bg-red-100 text-red-800">
                      Congé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="card-base">
        <h2 className="mb-4 text-lg font-semibold">
          Demandes de congés à valider
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                  AB
                </div>
                <div>
                  <p className="text-sm font-medium">Alice Brown</p>
                  <p className="text-xs text-muted-foreground">
                    Congés payés - 23 au 27 Déc 2025
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                  Approuver
                </button>
                <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
