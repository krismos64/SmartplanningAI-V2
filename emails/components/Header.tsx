/**
 * Header pour les emails SmartPlanning
 *
 * @ticket SP-296
 * @description Header avec logo et bande de couleur SmartPlanning
 */

import { Img, Section, Row, Column, Link } from '@react-email/components'
import * as React from 'react'

import { colors, spacing, dimensions } from '../styles/constants'

export interface HeaderProps {
  /** URL du logo (défaut: logo SmartPlanning hébergé) */
  logoUrl?: string
  /** URL de redirection du logo (défaut: site SmartPlanning) */
  logoLink?: string
}

/**
 * Header d'email avec logo SmartPlanning
 *
 * Inclut:
 * - Bande de couleur primaire en haut
 * - Logo centré cliquable
 */
export function Header({
  logoUrl,
  logoLink,
}: HeaderProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'
  const defaultLogoUrl = `${baseUrl}/images/logo-sp.png`
  const defaultLogoLink = baseUrl

  const finalLogoUrl = logoUrl || defaultLogoUrl
  const finalLogoLink = logoLink || defaultLogoLink
  return (
    <>
      {/* Bande de couleur primaire */}
      <Section style={topBarStyle} />

      {/* Section logo */}
      <Section style={headerStyle}>
        <Row>
          <Column align="center">
            <Link href={finalLogoLink} style={logoLinkStyle}>
              {/* Logo texte en fallback si l'image ne charge pas */}
              <table role="presentation" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td style={logoContainerStyle}>
                      <Img
                        src={finalLogoUrl}
                        alt="SmartPlanning"
                        height={dimensions.logoHeight}
                        style={logoImageStyle}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Link>
          </Column>
        </Row>
      </Section>

      {/* Séparateur subtil */}
      <Section style={dividerStyle} />
    </>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const topBarStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  height: '4px',
  width: '100%',
}

const headerStyle: React.CSSProperties = {
  backgroundColor: colors.background.primary,
  padding: `${spacing.lg} ${spacing.md}`,
}

const logoLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  display: 'inline-block',
}

const logoContainerStyle: React.CSSProperties = {
  textAlign: 'center',
}

const logoImageStyle: React.CSSProperties = {
  display: 'block',
  margin: '0 auto',
  border: 'none',
  outline: 'none',
}

const dividerStyle: React.CSSProperties = {
  borderBottom: `1px solid ${colors.border.light}`,
  margin: `0 ${spacing.lg}`,
}

export default Header
