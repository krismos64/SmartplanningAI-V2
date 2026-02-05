'use client'

/**
 * ProfilePageContent - Contenu principal de la page profil
 *
 * Client Component orchestrateur qui affiche toutes les sections du profil.
 * Utilise AnimatedContainer pour les animations Framer Motion.
 *
 * @ticket SP-270, SP-272
 */

import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { ProfileHeader } from './ProfileHeader'
import { PersonalInfoCard } from './PersonalInfoCard'
import { ProfessionalInfoCard } from './ProfessionalInfoCard'
import { AccountInfoCard } from './AccountInfoCard'
import { ProfileActions } from './ProfileActions'
import type { ProfileData } from '@/lib/actions/profile'

interface ProfilePageContentProps {
  profile: ProfileData
}

export function ProfilePageContent({ profile }: ProfilePageContentProps) {
  // Déterminer le nom à afficher
  const displayName = profile.employee
    ? `${profile.employee.firstName} ${profile.employee.lastName}`
    : profile.user.name || 'Utilisateur'

  // L'image vient des données du profil (sera mise à jour après upload via revalidation)
  const avatarUrl = profile.user.image || null

  return (
    <div className="space-y-6">
      {/* En-tête avec avatar et nom */}
      <AnimatedContainer animation="fadeInDown">
        <ProfileHeader
          name={displayName}
          email={profile.user.email}
          role={profile.user.role}
          avatarUrl={avatarUrl}
        />
      </AnimatedContainer>

      {/* Grille de cartes d'informations */}
      <AnimatedContainer stagger staggerSpeed="normal">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informations personnelles */}
          <AnimatedItem>
            <PersonalInfoCard
              email={profile.user.email}
              phone={profile.employee?.phone}
              firstName={profile.employee?.firstName}
              lastName={profile.employee?.lastName}
            />
          </AnimatedItem>

          {/* Informations professionnelles (si employé) */}
          {profile.employee && (
            <AnimatedItem>
              <ProfessionalInfoCard
                jobTitle={profile.employee.jobTitle}
                team={profile.employee.team}
                hireDate={profile.employee.hireDate}
                weeklyHours={profile.employee.weeklyHours}
              />
            </AnimatedItem>
          )}

          {/* Informations du compte */}
          <AnimatedItem>
            <AccountInfoCard
              createdAt={profile.user.createdAt}
              lastLoginAt={profile.user.lastLoginAt}
              emailVerified={profile.user.emailVerified}
              isActive={profile.user.isActive}
            />
          </AnimatedItem>

          {/* Actions */}
          <AnimatedItem>
            <ProfileActions />
          </AnimatedItem>
        </div>
      </AnimatedContainer>
    </div>
  )
}
