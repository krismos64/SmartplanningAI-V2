/**
 * EmployeeWelcome - Message de bienvenue personnalise
 *
 * Affiche un message de bienvenue contextuel selon l'heure
 * avec le prochain shift si disponible.
 *
 * @ticket SP-145
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NextShift {
  date: Date
  startTime: string
  endTime: string
}

export interface EmployeeWelcomeProps {
  /** Nom de l'utilisateur */
  userName: string
  /** Prochain shift (optionnel) */
  nextShift: NextShift | null
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
    return 'Bon après-midi'
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
 * Formate la date du prochain shift
 */
function formatShiftDate(date: Date): string {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const shiftDate = new Date(date)

  // Comparaison par jour uniquement
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(shiftDate, today)) {
    return "Aujourd'hui"
  }
  if (isSameDay(shiftDate, tomorrow)) {
    return 'Demain'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(shiftDate)
}

/**
 * Composant de bienvenue personnalise
 *
 * @example
 * <EmployeeWelcome
 *   userName="Jean"
 *   nextShift={{ date: new Date(), startTime: '09:00', endTime: '17:00' }}
 * />
 */
export function EmployeeWelcome({
  userName,
  nextShift,
  className,
}: EmployeeWelcomeProps) {
  const greeting = getGreeting()
  const today = formatDate(new Date())
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card
      className={cn(
        'glass-strong border-none bg-gradient-to-r from-primary/10 to-primary/5',
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, <span className="text-neon-primary">{userName}</span> !
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {nextShift && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Prochain planning</p>
              <p className="text-sm text-muted-foreground">
                {formatShiftDate(nextShift.date)} - {nextShift.startTime} a{' '}
                {nextShift.endTime}
              </p>
            </div>
          </div>
        )}

        {!nextShift && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Aucun planning programmé
              </p>
            </div>
          </div>
        )}
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

export default EmployeeWelcome
