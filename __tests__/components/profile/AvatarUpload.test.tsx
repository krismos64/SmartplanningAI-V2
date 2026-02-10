/**
 * Tests unitaires pour AvatarUpload
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { AvatarUpload } from '@/components/profile/AvatarUpload'

// ============================================================================
// Mocks
// ============================================================================

const { mockRefresh, mockToast } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

// Mock URL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn().mockReturnValue('blob:preview-url'),
  writable: true,
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
})

// ============================================================================
// Helpers
// ============================================================================

/** Configure MSW pour un upload réussi */
function setupUploadSuccess() {
  server.use(
    http.post('/api/avatar', () => {
      return HttpResponse.json({ success: true, url: 'https://cdn.test/avatar.jpg' })
    })
  )
}

/** Configure MSW pour un upload échoué */
function setupUploadError(errorMessage: string) {
  server.use(
    http.post('/api/avatar', () => {
      return HttpResponse.json({ error: errorMessage }, { status: 400 })
    })
  )
}

/** Configure MSW pour une suppression réussie */
function setupDeleteSuccess() {
  server.use(
    http.delete('/api/avatar', () => {
      return HttpResponse.json({ success: true, message: 'Supprimé' })
    })
  )
}

/** Configure MSW pour une suppression échouée */
function setupDeleteError(errorMessage: string) {
  server.use(
    http.delete('/api/avatar', () => {
      return HttpResponse.json({ error: errorMessage }, { status: 400 })
    })
  )
}

// ============================================================================
// Tests
// ============================================================================

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupUploadSuccess()
    setupDeleteSuccess()
  })

  describe('Affichage de base', () => {
    it('affiche le composant avec data-testid', () => {
      render(<AvatarUpload />)
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument()
    })

    it('affiche le bouton Changer', () => {
      render(<AvatarUpload />)
      expect(screen.getByTestId('avatar-upload-button')).toBeInTheDocument()
      expect(screen.getByText('Changer')).toBeInTheDocument()
    })

    it('affiche les instructions', () => {
      render(<AvatarUpload />)
      expect(screen.getByTestId('avatar-instructions')).toBeInTheDocument()
      expect(
        screen.getByText(/Glissez une image ou cliquez/)
      ).toBeInTheDocument()
    })

    it('affiche les initiales du nom', () => {
      render(<AvatarUpload name="Jean Dupont" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('affiche ? si pas de nom', () => {
      render(<AvatarUpload />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('n affiche pas le bouton Supprimer sans image', () => {
      render(<AvatarUpload />)
      expect(screen.queryByTestId('avatar-delete-button')).not.toBeInTheDocument()
    })

    it('affiche le bouton Supprimer avec une image', () => {
      render(<AvatarUpload currentImage="https://cdn.test/img.jpg" />)
      expect(screen.getByTestId('avatar-delete-button')).toBeInTheDocument()
      expect(screen.getByText('Supprimer')).toBeInTheDocument()
    })
  })

  describe('Initiales', () => {
    it('gere un seul mot', () => {
      render(<AvatarUpload name="Jean" />)
      expect(screen.getByText('JE')).toBeInTheDocument()
    })

    it('gere plusieurs mots', () => {
      render(<AvatarUpload name="Marie Claire Dupont" />)
      expect(screen.getByText('MD')).toBeInTheDocument()
    })
  })

  describe('Upload via input', () => {
    it('ouvre le file input au clic sur Changer', async () => {
      const user = userEvent.setup()
      render(<AvatarUpload />)

      const fileInput = screen.getByTestId('avatar-file-input') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      await user.click(screen.getByTestId('avatar-upload-button'))
      expect(clickSpy).toHaveBeenCalled()
    })

    it('upload un fichier valide', async () => {
      const onUploadSuccess = vi.fn()
      render(<AvatarUpload onUploadSuccess={onUploadSuccess} />)

      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      const input = screen.getByTestId('avatar-file-input')

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Photo de profil mise à jour'
        )
      })

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('rejette un fichier trop gros', async () => {
      render(<AvatarUpload />)

      const bigFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)],
        'big.jpg',
        { type: 'image/jpeg' }
      )

      const input = screen.getByTestId('avatar-file-input')
      fireEvent.change(input, { target: { files: [bigFile] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
      })
    })

    it('rejette un type de fichier invalide', async () => {
      render(<AvatarUpload />)

      const badFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' })
      const input = screen.getByTestId('avatar-file-input')
      fireEvent.change(input, { target: { files: [badFile] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled()
      })
    })
  })

  describe('Upload erreur API', () => {
    it('affiche un toast erreur si l API echoue', async () => {
      setupUploadError('Erreur serveur')

      render(<AvatarUpload />)

      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      const input = screen.getByTestId('avatar-file-input')
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Erreur serveur')
      })
    })
  })

  describe('Suppression', () => {
    it('affiche un toast succes apres suppression', async () => {
      const user = userEvent.setup()
      render(<AvatarUpload currentImage="https://cdn.test/img.jpg" />)

      await user.click(screen.getByTestId('avatar-delete-button'))

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Photo de profil supprimée'
        )
      })
    })

    it('appelle onDeleteSuccess apres suppression', async () => {
      const onDeleteSuccess = vi.fn()
      const user = userEvent.setup()
      render(
        <AvatarUpload
          currentImage="https://cdn.test/img.jpg"
          onDeleteSuccess={onDeleteSuccess}
        />
      )

      await user.click(screen.getByTestId('avatar-delete-button'))

      await waitFor(() => {
        expect(onDeleteSuccess).toHaveBeenCalled()
      })
    })

    it('appelle router.refresh apres suppression', async () => {
      const user = userEvent.setup()
      render(<AvatarUpload currentImage="https://cdn.test/img.jpg" />)

      await user.click(screen.getByTestId('avatar-delete-button'))

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('gere les erreurs de suppression', async () => {
      setupDeleteError('Suppression impossible')

      const user = userEvent.setup()
      render(<AvatarUpload currentImage="https://cdn.test/img.jpg" />)

      await user.click(screen.getByTestId('avatar-delete-button'))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Suppression impossible')
      })
    })
  })

  describe('Drag and drop', () => {
    it('gere le drag over', () => {
      render(<AvatarUpload />)
      const dropZone = screen.getByTestId('avatar-drop-zone')

      fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } })

      expect(dropZone.className).toContain('ring')
    })

    it('gere le drag leave', () => {
      render(<AvatarUpload />)
      const dropZone = screen.getByTestId('avatar-drop-zone')

      fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } })
      fireEvent.dragLeave(dropZone, { dataTransfer: { files: [] } })

      expect(dropZone.className).not.toContain('ring-4')
    })

    it('upload le fichier au drop', async () => {
      render(<AvatarUpload />)
      const dropZone = screen.getByTestId('avatar-drop-zone')

      const file = new File(['test'], 'avatar.png', { type: 'image/png' })
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Photo de profil mise à jour'
        )
      })
    })
  })
})
