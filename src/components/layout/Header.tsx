'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { signOut } from 'next-auth/react'
import { Menu, LogOut, User, Settings, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/components/ui/sidebar'
import { useCommandPalette } from '@/components/providers/command-palette-provider'
import { NotificationBell } from '@/components/notifications'

// Dynamic import du composant Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar?: string
    image?: string | null
    role: UserRole
    companyName?: string
  }
}

export function Header({ user }: HeaderProps) {
  const { toggleSidebar } = useSidebar()
  const { setOpen: openCommandPalette } = useCommandPalette()
  // Type object pour les données d'animation Lottie
  const [animationData, setAnimationData] = useState<object | null>(null)

  // Charger l'animation Lottie côté client uniquement
  useEffect(() => {
    fetch('/animations/planning-animation.json')
      .then((res) => res.json() as Promise<object>)
      .then((data: object) => {
        setAnimationData(data)
      })
      .catch((err: unknown) =>
        console.error('Failed to load Lottie animation:', err)
      )
  }, [])

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sp-header sticky top-0 z-40 w-full">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Burger + Logo */}
        <div className="flex items-center gap-4">
          {/* Burger menu pour mobile - WCAG 2.5.5: 44px touch target */}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 min-h-[44px] min-w-[44px] touch-manipulation lg:hidden"
            onClick={toggleSidebar}
            data-testid="burger-menu-button"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo + Animation Lottie */}
          <Link href="/app/dashboard" className="flex items-center gap-2">
            {animationData && (
              <div className="h-10 w-10">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={{ width: 40, height: 40 }}
                />
              </div>
            )}
            <span className="hidden text-lg font-semibold sm:inline-block">
              SmartPlanning
            </span>
          </Link>
        </div>

        {/* Right: Search + Theme toggle + Notifications + User menu */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Button - Command Palette trigger (SP-264) */}
          <Button
            variant="outline"
            onClick={() => openCommandPalette(true)}
            className="hidden h-9 gap-2 border-border/50 bg-muted/50 px-3 text-muted-foreground hover:bg-muted hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Rechercher...</span>
            <kbd className="pointer-events-none ml-2 hidden select-none rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-block">
              ⌘K
            </kbd>
          </Button>

          {/* Search Icon Button for mobile - WCAG 2.5.5: 44px touch target */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openCommandPalette(true)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] touch-manipulation sm:hidden"
            aria-label="Ouvrir la recherche"
            data-testid="mobile-search-button"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle (SP-265) */}
          <ThemeToggle />

          {/* Notifications - SP-322 */}
          <NotificationBell />

          {/* User dropdown menu - WCAG 2.5.5: 44px touch target */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-11 min-h-[44px] items-center gap-2 px-2 touch-manipulation"
                data-testid="user-menu-trigger"
              >
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left lg:flex">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void handleLogout()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'Super Admin'
    case 'DIRECTOR':
      return 'Directeur'
    case 'MANAGER':
      return 'Manager'
    case 'EMPLOYEE':
      return 'Employé'
    default:
      return 'Utilisateur'
  }
}
