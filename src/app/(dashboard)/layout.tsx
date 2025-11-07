/**
 * Dashboard Layout - Layout pour les pages authentifiées
 *
 * ✅ Source : Next.js 15 Route Groups + Dashboard patterns (Context7)
 *
 * OBJECTIF (CDA) :
 * Layout principal pour toutes les pages dashboard (director, manager, employee).
 * Utilise les Route Groups (dashboard) pour regrouper les pages protégées.
 *
 * AVANTAGES :
 * - URLs propres : /director, /manager, /employee (pas de /dashboard/...)
 * - Layout partagé (sidebar, header)
 * - Isolation du code authentification
 *
 * ARCHITECTURE :
 * - Sidebar gauche (navigation principale)
 * - Header en haut (user menu, notifications)
 * - Main content area responsive
 * - Mobile : sidebar devient drawer
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 Route Groups avancés
 * - Dashboard layout pattern (Vercel, Shadcn)
 * - Server Component avec metadata
 *
 * ⚠️ SÉCURITÉ :
 * Pour Phase 3 (SP-104) : Layout sans protection auth
 * Phase 4 (SP-105) : Ajout middleware NextAuth
 */

import Link from 'next/link'
import type { Metadata } from 'next'

/**
 * Metadata pour les pages dashboard
 *
 * Partagée par toutes les pages protégées
 */
export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Dashboard | SmartPlanning',
  },
  robots: {
    index: false, // Pages dashboard non indexées
    follow: false,
  },
}

/**
 * DashboardLayout Component
 *
 * Layout avec sidebar + header pour les pages authentifiées
 *
 * STRUCTURE :
 * - Sidebar fixe à gauche (desktop)
 * - Header fixe en haut
 * - Main content scrollable
 *
 * TODO (SP-105) :
 * - Ajouter vérification session auth()
 * - Rediriger vers /login si non authentifié
 * - Afficher user info dans header
 *
 * @param children - Pages director/manager/employee
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      {/* ===================================================================
          SIDEBAR - Navigation principale (Desktop)
          =================================================================== */}
      <aside className="hidden w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-6">
            <Link href="/" className="text-xl font-bold text-primary">
              SmartPlanning
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Dashboard v2.0
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/director"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              📊 Director Dashboard
            </Link>
            <Link
              href="/manager"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              👥 Manager Dashboard
            </Link>
            <Link
              href="/employee"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              👤 Employee Dashboard
            </Link>

            <div className="my-4 border-t" />

            <Link
              href="#"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              📅 Plannings
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              ✈️ Congés
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              👥 Équipes
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              ⚙️ Paramètres
            </Link>
          </nav>

          {/* Footer sidebar */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Version 2.0.0 - Beta
            </p>
          </div>
        </div>
      </aside>

      {/* ===================================================================
          MAIN CONTENT AREA
          =================================================================== */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Mobile: Burger menu (à implémenter en Phase 4) */}
            <div className="lg:hidden">
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-secondary"
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop: Breadcrumb ou titre */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-foreground">
                Dashboard
              </h1>
            </div>

            {/* Actions header : notifications + user menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-secondary"
                aria-label="Notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* User menu (dropdown à implémenter) */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  U
                </div>
                <div className="hidden text-sm lg:block">
                  <p className="font-medium">Utilisateur</p>
                  <p className="text-xs text-muted-foreground">
                    user@company.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
