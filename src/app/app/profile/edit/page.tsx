import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getProfile } from '@/lib/actions/profile'
import { EditProfileForm } from './_components'

/**
 * Page d'édition du profil utilisateur
 *
 * @description Server Component qui récupère les données du profil
 * et affiche le formulaire d'édition.
 *
 * @ticket SP-271
 */

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Modifier mon profil | SmartPlanning',
  description: 'Modifiez vos informations personnelles sur SmartPlanning.',
  robots: {
    index: false, // Page privée, ne pas indexer
  },
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function EditProfilePage() {
  // Récupérer le profil de l'utilisateur connecté
  const result = await getProfile()

  // Rediriger vers login si non authentifié
  if (!result.success) {
    redirect('/login')
  }

  const { user, employee } = result.data

  // Préparer les valeurs par défaut du formulaire
  // Pour SYSTEM_ADMIN sans Employee, on parse le User.name
  const defaultValues = {
    firstName: employee?.firstName ?? user.name?.split(' ')[0] ?? '',
    lastName:
      employee?.lastName ?? user.name?.split(' ').slice(1).join(' ') ?? '',
    phone: employee?.phone ?? '',
    jobTitle: employee?.jobTitle ?? '',
    hireDate: employee?.hireDate ?? null,
    weeklyHours: employee?.weeklyHours ?? null,
  }

  return (
    <div className="container max-w-2xl py-8" data-testid="edit-profile-page">
      <EditProfileForm defaultValues={defaultValues} hasEmployee={!!employee} />
    </div>
  )
}
