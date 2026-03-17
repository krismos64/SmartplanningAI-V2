/**
 * PageTracker Component
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 *
 * OBJECTIF :
 * Composant invisible qui track les pages visitées et les enregistre
 * dans localStorage via le store recent-pages-store.
 *
 * FONCTIONNALITÉS :
 * - Détecte les changements de route via usePathname
 * - Mappe le pathname vers un titre et une icône
 * - Enregistre la page dans l'historique récent
 * - Ne track que les routes dashboard (pas /auth, /api, etc.)
 *
 * RGPD COMPLIANCE :
 * Ne stocke que des données non sensibles :
 * - Routes (ex: "/app/tableau-de-bord/employes")
 * - Titres de pages (ex: "Collaborateurs")
 * - Noms d'icônes (ex: "Users")
 * - Timestamps
 */

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useRecentPages } from '@/hooks/use-recent-pages'
import { navigationItems } from '@/lib/navigation/menu-items'

/**
 * Mapping des routes vers les infos de page
 * Utilisé pour les routes qui ne sont pas dans navigationItems
 */
const ROUTE_INFO_MAP: Record<string, { title: string; icon: string }> = {
  '/app/tableau-de-bord': { title: 'Dashboard', icon: 'Home' },
  '/app/admin/dashboard': { title: 'Dashboard SaaS', icon: 'Activity' },
  '/app/admin/entreprises': { title: 'Entreprises', icon: 'Building' },
  '/app/admin/surveillance': { title: 'Monitoring', icon: 'Activity' },
  '/app/admin/journaux': { title: 'Logs système', icon: 'AlertCircle' },
  '/app/tableau-de-bord/employes': { title: 'Collaborateurs', icon: 'Users' },
  '/app/directeur/equipes': { title: 'Équipes', icon: 'UsersRound' },
  '/app/tableau-de-bord/plannings': { title: 'Plannings', icon: 'Calendar' },
  '/app/tableau-de-bord/conges': { title: 'Congés', icon: 'Plane' },
  '/app/tableau-de-bord/taches': { title: 'Notes perso', icon: 'ClipboardList' },
  '/stats': { title: 'Statistiques', icon: 'BarChart' },
  '/app/tableau-de-bord/incidents': { title: 'Incidents', icon: 'AlertCircle' },
  '/ai-planning': { title: 'IA Planning', icon: 'Brain' },
  '/app/parametres': { title: 'Paramètres', icon: 'Settings' },
}

/**
 * Routes à exclure du tracking
 */
const EXCLUDED_ROUTES = [
  '/auth',
  '/api',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
]

/**
 * Récupère les infos de page pour un pathname
 */
function getPageInfo(pathname: string): { title: string; icon: string } | null {
  // Vérifier si la route est exclue
  if (EXCLUDED_ROUTES.some((route) => pathname.startsWith(route))) {
    return null
  }

  // Chercher dans le mapping direct
  if (ROUTE_INFO_MAP[pathname]) {
    return ROUTE_INFO_MAP[pathname]
  }

  // Chercher dans navigationItems
  const navItem = navigationItems.find((item) => item.href === pathname)
  if (navItem) {
    return {
      title: navItem.label,
      icon: navItem.icon.name || 'FileText',
    }
  }

  // Route dynamique - extraire un titre du pathname
  // Ex: /app/dashboard/employees/123 -> "Détail employé"
  const segments = pathname.split('/').filter(Boolean)

  // Vérifier si c'est une page de détail (dernier segment est un ID)
  const lastSegment = segments[segments.length - 1]
  if (!lastSegment) {
    return null
  }

  const isDetailPage =
    /^[a-f0-9-]+$/i.test(lastSegment) || /^\d+$/.test(lastSegment)

  if (isDetailPage && segments.length >= 2) {
    const parentSegment = segments[segments.length - 2]
    if (!parentSegment) {
      return null
    }

    const parentPath = '/' + segments.slice(0, -1).join('/')

    // Chercher le parent dans le mapping
    const parentInfo = ROUTE_INFO_MAP[parentPath]
    if (parentInfo) {
      return {
        title: `Détail - ${parentInfo.title}`,
        icon: parentInfo.icon,
      }
    }

    // Sinon, capitaliser le segment parent
    const capitalizedParent =
      parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)
    return {
      title: `Détail - ${capitalizedParent}`,
      icon: 'FileText',
    }
  }

  // Page inconnue - ne pas tracker
  return null
}

/**
 * Props du composant PageTracker
 */
export interface PageTrackerProps {
  /** Désactiver le tracking (pour les tests) */
  disabled?: boolean
}

/**
 * Composant invisible qui track les pages visitées
 *
 * @example
 * ```tsx
 * <PageTracker />
 * ```
 */
export function PageTracker({ disabled = false }: PageTrackerProps) {
  const pathname = usePathname()
  const { addPage } = useRecentPages()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // Ne pas tracker si désactivé
    if (disabled) {
      return
    }

    // Ne pas tracker si c'est le même path
    if (pathname === lastTrackedPath.current) {
      return
    }

    // Récupérer les infos de la page
    const pageInfo = getPageInfo(pathname)

    // Ne pas tracker si pas d'infos (route exclue ou inconnue)
    if (!pageInfo) {
      return
    }

    // Enregistrer la page
    addPage({
      path: pathname,
      title: pageInfo.title,
      icon: pageInfo.icon,
    })

    // Mémoriser le dernier path tracké
    lastTrackedPath.current = pathname
  }, [pathname, addPage, disabled])

  // Composant invisible
  return null
}

export default PageTracker
