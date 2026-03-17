'use client'

/**
 * SettingsPageContent - Contenu principal de la page paramètres
 *
 * Client Component orchestrateur qui affiche les sections de paramètres
 * avec animations stagger et filtrage RBAC basé sur le rôle utilisateur.
 *
 * @ticket SP-274
 */

import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { SettingsHeader } from './SettingsHeader'
import { SettingsSection, type SettingsSectionProps } from './SettingsSection'
import { User, Palette, Bell, Shield, Building } from 'lucide-react'

interface SettingsPageContentProps {
  /** Rôle de l'utilisateur connecté pour filtrage RBAC */
  userRole: string
}

/** Configuration des sections de paramètres */
interface SettingsSectionConfig
  extends Omit<SettingsSectionProps, 'testId' | 'icon'> {
  id: string
  icon: SettingsSectionProps['icon']
  /** 'ALL' pour tous les rôles, ou tableau de rôles autorisés */
  roles: 'ALL' | string[]
}

const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: 'profile',
    icon: User,
    title: 'Profil',
    description: 'Gérez vos informations personnelles et professionnelles',
    href: '/app/profile',
    roles: 'ALL',
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Apparence',
    description: "Personnalisez le thème et les formats d'affichage",
    href: '/app/settings/appearance',
    roles: 'ALL',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Configurez vos préférences de notifications email et in-app',
    href: '/app/settings/notifications',
    roles: 'ALL',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Sécurité',
    description: 'Mot de passe, authentification et suppression de compte',
    href: '/app/profile/password',
    roles: 'ALL',
  },
  {
    id: 'company',
    icon: Building,
    title: 'Entreprise',
    description: 'Paramètres et configuration de votre organisation',
    href: '/app/settings/company',
    roles: ['DIRECTOR', 'SYSTEM_ADMIN'],
  },
]

/**
 * Filtre les sections visibles selon le rôle utilisateur
 */
function filterSectionsByRole(
  sections: SettingsSectionConfig[],
  userRole: string
) {
  return sections.filter((section) => {
    if (section.roles === 'ALL') return true
    return section.roles.includes(userRole)
  })
}

export function SettingsPageContent({ userRole }: SettingsPageContentProps) {
  const visibleSections = filterSectionsByRole(SETTINGS_SECTIONS, userRole)

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header avec animation */}
      <AnimatedContainer animation="fadeInDown">
        <SettingsHeader />
      </AnimatedContainer>

      {/* Grille des sections avec stagger */}
      <AnimatedContainer stagger staggerSpeed="normal">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSections.map((section) => (
            <AnimatedItem key={section.id}>
              <SettingsSection
                icon={section.icon}
                title={section.title}
                description={section.description}
                href={section.href}
                badge={section.badge}
                testId={`settings-section-${section.id}`}
              />
            </AnimatedItem>
          ))}
        </div>
      </AnimatedContainer>
    </div>
  )
}
