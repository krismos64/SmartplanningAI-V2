/**
 * Tests du Header : sous-titre utilisateur
 *
 * Le poste renseigné dans le profil prime sur le libellé de rôle : un
 * directeur qui se déclare « PDG » doit voir « PDG », pas « Directeur ».
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Header } from '../Header'

vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}))

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}))

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ toggleSidebar: vi.fn() }),
}))

vi.mock('@/components/providers/command-palette-provider', () => ({
  useCommandPalette: () => ({ setOpen: vi.fn() }),
}))

vi.mock('@/components/notifications', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AvatarFallback: ({ children }: React.PropsWithChildren) => (
    <span>{children}</span>
  ),
  AvatarImage: (props: { src?: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img data-testid="header-avatar-image" {...props} />
  ),
}))

const defaultUser = {
  name: 'Jean Dupont',
  email: 'jean@test.com',
  role: 'DIRECTOR' as const,
  companyName: 'Test Company',
}

describe('Header : sous-titre utilisateur', () => {
  it('affiche le poste quand il est renseigné', () => {
    render(<Header user={{ ...defaultUser, jobTitle: 'PDG' }} />)

    expect(screen.getByTestId('header-user-subtitle')).toHaveTextContent('PDG')
  })

  it('retombe sur le libellé de rôle sans poste renseigné', () => {
    render(<Header user={defaultUser} />)

    expect(screen.getByTestId('header-user-subtitle')).toHaveTextContent(
      'Directeur'
    )
  })

  it('ignore un poste composé uniquement d’espaces', () => {
    render(<Header user={{ ...defaultUser, jobTitle: '  ' }} />)

    expect(screen.getByTestId('header-user-subtitle')).toHaveTextContent(
      'Directeur'
    )
  })

  it("affiche la photo de profil quand l'utilisateur en a une", () => {
    render(
      <Header user={{ ...defaultUser, image: 'https://cdn.test/a.jpg' }} />
    )

    expect(screen.getByTestId('header-avatar-image')).toHaveAttribute(
      'src',
      'https://cdn.test/a.jpg'
    )
  })
})
