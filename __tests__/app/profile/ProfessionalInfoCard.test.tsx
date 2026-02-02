/**
 * Tests unitaires pour ProfessionalInfoCard
 *
 * @ticket SP-270
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProfessionalInfoCard } from '@/app/app/profile/_components/ProfessionalInfoCard'

describe('ProfessionalInfoCard', () => {
  const defaultProps = {
    jobTitle: 'Développeur Full-Stack',
    department: 'Informatique',
    team: { id: 'team-1', name: 'Équipe Dev' },
    hireDate: new Date('2020-03-15T00:00:00Z'),
    weeklyHours: 35,
  }

  it('should render job title', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(screen.getByTestId('pro-jobtitle')).toHaveTextContent(
      'Développeur Full-Stack'
    )
  })

  it('should render department', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(screen.getByTestId('pro-department')).toHaveTextContent(
      'Informatique'
    )
  })

  it('should render team name', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(screen.getByTestId('pro-team')).toHaveTextContent('Équipe Dev')
  })

  it('should render hire date in French format', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(screen.getByTestId('pro-hiredate')).toHaveTextContent('15 mars 2020')
  })

  it('should render weekly hours', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(screen.getByTestId('pro-hours')).toHaveTextContent('35h')
  })

  it('should display "Non renseigné" for null job title', () => {
    render(<ProfessionalInfoCard {...defaultProps} jobTitle={null} />)
    expect(screen.getByTestId('pro-jobtitle')).toHaveTextContent('Non renseigné')
  })

  it('should display "Non renseigné" for null department', () => {
    render(<ProfessionalInfoCard {...defaultProps} department={null} />)
    expect(screen.getByTestId('pro-department')).toHaveTextContent(
      'Non renseigné'
    )
  })

  it('should display "Aucune équipe" for null team', () => {
    render(<ProfessionalInfoCard {...defaultProps} team={null} />)
    expect(screen.getByTestId('pro-team')).toHaveTextContent('Aucune équipe')
  })

  it('should display "Non renseignée" for null hire date', () => {
    render(<ProfessionalInfoCard {...defaultProps} hireDate={null} />)
    expect(screen.getByTestId('pro-hiredate')).toHaveTextContent(
      'Non renseignée'
    )
  })

  it('should render card title', () => {
    render(<ProfessionalInfoCard {...defaultProps} />)
    expect(
      screen.getByText('Informations professionnelles')
    ).toBeInTheDocument()
  })

  it('should render different weekly hours values', () => {
    render(<ProfessionalInfoCard {...defaultProps} weeklyHours={39} />)
    expect(screen.getByTestId('pro-hours')).toHaveTextContent('39h')
  })

  it('should handle partial hours', () => {
    render(<ProfessionalInfoCard {...defaultProps} weeklyHours={28.5} />)
    expect(screen.getByTestId('pro-hours')).toHaveTextContent('28.5h')
  })
})
