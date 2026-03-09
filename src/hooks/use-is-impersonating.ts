/**
 * Hook pour detecter le mode impersonation
 *
 * Retourne true si l'utilisateur courant est en mode support (impersonation).
 * Utilise le champ isImpersonating du JWT enrichi via useSession().
 *
 * @ticket SP-454
 */
'use client'

import { useSession } from 'next-auth/react'

export function useIsImpersonating(): boolean {
  const { data: session } = useSession()
  return session?.user?.isImpersonating === true
}
