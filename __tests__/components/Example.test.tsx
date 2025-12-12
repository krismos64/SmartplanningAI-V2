/**
 * Test exemple pour valider le setup Vitest + React Testing Library
 *
 * Ce test vérifie que l'environnement de test est correctement configuré :
 * - Vitest fonctionne
 * - jsdom est disponible (DOM virtuel)
 * - React Testing Library render fonctionne
 * - jest-dom matchers sont disponibles (.toBeInTheDocument())
 *
 * @ticket SP-130
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Test setup validation', () => {
  it('should render a simple component', () => {
    render(<div data-testid="test">Hello Tests</div>)
    expect(screen.getByTestId('test')).toHaveTextContent('Hello Tests')
  })

  it('should find elements by role', () => {
    render(
      <button type="button" aria-label="Test button">
        Click me
      </button>
    )
    expect(
      screen.getByRole('button', { name: /test button/i })
    ).toBeInTheDocument()
  })

  it('should support jest-dom matchers', () => {
    render(
      <div>
        <span className="visible">Visible</span>
        <span className="hidden" hidden>
          Hidden
        </span>
      </div>
    )

    expect(screen.getByText('Visible')).toBeVisible()
    expect(screen.queryByText('Hidden')).not.toBeVisible()
  })
})
