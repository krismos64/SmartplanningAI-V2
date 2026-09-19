/**
 * Page de confidentialité et cookies
 *
 * @ticket SP-600 - Le consentement ne doit plus recouvrir le back-office
 *
 * Le consentement était auparavant réglable uniquement depuis le footer
 * public : un utilisateur connecté n'avait aucun moyen de revenir sur son
 * choix, alors que le RGPD impose un consentement révocable à tout moment.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { PrivacyPageContent } from './_components/PrivacyPageContent'

export const metadata: Metadata = {
  title: 'Confidentialité et cookies | SmartPlanning',
  description:
    'Consultez et modifiez à tout moment vos préférences de cookies et de mesure d’audience',
}

export default async function PrivacyPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return <PrivacyPageContent />
}
