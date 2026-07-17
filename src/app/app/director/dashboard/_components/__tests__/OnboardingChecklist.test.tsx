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
      <OnboardingChecklist hasTeam hasEmployee hasSchedule />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows progress count when steps remain', () => {
    render(
      <OnboardingChecklist
        hasTeam={false}
        hasEmployee={false}
        hasSchedule={false}
      />
    )

    expect(screen.getByText('0/3 étapes complétées')).toBeInTheDocument()
  })

  it('marks completed steps and counts progress correctly', () => {
    render(
      <OnboardingChecklist hasTeam hasEmployee hasSchedule={false} />
    )

    expect(screen.getByText('2/3 étapes complétées')).toBeInTheDocument()
    expect(
      screen.getByText('Créer votre premier planning')
    ).toBeInTheDocument()
  })

  it('collapses and shows next step shortcut', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingChecklist
        hasTeam={false}
        hasEmployee={false}
        hasSchedule={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Réduire' }))

    expect(
      screen.getByText(/Prochaine étape : Ajouter votre premier employé/)
    ).toBeInTheDocument()
  })
})
