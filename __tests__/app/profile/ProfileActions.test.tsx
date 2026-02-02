/**
 * Tests unitaires pour ProfileActions
 *
 * @ticket SP-270
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProfileActions } from '@/app/app/profile/_components/ProfileActions'

describe('ProfileActions', () => {
  it('should render card title', () => {
    render(<ProfileActions />)
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should render edit profile button with correct link', () => {
    render(<ProfileActions />)
    const button = screen.getByTestId('action-edit-profile')
    expect(button).toHaveTextContent('Modifier mon profil')
    expect(button).toHaveAttribute('href', '/app/profile/edit')
  })

  it('should render change password button with correct link', () => {
    render(<ProfileActions />)
    const button = screen.getByTestId('action-change-password')
    expect(button).toHaveTextContent('Changer mon mot de passe')
    expect(button).toHaveAttribute('href', '/app/profile/password')
  })

  it('should render export data button with correct link', () => {
    render(<ProfileActions />)
    const button = screen.getByTestId('action-export-data')
    expect(button).toHaveTextContent('Exporter mes données')
    expect(button).toHaveAttribute('href', '/app/profile/export')
  })

  it('should render delete account button with correct link', () => {
    render(<ProfileActions />)
    const button = screen.getByTestId('action-delete-account')
    expect(button).toHaveTextContent('Supprimer mon compte')
    expect(button).toHaveAttribute('href', '/app/profile/delete')
  })

  it('should have glass and hover-lift classes on card', () => {
    const { container } = render(<ProfileActions />)
    const card = container.firstChild
    expect(card).toHaveClass('glass')
    expect(card).toHaveClass('hover-lift')
  })

  it('should render all four action buttons', () => {
    render(<ProfileActions />)
    expect(screen.getByTestId('action-edit-profile')).toBeInTheDocument()
    expect(screen.getByTestId('action-change-password')).toBeInTheDocument()
    expect(screen.getByTestId('action-export-data')).toBeInTheDocument()
    expect(screen.getByTestId('action-delete-account')).toBeInTheDocument()
  })

  it('should have destructive text color on delete button', () => {
    render(<ProfileActions />)
    const deleteButton = screen.getByTestId('action-delete-account')
    expect(deleteButton).toHaveClass('text-destructive')
  })
})
