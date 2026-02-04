/**
 * Tests unitaires pour avatar-config.ts
 *
 * @ticket SP-272
 */

import { describe, it, expect } from 'vitest'
import { AVATAR_CONFIG, type AllowedMimeType } from '../avatar-config'

describe('avatar-config', () => {
  describe('AVATAR_CONFIG', () => {
    it('should have correct folder path', () => {
      expect(AVATAR_CONFIG.folder).toBe('smartplanning/avatars')
    })

    it('should have max file size of 5MB', () => {
      expect(AVATAR_CONFIG.maxFileSize).toBe(5 * 1024 * 1024)
    })

    it('should allow jpeg, png, webp, and gif mime types', () => {
      expect(AVATAR_CONFIG.allowedMimeTypes).toContain('image/jpeg')
      expect(AVATAR_CONFIG.allowedMimeTypes).toContain('image/png')
      expect(AVATAR_CONFIG.allowedMimeTypes).toContain('image/webp')
      expect(AVATAR_CONFIG.allowedMimeTypes).toContain('image/gif')
      expect(AVATAR_CONFIG.allowedMimeTypes).toHaveLength(4)
    })

    it('should not allow other mime types', () => {
      const disallowedTypes = [
        'image/svg+xml',
        'image/bmp',
        'application/pdf',
        'text/plain',
      ]

      disallowedTypes.forEach((type) => {
        expect(
          AVATAR_CONFIG.allowedMimeTypes.includes(type as AllowedMimeType)
        ).toBe(false)
      })
    })
  })

  describe('AllowedMimeType', () => {
    it('should be a union of allowed mime types', () => {
      const validTypes: AllowedMimeType[] = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ]

      validTypes.forEach((type) => {
        expect(AVATAR_CONFIG.allowedMimeTypes).toContain(type)
      })
    })
  })
})
