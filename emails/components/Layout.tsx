/**
 * Layout de base pour les emails SmartPlanning
 *
 * @ticket SP-296
 * @description Container responsive avec structure HTML email compatible
 */

import {
  Html,
  Head,
  Body,
  Container,
  Font,
  Preview,
} from '@react-email/components'
import * as React from 'react'

import { colors, typography, dimensions, spacing } from '../styles/constants'
import { Header } from './Header'
import { Footer } from './Footer'

export interface LayoutProps {
  /** Texte de prévisualisation (aperçu dans la boîte de réception) */
  preview?: string
  /** Contenu principal de l'email */
  children: React.ReactNode
  /** Afficher le header (défaut: true) */
  showHeader?: boolean
  /** Afficher le footer (défaut: true) */
  showFooter?: boolean
  /** Afficher le lien de désinscription dans le footer */
  showUnsubscribe?: boolean
}

/**
 * Layout de base responsive pour tous les emails SmartPlanning
 *
 * Structure:
 * - HTML avec meta viewport pour responsive
 * - Polices web avec fallback
 * - Header avec logo
 * - Contenu principal
 * - Footer avec liens
 */
export function Layout({
  preview,
  children,
  showHeader = true,
  showFooter = true,
  showUnsubscribe = false,
}: LayoutProps) {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta
          name="format-detection"
          content="telephone=no,address=no,email=no,date=no,url=no"
        />
        <Font
          fontFamily="Rajdhani"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      {preview && <Preview>{preview}</Preview>}

      <Body style={bodyStyle}>
        {/* Wrapper pour centrage et fond */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={wrapperStyle}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: spacing.md }}>
                {/* Container principal */}
                <Container style={containerStyle}>
                  {showHeader && <Header />}

                  {/* Contenu principal */}
                  <table
                    role="presentation"
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={contentStyle}
                  >
                    <tbody>
                      <tr>
                        <td style={contentCellStyle}>{children}</td>
                      </tr>
                    </tbody>
                  </table>

                  {showFooter && <Footer showUnsubscribe={showUnsubscribe} />}
                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const bodyStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  fontFamily: typography.fontFamilyFallback,
  margin: 0,
  padding: 0,
  WebkitTextSizeAdjust: '100%',
}

const wrapperStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  width: '100%',
}

const containerStyle: React.CSSProperties = {
  maxWidth: dimensions.maxWidth,
  width: '100%',
  backgroundColor: colors.background.primary,
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const contentStyle: React.CSSProperties = {
  width: '100%',
}

const contentCellStyle: React.CSSProperties = {
  padding: `${spacing.xl} ${spacing.lg}`,
}

export default Layout
