/**
 * Export des composants React Email SmartPlanning
 *
 * @ticket SP-296
 * @description Barrel export pour une importation simplifiée
 */

// Composants de mise en page
export { Layout } from './Layout'
export type { LayoutProps } from './Layout'

export { Header } from './Header'
export type { HeaderProps } from './Header'

export { Footer } from './Footer'
export type { FooterProps } from './Footer'

// Composants UI
export { Button, ButtonGroup } from './Button'
export type { ButtonProps, ButtonGroupProps, ButtonVariant, ButtonSize } from './Button'

// Ré-export des composants React Email utiles
export {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Hr,
  Preview,
} from '@react-email/components'

// Export des styles
export * from '../styles/constants'
