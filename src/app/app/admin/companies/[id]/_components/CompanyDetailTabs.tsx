'use client'

/**
 * CompanyDetailTabs — Navigation par onglets de la fiche entreprise
 *
 * Pilote l'onglet actif via le searchParam `?tab=` (deep-link bookmarkable,
 * pattern journal d'audit SP-445). Chaque onglet est un Suspense boundary
 * indépendant côté serveur (voir page.tsx) : le changement d'onglet ne
 * recharge pas les données des autres.
 *
 * @ticket SP-546
 */

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Info, CreditCard, Users, ScrollText } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export type CompanyDetailTab = 'infos' | 'subscription' | 'users' | 'audit'

const TABS: { value: CompanyDetailTab; label: string; icon: typeof Info }[] = [
  { value: 'infos', label: 'Informations', icon: Info },
  { value: 'subscription', label: 'Abonnement', icon: CreditCard },
  { value: 'users', label: 'Utilisateurs', icon: Users },
  { value: 'audit', label: 'Audit', icon: ScrollText },
]

const DEFAULT_TAB: CompanyDetailTab = 'infos'

function isValidTab(value: string | null): value is CompanyDetailTab {
  return TABS.some((tab) => tab.value === value)
}

export interface CompanyDetailTabsProps {
  infos: React.ReactNode
  subscription: React.ReactNode
  users: React.ReactNode
  audit: React.ReactNode
}

export function CompanyDetailTabs({
  infos,
  subscription,
  users,
  audit,
}: CompanyDetailTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawTab = searchParams.get('tab')
  const activeTab = isValidTab(rawTab) ? rawTab : DEFAULT_TAB

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === DEFAULT_TAB) {
        params.delete('tab')
      } else {
        params.set('tab', value)
      }
      const query = params.toString()
      // replace (pas push) : changer d'onglet ne doit pas empiler l'historique
      // — le bouton Retour ramène à la liste, pas à chaque onglet visité
      // (review PR #54). Le deep-link ?tab= reste bookmarkable.
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [searchParams, pathname, router]
  )

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList data-testid="company-detail-tabs">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-testid={`company-tab-${tab.value}`}
            className="gap-1.5"
          >
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="infos" data-testid="company-tab-content-infos">
        {infos}
      </TabsContent>
      <TabsContent
        value="subscription"
        data-testid="company-tab-content-subscription"
      >
        {subscription}
      </TabsContent>
      <TabsContent value="users" data-testid="company-tab-content-users">
        {users}
      </TabsContent>
      <TabsContent value="audit" data-testid="company-tab-content-audit">
        {audit}
      </TabsContent>
    </Tabs>
  )
}
