/**
 * Bouton CTA pour les emails SmartPlanning
 *
 * @ticket SP-296
 * @description Bouton stylisé avec variantes (primary, secondary, outline)
 */

import { Button as ReactEmailButton } from '@react-email/components'
import * as React from 'react'

import {
  colors,
  typography,
  borders,
  dimensions,
  spacing,
} from '../styles/constants'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  /** URL de destination du bouton */
  href: string
  /** Texte du bouton */
  children: React.ReactNode
  /** Variante du bouton (défaut: primary) */
  variant?: ButtonVariant
  /** Taille du bouton (défaut: md) */
  size?: ButtonSize
  /** Pleine largeur */
  fullWidth?: boolean
  /** Styles personnalisés */
  style?: React.CSSProperties
}

/**
 * Bouton CTA pour les emails
 *
 * Utilise la technique du "bulletproof button" pour une
 * compatibilité maximale avec les clients email.
 *
 * Variantes:
 * - primary: Bleu SmartPlanning (défaut)
 * - secondary: Bleu foncé
 * - outline: Bordure bleu, fond transparent
 * - success: Vert
 * - danger: Rouge
 */
export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
}: ButtonProps) {
  const buttonStyle = {
    ...getBaseStyle(size),
    ...getVariantStyle(variant),
    ...(fullWidth && {
      width: '100%',
      display: 'block',
      textAlign: 'center' as const,
    }),
    ...style,
  }

  return (
    <ReactEmailButton href={href} style={buttonStyle}>
      {children}
    </ReactEmailButton>
  )
}

// =============================================================================
// STYLE HELPERS
// =============================================================================

function getBaseStyle(size: ButtonSize): React.CSSProperties {
  const sizes: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.sm,
    },
    md: {
      padding: `${dimensions.buttonPaddingY} ${dimensions.buttonPaddingX}`,
      fontSize: typography.fontSize.base,
    },
    lg: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.lg,
    },
  }

  return {
    display: 'inline-block',
    fontFamily: typography.fontFamilyFallback,
    fontWeight: typography.fontWeight.semibold,
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: borders.radius.md,
    lineHeight: typography.lineHeight.normal,
    ...sizes[size],
  }
}

function getVariantStyle(variant: ButtonVariant): React.CSSProperties {
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.text.inverse,
      border: `2px solid ${colors.primary}`,
    },
    secondary: {
      backgroundColor: colors.primaryDark,
      color: colors.text.inverse,
      border: `2px solid ${colors.primaryDark}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    success: {
      backgroundColor: colors.status.success,
      color: colors.text.inverse,
      border: `2px solid ${colors.status.success}`,
    },
    danger: {
      backgroundColor: colors.status.error,
      color: colors.text.inverse,
      border: `2px solid ${colors.status.error}`,
    },
  }

  return variants[variant]
}

// =============================================================================
// COMPOSANT GROUPE DE BOUTONS
// =============================================================================

export interface ButtonGroupProps {
  /** Boutons à afficher */
  children: React.ReactNode
  /** Alignement (défaut: center) */
  align?: 'left' | 'center' | 'right'
  /** Espacement entre les boutons */
  gap?: string
}

/**
 * Groupe de boutons avec espacement
 */
export function ButtonGroup({
  children,
  align = 'center',
  gap = spacing.md,
}: ButtonGroupProps) {
  return (
    <table
      role="presentation"
      cellPadding="0"
      cellSpacing="0"
      style={{ width: '100%' }}
    >
      <tbody>
        <tr>
          <td
            style={{
              textAlign: align,
              paddingTop: spacing.md,
              paddingBottom: spacing.md,
            }}
          >
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              style={{
                display: 'inline-table',
              }}
            >
              <tbody>
                <tr>
                  {React.Children.map(children, (child, index) => (
                    <td
                      key={index}
                      style={{
                        paddingLeft: index > 0 ? gap : '0',
                      }}
                    >
                      {child}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default Button
