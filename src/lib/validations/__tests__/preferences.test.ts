/**
 * Tests unitaires pour la validation des préférences utilisateur
 *
 * @ticket SP-433 - Migration Prisma ajout champ preferences JSON
 */

import { describe, it, expect } from 'vitest'
import {
  themePreferenceSchema,
  dateFormatPreferenceSchema,
  timeFormatPreferenceSchema,
  languagePreferenceSchema,
  displayPreferencesSchema,
  notificationChannelPreferencesSchema,
  notificationPreferencesSchema,
  userPreferencesSchema,
  updateDisplayPreferencesSchema,
  updateUserPreferencesSchema,
} from '../preferences'

// ============================================================================
// THÈME
// ============================================================================

describe('themePreferenceSchema', () => {
  it('should accept valid theme values', () => {
    expect(themePreferenceSchema.parse('light')).toBe('light')
    expect(themePreferenceSchema.parse('dark')).toBe('dark')
    expect(themePreferenceSchema.parse('system')).toBe('system')
  })

  it('should reject invalid theme values', () => {
    expect(() => themePreferenceSchema.parse('invalid')).toThrow()
    expect(() => themePreferenceSchema.parse('')).toThrow()
    expect(() => themePreferenceSchema.parse(123)).toThrow()
  })

  it('should default to system', () => {
    expect(themePreferenceSchema.parse(undefined)).toBe('system')
  })
})

// ============================================================================
// FORMAT DE DATE
// ============================================================================

describe('dateFormatPreferenceSchema', () => {
  it('should accept valid date formats', () => {
    expect(dateFormatPreferenceSchema.parse('DD/MM/YYYY')).toBe('DD/MM/YYYY')
    expect(dateFormatPreferenceSchema.parse('MM/DD/YYYY')).toBe('MM/DD/YYYY')
    expect(dateFormatPreferenceSchema.parse('YYYY-MM-DD')).toBe('YYYY-MM-DD')
  })

  it('should reject invalid date formats', () => {
    expect(() => dateFormatPreferenceSchema.parse('invalid')).toThrow()
    expect(() => dateFormatPreferenceSchema.parse('DD-MM-YYYY')).toThrow()
  })

  it('should default to DD/MM/YYYY', () => {
    expect(dateFormatPreferenceSchema.parse(undefined)).toBe('DD/MM/YYYY')
  })
})

// ============================================================================
// FORMAT D'HEURE
// ============================================================================

describe('timeFormatPreferenceSchema', () => {
  it('should accept valid time formats', () => {
    expect(timeFormatPreferenceSchema.parse('24h')).toBe('24h')
    expect(timeFormatPreferenceSchema.parse('12h')).toBe('12h')
  })

  it('should reject invalid time formats', () => {
    expect(() => timeFormatPreferenceSchema.parse('invalid')).toThrow()
    expect(() => timeFormatPreferenceSchema.parse('13h')).toThrow()
  })

  it('should default to 24h', () => {
    expect(timeFormatPreferenceSchema.parse(undefined)).toBe('24h')
  })
})

// ============================================================================
// LANGUE
// ============================================================================

describe('languagePreferenceSchema', () => {
  it('should accept valid languages', () => {
    expect(languagePreferenceSchema.parse('fr')).toBe('fr')
    expect(languagePreferenceSchema.parse('en')).toBe('en')
  })

  it('should reject invalid languages', () => {
    expect(() => languagePreferenceSchema.parse('de')).toThrow()
    expect(() => languagePreferenceSchema.parse('es')).toThrow()
  })

  it('should default to fr', () => {
    expect(languagePreferenceSchema.parse(undefined)).toBe('fr')
  })
})

// ============================================================================
// PRÉFÉRENCES D'AFFICHAGE
// ============================================================================

describe('displayPreferencesSchema', () => {
  it('should validate complete display preferences', () => {
    const input = {
      theme: 'dark',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      language: 'fr',
    }
    const result = displayPreferencesSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should apply defaults for empty object', () => {
    const result = displayPreferencesSchema.parse({})
    expect(result).toEqual({
      theme: 'system',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      language: 'fr',
    })
  })

  it('should apply partial defaults', () => {
    const input = { theme: 'light' }
    const result = displayPreferencesSchema.parse(input)
    expect(result.theme).toBe('light')
    expect(result.dateFormat).toBe('DD/MM/YYYY')
    expect(result.timeFormat).toBe('24h')
    expect(result.language).toBe('fr')
  })

  it('should reject invalid theme in display preferences', () => {
    const input = { theme: 'invalid' }
    expect(() => displayPreferencesSchema.parse(input)).toThrow()
  })
})

// ============================================================================
// PRÉFÉRENCES NOTIFICATIONS PAR CANAL
// ============================================================================

describe('notificationChannelPreferencesSchema', () => {
  it('should validate complete channel preferences', () => {
    const input = {
      planning: true,
      leaves: false,
      tasks: true,
      system: false,
    }
    const result = notificationChannelPreferencesSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should apply defaults for empty object', () => {
    const result = notificationChannelPreferencesSchema.parse({})
    expect(result).toEqual({
      planning: true,
      leaves: true,
      tasks: true,
      system: true,
    })
  })

  it('should apply partial defaults', () => {
    const input = { planning: false }
    const result = notificationChannelPreferencesSchema.parse(input)
    expect(result.planning).toBe(false)
    expect(result.leaves).toBe(true)
    expect(result.tasks).toBe(true)
    expect(result.system).toBe(true)
  })

  it('should reject non-boolean values', () => {
    const input = { planning: 'yes' }
    expect(() => notificationChannelPreferencesSchema.parse(input)).toThrow()
  })
})

// ============================================================================
// PRÉFÉRENCES NOTIFICATIONS
// ============================================================================

describe('notificationPreferencesSchema', () => {
  it('should validate complete notification preferences', () => {
    const input = {
      email: {
        planning: true,
        leaves: false,
        tasks: true,
        system: true,
      },
      inApp: {
        planning: false,
        leaves: true,
        tasks: false,
        system: true,
      },
    }
    const result = notificationPreferencesSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should apply defaults for nested objects', () => {
    const input = {
      email: { planning: false },
      inApp: {},
    }
    const result = notificationPreferencesSchema.parse(input)
    expect(result.email.planning).toBe(false)
    expect(result.email.leaves).toBe(true)
    expect(result.inApp.planning).toBe(true)
  })
})

// ============================================================================
// PRÉFÉRENCES UTILISATEUR COMPLÈTES
// ============================================================================

describe('userPreferencesSchema', () => {
  it('should validate complete user preferences', () => {
    const input = {
      display: {
        theme: 'dark',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '12h',
        language: 'en',
      },
      notifications: {
        email: { planning: true, leaves: true, tasks: true, system: false },
        inApp: { planning: true, leaves: false, tasks: true, system: true },
      },
    }
    const result = userPreferencesSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('should validate empty object', () => {
    const result = userPreferencesSchema.parse({})
    expect(result).toEqual({})
  })

  it('should validate partial preferences', () => {
    const input = {
      display: { theme: 'light' },
    }
    const result = userPreferencesSchema.parse(input)
    expect(result.display?.theme).toBe('light')
    expect(result.notifications).toBeUndefined()
  })

  it('should reject invalid nested values', () => {
    const input = {
      display: { theme: 'invalid' },
    }
    expect(() => userPreferencesSchema.parse(input)).toThrow()
  })
})

// ============================================================================
// SCHÉMAS DE MISE À JOUR
// ============================================================================

describe('updateDisplayPreferencesSchema', () => {
  it('should accept partial updates', () => {
    const input = { theme: 'dark' }
    const result = updateDisplayPreferencesSchema.parse(input)
    expect(result.theme).toBe('dark')
    expect(result.dateFormat).toBeUndefined()
  })

  it('should accept empty object', () => {
    const result = updateDisplayPreferencesSchema.parse({})
    expect(result).toEqual({})
  })

  it('should reject invalid values', () => {
    const input = { theme: 'invalid' }
    expect(() => updateDisplayPreferencesSchema.parse(input)).toThrow()
  })
})

describe('updateUserPreferencesSchema', () => {
  it('should accept partial nested updates', () => {
    const input = {
      display: { theme: 'light' },
    }
    const result = updateUserPreferencesSchema.parse(input)
    expect(result.display?.theme).toBe('light')
  })

  it('should accept empty object', () => {
    const result = updateUserPreferencesSchema.parse({})
    expect(result).toEqual({})
  })
})
