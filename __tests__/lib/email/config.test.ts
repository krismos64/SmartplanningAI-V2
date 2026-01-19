/**
 * Tests unitaires pour la configuration email
 *
 * @ticket SP-295
 * @description Tests des fonctions de configuration SMTP
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('email/config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ==========================================================================
  // isEmailConfigured
  // ==========================================================================

  describe('isEmailConfigured', () => {
    it('devrait retourner true si toutes les variables sont définies', async () => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user@test.com'
      process.env.SMTP_PASSWORD = 'password123'

      const { isEmailConfigured } = await import('@/lib/email/config')
      expect(isEmailConfigured()).toBe(true)
    })

    it('devrait retourner false si SMTP_HOST manque', async () => {
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user@test.com'
      process.env.SMTP_PASSWORD = 'password123'
      delete process.env.SMTP_HOST

      const { isEmailConfigured } = await import('@/lib/email/config')
      expect(isEmailConfigured()).toBe(false)
    })

    it('devrait retourner false si SMTP_USER manque', async () => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_PASSWORD = 'password123'
      delete process.env.SMTP_USER

      const { isEmailConfigured } = await import('@/lib/email/config')
      expect(isEmailConfigured()).toBe(false)
    })

    it('devrait retourner false si SMTP_PASSWORD manque', async () => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user@test.com'
      delete process.env.SMTP_PASSWORD

      const { isEmailConfigured } = await import('@/lib/email/config')
      expect(isEmailConfigured()).toBe(false)
    })

    it('devrait retourner false si aucune variable n\'est définie', async () => {
      delete process.env.SMTP_HOST
      delete process.env.SMTP_PORT
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD

      const { isEmailConfigured } = await import('@/lib/email/config')
      expect(isEmailConfigured()).toBe(false)
    })
  })

  // ==========================================================================
  // getSmtpConfig
  // ==========================================================================

  describe('getSmtpConfig', () => {
    it('devrait retourner la configuration SMTP correcte', async () => {
      process.env.SMTP_HOST = 'smtp.hostinger.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'contact@smartplanning.fr'
      process.env.SMTP_PASSWORD = 'secret123'

      const { getSmtpConfig } = await import('@/lib/email/config')
      const config = getSmtpConfig()

      expect(config.host).toBe('smtp.hostinger.com')
      expect(config.port).toBe(587)
      expect(config.secure).toBe(false) // Port 587 = STARTTLS
      expect(config.auth.user).toBe('contact@smartplanning.fr')
      expect(config.auth.pass).toBe('secret123')
      expect(config.pool).toBe(true)
      expect(config.maxConnections).toBe(5)
      expect(config.maxMessages).toBe(100)
    })

    it('devrait utiliser secure: true pour le port 465', async () => {
      process.env.SMTP_HOST = 'smtp.hostinger.com'
      process.env.SMTP_PORT = '465'
      process.env.SMTP_USER = 'contact@smartplanning.fr'
      process.env.SMTP_PASSWORD = 'secret123'

      const { getSmtpConfig } = await import('@/lib/email/config')
      const config = getSmtpConfig()

      expect(config.port).toBe(465)
      expect(config.secure).toBe(true) // Port 465 = SSL
    })

    it('devrait utiliser le port 587 par défaut', async () => {
      process.env.SMTP_HOST = 'smtp.hostinger.com'
      process.env.SMTP_USER = 'contact@smartplanning.fr'
      process.env.SMTP_PASSWORD = 'secret123'
      delete process.env.SMTP_PORT

      const { getSmtpConfig } = await import('@/lib/email/config')
      const config = getSmtpConfig()

      expect(config.port).toBe(587)
    })

    it('devrait lever une erreur si SMTP_HOST manque', async () => {
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user@test.com'
      process.env.SMTP_PASSWORD = 'password123'
      delete process.env.SMTP_HOST

      const { getSmtpConfig } = await import('@/lib/email/config')
      expect(() => getSmtpConfig()).toThrow('Configuration SMTP incomplète')
    })

    it('devrait lever une erreur si SMTP_USER manque', async () => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_PASSWORD = 'password123'
      delete process.env.SMTP_USER

      const { getSmtpConfig } = await import('@/lib/email/config')
      expect(() => getSmtpConfig()).toThrow('Configuration SMTP incomplète')
    })

    it('devrait lever une erreur si SMTP_PASSWORD manque', async () => {
      process.env.SMTP_HOST = 'smtp.test.com'
      process.env.SMTP_PORT = '587'
      process.env.SMTP_USER = 'user@test.com'
      delete process.env.SMTP_PASSWORD

      const { getSmtpConfig } = await import('@/lib/email/config')
      expect(() => getSmtpConfig()).toThrow('Configuration SMTP incomplète')
    })
  })

  // ==========================================================================
  // getEmailFrom
  // ==========================================================================

  describe('getEmailFrom', () => {
    it('devrait retourner SMTP_FROM si défini', async () => {
      process.env.SMTP_FROM = 'SmartPlanning <contact@smartplanning.fr>'
      process.env.SMTP_USER = 'user@test.com'

      const { getEmailFrom } = await import('@/lib/email/config')
      expect(getEmailFrom()).toBe('SmartPlanning <contact@smartplanning.fr>')
    })

    it('devrait retourner SMTP_USER si SMTP_FROM n\'est pas défini', async () => {
      delete process.env.SMTP_FROM
      process.env.SMTP_USER = 'contact@smartplanning.fr'

      const { getEmailFrom } = await import('@/lib/email/config')
      expect(getEmailFrom()).toBe('contact@smartplanning.fr')
    })

    it('devrait retourner la valeur par défaut si rien n\'est défini', async () => {
      delete process.env.SMTP_FROM
      delete process.env.SMTP_USER

      const { getEmailFrom } = await import('@/lib/email/config')
      expect(getEmailFrom()).toBe('SmartPlanning <contact@smartplanning.fr>')
    })
  })

  // ==========================================================================
  // getBaseUrl
  // ==========================================================================

  describe('getBaseUrl', () => {
    it('devrait retourner NEXT_PUBLIC_APP_URL si défini', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

      const { getBaseUrl } = await import('@/lib/email/config')
      expect(getBaseUrl()).toBe('http://localhost:3000')
    })

    it('devrait retourner la valeur par défaut si non défini', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL

      const { getBaseUrl } = await import('@/lib/email/config')
      expect(getBaseUrl()).toBe('https://smartplanning.fr')
    })
  })

  // ==========================================================================
  // getContactEmail
  // ==========================================================================

  describe('getContactEmail', () => {
    it('devrait retourner CONTACT_EMAIL si défini', async () => {
      process.env.CONTACT_EMAIL = 'support@smartplanning.fr'
      process.env.SMTP_USER = 'user@test.com'

      const { getContactEmail } = await import('@/lib/email/config')
      expect(getContactEmail()).toBe('support@smartplanning.fr')
    })

    it('devrait retourner SMTP_USER si CONTACT_EMAIL n\'est pas défini', async () => {
      delete process.env.CONTACT_EMAIL
      process.env.SMTP_USER = 'contact@smartplanning.fr'

      const { getContactEmail } = await import('@/lib/email/config')
      expect(getContactEmail()).toBe('contact@smartplanning.fr')
    })

    it('devrait retourner la valeur par défaut si rien n\'est défini', async () => {
      delete process.env.CONTACT_EMAIL
      delete process.env.SMTP_USER

      const { getContactEmail } = await import('@/lib/email/config')
      expect(getContactEmail()).toBe('contact@smartplanning.fr')
    })
  })
})
