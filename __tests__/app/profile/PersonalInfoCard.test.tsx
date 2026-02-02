/**
 * Tests unitaires pour PersonalInfoCard
 *
 * @ticket SP-270
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PersonalInfoCard } from '@/app/app/profile/_components/PersonalInfoCard'

describe('PersonalInfoCard', () => {
  it('should render email', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone={null}
        firstName={undefined}
        lastName={undefined}
      />
    )
    expect(screen.getByTestId('personal-email')).toHaveTextContent(
      'jean@test.com'
    )
  })

  it('should render full name when provided', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone="0612345678"
        firstName="Jean"
        lastName="Dupont"
      />
    )
    expect(screen.getByTestId('personal-fullname')).toHaveTextContent(
      'Jean Dupont'
    )
  })

  it('should not render full name section when firstName is missing', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone="0612345678"
        firstName={undefined}
        lastName="Dupont"
      />
    )
    expect(screen.queryByTestId('personal-fullname')).not.toBeInTheDocument()
  })

  it('should not render full name section when lastName is missing', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone="0612345678"
        firstName="Jean"
        lastName={undefined}
      />
    )
    expect(screen.queryByTestId('personal-fullname')).not.toBeInTheDocument()
  })

  it('should display "Non renseigné" for null phone', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone={null}
        firstName="Jean"
        lastName="Dupont"
      />
    )
    expect(screen.getByTestId('personal-phone')).toHaveTextContent(
      'Non renseigné'
    )
  })

  it('should display "Non renseigné" for undefined phone', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone={undefined}
        firstName="Jean"
        lastName="Dupont"
      />
    )
    expect(screen.getByTestId('personal-phone')).toHaveTextContent(
      'Non renseigné'
    )
  })

  it('should render phone number when provided', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone="0612345678"
        firstName="Jean"
        lastName="Dupont"
      />
    )
    expect(screen.getByTestId('personal-phone')).toHaveTextContent('0612345678')
  })

  it('should render card title with User icon', () => {
    render(
      <PersonalInfoCard
        email="jean@test.com"
        phone={null}
        firstName={undefined}
        lastName={undefined}
      />
    )
    expect(screen.getByText('Informations personnelles')).toBeInTheDocument()
  })

  it('should have hover-lift and glass classes', () => {
    const { container } = render(
      <PersonalInfoCard
        email="jean@test.com"
        phone={null}
        firstName={undefined}
        lastName={undefined}
      />
    )
    const card = container.firstChild
    expect(card).toHaveClass('glass')
    expect(card).toHaveClass('hover-lift')
  })
})
