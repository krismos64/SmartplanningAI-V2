/**
 * CommandPalette Component
 *
 * Command menu (⌘K) inspiré de Linear/Notion/Raycast.
 * Permet la navigation rapide, les actions et le changement de thème.
 *
 * @see SP-264 - Dashboard Layout V2
 * @see SP-264 Phase 4 - Recent Pages
 * @see Context7 (cmdk documentation)
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   userRole="DIRECTOR"
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useTheme } from 'next-themes'
import { Clock, type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import {
  motion,
  FramerAnimatePresence as AnimatePresence,
  fadeVariants,
  scaleVariants,
} from '@/lib/animations'
import { cn } from '@/lib/utils'
import {
  type UserRole,
  type NavigationItem,
  type ActionItem,
  getNavigationItemsByRole,
  getActionItemsByRole,
  themeItems,
  helpItems,
} from '@/lib/navigation/menu-items'
import { useRecentPages, type RecentPage } from '@/hooks/use-recent-pages'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'

export interface CommandPaletteProps {
  /** État ouvert/fermé */
  open: boolean
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void
  /** Rôle de l'utilisateur pour le filtrage RBAC */
  userRole: UserRole
  /** Callback pour ouvrir la modal de raccourcis clavier (SP-264 Phase 3) */
  onShowShortcuts?: () => void
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Récupère l'icône Lucide par son nom
 */
function getIconByName(iconName: string): LucideIcon {
  // Cast explicite pour accéder aux icônes par nom
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[iconName] || Clock
}

export function CommandPalette({
  open,
  onOpenChange,
  userRole,
  onShowShortcuts,
  className,
}: CommandPaletteProps) {
  const router = useRouter()
  const { setTheme, theme: currentTheme } = useTheme()
  const [search, setSearch] = React.useState('')

  // Hook pour les pages récentes (SP-264 Phase 4)
  const { recentPages, isLoading: recentPagesLoading } = useRecentPages()

  // Filtrer les items selon le rôle
  const navigationItems = React.useMemo(
    () => getNavigationItemsByRole(userRole),
    [userRole]
  )

  const actionItems = React.useMemo(
    () => getActionItemsByRole(userRole),
    [userRole]
  )

  // Reset search on close
  React.useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  // Handlers
  const handleNavigate = React.useCallback(
    (item: NavigationItem) => {
      router.push(item.href)
      onOpenChange(false)
    },
    [router, onOpenChange]
  )

  // Handler pour les pages récentes (SP-264 Phase 4)
  const handleRecentPageNavigate = React.useCallback(
    (page: RecentPage) => {
      router.push(page.path)
      onOpenChange(false)
    },
    [router, onOpenChange]
  )

  const handleAction = React.useCallback(
    (item: ActionItem) => {
      switch (item.action) {
        case 'create-planning':
          router.push('/schedules/new')
          break
        case 'add-employee':
          router.push('/app/dashboard/employees/new')
          break
        case 'create-team':
          router.push('/app/director/teams/new')
          break
        default:
          // Action non gérée - ignorer silencieusement
          break
      }
      onOpenChange(false)
    },
    [router, onOpenChange]
  )

  const handleThemeChange = React.useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      setTheme(theme)
      onOpenChange(false)
    },
    [setTheme, onOpenChange]
  )

  const handleHelp = React.useCallback(
    (action: string, onShowShortcuts?: () => void) => {
      switch (action) {
        case 'show-shortcuts':
          // SP-264 Phase 3 - Ouvrir la modal de raccourcis
          onShowShortcuts?.()
          break
        case 'open-docs':
          window.open('/docs', '_blank')
          break
        case 'open-help':
          window.open('/help', '_blank')
          break
      }
      onOpenChange(false)
    },
    [onOpenChange]
  )

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="command-palette-overlay"
            data-testid="command-palette-overlay"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Dialog container */}
          <motion.div
            key="command-palette-dialog"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                'w-full max-w-[640px] overflow-hidden rounded-xl',
                'border border-border bg-popover shadow-2xl',
                'mx-4',
                className
              )}
            >
              <Command
                className="flex flex-col"
                label="Command Palette"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onOpenChange(false)
                  }
                }}
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-border px-4">
                  <SearchIcon className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Rechercher ou exécuter une commande..."
                    className={cn(
                      'flex h-14 w-full bg-transparent py-4 text-sm',
                      'placeholder:text-muted-foreground',
                      'outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                    autoFocus
                  />
                  <kbd className="hidden rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
                    ESC
                  </kbd>
                </div>

                {/* Command List */}
                <Command.List
                  className="max-h-[400px] overflow-y-auto p-2"
                  style={
                    {
                      '--cmdk-list-height': 'auto',
                    } as React.CSSProperties
                  }
                >
                  <Command.Empty className="flex h-16 items-center justify-center text-sm text-muted-foreground">
                    Aucun résultat trouvé.
                  </Command.Empty>

                  {/* Recent Pages Group (SP-264 Phase 4) */}
                  {!recentPagesLoading && recentPages.length > 0 && (
                    <Command.Group
                      heading={
                        <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Pages récentes
                        </span>
                      }
                    >
                      {recentPages.map((page) => {
                        const IconComponent = page.icon
                          ? getIconByName(page.icon)
                          : Clock
                        return (
                          <CommandItem
                            key={page.path}
                            onSelect={() => handleRecentPageNavigate(page)}
                            keywords={[
                              page.title,
                              'récent',
                              'recent',
                              'visité',
                            ]}
                          >
                            <IconComponent className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">{page.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(page.visitedAt)}
                            </span>
                          </CommandItem>
                        )
                      })}
                    </Command.Group>
                  )}

                  {/* Navigation Group */}
                  {navigationItems.length > 0 && (
                    <Command.Group
                      heading={
                        <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Navigation
                        </span>
                      }
                    >
                      {navigationItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleNavigate(item)}
                          keywords={item.keywords}
                        >
                          <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut && (
                            <ShortcutBadge shortcut={item.shortcut} />
                          )}
                        </CommandItem>
                      ))}
                    </Command.Group>
                  )}

                  {/* Actions Group */}
                  {actionItems.length > 0 && (
                    <Command.Group
                      heading={
                        <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions rapides
                        </span>
                      }
                    >
                      {actionItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleAction(item)}
                          keywords={item.keywords}
                        >
                          <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{item.label}</span>
                        </CommandItem>
                      ))}
                    </Command.Group>
                  )}

                  {/* Theme Group */}
                  <Command.Group
                    heading={
                      <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Thème
                      </span>
                    }
                  >
                    {themeItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleThemeChange(item.theme)}
                        keywords={item.keywords}
                      >
                        <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{item.label}</span>
                        {currentTheme === item.theme && (
                          <CheckIcon className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </Command.Group>

                  {/* Help Group */}
                  <Command.Group
                    heading={
                      <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Aide
                      </span>
                    }
                  >
                    {helpItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() =>
                          handleHelp(item.action, onShowShortcuts)
                        }
                        keywords={item.keywords}
                      >
                        <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{item.label}</span>
                      </CommandItem>
                    ))}
                  </Command.Group>
                </Command.List>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-4 py-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">
                        ↑
                      </kbd>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">
                        ↓
                      </kbd>
                      <span>naviguer</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">
                        ↵
                      </kbd>
                      <span>sélectionner</span>
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    SmartPlanning
                  </span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Command Item wrapper avec styles
 */
interface CommandItemProps {
  children: React.ReactNode
  onSelect: () => void
  keywords?: string[]
}

function CommandItem({ children, onSelect, keywords }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className={cn(
        'flex cursor-pointer items-center rounded-lg px-3 py-2.5',
        'text-sm text-foreground',
        'transition-colors duration-100',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'outline-none'
      )}
    >
      {children}
    </Command.Item>
  )
}

/**
 * Badge pour afficher un raccourci
 */
function ShortcutBadge({ shortcut }: { shortcut: string }) {
  const keys = shortcut.split(' ')

  return (
    <span className="flex items-center gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

/**
 * Search Icon
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/**
 * Check Icon
 */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default CommandPalette
