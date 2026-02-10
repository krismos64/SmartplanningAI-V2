/**
 * UsageIndicator — Jauge d'utilisation des sièges
 *
 * Affiche le nombre d'employés actifs par rapport aux sièges achetés,
 * le taux d'utilisation avec une barre de progression colorée,
 * et le montant mensuel.
 *
 * @ticket SP-360
 */
'use client'

import { Users, Receipt, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion, fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface UsageIndicatorProps {
  /** Nombre d'employés actifs */
  employeeCount: number
  /** Nombre de sièges achetés (subscription.quantity) */
  quantity: number
  /** Prix par employé en centimes */
  pricePerEmployee: number
  /** Montant mensuel en euros */
  monthlyAmount: number
  /** Classes CSS additionnelles */
  className?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function getUsageColor(ratio: number): 'success' | 'warning' | 'destructive' {
  if (ratio >= 1) return 'destructive'
  if (ratio >= 0.8) return 'warning'
  return 'success'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UsageIndicator({
  employeeCount,
  quantity,
  pricePerEmployee,
  monthlyAmount,
  className,
}: UsageIndicatorProps) {
  const shouldReduceMotion = useReducedMotion()

  const usageRatio = quantity > 0 ? employeeCount / quantity : 0
  const usagePercent = Math.min(Math.round(usageRatio * 100), 100)
  const usageColor = getUsageColor(usageRatio)
  const pricePerEmployeeEur = pricePerEmployee / 100

  const content = (
    <Card
      className={cn('glass-strong', className)}
      data-testid="usage-indicator"
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">Utilisation</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Jauge */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <span
                className="font-semibold text-foreground"
                data-testid="employee-count"
              >
                {employeeCount}
              </span>{' '}
              / {quantity} sièges utilisés
            </span>
            <span className="font-medium" data-testid="usage-percent">
              {usagePercent}%
            </span>
          </div>
          <ProgressBar
            value={usagePercent}
            color={usageColor}
            size="md"
            aria-label={`${employeeCount} employés sur ${quantity} sièges`}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Prix unitaire</p>
            <p className="text-lg font-bold" data-testid="price-per-employee">
              {formatCurrency(pricePerEmployeeEur)}
            </p>
            <p className="text-xs text-muted-foreground">par employé / mois</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-1">
              <Receipt
                className="h-3 w-3 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">Total mensuel</p>
            </div>
            <p className="text-lg font-bold" data-testid="monthly-total">
              {formatCurrency(monthlyAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {quantity} × {formatCurrency(pricePerEmployeeEur)}
            </p>
          </div>
        </div>

        {/* Info prorata */}
        <TooltipProvider>
          <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-help"
                  aria-hidden="true"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Le prorata est calculé automatiquement par Stripe</p>
              </TooltipContent>
            </Tooltip>
            <p data-testid="prorata-info">
              Chaque employé ajouté ou retiré ajuste automatiquement votre
              facture au prorata.
            </p>
          </div>
        </TooltipProvider>
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
