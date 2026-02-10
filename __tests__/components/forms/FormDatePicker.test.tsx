/**
 * Tests unitaires pour FormDatePicker
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormDatePicker } from '@/components/forms/FormDatePicker'

// ============================================================================
// Tests
// ============================================================================

describe('FormDatePicker', () => {
  describe('Affichage de base', () => {
    it('affiche le placeholder par defaut', () => {
      render(<FormDatePicker />)
      expect(
        screen.getByText('Sélectionner une date')
      ).toBeInTheDocument()
    })

    it('affiche un placeholder personnalise', () => {
      render(<FormDatePicker placeholder="Choisir la date" />)
      expect(screen.getByText('Choisir la date')).toBeInTheDocument()
    })

    it('affiche le label quand fourni', () => {
      render(<FormDatePicker label="Date de debut" />)
      expect(screen.getByText('Date de debut')).toBeInTheDocument()
    })

    it('affiche l erreur quand fournie', () => {
      render(<FormDatePicker label="Date" error="Date invalide" />)
      expect(screen.getByText('Date invalide')).toBeInTheDocument()
    })

    it('affiche le helpText quand fourni', () => {
      render(<FormDatePicker label="Date" helpText="Format JJ/MM/AAAA" />)
      expect(screen.getByText('Format JJ/MM/AAAA')).toBeInTheDocument()
    })

    it('affiche la date selectionnee formatee', () => {
      render(<FormDatePicker value={new Date('2026-03-15')} />)
      expect(screen.getByText(/15 mars 2026/)).toBeInTheDocument()
    })

    it('affiche l icone calendrier', () => {
      const { container } = render(<FormDatePicker />)
      const icon = container.querySelector('.lucide-calendar')
      expect(icon).toBeTruthy()
    })
  })

  describe('Ouverture/Fermeture du popover', () => {
    it('n affiche pas le calendrier par defaut', () => {
      render(<FormDatePicker />)
      expect(
        screen.queryByRole('dialog', { name: 'Sélecteur de date' })
      ).not.toBeInTheDocument()
    })

    it('ouvre le calendrier au clic', async () => {
      const user = userEvent.setup()
      render(<FormDatePicker />)

      await user.click(screen.getByText('Sélectionner une date'))

      expect(
        screen.getByRole('dialog', { name: 'Sélecteur de date' })
      ).toBeInTheDocument()
    })

    it('ferme le calendrier au 2eme clic', async () => {
      const user = userEvent.setup()
      render(<FormDatePicker />)

      const button = screen.getByText('Sélectionner une date').closest('button')!
      await user.click(button)
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(button)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Etat disabled', () => {
    it('ne s ouvre pas quand disabled', async () => {
      const user = userEvent.setup()
      render(<FormDatePicker disabled />)

      const button = screen.getByText('Sélectionner une date').closest('button')!
      await user.click(button)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('le bouton a l attribut disabled', () => {
      render(<FormDatePicker disabled />)
      const button = screen.getByText('Sélectionner une date').closest('button')!
      expect(button).toBeDisabled()
    })
  })

  describe('Accessibilite', () => {
    it('a aria-haspopup dialog', () => {
      render(<FormDatePicker />)
      const button = screen.getByText('Sélectionner une date').closest('button')!
      expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    })

    it('a aria-expanded false par defaut', () => {
      render(<FormDatePicker />)
      const button = screen.getByText('Sélectionner une date').closest('button')!
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('a aria-expanded true quand ouvert', async () => {
      const user = userEvent.setup()
      render(<FormDatePicker />)

      const button = screen.getByText('Sélectionner une date').closest('button')!
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Callback onChange', () => {
    it('appelle onChange quand une date est selectionnee', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(
        <FormDatePicker
          value={new Date('2026-01-15')}
          onChange={onChange}
        />
      )

      // Ouvrir le calendrier
      const button = screen.getByText(/15 janvier 2026/).closest('button')!
      await user.click(button)

      // Cliquer sur un jour (ex: 20)
      const day20 = screen.getByText('20')
      await user.click(day20)

      expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    })

    it('ferme le popover apres selection', async () => {
      const user = userEvent.setup()
      render(
        <FormDatePicker
          value={new Date('2026-01-15')}
          onChange={vi.fn()}
        />
      )

      const button = screen.getByText(/15 janvier 2026/).closest('button')!
      await user.click(button)
      await user.click(screen.getByText('20'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Fermeture au clic exterieur', () => {
    it('ferme le popover au clic en dehors', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <FormDatePicker />
          <button data-testid="outside">Dehors</button>
        </div>
      )

      // Ouvrir
      await user.click(screen.getByText('Sélectionner une date'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Clic en dehors
      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Sans label', () => {
    it('rend sans FormField wrapper quand pas de label', () => {
      const { container } = render(<FormDatePicker />)
      // Pas de FormField label
      expect(container.querySelector('label')).toBeNull()
    })
  })

  describe('Indicateur required', () => {
    it('affiche l asterisque quand required et label', () => {
      render(<FormDatePicker label="Date" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })
})
