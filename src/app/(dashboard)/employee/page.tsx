/**
 * Employee Dashboard - Dashboard Employé
 *
 * ✅ Source : Next.js 15 Server Components + Role-based access (Context7)
 *
 * OBJECTIF (CDA) :
 * Dashboard pour utilisateurs avec le rôle EMPLOYEE.
 * Vue personnelle uniquement (ses plannings, ses congés).
 *
 * FONCTIONNALITÉS PRÉVUES :
 * - Voir SON planning personnel
 * - Demander des congés
 * - Consulter son historique de congés
 * - Voir les shifts disponibles pour échange
 *
 * RÉFÉRENCE CDA :
 * - Server Component avec filtres Prisma (employeeId)
 * - Role-based UI (pas d'actions admin)
 * - Self-service employee portal
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Employé',
  description: 'Consultez votre planning et gérez vos congés',
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function EmployeeDashboardPage() {
  // TODO (SP-105) : Vérifier session et role EMPLOYEE
  // TODO (SP-106+) : Fetch data Prisma avec filtre employeeId

  return (
    <div className="space-y-6">
      {/* Header avec photo de profil */}
      <div className="card-base flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-medium text-primary-foreground">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bonjour, John Doe
            </h1>
            <p className="text-sm text-muted-foreground">
              Engineering Team - Senior Developer
            </p>
          </div>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Demander un congé
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Shifts ce mois
            </p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="mt-2 text-3xl font-bold">18</p>
          <p className="mt-1 text-xs text-muted-foreground">
            144 heures travaillées
          </p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Congés restants
            </p>
            <span className="text-2xl">✈️</span>
          </div>
          <p className="mt-2 text-3xl font-bold">12</p>
          <p className="mt-1 text-xs text-muted-foreground">
            jours disponibles
          </p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Prochain shift
            </p>
            <span className="text-2xl">⏰</span>
          </div>
          <p className="mt-2 text-xl font-bold">Demain 9h</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bureau - 8 heures
          </p>
        </div>
      </div>

      {/* Mon planning cette semaine */}
      <div className="card-base">
        <h2 className="mb-4 text-lg font-semibold">
          Mon planning cette semaine
        </h2>
        <div className="space-y-3">
          {[
            { day: 'Lundi 7', time: '9h00 - 17h00', type: 'Bureau' },
            { day: 'Mardi 8', time: '9h00 - 17h00', type: 'Bureau' },
            { day: 'Mercredi 9', time: '10h00 - 18h00', type: 'Remote' },
            { day: 'Jeudi 10', time: '9h00 - 17h00', type: 'Bureau' },
            { day: 'Vendredi 11', time: 'Congé', type: 'Congé payé' },
          ].map((shift) => (
            <div
              key={shift.day}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{shift.day}</p>
                <p className="text-sm text-muted-foreground">{shift.time}</p>
              </div>
              <span
                className={`badge-base ${
                  shift.type === 'Congé payé'
                    ? 'bg-red-100 text-red-800'
                    : shift.type === 'Remote'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {shift.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mes demandes de congés */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-base">
          <h2 className="mb-4 text-lg font-semibold">
            Mes demandes de congés
          </h2>
          <div className="space-y-3">
            {[
              { dates: '23-27 Déc', status: 'Approuvé', color: 'green' },
              { dates: '10-12 Jan', status: 'En attente', color: 'yellow' },
              { dates: '15-20 Fév', status: 'Rejeté', color: 'red' },
            ].map((request, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{request.dates}</p>
                  <p className="text-xs text-muted-foreground">
                    Congés payés
                  </p>
                </div>
                <span
                  className={`badge-base ${
                    request.color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : request.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg border border-border bg-white py-2 text-sm font-medium hover:bg-secondary">
            Voir tout l&apos;historique
          </button>
        </div>

        {/* Échanges de shifts */}
        <div className="card-base">
          <h2 className="mb-4 text-lg font-semibold">
            Shifts disponibles pour échange
          </h2>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-3 hover:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Jeudi 12 Déc</p>
                    <p className="text-xs text-muted-foreground">
                      14h-22h - Alice Brown
                    </p>
                  </div>
                  <button className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                    Échanger
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg border border-border bg-white py-2 text-sm font-medium hover:bg-secondary">
            Proposer un échange
          </button>
        </div>
      </div>
    </div>
  )
}
