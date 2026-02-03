/**
 * Tests unitaires pour les utilitaires de préférences utilisateur
 *
 * @ticket SP-433 - Migration Prisma ajout champ preferences JSON
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseUserPreferences,
  parseDisplayPreferences,
  parseNotificationPreferences,
  mergePreferencesWithDefaults,
  serializeUserPreferences,
  isEmailNotificationEnabled,
  isInAppNotificationEnabled,
} from '../preferences'
import {
  DEFAULT_USER_PREFERENCES,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/types/preferences'

// ============================================================================
// PARSE USER PREFERENCES
// ============================================================================

describe('parseUserPreferences', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return defaults for null input', () => {
    const result = parseUserPreferences(null)
    expect(result).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('should return defaults for undefined input', () => {
    const result = parseUserPreferences(undefined)
    expect(result).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('should return defaults for non-object input', () => {
    expect(parseUserPreferences('string')).toEqual(DEFAULT_USER_PREFERENCES)
    expect(parseUserPreferences(123)).toEqual(DEFAULT_USER_PREFERENCES)
    expect(parseUserPreferences(true)).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('should parse valid complete preferences', () => {
    const input = {
      display: {
        theme: 'dark',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '12h',
        language: 'en',
      },
      notifications: {
        email: { planning: false, leaves: true, tasks: false, system: true },
        inApp: { planning: true, leaves: false, tasks: true, system: false },
      },
    }
    const result = parseUserPreferences(input)
    expect(result.display?.theme).toBe('dark')
    expect(result.display?.dateFormat).toBe('YYYY-MM-DD')
    expect(result.notifications?.email?.planning).toBe(false)
    expect(result.notifications?.inApp?.system).toBe(false)
  })

  it('should merge partial preferences with defaults', () => {
    const input = {
      display: { theme: 'light' },
    }
    const result = parseUserPreferences(input)
    expect(result.display?.theme).toBe('light')
    expect(result.display?.dateFormat).toBe('DD/MM/YYYY') // default
    expect(result.display?.timeFormat).toBe('24h') // default
    expect(result.notifications?.email?.planning).toBe(true) // default
  })

  it('should handle invalid nested values by using defaults', () => {
    const input = {
      display: { theme: 'invalid' },
    }
    const result = parseUserPreferences(input)
    // With invalid input, should return defaults
    expect(result).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('should not mutate defaults', () => {
    const defaultsCopy = structuredClone(DEFAULT_USER_PREFERENCES)
    parseUserPreferences(null)
    expect(DEFAULT_USER_PREFERENCES).toEqual(defaultsCopy)
  })
})

// ============================================================================
// PARSE DISPLAY PREFERENCES
// ============================================================================

describe('parseDisplayPreferences', () => {
  it('should return defaults for null input', () => {
    const result = parseDisplayPreferences(null)
    expect(result).toEqual(DEFAULT_DISPLAY_PREFERENCES)
  })

  it('should return defaults for non-object input', () => {
    expect(parseDisplayPreferences('string')).toEqual(
      DEFAULT_DISPLAY_PREFERENCES
    )
    expect(parseDisplayPreferences(123)).toEqual(DEFAULT_DISPLAY_PREFERENCES)
  })

  it('should parse valid display preferences', () => {
    const input = {
      theme: 'dark',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en',
    }
    const result = parseDisplayPreferences(input)
    expect(result).toEqual(input)
  })

  it('should use defaults for invalid theme', () => {
    const input = { theme: 'invalid' }
    const result = parseDisplayPreferences(input)
    expect(result.theme).toBe('system')
  })

  it('should use defaults for invalid dateFormat', () => {
    const input = { dateFormat: 'invalid' }
    const result = parseDisplayPreferences(input)
    expect(result.dateFormat).toBe('DD/MM/YYYY')
  })

  it('should use defaults for invalid timeFormat', () => {
    const input = { timeFormat: '13h' }
    const result = parseDisplayPreferences(input)
    expect(result.timeFormat).toBe('24h')
  })

  it('should use defaults for invalid language', () => {
    const input = { language: 'de' }
    const result = parseDisplayPreferences(input)
    expect(result.language).toBe('fr')
  })
})

// ============================================================================
// PARSE NOTIFICATION PREFERENCES
// ============================================================================

describe('parseNotificationPreferences', () => {
  it('should return defaults for null input', () => {
    const result = parseNotificationPreferences(null)
    expect(result).toEqual(DEFAULT_NOTIFICATION_PREFERENCES)
  })

  it('should return defaults for non-object input', () => {
    expect(parseNotificationPreferences('string')).toEqual(
      DEFAULT_NOTIFICATION_PREFERENCES
    )
  })

  it('should parse valid notification preferences', () => {
    const input = {
      email: { planning: false, leaves: true, tasks: false, system: true },
      inApp: { planning: true, leaves: false, tasks: true, system: false },
    }
    const result = parseNotificationPreferences(input)
    expect(result.email.planning).toBe(false)
    expect(result.inApp.system).toBe(false)
  })

  it('should use defaults for missing channels', () => {
    const input = {
      email: { planning: false },
    }
    const result = parseNotificationPreferences(input)
    expect(result.email.planning).toBe(false)
    expect(result.email.leaves).toBe(true) // default
    expect(result.inApp.planning).toBe(true) // default
  })

  it('should use defaults for non-boolean values', () => {
    const input = {
      email: { planning: 'yes' },
    }
    const result = parseNotificationPreferences(input)
    expect(result.email.planning).toBe(true) // default because 'yes' is not boolean
  })
})

// ============================================================================
// MERGE PREFERENCES WITH DEFAULTS
// ============================================================================

describe('mergePreferencesWithDefaults', () => {
  it('should return complete preferences for empty input', () => {
    const result = mergePreferencesWithDefaults({})
    expect(result.display).toBeDefined()
    expect(result.notifications).toBeDefined()
    expect(result.display?.theme).toBe('system')
    expect(result.notifications?.email?.planning).toBe(true)
  })

  it('should preserve provided values', () => {
    const input = {
      display: { theme: 'dark' as const },
      notifications: {
        email: { planning: false },
      },
    }
    const result = mergePreferencesWithDefaults(input)
    expect(result.display?.theme).toBe('dark')
    expect(result.notifications?.email?.planning).toBe(false)
  })

  it('should fill missing values with defaults', () => {
    const input = {
      display: { theme: 'light' as const },
    }
    const result = mergePreferencesWithDefaults(input)
    expect(result.display?.theme).toBe('light')
    expect(result.display?.dateFormat).toBe('DD/MM/YYYY')
    expect(result.notifications?.email?.planning).toBe(true)
  })
})

// ============================================================================
// SERIALIZE USER PREFERENCES
// ============================================================================

describe('serializeUserPreferences', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should serialize valid preferences', () => {
    const input = {
      display: {
        theme: 'dark' as const,
        dateFormat: 'DD/MM/YYYY' as const,
        timeFormat: '24h' as const,
        language: 'fr' as const,
      },
    }
    const result = serializeUserPreferences(input)
    expect(result).toEqual(input)
  })

  it('should return defaults for invalid preferences', () => {
    const input = {
      display: { theme: 'invalid' },
    }
    const result = serializeUserPreferences(input as never)
    expect(result).toEqual(DEFAULT_USER_PREFERENCES)
  })

  it('should handle empty object', () => {
    const result = serializeUserPreferences({})
    expect(result).toEqual({})
  })
})

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

describe('isEmailNotificationEnabled', () => {
  it('should return true when enabled', () => {
    const prefs = {
      notifications: {
        email: { planning: true, leaves: false, tasks: true, system: true },
        inApp: { planning: true, leaves: true, tasks: true, system: true },
      },
    }
    expect(isEmailNotificationEnabled(prefs, 'planning')).toBe(true)
    expect(isEmailNotificationEnabled(prefs, 'tasks')).toBe(true)
  })

  it('should return false when disabled', () => {
    const prefs = {
      notifications: {
        email: { planning: false, leaves: false, tasks: false, system: false },
        inApp: { planning: true, leaves: true, tasks: true, system: true },
      },
    }
    expect(isEmailNotificationEnabled(prefs, 'planning')).toBe(false)
    expect(isEmailNotificationEnabled(prefs, 'leaves')).toBe(false)
  })

  it('should return true by default when preferences are undefined', () => {
    expect(isEmailNotificationEnabled({}, 'planning')).toBe(true)
    expect(
      isEmailNotificationEnabled({ notifications: undefined }, 'leaves')
    ).toBe(true)
  })
})

describe('isInAppNotificationEnabled', () => {
  it('should return true when enabled', () => {
    const prefs = {
      notifications: {
        email: { planning: true, leaves: true, tasks: true, system: true },
        inApp: { planning: true, leaves: false, tasks: true, system: false },
      },
    }
    expect(isInAppNotificationEnabled(prefs, 'planning')).toBe(true)
    expect(isInAppNotificationEnabled(prefs, 'tasks')).toBe(true)
  })

  it('should return false when disabled', () => {
    const prefs = {
      notifications: {
        email: { planning: true, leaves: true, tasks: true, system: true },
        inApp: { planning: false, leaves: false, tasks: false, system: false },
      },
    }
    expect(isInAppNotificationEnabled(prefs, 'planning')).toBe(false)
    expect(isInAppNotificationEnabled(prefs, 'system')).toBe(false)
  })

  it('should return true by default when preferences are undefined', () => {
    expect(isInAppNotificationEnabled({}, 'planning')).toBe(true)
  })
})
