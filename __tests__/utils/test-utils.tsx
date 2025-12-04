/**
 * Utilitaires de test personnalisés pour SmartPlanning
 *
 * Ce fichier fournit un custom render qui wrap les composants
 * avec tous les providers nécessaires de l'application.
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 */

import React, { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * AllProviders - Wrapper avec tous les providers de l'application
 *
 * Pour SmartPlanning, les providers sont :
 * - ToastProvider (rendu séparément dans le DOM, pas besoin de wrapper)
 * - Futurs providers (Auth, Theme, etc.) seront ajoutés ici
 *
 * NOTE: Le ToastProvider utilise Sonner qui injecte directement dans le DOM,
 * il n'a pas besoin d'être dans ce wrapper.
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Futurs providers seront ajoutés ici */}
      {/* <ThemeProvider> */}
      {/* <AuthProvider> */}
      {children}
      {/* </AuthProvider> */}
      {/* </ThemeProvider> */}
    </>
  )
}

/**
 * Custom render avec providers
 *
 * Utilise ce render au lieu de celui de @testing-library/react
 * pour avoir automatiquement tous les providers de l'app.
 *
 * @example
 * ```tsx
 * import { render, screen } from '@/__tests__/utils/test-utils'
 *
 * test('renders component', () => {
 *   render(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Setup userEvent pour interactions utilisateur réalistes
 *
 * userEvent simule les interactions utilisateur de manière plus
 * réaliste que fireEvent (clavier, souris, etc.)
 *
 * @example
 * ```tsx
 * import { render, screen, setupUser } from '@/__tests__/utils/test-utils'
 *
 * test('user can click button', async () => {
 *   const user = setupUser()
 *   render(<Button onClick={handleClick}>Click me</Button>)
 *
 *   await user.click(screen.getByRole('button'))
 *   expect(handleClick).toHaveBeenCalled()
 * })
 * ```
 */
function setupUser() {
  return userEvent.setup()
}

// Re-export tout de @testing-library/react
export * from '@testing-library/react'

// Override le render par défaut avec notre custom render
export { customRender as render, setupUser }
