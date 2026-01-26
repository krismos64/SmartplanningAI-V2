/**
 * Layout pour la page Schedules
 *
 * @description Metadata SEO pour la page de gestion des plannings
 * @ticket SP-395, SP-396
 */

import { Metadata } from 'next'
import './schedule-calendar.css'

export const metadata: Metadata = {
  title: 'Plannings | SmartPlanning',
  description:
    'Gérez les plannings et horaires de travail de vos équipes. Créez, modifiez et publiez les shifts facilement.',
  openGraph: {
    title: 'Plannings | SmartPlanning',
    description: 'Gérez les plannings et horaires de travail de vos équipes',
  },
}

export default function SchedulesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
