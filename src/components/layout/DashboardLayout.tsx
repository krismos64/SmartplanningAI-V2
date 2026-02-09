'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DynamicBreadcrumbs } from '@/components/ui/dynamic-breadcrumbs'
import { CommandPaletteProvider } from '@/components/providers/command-palette-provider'
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
} from '@/providers/keyboard-shortcuts-provider'
import { NotificationsProvider } from '@/providers/notifications-provider'

import { Header } from './Header'
import { Sidebar, type SidebarVariant } from './Sidebar'
import { Footer } from './Footer'
import { PageTracker } from './PageTracker'
import { SubscriptionBanner } from './SubscriptionBanner'

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

/** Données d'abonnement pour la bannière progressive (SP-441) */
interface SubscriptionData {
  subscriptionStatus: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    image?: string | null
    role: UserRole
    organizationId?: string
    companyName?: string
  }
  /** Données d'abonnement pour la bannière (SP-441) */
  subscriptionData?: SubscriptionData
  /** Variante de style de la sidebar (défaut: 'cosmic') */
  sidebarVariant?: SidebarVariant
}

/**
 * Composant interne qui connecte CommandPalette au contexte des raccourcis
 * Nécessaire car CommandPaletteProvider doit être enfant de KeyboardShortcutsProvider
 */
function DashboardLayoutContent({
  children,
  user,
  pathname,
  sidebarVariant,
  subscriptionData,
}: {
  children: React.ReactNode
  user: DashboardLayoutProps['user']
  pathname: string
  sidebarVariant: SidebarVariant
  subscriptionData?: SubscriptionData
}) {
  const { openShortcutsModal } = useKeyboardShortcutsContext()

  return (
    <CommandPaletteProvider
      userRole={user.role}
      onShowShortcuts={openShortcutsModal}
    >
      {/* Page Tracker - SP-264 Phase 4 */}
      <PageTracker />

      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          {/* Sidebar */}
          <Sidebar user={user} variant={sidebarVariant} />

          {/* Main content area */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <Header user={user} />

            {/* Subscription Banner — SP-441 */}
            {subscriptionData && (
              <SubscriptionBanner
                subscriptionStatus={subscriptionData.subscriptionStatus}
                trialEndsAt={subscriptionData.trialEndsAt}
                currentPeriodEnd={subscriptionData.currentPeriodEnd}
                role={user.role}
              />
            )}

            {/* Page content */}
            <main className="bg-mesh flex-1 transition-all duration-300">
              <ScrollArea className="h-[calc(100vh-4rem-3.5rem)]">
                <div className="container mx-auto p-6">
                  {/* Dynamic Breadcrumbs - SP-264 */}
                  <DynamicBreadcrumbs pathname={pathname} />

                  {/* Page content with Suspense boundary */}
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                </div>
              </ScrollArea>
            </main>

            {/* Footer */}
            <Footer variant="dashboard" />
          </div>
        </div>
      </SidebarProvider>
    </CommandPaletteProvider>
  )
}

export function DashboardLayout({
  children,
  user,
  subscriptionData,
  sidebarVariant = 'aurora',
}: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <KeyboardShortcutsProvider>
      <NotificationsProvider>
        <DashboardLayoutContent
          user={user}
          pathname={pathname}
          sidebarVariant={sidebarVariant}
          subscriptionData={subscriptionData}
        >
          {children}
        </DashboardLayoutContent>
      </NotificationsProvider>
    </KeyboardShortcutsProvider>
  )
}
