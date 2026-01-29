/**
 * PrivacyBadge - Badge indiquant la confidentialité des notes
 *
 * @description Badge discret avec icône cadenas
 * @ticket SP-419
 */

import { Lock } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground"
      aria-label="Vos notes sont privées et confidentielles"
    >
      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Vos notes sont privées</span>
    </div>
  )
}
