/**
 * Utilitaires pour la messagerie
 *
 * @ticket SP-506
 */

const GROUP_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-pink-500',
]

/**
 * Retourne une couleur déterministe basée sur le nom du groupe
 */
export function getGroupAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length]!
}

/**
 * Retourne les initiales d'un nom de groupe (max 2 caractères)
 */
export function getGroupInitials(name: string): string {
  return name
    .split(/[\s\-_]+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
