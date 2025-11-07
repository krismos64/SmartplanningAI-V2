/**
 * Director Dashboard - Dashboard Directeur
 *
 * ✅ Source : Next.js 15 Server Components + Role-based access (Context7)
 *
 * OBJECTIF (CDA) :
 * Dashboard principal pour les utilisateurs avec le rôle DIRECTOR.
 * Vue d'ensemble de TOUTE l'organisation (multi-tenant).
 *
 * FONCTIONNALITÉS PRÉVUES :
 * - Statistiques organisation (employés, équipes, abonnement)
 * - Graphiques de performance
 * - Liste des demandes de congés en attente
 * - Gestion des utilisateurs et équipes
 * - Configuration de l'organisation
 *
 * RÉFÉRENCE CDA :
 * - Server Component avec données Prisma
 * - Role-based UI (conditionnel selon session.user.role)
 * - Metadata SEO personnalisée
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Directeur',
  description: 'Vue d\'ensemble de votre organisation SmartPlanning',
}

export default async function DirectorDashboardPage() {
  // TODO (SP-105) : Vérifier session et role DIRECTOR
  // TODO (SP-106+) : Fetch data avec Prisma

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Directeur
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vue d&apos;ensemble de votre organisation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Employés actifs
            </p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="mt-2 text-3xl font-bold">42</p>
          <p className="mt-1 text-xs text-muted-foreground">
            +2 ce mois-ci
          </p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Équipes
            </p>
            <span className="text-2xl">🔷</span>
          </div>
          <p className="mt-2 text-3xl font-bold">6</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Engineering, Sales, Support...
          </p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Congés en attente
            </p>
            <span className="text-2xl">✈️</span>
          </div>
          <p className="mt-2 text-3xl font-bold">8</p>
          <p className="mt-1 text-xs text-muted-foreground">
            À valider
          </p>
        </div>

        <div className="card-base border-primary">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Plan actuel
            </p>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="mt-2 text-2xl font-bold">ENTERPRISE</p>
          <p className="mt-1 text-xs text-muted-foreground">
            299€/mois - Illimité
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base">
        <h2 className="mb-4 text-lg font-semibold">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Ajouter un employé</p>
            <p className="text-xs text-muted-foreground">
              Inviter un nouveau membre
            </p>
          </button>
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Créer une équipe</p>
            <p className="text-xs text-muted-foreground">
              Organiser votre structure
            </p>
          </button>
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Voir les plannings</p>
            <p className="text-xs text-muted-foreground">
              Calendrier global
            </p>
          </button>
          <button className="rounded-lg border border-border bg-white p-4 text-left hover:bg-secondary">
            <p className="mb-1 text-sm font-medium">Paramètres</p>
            <p className="text-xs text-muted-foreground">
              Configuration org.
            </p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Demandes de congés */}
        <div className="card-base">
          <h2 className="mb-4 text-lg font-semibold">
            Demandes de congés récentes
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      23-27 Dec 2025
                    </p>
                  </div>
                </div>
                <span className="badge-base bg-yellow-100 text-yellow-800">
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nouveaux employés */}
        <div className="card-base">
          <h2 className="mb-4 text-lg font-semibold">Nouveaux employés</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    AB
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alice Brown</p>
                    <p className="text-xs text-muted-foreground">
                      Engineering Team
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Il y a 2 jours
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
