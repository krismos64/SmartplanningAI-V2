'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getNavigationItemsByRole,
  getRoleLabel,
  type UserRole,
} from '@/lib/navigation/menu-items'
import { MessagesBadge } from '@/components/messaging/MessagesBadge'

/**
 * Variantes de style pour la sidebar
 * - neon: Style néon bleu/violet par défaut (original)
 * - gradient-glass: Glassmorphism avec dégradé sophistiqué
 * - aurora: Aurores boréales animées (vert/cyan/violet)
 * - cosmic: Effet cosmique 3D avec étoiles et nébuleuses
 */
export type SidebarVariant = 'neon' | 'gradient-glass' | 'aurora' | 'cosmic'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: UserRole
    organizationId?: string
    companyName?: string
  }
  /** Variante de style de la sidebar (défaut: 'neon') */
  variant?: SidebarVariant
}

/**
 * Mapping des variantes vers les classes CSS
 */
const variantClasses: Record<SidebarVariant, string> = {
  neon: 'sidebar-neon',
  'gradient-glass': 'sidebar-gradient-glass',
  aurora: 'sidebar-aurora',
  cosmic: 'sidebar-cosmic',
}

export function Sidebar({ user, variant = 'neon' }: SidebarProps) {
  const pathname = usePathname()
  const filteredMenuItems = getNavigationItemsByRole(user.role)
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sidebarClassName = variantClasses[variant]

  return (
    <SidebarPrimitive className={sidebarClassName}>
      {/* Header */}
      <SidebarHeader className="border-b border-white/[0.06] p-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col"
        >
          <span className="sidebar-neon-title text-lg">
            {user.companyName || 'SmartPlanning'}
          </span>
          <span className="text-xs text-slate-400">
            {getRoleLabel(user.role)}
          </span>
        </motion.div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredMenuItems.map((item, index) => {
            const Icon = item.icon
            // Correspondance exacte pour les pages racines (dashboard, admin/dashboard)
            // qui sont préfixes d'autres routes
            const exactMatchPaths = ['/app/dashboard', '/app/admin/dashboard']
            const isActive = exactMatchPaths.includes(item.href)
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>
                    <div
                      className="sidebar-nav-item w-full"
                      data-active={isActive}
                    >
                      <motion.div
                        className="sidebar-nav-icon"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <motion.span
                        className="flex flex-1 items-center justify-between text-sm font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.label}
                        {item.id === 'messages' && <MessagesBadge />}
                      </motion.span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Avatar className="sp-avatar-neon h-8 w-8 rounded-full">
            <AvatarFallback className="bg-transparent text-xs text-blue-300">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden"
          >
            <span className="truncate text-sm font-medium text-slate-200">
              {user.name}
            </span>
            <span className="truncate text-xs text-slate-400">
              {user.email}
            </span>
          </motion.div>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}
