'use client'

import * as React from 'react'
import { Spinner } from '@/components/loading/Spinner'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Props injectées par le HOC withLoading
 */
export interface WithLoadingInjectedProps {
  /**
   * État de chargement
   */
  isLoading?: boolean

  /**
   * Texte affiché pendant le chargement
   */
  loadingText?: string
}

/**
 * Options de configuration du HOC
 */
export interface WithLoadingOptions {
  /**
   * Composant de chargement personnalisé
   * Par défaut : Spinner
   */
  LoadingComponent?: React.ComponentType<{ message?: string }>

  /**
   * Texte par défaut pendant le chargement
   * @default 'Chargement...'
   */
  defaultLoadingText?: string

  /**
   * Position du spinner par rapport au contenu
   * - 'replace' : remplace le contenu
   * - 'overlay' : superpose sur le contenu
   * @default 'replace'
   */
  mode?: 'replace' | 'overlay'

  /**
   * Classes CSS additionnelles pour le container de loading
   */
  loadingClassName?: string

  /**
   * Hauteur minimale du container en mode loading
   */
  minHeight?: string | number
}

// =============================================================================
// DEFAULT LOADING COMPONENT
// =============================================================================

interface DefaultLoadingProps {
  message?: string
  className?: string
}

const DefaultLoading: React.FC<DefaultLoadingProps> = ({
  message,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 p-6',
      className
    )}
  >
    <Spinner size="md" variant="primary" />
    {message && (
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    )}
  </div>
)

// =============================================================================
// HOC
// =============================================================================

/**
 * withLoading - Higher-Order Component pour ajouter un état de chargement
 *
 * Encapsule un composant avec une logique de loading automatique.
 * Quand isLoading=true, affiche un composant de chargement à la place
 * ou en overlay sur le contenu original.
 *
 * Features:
 * - Mode 'replace' : remplace le contenu par le spinner
 * - Mode 'overlay' : affiche le spinner par-dessus le contenu
 * - Composant de chargement personnalisable
 * - Texte de chargement configurable
 * - TypeScript complet avec préservation des types
 *
 * @example
 * ```tsx
 * // Usage basique
 * const MyComponentWithLoading = withLoading(MyComponent)
 * <MyComponentWithLoading isLoading={true} {...props} />
 *
 * // Avec options
 * const MyComponentWithLoading = withLoading(MyComponent, {
 *   mode: 'overlay',
 *   defaultLoadingText: 'Patientez...',
 * })
 *
 * // Avec composant de chargement personnalisé
 * const MyComponentWithLoading = withLoading(MyComponent, {
 *   LoadingComponent: MyCustomSpinner,
 * })
 * ```
 *
 * @see SP-266 - Loading States avancés
 */
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithLoadingOptions = {}
): React.FC<P & WithLoadingInjectedProps> {
  const {
    LoadingComponent,
    defaultLoadingText = 'Chargement...',
    mode = 'replace',
    loadingClassName,
    minHeight = '100px',
  } = options

  // Composant de chargement à utiliser
  const Loading = LoadingComponent || DefaultLoading

  // Créer le composant wrapper
  const WithLoadingComponent: React.FC<P & WithLoadingInjectedProps> = (
    props
  ) => {
    const { isLoading = false, loadingText, ...restProps } = props
    const displayText = loadingText ?? defaultLoadingText

    // Mode replace : affiche uniquement le loading
    if (mode === 'replace' && isLoading) {
      return (
        <div
          className={cn('flex items-center justify-center', loadingClassName)}
          style={{ minHeight }}
          role="status"
          aria-busy="true"
          aria-label={displayText}
        >
          <Loading message={displayText} />
        </div>
      )
    }

    // Mode overlay : affiche le contenu avec un overlay de loading
    if (mode === 'overlay') {
      return (
        <div className="relative">
          <div
            className={cn(
              'transition-opacity duration-200',
              isLoading && 'pointer-events-none opacity-50'
            )}
          >
            <WrappedComponent {...(restProps as P)} />
          </div>

          {isLoading && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'bg-background/50 backdrop-blur-sm',
                loadingClassName
              )}
              role="status"
              aria-busy="true"
              aria-label={displayText}
            >
              <Loading message={displayText} />
            </div>
          )}
        </div>
      )
    }

    // Pas en loading : affiche le composant normal
    return <WrappedComponent {...(restProps as P)} />
  }

  // Définir le displayName pour le debugging
  const wrappedName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  WithLoadingComponent.displayName = `withLoading(${wrappedName})`

  return WithLoadingComponent
}

export default withLoading
