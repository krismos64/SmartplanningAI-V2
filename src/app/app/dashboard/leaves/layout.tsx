/**
 * Layout pour la page Leaves (Congés)
 *
 * @description Metadata SEO pour la page de gestion des congés
 * @ticket SP-413
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Congés | SmartPlanning',
  description:
    'Gérez les demandes de congés de votre équipe. Consultez, validez et suivez les absences facilement.',
  openGraph: {
    title: 'Gestion des Congés | SmartPlanning',
    description: 'Tableau de bord des demandes de congés et absences',
  },
}

export default function LeavesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
