'use client'

/**
 * ProfileHeader - En-tête du profil utilisateur avec upload d'avatar
 *
 * Affiche l'avatar (avec upload), le nom, l'email et le badge de rôle.
 * Design Cyber Glass 3D avec animation text-neon.
 *
 * @ticket SP-270, SP-272
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AvatarUpload } from '@/components/profile'

interface ProfileHeaderProps {
  name: string
  email: string
  role: string
  avatarUrl: string | null
  editable?: boolean
  onAvatarChange?: (url: string | null) => void
}

const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: 'Administrateur Système',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé',
}

const ROLE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  SYSTEM_ADMIN: 'destructive',
  DIRECTOR: 'default',
  MANAGER: 'secondary',
  EMPLOYEE: 'outline',
}

/**
 * Génère les initiales à partir du nom complet
 *
 * @param name - Nom complet (ex: "Jean Dupont")
 * @returns Initiales en majuscules (ex: "JD")
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHeader({
  name,
  email,
  role,
  avatarUrl,
  editable = true,
  onAvatarChange,
}: ProfileHeaderProps) {
  if (editable) {
    return (
      <div
        className="glass-strong flex flex-col items-center gap-6 rounded-xl p-6 sm:flex-row"
        data-testid="profile-header"
      >
        <AvatarUpload
          currentImage={avatarUrl}
          name={name}
          onUploadSuccess={(url) => onAvatarChange?.(url)}
          onDeleteSuccess={() => onAvatarChange?.(null)}
        />

        <div className="space-y-1 text-center sm:text-left">
          <h1
            className="text-neon-primary text-2xl font-bold"
            data-testid="profile-name"
          >
            {name}
          </h1>
          <p className="text-muted-foreground" data-testid="profile-email">
            {email}
          </p>
          <Badge
            variant={ROLE_VARIANTS[role] || 'outline'}
            data-testid="profile-role"
          >
            {ROLE_LABELS[role] || role}
          </Badge>
        </div>
      </div>
    )
  }

  // Version non-éditable (lecture seule)
  return (
    <div
      className="glass-strong flex items-center gap-6 rounded-xl p-6"
      data-testid="profile-header"
    >
      <Avatar className="h-20 w-20 ring-2 ring-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt={name} />
        <AvatarFallback className="bg-primary/10 text-xl text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <h1
          className="text-neon-primary text-2xl font-bold"
          data-testid="profile-name"
        >
          {name}
        </h1>
        <p className="text-muted-foreground" data-testid="profile-email">
          {email}
        </p>
        <Badge
          variant={ROLE_VARIANTS[role] || 'outline'}
          data-testid="profile-role"
        >
          {ROLE_LABELS[role] || role}
        </Badge>
      </div>
    </div>
  )
}
