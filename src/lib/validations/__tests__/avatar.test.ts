/**
 * Tests unitaires pour la validation d'avatar
 *
 * @ticket SP-272
 */

import { describe, it, expect } from 'vitest'
import { avatarFileSchema, AVATAR_ERRORS } from '../avatar'
import { AVATAR_CONFIG } from '../../avatar-config'

// Helper pour créer un mock File
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Array(size).fill('a').join('')
  return new File([content], name, { type })
}

describe('avatar validation', () => {
  describe('avatarFileSchema', () => {
    it('should accept valid jpeg file', () => {
      const file = createMockFile('avatar.jpg', 1024, 'image/jpeg')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(true)
    })

    it('should accept valid png file', () => {
      const file = createMockFile('avatar.png', 1024, 'image/png')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(true)
    })

    it('should accept valid webp file', () => {
      const file = createMockFile('avatar.webp', 1024, 'image/webp')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(true)
    })

    it('should accept valid gif file', () => {
      const file = createMockFile('avatar.gif', 1024, 'image/gif')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(true)
    })

    it('should reject file exceeding max size', () => {
      const oversizedFile = createMockFile(
        'large.jpg',
        AVATAR_CONFIG.maxFileSize + 1,
        'image/jpeg'
      )
      const result = avatarFileSchema.safeParse({ file: oversizedFile })

      expect(result.success).toBe(false)
    })

    it('should accept file at exactly max size', () => {
      const file = createMockFile(
        'max.jpg',
        AVATAR_CONFIG.maxFileSize,
        'image/jpeg'
      )
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(true)
    })

    it('should reject invalid mime type - svg', () => {
      const file = createMockFile('avatar.svg', 1024, 'image/svg+xml')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(false)
    })

    it('should reject invalid mime type - pdf', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(false)
    })

    it('should reject invalid mime type - text', () => {
      const file = createMockFile('file.txt', 1024, 'text/plain')
      const result = avatarFileSchema.safeParse({ file })

      expect(result.success).toBe(false)
    })

    it('should reject non-File input', () => {
      const result = avatarFileSchema.safeParse({ file: 'not a file' })

      expect(result.success).toBe(false)
    })

    it('should reject null file', () => {
      const result = avatarFileSchema.safeParse({ file: null })

      expect(result.success).toBe(false)
    })

    it('should reject undefined file', () => {
      const result = avatarFileSchema.safeParse({ file: undefined })

      expect(result.success).toBe(false)
    })
  })

  describe('AVATAR_ERRORS', () => {
    it('should have all required error messages', () => {
      expect(AVATAR_ERRORS.FILE_REQUIRED).toBeDefined()
      expect(AVATAR_ERRORS.FILE_TOO_LARGE).toBeDefined()
      expect(AVATAR_ERRORS.INVALID_FORMAT).toBeDefined()
      expect(AVATAR_ERRORS.UPLOAD_FAILED).toBeDefined()
      expect(AVATAR_ERRORS.DELETE_FAILED).toBeDefined()
    })

    it('should have French error messages', () => {
      expect(AVATAR_ERRORS.FILE_REQUIRED).toContain('sélectionner')
      expect(AVATAR_ERRORS.FILE_TOO_LARGE).toContain('volumineux')
      expect(AVATAR_ERRORS.INVALID_FORMAT).toContain('Format')
      expect(AVATAR_ERRORS.UPLOAD_FAILED).toContain('upload')
      expect(AVATAR_ERRORS.DELETE_FAILED).toContain('suppression')
    })

    it('should include max file size in error message', () => {
      const maxSizeMB = AVATAR_CONFIG.maxFileSize / 1024 / 1024
      expect(AVATAR_ERRORS.FILE_TOO_LARGE).toContain(String(maxSizeMB))
    })
  })
})
