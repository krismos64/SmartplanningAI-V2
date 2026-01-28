/**
 * Tests pour le Sidebar - Lien Congés
 *
 * @ticket SP-413
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Sidebar } from '../Sidebar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/app/dashboard'),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    span: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
  },
}))

// Mock sidebar primitives
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: React.PropsWithChildren) => (
    <aside data-testid="sidebar">{children}</aside>
  ),
  SidebarContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarMenu: ({ children }: React.PropsWithChildren) => (
    <nav data-testid="sidebar-menu">{children}</nav>
  ),
  SidebarMenuButton: ({
    children,
    asChild,
    ...props
  }: React.PropsWithChildren<{ asChild?: boolean }>) => (
    <div data-testid="sidebar-menu-button" {...props}>
      {children}
    </div>
  ),
  SidebarMenuItem: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  useSidebar: () => ({
    state: 'expanded',
    toggleSidebar: vi.fn(),
  }),
}))

// Mock tooltips
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  TooltipProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock button
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

// Mock avatar
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AvatarFallback: ({ children }: React.PropsWithChildren) => (
    <span>{children}</span>
  ),
}))

const defaultUser = {
  name: 'Jean Dupont',
  email: 'jean@test.com',
  role: 'EMPLOYEE' as const,
  companyName: 'Test Company',
}

describe('Sidebar - Leaves Link', () => {
  it('shows Congés link for EMPLOYEE role', () => {
    render(<Sidebar user={defaultUser} />)

    expect(screen.getByText('Congés')).toBeInTheDocument()
  })

  it('shows Congés link for MANAGER role', () => {
    render(<Sidebar user={{ ...defaultUser, role: 'MANAGER' }} />)

    expect(screen.getByText('Congés')).toBeInTheDocument()
  })

  it('shows Congés link for DIRECTOR role', () => {
    render(<Sidebar user={{ ...defaultUser, role: 'DIRECTOR' }} />)

    expect(screen.getByText('Congés')).toBeInTheDocument()
  })

  it('has correct href /app/dashboard/leaves', () => {
    render(<Sidebar user={defaultUser} />)

    const leavesLink = screen.getByText('Congés').closest('a')
    expect(leavesLink).toHaveAttribute('href', '/app/dashboard/leaves')
  })

  it('does not show Congés link for SYSTEM_ADMIN role', () => {
    render(<Sidebar user={{ ...defaultUser, role: 'SYSTEM_ADMIN' }} />)

    expect(screen.queryByText('Congés')).not.toBeInTheDocument()
  })
})
