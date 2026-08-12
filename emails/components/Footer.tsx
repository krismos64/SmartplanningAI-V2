/**
 * Footer pour les emails SmartPlanning
 *
 * @ticket SP-296
 * @description Footer avec liens, copyright et informations légales
 */

import { Section, Row, Column, Link, Text } from '@react-email/components'
import * as React from 'react'

import { colors, typography, spacing } from '../styles/constants'

export interface FooterProps {
  /** Année du copyright (défaut: année courante) */
  year?: number
  /** Afficher les liens de navigation */
  showLinks?: boolean
  /** Afficher le texte de désabonnement */
  showUnsubscribe?: boolean
  /** Lien de désabonnement personnalisé */
  unsubscribeUrl?: string
}

/**
 * Footer d'email SmartPlanning
 *
 * Inclut:
 * - Liens vers le site, CGU, confidentialité
 * - Copyright
 * - Lien de désabonnement (optionnel)
 * - Adresse de contact
 *
 * Le lien « Contact » avait ete retire parce que la route publique /contact
 * n'existait pas, seule l'API /api/contact etant exposee. La page existe
 * depuis SP-574, le lien est retabli.
 */
export function Footer({
  year = new Date().getFullYear(),
  showLinks = true,
  showUnsubscribe = false,
  unsubscribeUrl,
}: FooterProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

  return (
    <>
      {/* Séparateur */}
      <Section style={dividerStyle} />

      {/* Section footer */}
      <Section style={footerStyle}>
        {/* Liens de navigation */}
        {showLinks && (
          <Row style={linksRowStyle}>
            <Column align="center">
              <table role="presentation" cellPadding="0" cellSpacing="0">
                <tbody>
                  <tr>
                    <td style={linkCellStyle}>
                      <Link href={baseUrl} style={linkStyle}>
                        Site web
                      </Link>
                    </td>
                    <td style={separatorCellStyle}>
                      <Text style={separatorStyle}>•</Text>
                    </td>
                    <td style={linkCellStyle}>
                      <Link href={`${baseUrl}/cgu`} style={linkStyle}>
                        CGU
                      </Link>
                    </td>
                    <td style={separatorCellStyle}>
                      <Text style={separatorStyle}>•</Text>
                    </td>
                    <td style={linkCellStyle}>
                      <Link
                        href={`${baseUrl}/confidentialite`}
                        style={linkStyle}
                      >
                        Confidentialité
                      </Link>
                    </td>
                    <td style={separatorCellStyle}>
                      <Text style={separatorStyle}>•</Text>
                    </td>
                    <td style={linkCellStyle}>
                      <Link href={`${baseUrl}/contact`} style={linkStyle}>
                        Contact
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Column>
          </Row>
        )}

        {/* Copyright */}
        <Row>
          <Column align="center">
            <Text style={copyrightStyle}>
              © {year} SmartPlanning. Tous droits réservés.
            </Text>
          </Column>
        </Row>

        {/* Adresse */}
        <Row>
          <Column align="center">
            <Text style={addressStyle}>
              SmartPlanning - Solution de gestion intelligente des équipes
            </Text>
          </Column>
        </Row>

        {/* Lien de désabonnement */}
        {showUnsubscribe && (
          <Row style={unsubscribeRowStyle}>
            <Column align="center">
              <Text style={unsubscribeTextStyle}>
                Vous recevez cet email car vous êtes inscrit sur SmartPlanning.
                <br />
                {/*
                  `/preferences-email` n'a jamais existe : le lien renvoyait
                  un 404 sur les deux emails qui l'affichent, ceux de fin
                  d'essai. La page reelle est `/app/settings/notifications`.
                */}
                <Link
                  href={
                    unsubscribeUrl || `${baseUrl}/app/settings/notifications`
                  }
                  style={unsubscribeLinkStyle}
                >
                  Gérer mes préférences email
                </Link>
              </Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Bande de couleur en bas */}
      <Section style={bottomBarStyle} />
    </>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const dividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${colors.border.light}`,
  margin: `0 ${spacing.lg}`,
}

const footerStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  padding: `${spacing.lg} ${spacing.md}`,
}

const linksRowStyle: React.CSSProperties = {
  marginBottom: spacing.md,
}

const linkCellStyle: React.CSSProperties = {
  padding: `0 ${spacing.xs}`,
}

const linkStyle: React.CSSProperties = {
  color: colors.text.secondary,
  fontSize: typography.fontSize.sm,
  textDecoration: 'none',
}

const separatorCellStyle: React.CSSProperties = {
  padding: `0 ${spacing.xs}`,
}

const separatorStyle: React.CSSProperties = {
  color: colors.text.muted,
  fontSize: typography.fontSize.sm,
  margin: 0,
}

const copyrightStyle: React.CSSProperties = {
  color: colors.text.secondary,
  fontSize: typography.fontSize.sm,
  margin: `0 0 ${spacing.xs} 0`,
  textAlign: 'center',
}

const addressStyle: React.CSSProperties = {
  color: colors.text.muted,
  fontSize: typography.fontSize.xs,
  margin: 0,
  textAlign: 'center',
}

const unsubscribeRowStyle: React.CSSProperties = {
  marginTop: spacing.md,
}

const unsubscribeTextStyle: React.CSSProperties = {
  color: colors.text.muted,
  fontSize: typography.fontSize.xs,
  margin: 0,
  textAlign: 'center',
  lineHeight: typography.lineHeight.relaxed,
}

const unsubscribeLinkStyle: React.CSSProperties = {
  color: colors.text.muted,
  fontSize: typography.fontSize.xs,
  textDecoration: 'underline',
}

const bottomBarStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  height: '4px',
  width: '100%',
}

export default Footer
