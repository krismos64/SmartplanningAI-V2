/**
 * Tests unitaires pour OnboardingChecklist
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingChecklist } from '../OnboardingChecklist'

describe('OnboardingChecklist', () => {
  it('renders nothing when all steps are done', () => {
    const { container } = render(
      <OnboardingChecklist hasTeam hasEmployee hasSchedule hasCompleteProfile />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows progress count when steps remain', () => {
    render(
      <OnboardingChecklist
        hasTeam={false}
        hasEmployee={false}
        hasSchedule={false}
        hasCompleteProfile={false}
      />
    )

    expect(screen.getByText('0/4 étapes complétées')).toBeInTheDocument()
  })

  it('marks completed steps and counts progress correctly', () => {
    render(
      <OnboardingChecklist
        hasTeam
        hasEmployee
        hasSchedule={false}
        hasCompleteProfile={false}
      />
    )

    expect(screen.getByText('2/4 étapes complétées')).toBeInTheDocument()
    expect(screen.getByText('Créer votre premier planning')).toBeInTheDocument()
  })

  /**
   * L'équipe doit rester la première étape : le formulaire de création
   * d'employé propose d'affecter une équipe, impossible tant qu'aucune
   * n'existe. Inverser cet ordre remettrait le directeur dans l'impasse.
   */
  it('proposes team creation as the first step', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingChecklist
        hasTeam={false}
        hasEmployee={false}
        hasSchedule={false}
        hasCompleteProfile={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Réduire' }))

    expect(
      screen.getByText(/Prochaine étape : Créer votre première équipe/)
    ).toBeInTheDocument()
  })

  it('offers a profile completion step linking to the profile page', () => {
    render(
      <OnboardingChecklist
        hasTeam
        hasEmployee
        hasSchedule
        hasCompleteProfile={false}
      />
    )

    expect(screen.getByText('Compléter votre profil')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Compléter' })).toHaveAttribute(
      'href',
      '/app/profile'
    )
  })
})
