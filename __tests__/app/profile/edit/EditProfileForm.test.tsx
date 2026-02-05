/**
 * Tests unitaires pour EditProfileForm
 *
 * @ticket SP-271
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock server actions
vi.mock('@/lib/actions/profile', () => ({
  updateProfile: vi.fn(),
}))

// Mock useCrudMutation
vi.mock('@/hooks/use-crud-mutation', () => ({
  useCrudMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    errorField: null,
    reset: vi.fn(),
  })),
}))

// Import après les mocks
import { EditProfileForm } from '@/app/app/profile/edit/_components/EditProfileForm'
import { useCrudMutation } from '@/hooks/use-crud-mutation'

// ============================================================================
// HELPERS
// ============================================================================

const defaultProps = {
  defaultValues: {
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '0612345678',
    jobTitle: 'Développeur',
    hireDate: new Date('2020-03-15'),
  },
  hasEmployee: true,
}

const systemAdminProps = {
  defaultValues: {
    firstName: 'Admin',
    lastName: 'System',
    phone: '',
    jobTitle: '',
    hireDate: null,
  },
  hasEmployee: false,
}

// ============================================================================
// TESTS
// ============================================================================

// ============================================================================
// MOCKS
// ============================================================================
const mockMutate = vi.fn()
const mockUseCrudMutation = vi.mocked(useCrudMutation)

describe('EditProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCrudMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      errorField: null,
      reset: vi.fn(),
    })
  })

  // ==========================================================================
  // RENDU INITIAL
  // ==========================================================================
  describe('Rendu initial', () => {
    it('should render form with all fields when hasEmployee is true', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByTestId('input-firstName')).toBeInTheDocument()
      expect(screen.getByTestId('input-lastName')).toBeInTheDocument()
      expect(screen.getByTestId('input-phone')).toBeInTheDocument()
      expect(screen.getByTestId('input-jobTitle')).toBeInTheDocument()
      expect(screen.getByTestId('input-hireDate')).toBeInTheDocument()
    })

    it('should render form with default values', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByTestId('input-firstName')).toHaveValue('Jean')
      expect(screen.getByTestId('input-lastName')).toHaveValue('Dupont')
      expect(screen.getByTestId('input-phone')).toHaveValue('0612345678')
    })

    it('should render title "Modifier mon profil"', () => {
      render(<EditProfileForm {...defaultProps} />)
      expect(screen.getByText('Modifier mon profil')).toBeInTheDocument()
    })

    it('should render back link to profile', () => {
      render(<EditProfileForm {...defaultProps} />)
      const backLink = screen.getByTestId('back-to-profile')
      expect(backLink).toHaveAttribute('href', '/app/profile')
    })

    it('should render cancel button linking to profile', () => {
      render(<EditProfileForm {...defaultProps} />)
      const cancelButton = screen.getByTestId('cancel-button')
      expect(cancelButton).toHaveAttribute('href', '/app/profile')
    })

    it('should render submit button', () => {
      render(<EditProfileForm {...defaultProps} />)
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
      expect(screen.getByText('Enregistrer')).toBeInTheDocument()
    })

    it('should have glass class on card', () => {
      render(<EditProfileForm {...defaultProps} />)
      const card = screen.getByTestId('edit-profile-form')
      expect(card).toHaveClass('glass')
    })
  })

  // ==========================================================================
  // GESTION SYSTEM_ADMIN (SANS EMPLOYEE)
  // ==========================================================================
  describe('SYSTEM_ADMIN sans Employee', () => {
    it('should hide employee fields when hasEmployee is false', () => {
      render(<EditProfileForm {...systemAdminProps} />)

      expect(screen.getByTestId('input-firstName')).toBeInTheDocument()
      expect(screen.getByTestId('input-lastName')).toBeInTheDocument()
      expect(screen.queryByTestId('input-phone')).not.toBeInTheDocument()
      expect(screen.queryByTestId('input-jobTitle')).not.toBeInTheDocument()
      expect(screen.queryByTestId('input-hireDate')).not.toBeInTheDocument()
    })

    it('should display system admin notice when hasEmployee is false', () => {
      render(<EditProfileForm {...systemAdminProps} />)

      expect(screen.getByTestId('system-admin-notice')).toBeInTheDocument()
      expect(
        screen.getByText(/En tant qu'administrateur système/)
      ).toBeInTheDocument()
    })

    it('should not display system admin notice when hasEmployee is true', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(screen.queryByTestId('system-admin-notice')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // VALIDATION
  // ==========================================================================
  describe('Validation côté client', () => {
    it('should show error for firstName too short', async () => {
      render(<EditProfileForm {...defaultProps} />)
      const user = userEvent.setup()

      const firstNameInput = screen.getByTestId('input-firstName')
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'J')
      await user.tab() // Trigger onBlur

      await waitFor(() => {
        expect(screen.getByText('Minimum 2 caractères')).toBeInTheDocument()
      })
    })

    it('should show error for lastName empty', async () => {
      render(<EditProfileForm {...defaultProps} />)
      const user = userEvent.setup()

      const lastNameInput = screen.getByTestId('input-lastName')
      await user.clear(lastNameInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText('Minimum 2 caractères')).toBeInTheDocument()
      })
    })

    it('should show error for invalid phone format', async () => {
      render(<EditProfileForm {...defaultProps} />)
      const user = userEvent.setup()

      const phoneInput = screen.getByTestId('input-phone')
      await user.clear(phoneInput)
      await user.type(phoneInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Numéro invalide/)).toBeInTheDocument()
      })
    })

    it('should accept empty phone (optional field)', async () => {
      // Phone vide par défaut
      const propsWithEmptyPhone = {
        ...defaultProps,
        defaultValues: {
          ...defaultProps.defaultValues,
          phone: '',
        },
      }
      render(<EditProfileForm {...propsWithEmptyPhone} />)

      const phoneInput = screen.getByTestId('input-phone')
      expect(phoneInput).toHaveValue('')

      // Pas d'erreur affichée par défaut pour un champ vide optionnel
      const errorPhone = screen.queryByTestId('error-phone')
      if (errorPhone) {
        expect(errorPhone).not.toHaveTextContent('Numéro invalide')
      }
    })
  })

  // ==========================================================================
  // ÉTAT DU FORMULAIRE
  // ==========================================================================
  describe('État du formulaire', () => {
    it('should have submit button disabled when form is not dirty', () => {
      render(<EditProfileForm {...defaultProps} />)
      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when form is modified', async () => {
      render(<EditProfileForm {...defaultProps} />)
      const user = userEvent.setup()

      const firstNameInput = screen.getByTestId('input-firstName')
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Pierre')

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).not.toBeDisabled()
    })
  })

  // ==========================================================================
  // SOUMISSION
  // ==========================================================================
  describe('Soumission du formulaire', () => {
    it('should call mutate with form data on submit', async () => {
      render(<EditProfileForm {...defaultProps} />)
      const user = userEvent.setup()

      // Modifier un champ pour activer le bouton
      const firstNameInput = screen.getByTestId('input-firstName')
      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Pierre')

      // Soumettre
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          firstName: 'Pierre',
          lastName: 'Dupont',
          phone: '0612345678',
          jobTitle: 'Développeur',
          hireDate: defaultProps.defaultValues.hireDate,
        })
      })
    })

    it('should show loading state when submitting', () => {
      mockUseCrudMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        error: null,
        errorField: null,
        reset: vi.fn(),
      })

      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByText('Enregistrement...')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should disable inputs when submitting', () => {
      mockUseCrudMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        error: null,
        errorField: null,
        reset: vi.fn(),
      })

      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByTestId('input-firstName')).toBeDisabled()
      expect(screen.getByTestId('input-lastName')).toBeDisabled()
      expect(screen.getByTestId('input-phone')).toBeDisabled()
    })
  })

  // ==========================================================================
  // ACCESSIBILITÉ
  // ==========================================================================
  describe('Accessibilité', () => {
    it('should have autocomplete attributes on inputs', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByTestId('input-firstName')).toHaveAttribute(
        'autocomplete',
        'given-name'
      )
      expect(screen.getByTestId('input-lastName')).toHaveAttribute(
        'autocomplete',
        'family-name'
      )
      expect(screen.getByTestId('input-phone')).toHaveAttribute(
        'autocomplete',
        'tel'
      )
    })

    it('should have phone input with type tel', () => {
      render(<EditProfileForm {...defaultProps} />)
      expect(screen.getByTestId('input-phone')).toHaveAttribute('type', 'tel')
    })

    it('should have aria-label on back button', () => {
      render(<EditProfileForm {...defaultProps} />)
      const backLink = screen.getByTestId('back-to-profile')
      expect(backLink).toHaveAttribute('aria-label', 'Retour au profil')
    })
  })

  // ==========================================================================
  // LABELS ET DESCRIPTIONS
  // ==========================================================================
  describe('Labels et descriptions', () => {
    it('should display correct labels', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(screen.getByText('Prénom')).toBeInTheDocument()
      expect(screen.getByText('Nom')).toBeInTheDocument()
      expect(screen.getByText('Téléphone')).toBeInTheDocument()
      expect(screen.getByText('Poste')).toBeInTheDocument()
      expect(screen.getByText("Date d'embauche")).toBeInTheDocument()
    })

    it('should display phone format description', () => {
      render(<EditProfileForm {...defaultProps} />)

      expect(
        screen.getByText('Format français : 0612345678 ou +33612345678')
      ).toBeInTheDocument()
    })
  })
})
