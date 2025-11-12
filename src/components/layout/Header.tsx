'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Menu, Bell, LogOut, User, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/components/ui/sidebar'

// Dynamic import du composant Lottie pour éviter les erreurs SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type UserRole = 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar?: string
    role: UserRole
  }
  notificationsCount?: number
}

export function Header({ user, notificationsCount = 0 }: HeaderProps) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const [animationData, setAnimationData] = useState<any>(null)

  // Charger l'animation Lottie côté client uniquement
  useEffect(() => {
    fetch('/animations/planning-animation.json')
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data)
      })
      .catch((err) => console.error('Failed to load Lottie animation:', err))
  }, [])

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    // TODO: Implémenter la logique de déconnexion (next-auth signOut)
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Burger + Logo */}
        <div className="flex items-center gap-4">
          {/* Burger menu pour mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo + Animation Lottie */}
          <Link href="/dashboard" className="flex items-center gap-2">
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

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {notificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                >
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
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
                onClick={handleLogout}
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
    case 'SUPER_ADMIN':
      return 'Super Admin'
    case 'DIRECTOR':
      return 'Directeur'
    case 'MANAGER':
      return 'Manager'
    case 'EMPLOYEE':
      return 'Employé'
  }
}
