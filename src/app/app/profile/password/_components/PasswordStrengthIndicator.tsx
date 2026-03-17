/**
 * PasswordStrengthIndicator - Indicateur visuel de force du mot de passe
 *
 * Affiche une barre de progression et une liste de critères
 * pour guider l'utilisateur dans le choix d'un mot de passe fort.
 *
 * @ticket SP-273
 */

'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  /** Mot de passe à évaluer */
  password: string
}

interface Criterion {
  label: string
  met: boolean
}

/**
 * Calcule les critères de force du mot de passe
 */
function evaluateCriteria(password: string): Criterion[] {
  return [
    {
      label: 'Au moins 8 caractères',
      met: password.length >= 8,
    },
    {
      label: 'Au moins une majuscule',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Au moins une minuscule',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Au moins un chiffre',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Au moins un caractère spécial',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ]
}

/**
 * Calcule le niveau de force basé sur les critères remplis
 */
function calculateStrength(criteria: Criterion[]) {
  const metCount = criteria.filter((c) => c.met).length

  if (metCount === 0) return { level: 0, label: '', color: '' }
  if (metCount <= 2) return { level: 1, label: 'Faible', color: 'bg-red-500' }
  if (metCount <= 3) return { level: 2, label: 'Moyen', color: 'bg-yellow-500' }
  if (metCount <= 4) return { level: 3, label: 'Fort', color: 'bg-blue-500' }
  return { level: 4, label: 'Très fort', color: 'bg-green-500' }
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const criteria = useMemo(() => evaluateCriteria(password), [password])
  const strength = useMemo(() => calculateStrength(criteria), [criteria])

  // Ne pas afficher si pas de mot de passe
  if (!password) return null

  return (
    <div className="mt-2 space-y-3" data-testid="password-strength-indicator">
      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Force du mot de passe</span>
          {strength.label && (
            <span
              className={cn(
                'font-medium',
                strength.level <= 1 && 'text-red-500',
                strength.level === 2 && 'text-yellow-500',
                strength.level === 3 && 'text-blue-500',
                strength.level === 4 && 'text-green-500'
              )}
              data-testid="password-strength-label"
            >
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              strength.color
            )}
            style={{ width: `${(strength.level / 4) * 100}%` }}
            data-testid="password-strength-bar"
            role="progressbar"
            aria-valuenow={strength.level}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label={`Force du mot de passe: ${strength.label || 'Aucun'}`}
          />
        </div>
      </div>

      {/* Liste des critères */}
      <ul className="space-y-1 text-xs" aria-label="Critères du mot de passe">
        {criteria.map((criterion, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2 transition-colors',
              criterion.met ? 'text-green-600' : 'text-muted-foreground'
            )}
            data-testid={`criterion-${index}`}
            aria-label={`${criterion.label}: ${criterion.met ? 'Rempli' : 'Non rempli'}`}
          >
            {criterion.met ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3" aria-hidden="true" />
            )}
            {criterion.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
