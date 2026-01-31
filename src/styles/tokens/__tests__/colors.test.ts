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
  glowColors,
  gradients,
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

  describe('Glow Colors - Cyber Glass 3D', () => {
    const glowColorNames = ['cyan', 'blue', 'violet', 'emerald', 'amber', 'rose']
    const intensityLevels = ['light', 'medium', 'strong', 'intense']

    it('should export all glow color palettes', () => {
      glowColorNames.forEach((color) => {
        expect(glowColors).toHaveProperty(color)
      })
    })

    it('should have all intensity levels for each glow color', () => {
      glowColorNames.forEach((colorName) => {
        const color = glowColors[colorName as keyof typeof glowColors]
        intensityLevels.forEach((intensity) => {
          expect(color).toHaveProperty(intensity)
        })
      })
    })

    it('should have valid rgba format for all glow colors', () => {
      const rgbaRegex = /^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/

      glowColorNames.forEach((colorName) => {
        const color = glowColors[colorName as keyof typeof glowColors]
        Object.values(color).forEach((value) => {
          expect(value).toMatch(rgbaRegex)
        })
      })
    })

    it('should have increasing opacity for intensity levels', () => {
      const extractOpacity = (rgba: string): number => {
        const match = rgba.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/)
        return match && match[1] ? parseFloat(match[1]) : 0
      }

      glowColorNames.forEach((colorName) => {
        const color = glowColors[colorName as keyof typeof glowColors]
        const lightOpacity = extractOpacity(color.light)
        const mediumOpacity = extractOpacity(color.medium)
        const strongOpacity = extractOpacity(color.strong)
        const intenseOpacity = extractOpacity(color.intense)

        expect(lightOpacity).toBeLessThan(mediumOpacity)
        expect(mediumOpacity).toBeLessThan(strongOpacity)
        expect(strongOpacity).toBeLessThan(intenseOpacity)
      })
    })

    it('should have correct cyan glow values', () => {
      expect(glowColors.cyan.light).toBe('rgba(6, 182, 212, 0.15)')
      expect(glowColors.cyan.intense).toBe('rgba(6, 182, 212, 0.7)')
    })

    it('should have correct blue glow values', () => {
      expect(glowColors.blue.light).toBe('rgba(59, 130, 246, 0.15)')
      expect(glowColors.blue.intense).toBe('rgba(59, 130, 246, 0.7)')
    })
  })

  describe('Gradients - Cyber Glass 3D', () => {
    const gradientNames = [
      'primary',
      'cardShine',
      'sidebarGlow',
      'meshDark',
      'meshLight',
      'textPrimary',
      'borderAnimated',
    ]

    it('should export all gradient definitions', () => {
      gradientNames.forEach((name) => {
        expect(gradients).toHaveProperty(name)
      })
    })

    it('should have valid CSS gradient format', () => {
      // All gradients should contain 'gradient' keyword
      Object.values(gradients).forEach((value) => {
        expect(value).toContain('gradient')
      })
    })

    it('primary gradient should use SmartPlanning brand colors', () => {
      // Primary should include blue (#3B82F6), violet (#8B5CF6), and cyan (#06B6D4)
      expect(gradients.primary).toContain('#3B82F6')
      expect(gradients.primary).toContain('#8B5CF6')
      expect(gradients.primary).toContain('#06B6D4')
    })

    it('cardShine gradient should be semi-transparent', () => {
      expect(gradients.cardShine).toContain('rgba')
      expect(gradients.cardShine).toContain('linear-gradient')
    })

    it('sidebarGlow should be a radial gradient', () => {
      expect(gradients.sidebarGlow).toContain('radial-gradient')
    })

    it('mesh gradients should contain multiple radial gradients', () => {
      expect(gradients.meshDark).toContain('radial-gradient')
      expect(gradients.meshLight).toContain('radial-gradient')
    })

    it('borderAnimated should use conic-gradient for rotation effect', () => {
      expect(gradients.borderAnimated).toContain('conic-gradient')
      expect(gradients.borderAnimated).toContain('--gradient-angle')
    })

    it('textPrimary should be a linear gradient for text effect', () => {
      expect(gradients.textPrimary).toContain('linear-gradient')
    })
  })
})
