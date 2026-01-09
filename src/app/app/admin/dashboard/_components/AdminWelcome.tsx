/**
 * AdminWelcome - Message de bienvenue personnalise pour Super Admin
 *
 * Affiche un message de bienvenue avec indicateurs de sante plateforme,
 * MRR et taux de churn.
 *
 * @ticket SP-148
 */
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AdminWelcomeProps {
  /** Nom de l'administrateur */
  userName: string
  /** Nombre total d'entreprises */
  totalCompanies: number
  /** Nombre total d'utilisateurs */
  totalUsers: number
  /** MRR actuel en EUR */
  mrr: number
  /** Taux de churn mensuel (%) */
  churnRate: number
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
 * Formate un montant en EUR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Determine le statut de sante de la plateforme
 */
function getHealthStatus(churnRate: number): {
  label: string
  color: string
  bgColor: string
} {
  if (churnRate <= 2) {
    return {
      label: 'Excellent',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    }
  }
  if (churnRate <= 5) {
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
 * Composant de bienvenue Super Admin
 *
 * @example
 * <AdminWelcome
 *   userName="Admin"
 *   totalCompanies={150}
 *   totalUsers={2500}
 *   mrr={45000}
 *   churnRate={2.5}
 * />
 */
export function AdminWelcome({
  userName,
  totalCompanies: _totalCompanies,
  totalUsers: _totalUsers,
  mrr,
  churnRate,
  className,
}: AdminWelcomeProps) {
  // Reserved for future use in expanded welcome panel
  void _totalCompanies
  void _totalUsers
  const greeting = getGreeting()
  const today = formatDate(new Date())
  const healthStatus = getHealthStatus(churnRate)

  return (
    <Card
      className={cn(
        'border-none bg-gradient-to-r from-rose-500/10 to-rose-500/5',
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Texte de bienvenue */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, {userName} !
            </h1>
            <p className="text-muted-foreground">{today}</p>
            <p className="text-sm text-muted-foreground">
              Vue globale de la plateforme SmartPlanning
            </p>
          </div>

          {/* Indicateurs */}
          <div className="flex flex-wrap gap-3">
            {/* Badge MRR */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-sm font-medium text-emerald-600">
                MRR: {formatCurrency(mrr)}
              </span>
            </div>

            {/* Badge sante plateforme */}
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

            {/* Badge churn */}
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2',
                churnRate > 5 ? 'bg-red-500/10' : 'bg-blue-500/10'
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
                  churnRate > 5 ? 'text-red-600' : 'text-blue-600'
                )}
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span
                className={cn(
                  'text-sm font-medium',
                  churnRate > 5 ? 'text-red-600' : 'text-blue-600'
                )}
              >
                Churn: {churnRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AdminWelcome
