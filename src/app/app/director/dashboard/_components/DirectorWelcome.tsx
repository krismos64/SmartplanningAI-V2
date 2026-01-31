/**
 * DirectorWelcome - Message de bienvenue personnalise pour Director
 *
 * Affiche un message de bienvenue avec nom entreprise,
 * indicateur de sante et alertes.
 *
 * @ticket SP-147
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface DirectorWelcomeProps {
  /** Nom du directeur */
  userName: string
  /** Nom de l'entreprise */
  companyName: string
  /** Nombre de conges en attente */
  pendingLeaves: number
  /** Taux de presence moyen (%) */
  attendanceRate: number
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
 * Determine le statut de sante de l'entreprise
 */
function getHealthStatus(attendanceRate: number): {
  label: string
  color: string
  bgColor: string
} {
  if (attendanceRate >= 90) {
    return {
      label: 'Excellent',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    }
  }
  if (attendanceRate >= 75) {
    return {
      label: 'Correct',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    }
  }
  return {
    label: 'Attention requise',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
  }
}

/**
 * Composant de bienvenue Director
 *
 * @example
 * <DirectorWelcome
 *   userName="Marie"
 *   companyName="TechCorp"
 *   pendingLeaves={5}
 *   attendanceRate={92}
 * />
 */
export function DirectorWelcome({
  userName,
  companyName,
  pendingLeaves,
  attendanceRate,
  className,
}: DirectorWelcomeProps) {
  const greeting = getGreeting()
  const today = formatDate(new Date())
  const healthStatus = getHealthStatus(attendanceRate)
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card
      className={cn(
        'glass-strong border-none bg-gradient-to-r from-violet-500/10 to-violet-500/5',
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Texte de bienvenue */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting},{' '}
              <span className="text-neon-primary">{userName}</span> !
            </h1>
            <p className="text-muted-foreground">{today}</p>
            <p className="text-sm text-muted-foreground">
              Vue globale de <span className="font-medium">{companyName}</span>
            </p>
          </div>

          {/* Indicateurs */}
          <div className="flex flex-wrap gap-3">
            {/* Badge sante entreprise */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2',
                healthStatus.bgColor
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn('h-4 w-4', healthStatus.color)}
                aria-hidden="true"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className={cn('text-sm font-medium', healthStatus.color)}>
                {healthStatus.label}
              </span>
            </div>

            {/* Badge alertes conges */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2',
                pendingLeaves > 0 ? 'bg-orange-500/10' : 'bg-emerald-500/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  'h-4 w-4',
                  pendingLeaves > 0 ? 'text-orange-600' : 'text-emerald-600'
                )}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                className={cn(
                  'text-sm font-medium',
                  pendingLeaves > 0 ? 'text-orange-600' : 'text-emerald-600'
                )}
              >
                {pendingLeaves > 0
                  ? `${pendingLeaves} conge${pendingLeaves > 1 ? 's' : ''} en attente`
                  : 'Aucune alerte'}
              </span>
            </div>
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

export default DirectorWelcome
