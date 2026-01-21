/**
 * Tests unitaires - Design Tokens Couleurs
 *
 * @see SP-259 - Design Tokens
 */

import { describe, it, expect } from 'vitest'
import {
  primitiveColors,
  semanticColors,
  slate,
  blue,
  cyan,
  emerald,
  amber,
  rose,
  violet,
  semanticLight,
  semanticDark,
  withOpacity,
  toHslVar,
} from '../colors'

describe('Design Tokens - Colors', () => {
  describe('Primitive Colors', () => {
    it('should export all primitive color palettes', () => {
      expect(primitiveColors).toHaveProperty('slate')
      expect(primitiveColors).toHaveProperty('blue')
      expect(primitiveColors).toHaveProperty('cyan')
      expect(primitiveColors).toHaveProperty('emerald')
      expect(primitiveColors).toHaveProperty('amber')
      expect(primitiveColors).toHaveProperty('rose')
      expect(primitiveColors).toHaveProperty('violet')
    })

    it('should have all shade levels for each palette', () => {
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
      const palettes = [slate, blue, cyan, emerald, amber, rose, violet]

      palettes.forEach((palette) => {
        shades.forEach((shade) => {
          expect(palette).toHaveProperty(String(shade))
        })
      })
    })

    it('should have valid hex color format for all primitive colors', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/
      const palettes = [slate, blue, cyan, emerald, amber, rose, violet]

      palettes.forEach((palette) => {
        Object.values(palette).forEach((color) => {
          expect(color).toMatch(hexColorRegex)
        })
      })
    })

    it('should have correct SmartPlanning primary blue', () => {
      expect(blue[500]).toBe('#3b82f6')
    })

    it('should have correct accent cyan', () => {
      expect(cyan[500]).toBe('#06b6d4')
    })
  })

  describe('Semantic Colors - Light Mode', () => {
    it('should have all required semantic categories', () => {
      expect(semanticLight).toHaveProperty('background')
      expect(semanticLight).toHaveProperty('foreground')
      expect(semanticLight).toHaveProperty('primary')
      expect(semanticLight).toHaveProperty('secondary')
      expect(semanticLight).toHaveProperty('accent')
      expect(semanticLight).toHaveProperty('success')
      expect(semanticLight).toHaveProperty('warning')
      expect(semanticLight).toHaveProperty('destructive')
      expect(semanticLight).toHaveProperty('info')
      expect(semanticLight).toHaveProperty('card')
      expect(semanticLight).toHaveProperty('popover')
      expect(semanticLight).toHaveProperty('sidebar')
    })

    it('should have valid HSL format for semantic colors', () => {
      // HSL format: "h s% l%" or "h s l"
      const hslRegex = /^\d+(\.\d+)?\s+\d+(\.\d+)?%?\s+\d+(\.\d+)?%?$/

      expect(semanticLight.primary.DEFAULT).toMatch(hslRegex)
      expect(semanticLight.secondary.DEFAULT).toMatch(hslRegex)
      expect(semanticLight.accent.DEFAULT).toMatch(hslRegex)
    })

    it('should have hover and foreground variants for main colors', () => {
      const mainColors = [
        'primary',
        'secondary',
        'accent',
        'success',
        'warning',
        'destructive',
        'info',
      ]

      mainColors.forEach((color) => {
        const colorObj = semanticLight[color as keyof typeof semanticLight]
        if (typeof colorObj === 'object' && colorObj !== null) {
          expect(colorObj).toHaveProperty('DEFAULT')
          expect(colorObj).toHaveProperty('foreground')
        }
      })
    })
  })

  describe('Semantic Colors - Dark Mode', () => {
    it('should have all required semantic categories', () => {
      expect(semanticDark).toHaveProperty('background')
      expect(semanticDark).toHaveProperty('foreground')
      expect(semanticDark).toHaveProperty('primary')
      expect(semanticDark).toHaveProperty('secondary')
      expect(semanticDark).toHaveProperty('accent')
    })

    it('should have different values from light mode', () => {
      // Primary should be brighter in dark mode
      expect(semanticDark.primary.DEFAULT).not.toBe(
        semanticLight.primary.DEFAULT
      )
      expect(semanticDark.background.DEFAULT).not.toBe(
        semanticLight.background.DEFAULT
      )
    })
  })

  describe('Color Utilities', () => {
    it('withOpacity should return correct HSL with opacity', () => {
      const result = withOpacity('217 91% 60%', 0.5)
      expect(result).toBe('hsl(217 91% 60% / 0.5)')
    })

    it('withOpacity should handle different opacity values', () => {
      expect(withOpacity('0 0% 100%', 0)).toBe('hsl(0 0% 100% / 0)')
      expect(withOpacity('0 0% 100%', 1)).toBe('hsl(0 0% 100% / 1)')
      expect(withOpacity('0 0% 100%', 0.75)).toBe('hsl(0 0% 100% / 0.75)')
    })

    it('toHslVar should return correct CSS variable format', () => {
      const result = toHslVar('primary')
      expect(result).toBe('hsl(var(--primary))')
    })

    it('toHslVar should handle different variable names', () => {
      expect(toHslVar('background')).toBe('hsl(var(--background))')
      expect(toHslVar('accent-foreground')).toBe(
        'hsl(var(--accent-foreground))'
      )
    })
  })

  describe('Semantic Colors Export', () => {
    it('should export both light and dark themes', () => {
      expect(semanticColors).toHaveProperty('light')
      expect(semanticColors).toHaveProperty('dark')
      expect(semanticColors.light).toBe(semanticLight)
      expect(semanticColors.dark).toBe(semanticDark)
    })
  })
})
