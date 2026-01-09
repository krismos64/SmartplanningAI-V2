'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getNavigationForRole,
  type NavItem,
  type NavSection,
} from '@/config/navigation'
import { ROLE_LABELS } from '@/lib/permissions'

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: UserRole
    organizationId?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const sections = getNavigationForRole(user.role)
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarPrimitive className="border-r">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-lg font-semibold">SmartPlanning</span>
              <span className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={isCollapsed ? 'mx-auto' : ''}
            aria-label={isCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4">
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-4">
        <div
          className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </motion.div>
          )}
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}

interface SidebarSectionProps {
  section: NavSection
  pathname: string
  isCollapsed: boolean
}

function SidebarSection({
  section,
  pathname,
  isCollapsed,
}: SidebarSectionProps) {
  return (
    <SidebarGroup>
      {section.title && !isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {section.title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item, index) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              index={index}
              pathname={pathname}
              isCollapsed={isCollapsed}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

interface SidebarNavItemProps {
  item: NavItem
  index: number
  pathname: string
  isCollapsed: boolean
}

function SidebarNavItem({
  item,
  index,
  pathname,
  isCollapsed,
}: SidebarNavItemProps) {
  const Icon = item.icon
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`)

  const menuButton = (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          <motion.div
            className="flex w-full items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
            {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </motion.div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  // Show tooltip only when collapsed
  if (isCollapsed) {
    return (
      <TooltipProvider key={item.id} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{item.label}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return menuButton
}
