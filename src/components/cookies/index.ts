/**
 * Composants de gestion du consentement cookies RGPD
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

export { CookieBanner } from './CookieBanner'
export type { CookieBannerProps } from './CookieBanner'

export { CookiePreferencesModal } from './CookiePreferencesModal'

export { CookieSettingsButton } from './CookieSettingsButton'
export type { CookieSettingsButtonProps } from './CookieSettingsButton'

export {
  CookieConsentProvider,
  useCookieConsentContext,
  useCookieConsentContextOptional,
} from './CookieConsentProvider'
export type { CookieConsentContextValue } from './CookieConsentProvider'
