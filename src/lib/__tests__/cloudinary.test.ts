/**
 * Tests unitaires pour cloudinary.ts
 *
 * @ticket SP-272
 */

import { describe, it, expect } from 'vitest'
import { extractPublicIdFromUrl, AVATAR_TRANSFORMATION } from '../cloudinary'

describe('cloudinary', () => {
  describe('extractPublicIdFromUrl', () => {
    it('should extract public_id from valid Cloudinary URL', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/smartplanning/avatars/user-abc123.webp'
      const result = extractPublicIdFromUrl(url)

      expect(result).toBe('smartplanning/avatars/user-abc123')
    })

    it('should handle different file formats', () => {
      const jpgUrl =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg'
      const pngUrl =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.png'

      expect(extractPublicIdFromUrl(jpgUrl)).toBe('folder/image')
      expect(extractPublicIdFromUrl(pngUrl)).toBe('folder/image')
    })

    it('should handle nested folders', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v1/a/b/c/image.webp'
      const result = extractPublicIdFromUrl(url)

      expect(result).toBe('a/b/c/image')
    })

    it('should return null for empty string', () => {
      expect(extractPublicIdFromUrl('')).toBeNull()
    })

    it('should return null for invalid URL without version', () => {
      const url = 'https://example.com/image.jpg'
      expect(extractPublicIdFromUrl(url)).toBeNull()
    })

    it('should handle URLs with transformations', () => {
      // URLs with transformations still have the version pattern
      const url =
        'https://res.cloudinary.com/demo/image/upload/c_fill,w_200/v1234567890/folder/image.webp'
      // This might not match our simple regex, but let's verify behavior
      const result = extractPublicIdFromUrl(url)
      expect(result).toBe('folder/image')
    })
  })

  describe('AVATAR_TRANSFORMATION', () => {
    it('should have correct dimensions', () => {
      expect(AVATAR_TRANSFORMATION.width).toBe(200)
      expect(AVATAR_TRANSFORMATION.height).toBe(200)
    })

    it('should use fill crop mode', () => {
      expect(AVATAR_TRANSFORMATION.crop).toBe('fill')
    })

    it('should use face gravity for smart cropping', () => {
      expect(AVATAR_TRANSFORMATION.gravity).toBe('face')
    })

    it('should output webp format', () => {
      expect(AVATAR_TRANSFORMATION.format).toBe('webp')
    })

    it('should use auto quality', () => {
      expect(AVATAR_TRANSFORMATION.quality).toBe('auto')
    })
  })
})
