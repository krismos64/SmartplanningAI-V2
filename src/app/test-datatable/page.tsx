/**
 * Test DataTable Page - Page de démonstration du composant DataTable
 *
 * ✅ Source : Next.js 15 App Router + Client Component (Context7)
 *
 * OBJECTIF :
 * Page de test complète pour valider le DataTable avec données réelles
 * Accessible via /test-datatable
 *
 * FONCTIONNALITÉS :
 * - 50 utilisateurs fictifs
 * - Callbacks View/Edit/Delete avec console.log
 * - Layout responsive
 * - Titre et description
 */

'use client'

import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'
import { mockUsers, type User } from './mock-data'

export default function TestDataTablePage() {
  // ===================================================================
  // HANDLERS (Actions sur les lignes)
  // ===================================================================
  const handleView = (user: User) => {
    // eslint-disable-next-line no-console
    console.log('🔍 View user:', user)
    // TODO Phase suivante : Ouvrir modal de détails
  }

  const handleEdit = (user: User) => {
    // eslint-disable-next-line no-console
    console.log('✏️ Edit user:', user)
    // TODO Phase suivante : Ouvrir modal d'édition
  }

  const handleDelete = (user: User) => {
    // eslint-disable-next-line no-console
    console.log('🗑️ Delete user:', user)
    // TODO Phase suivante : Ouvrir confirmation de suppression
  }

  // ===================================================================
  // RENDU
  // ===================================================================
  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Test DataTable Component
        </h1>
        <p className="mt-2 text-muted-foreground">
          Démonstration du composant DataTable production-ready avec TanStack
          Table v8, Shadcn/ui et Next.js 15. Testez le tri, la pagination, la
          recherche et la sélection.
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={getColumns(handleView, handleEdit, handleDelete)}
        data={mockUsers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher par nom..."
        searchColumn="name"
      />

      {/* Footer info */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-4">
        <h2 className="text-sm font-semibold">Fonctionnalités testées :</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>✅ Tri multi-colonnes (clic sur les en-têtes avec icône)</li>
          <li>✅ Pagination (10/20/50/100 lignes par page)</li>
          <li>✅ Recherche globale fuzzy (barre de recherche)</li>
          <li>✅ Sélection multi-rows (checkboxes)</li>
          <li>✅ Actions par ligne (dropdown menu View/Edit/Delete)</li>
          <li>
            ✅ Responsive : table desktop (≥1024px), cards mobile (&lt;768px)
          </li>
          <li>✅ Empty state (visible quand aucun résultat filtré)</li>
          <li>✅ TypeScript strict avec generics</li>
        </ul>
      </div>

      {/* Instructions développeur */}
      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-sm font-semibold text-primary">
          Instructions développeur :
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Les callbacks View/Edit/Delete affichent actuellement les données dans
          la console (ouvrez DevTools avec F12). En production, vous remplacerez
          ces console.log par des appels API et des modals d&apos;édition.
        </p>
      </div>
    </div>
  )
}
