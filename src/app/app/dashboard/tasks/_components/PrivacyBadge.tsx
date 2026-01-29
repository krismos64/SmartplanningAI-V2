/**
 * PrivacyBadge - Badge indiquant la confidentialité des tâches
 *
 * @description Badge discret avec icône cadenas
 * @ticket SP-419
 */

import { Lock } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
      aria-label="Vos tâches sont privées et confidentielles"
    >
      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Vos tâches sont privées</span>
    </div>
  )
}
