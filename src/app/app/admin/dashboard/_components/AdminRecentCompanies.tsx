/**
 * AdminRecentCompanies - Liste des dernieres entreprises inscrites
 *
 * Affiche les 5 dernieres entreprises avec leurs infos de base
 * (Server Component qui fetch les donnees).
 *
 * @ticket SP-148
 */
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface AdminRecentCompaniesProps {
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate une date relative
 */
function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
  return `Il y a ${Math.floor(diffDays / 30)} mois`
}

/**
 * Genere les initiales d'une entreprise
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Couleurs pour les avatars
 */
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
]

/**
 * Composant liste des dernieres entreprises
 *
 * @example
 * <AdminRecentCompanies />
 */
export async function AdminRecentCompanies({
  className,
}: AdminRecentCompaniesProps) {
  // Recuperer les 5 dernieres entreprises
  const recentCompanies = await prisma.company.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
    select: {
      id: true,
      name: true,
      createdAt: true,
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  })

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Dernieres inscriptions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              5 dernieres entreprises
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/entreprises">Voir tout</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentCompanies.length > 0 ? (
          <div className="space-y-3">
            {recentCompanies.map((company, index) => (
              <div
                key={company.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar avec initiales */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white',
                      AVATAR_COLORS[index % AVATAR_COLORS.length]
                    )}
                  >
                    {getInitials(company.name)}
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {company._count.users} utilisateur
                      {company._count.users > 1 ? 's' : ''} -{' '}
                      {company.subscription?.plan ?? 'FREE'}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeDate(company.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucune entreprise inscrite
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminRecentCompanies
