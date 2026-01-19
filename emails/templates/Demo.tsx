/**
 * Template de démonstration des composants React Email SmartPlanning
 *
 * @ticket SP-296
 * @description Template de test pour prévisualiser tous les composants
 */

import { Text, Hr, Section, Row, Column } from '@react-email/components'
import * as React from 'react'

import {
  Layout,
  Button,
  ButtonGroup,
  colors,
  typography,
  spacing,
  presetStyles,
} from '../components'

/**
 * Props pour le template de démonstration
 */
interface DemoProps {
  userName?: string
}

/**
 * Template de démonstration
 *
 * Ce template affiche tous les composants disponibles
 * pour vérifier leur rendu dans le serveur de preview.
 */
export function Demo({ userName = 'Christophe' }: DemoProps) {
  return (
    <Layout preview="Démonstration des composants email SmartPlanning">
      {/* Titre principal */}
      <Text style={presetStyles.heading1}>
        Bienvenue sur SmartPlanning, {userName} !
      </Text>

      {/* Paragraphe d'introduction */}
      <Text style={presetStyles.paragraph}>
        Ceci est un email de démonstration qui présente tous les composants
        disponibles dans notre système d&apos;emails React Email. Ce template permet
        de vérifier le rendu visuel avant d&apos;implémenter les vrais templates.
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Section Boutons */}
      <Text style={presetStyles.heading2}>Boutons CTA</Text>
      <Text style={presetStyles.paragraph}>
        Différentes variantes de boutons disponibles :
      </Text>

      {/* Bouton Primary */}
      <Section style={{ marginBottom: spacing.md }}>
        <Button href="https://smartplanning.fr" variant="primary">
          Bouton Primary
        </Button>
      </Section>

      {/* Bouton Secondary */}
      <Section style={{ marginBottom: spacing.md }}>
        <Button href="https://smartplanning.fr" variant="secondary">
          Bouton Secondary
        </Button>
      </Section>

      {/* Bouton Outline */}
      <Section style={{ marginBottom: spacing.md }}>
        <Button href="https://smartplanning.fr" variant="outline">
          Bouton Outline
        </Button>
      </Section>

      {/* Groupe de boutons */}
      <ButtonGroup align="center">
        <Button href="https://smartplanning.fr" variant="success" size="sm">
          Accepter
        </Button>
        <Button href="https://smartplanning.fr" variant="danger" size="sm">
          Refuser
        </Button>
      </ButtonGroup>

      <Hr style={presetStyles.divider} />

      {/* Section Tailles */}
      <Text style={presetStyles.heading2}>Tailles de boutons</Text>

      <Section style={{ marginBottom: spacing.md }}>
        <Button href="#" variant="primary" size="sm">
          Petit (sm)
        </Button>
      </Section>

      <Section style={{ marginBottom: spacing.md }}>
        <Button href="#" variant="primary" size="md">
          Moyen (md)
        </Button>
      </Section>

      <Section style={{ marginBottom: spacing.md }}>
        <Button href="#" variant="primary" size="lg">
          Grand (lg)
        </Button>
      </Section>

      {/* Bouton full width */}
      <Section style={{ marginBottom: spacing.md }}>
        <Button href="#" variant="primary" fullWidth>
          Bouton pleine largeur
        </Button>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Section Typographie */}
      <Text style={presetStyles.heading2}>Typographie</Text>

      <Text style={{ ...presetStyles.paragraph, fontSize: typography.fontSize.xs }}>
        Texte extra small (12px)
      </Text>
      <Text style={{ ...presetStyles.paragraph, fontSize: typography.fontSize.sm }}>
        Texte small (14px)
      </Text>
      <Text style={{ ...presetStyles.paragraph, fontSize: typography.fontSize.base }}>
        Texte base (16px) - Taille par défaut des paragraphes
      </Text>
      <Text style={{ ...presetStyles.paragraph, fontSize: typography.fontSize.lg }}>
        Texte large (18px)
      </Text>
      <Text style={{ ...presetStyles.paragraph, fontSize: typography.fontSize.xl }}>
        Texte extra large (20px)
      </Text>

      <Hr style={presetStyles.divider} />

      {/* Section Couleurs */}
      <Text style={presetStyles.heading2}>Palette de couleurs</Text>

      <table role="presentation" style={{ width: '100%', marginBottom: spacing.lg }}>
        <tbody>
          <tr>
            <td style={colorBoxStyle(colors.primary)}>Primary</td>
            <td style={colorBoxStyle(colors.primaryDark)}>Primary Dark</td>
            <td style={colorBoxStyle(colors.primaryLight)}>Primary Light</td>
          </tr>
          <tr>
            <td style={colorBoxStyle(colors.status.success)}>Success</td>
            <td style={colorBoxStyle(colors.status.warning)}>Warning</td>
            <td style={colorBoxStyle(colors.status.error)}>Error</td>
          </tr>
        </tbody>
      </table>

      <Hr style={presetStyles.divider} />

      {/* Section Info box */}
      <Text style={presetStyles.heading2}>Boîte d&apos;information</Text>

      <Section style={infoBoxStyle}>
        <Row>
          <Column>
            <Text style={infoBoxTextStyle}>
              💡 <strong>Conseil :</strong> Vous pouvez personnaliser ces composants
              selon vos besoins en modifiant les constantes de style.
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={presetStyles.divider} />

      {/* Call to action final */}
      <Text style={{ ...presetStyles.paragraph, textAlign: 'center' }}>
        Prêt à commencer avec SmartPlanning ?
      </Text>

      <Section style={{ textAlign: 'center' }}>
        <Button href="https://smartplanning.fr/inscription" variant="primary" size="lg">
          Créer mon compte gratuitement
        </Button>
      </Section>
    </Layout>
  )
}

// =============================================================================
// STYLES LOCAUX
// =============================================================================

function colorBoxStyle(bgColor: string): React.CSSProperties {
  return {
    backgroundColor: bgColor,
    color: '#ffffff',
    padding: spacing.sm,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  }
}

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: colors.background.secondary,
  borderLeft: `4px solid ${colors.primary}`,
  padding: spacing.md,
  borderRadius: '4px',
}

const infoBoxTextStyle: React.CSSProperties = {
  color: colors.text.primary,
  fontSize: typography.fontSize.sm,
  margin: 0,
  lineHeight: typography.lineHeight.normal,
}

export default Demo
