'use client'

/**
 * ThemeProvider Component
 *
 * Wrapper pour next-themes avec configuration optimisée pour SmartPlanning.
 * Gère le dark/light mode avec persistance localStorage.
 *
 * @see SP-265 - Dark/Light Mode
 * @see Context7 - next-themes best practices 2025-2026
 *
 * Configuration :
 * - attribute="class" : Compatible avec Tailwind CSS darkMode: 'class'
 * - defaultTheme="dark" : Dark mode par défaut pour SmartPlanning
 * - enableSystem : Active la détection prefers-color-scheme après choix utilisateur
 * - disableTransitionOnChange={false} : Garde les transitions fluides
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
