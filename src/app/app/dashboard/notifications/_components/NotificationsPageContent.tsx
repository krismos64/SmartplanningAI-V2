/**
 * NotificationsPageContent - Client Component
 *
 * @ticket SP-324
 * @description Orchestrateur de la page notifications avec état, filtres et pagination
 */

'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useNotificationsPaginated } from '@/hooks/useNotificationsPaginated'
import { NotificationEmptyState } from '@/components/notifications'

import { NotificationsFilters } from './NotificationsFilters'
import { NotificationsTable } from './NotificationsTable'
import { NotificationsBulkActions } from './NotificationsBulkActions'
import { NotificationsListSkeleton } from './NotificationsListSkeleton'

export function NotificationsPageContent() {
  const hookResult = useNotificationsPaginated({ pageSize: 10 })
  const notifications = hookResult.notifications
  const pagination = hookResult.pagination
  const isLoading = hookResult.isLoading
  const error = hookResult.error
  const page = hookResult.page
  const goToPage = hookResult.goToPage
  const nextPage = hookResult.nextPage
  const prevPage = hookResult.prevPage
  const filters = hookResult.filters
  const setTypeFilter = hookResult.setTypeFilter
  const setReadFilter = hookResult.setReadFilter
  const clearFilters = hookResult.clearFilters
  const hasActiveFilters = hookResult.hasActiveFilters
  const unreadCount = hookResult.unreadCount
  const readCount = hookResult.readCount
  const markAsRead = hookResult.markAsRead
  const markAllAsRead = hookResult.markAllAsRead
  const deleteNotification = hookResult.deleteNotification
  const deleteAllRead = hookResult.deleteAllRead

  // Gestionnaires d'événements sans async pour éviter les promesses non gérées
  const handleMarkAsRead = (id: string) => {
    void markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    void markAllAsRead()
  }

  const handleDeleteNotification = (id: string) => {
    void deleteNotification(id)
  }

  const handleDeleteAllRead = () => {
    void deleteAllRead()
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center"
          data-testid="notifications-error"
        >
          <p className="text-destructive">Erreur : {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="notifications-page">
      <PageHeader />

      {/* Filtres et actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <NotificationsFilters
          filters={filters}
          onTypeChange={setTypeFilter}
          onReadChange={setReadFilter}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <NotificationsBulkActions
          unreadCount={unreadCount}
          readCount={readCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteAllRead={handleDeleteAllRead}
          isLoading={isLoading}
        />
      </div>

      {/* Liste ou états */}
      {isLoading ? (
        <NotificationsListSkeleton />
      ) : notifications.length === 0 ? (
        <div className="py-8" data-testid="notifications-empty">
          <NotificationEmptyState />
          {hasActiveFilters && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Essayez de{' '}
              <button
                onClick={clearFilters}
                className="text-primary hover:underline"
              >
                réinitialiser les filtres
              </button>
            </p>
          )}
        </div>
      ) : (
        <NotificationsTable
          notifications={notifications}
          pagination={pagination}
          page={page}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
        />
      )}
    </div>
  )
}

function PageHeader() {
  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/app/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Notifications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Historique complet de vos notifications
        </p>
      </div>
    </>
  )
}
