/**
 * Setup global pour Vitest
 *
 * Ce fichier est exécuté AVANT chaque fichier de test.
 * Il configure l'environnement de test avec les matchers jest-dom
 * et le cleanup automatique après chaque test.
 *
 * @see https://testing-library.com/docs/react-testing-library/setup
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Cleanup automatique après chaque test
 *
 * React Testing Library ne fait PAS automatiquement le cleanup
 * depuis la version 9. Il faut le faire manuellement ou via
 * ce setup global.
 *
 * Le cleanup :
 * - Démonte les composants rendus
 * - Nettoie le DOM
 * - Évite les fuites de mémoire entre tests
 */
afterEach(() => {
  cleanup()
})
