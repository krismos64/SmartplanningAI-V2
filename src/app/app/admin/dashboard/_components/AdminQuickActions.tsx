/**
 * AdminQuickActions - Actions rapides pour Super Admin
 *
 * Affiche les boutons d'actions rapides pour l'administration
 * de la plateforme.
 *
 * @ticket SP-148
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BroadcastModal } from '@/components/admin/BroadcastModal'
import { cn } from '@/lib/utils'

export interface AdminQuickActionsProps {
  /** Nombre total d'entreprises */
  totalCompanies: number
  /** Nombre d'abonnements actifs */
  activeSubscriptions: number
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant actions rapides Super Admin
 *
 * @example
 * <AdminQuickActions totalCompanies={150} activeSubscriptions={120} />
 */
export function AdminQuickActions({
  totalCompanies,
  activeSubscriptions,
  className,
}: AdminQuickActionsProps) {
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {/* Creer une entreprise */}
          <Button variant="default" asChild>
            <Link
              href="/admin/companies/new"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M9 8h1" />
                <path d="M9 12h1" />
                <path d="M9 16h1" />
                <path d="M14 8h1" />
                <path d="M14 12h1" />
                <path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <line x1="12" y1="5" x2="12" y2="9" />
                <line x1="10" y1="7" x2="14" y2="7" />
              </svg>
              Nouvelle entreprise
            </Link>
          </Button>

          {/* Gerer les entreprises */}
          <Button variant="outline" asChild>
            <Link href="/admin/companies" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M9 8h1" />
                <path d="M9 12h1" />
                <path d="M9 16h1" />
                <path d="M14 8h1" />
                <path d="M14 12h1" />
                <path d="M14 16h1" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              Entreprises
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {totalCompanies}
              </span>
            </Link>
          </Button>

          {/* Gerer les abonnements */}
          <Button variant="outline" asChild>
            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              Abonnements
              <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {activeSubscriptions}
              </span>
            </Link>
          </Button>

          {/* Diffusion générale (SP-477) */}
          <BroadcastModal />

          {/* Parametres plateforme */}
          <Button variant="outline" asChild>
            <Link href="/admin/settings" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Parametres
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (shouldReduceMotion) {
    return content
  }

  return (
    <motion.div
      variants={fadeSlideUpVariants}
      initial="hidden"
      animate="visible"
      custom={0.5}
    >
      {content}
    </motion.div>
  )
}

export default AdminQuickActions
