/**
 * ManagerWelcome - Message de bienvenue personnalise pour le manager
 *
 * Affiche un message de bienvenue contextuel selon l'heure
 * avec badge alerte si conges en attente.
 *
 * @ticket SP-316
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ManagerWelcomeProps {
  /** Nom du manager */
  userName: string
  /** Nombre de demandes de conges en attente */
  pendingLeaveRequests: number
  /** Nombre d'absents aujourd'hui */
  todayAbsences: number
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Retourne un message de salutation selon l'heure
 */
function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Bonjour'
  }
  if (hour >= 12 && hour < 18) {
    return 'Bon apres-midi'
  }
  return 'Bonsoir'
}

/**
 * Formate une date en francais
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Composant de bienvenue personnalise pour le Manager
 *
 * @example
 * <ManagerWelcome
 *   userName="Marie"
 *   pendingLeaveRequests={3}
 *   todayAbsences={2}
 * />
 */
export function ManagerWelcome({
  userName,
  pendingLeaveRequests,
  todayAbsences,
  className,
}: ManagerWelcomeProps) {
  const greeting = getGreeting()
  const today = formatDate(new Date())
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card
      className={cn(
        'glass-strong border-none bg-gradient-to-r from-blue-500/10 to-indigo-500/5',
        className
      )}
      data-testid="manager-welcome"
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, <span className="text-neon-primary">{userName}</span>{' '}
              !
            </h1>
            <p className="text-muted-foreground">{today}</p>
            <p className="text-sm text-muted-foreground">
              Vue d&apos;ensemble de votre equipe
            </p>
          </div>

          {/* Badges d'alerte */}
          <div className="flex flex-wrap gap-2">
            {pendingLeaveRequests > 0 && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1.5"
                data-testid="pending-leaves-badge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {pendingLeaveRequests} conge
                {pendingLeaveRequests > 1 ? 's' : ''} a valider
              </Badge>
            )}
            {todayAbsences > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5"
                data-testid="absences-badge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="17" y1="11" x2="22" y2="11" />
                </svg>
                {todayAbsences} absent{todayAbsences > 1 ? 's' : ''}{' '}
                aujourd&apos;hui
              </Badge>
            )}
            {pendingLeaveRequests === 0 && todayAbsences === 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 border-emerald-500 text-emerald-600"
                data-testid="all-good-badge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Tout est en ordre
              </Badge>
            )}
          </div>
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
    >
      {content}
    </motion.div>
  )
}

export default ManagerWelcome
