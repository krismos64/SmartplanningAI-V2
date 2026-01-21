/**
 * Tests d'intégration - Design Tokens
 *
 * Vérifie l'export global et la cohérence du système de tokens
 *
 * @see SP-259 - Design Tokens
 */

import { describe, it, expect } from 'vitest'
import {
  tokens,
  utils,
  tailwindTheme,
  cssVariablesLight,
  cssVariablesDark,
  // Re-exports
  colors,
  typography,
  spacing,
  shadows,
  radius,
} from '../index'

describe('Design Tokens - Integration', () => {
  describe('Main Tokens Export', () => {
    it('should export colors category', () => {
      expect(tokens.colors).toBeDefined()
      expect(tokens.colors.primitive).toBeDefined()
      expect(tokens.colors.semantic).toBeDefined()
      expect(tokens.colors.blue).toBeDefined()
    })

    it('should export typography category', () => {
      expect(tokens.typography).toBeDefined()
      expect(tokens.typography.fontFamily).toBeDefined()
      expect(tokens.typography.fontSize).toBeDefined()
      expect(tokens.typography.textStyles).toBeDefined()
    })

    it('should export spacing category', () => {
      expect(tokens.spacing).toBeDefined()
      expect(tokens.spacing.scale).toBeDefined()
      expect(tokens.spacing.semantic).toBeDefined()
      expect(tokens.spacing.sizes).toBeDefined()
    })

    it('should export shadows category', () => {
      expect(tokens.shadows).toBeDefined()
      expect(tokens.shadows.boxShadow).toBeDefined()
      expect(tokens.shadows.dropShadow).toBeDefined()
      expect(tokens.shadows.glow).toBeDefined()
    })

    it('should export radius category', () => {
      expect(tokens.radius).toBeDefined()
      expect(tokens.radius.scale).toBeDefined()
      expect(tokens.radius.semantic).toBeDefined()
    })
  })

  describe('Utils Export', () => {
    it('should export withOpacity utility', () => {
      expect(utils.withOpacity).toBeTypeOf('function')
      expect(utils.withOpacity('217 91% 60%', 0.5)).toBe(
        'hsl(217 91% 60% / 0.5)'
      )
    })

    it('should export toHslVar utility', () => {
      expect(utils.toHslVar).toBeTypeOf('function')
      expect(utils.toHslVar('primary')).toBe('hsl(var(--primary))')
    })

    it('should export cssVar utility', () => {
      expect(utils.cssVar).toBeTypeOf('function')
      expect(utils.cssVar('primary')).toBe('var(--primary)')
    })

    it('should export hslVar utility', () => {
      expect(utils.hslVar).toBeTypeOf('function')
      expect(utils.hslVar('background')).toBe('hsl(var(--background))')
    })
  })

  describe('Tailwind Theme Export', () => {
    it('should export colors for Tailwind', () => {
      expect(tailwindTheme.colors).toBeDefined()
      expect(tailwindTheme.colors.blue).toBeDefined()
      expect(tailwindTheme.colors.slate).toBeDefined()
    })

    it('should export fontFamily for Tailwind', () => {
      expect(tailwindTheme.fontFamily).toBeDefined()
      expect(tailwindTheme.fontFamily.display).toBeDefined()
      expect(tailwindTheme.fontFamily.sans).toBeDefined()
    })

    it('should export fontSize for Tailwind', () => {
      expect(tailwindTheme.fontSize).toBeDefined()
      expect(tailwindTheme.fontSize.base).toBeDefined()
    })

    it('should export spacing for Tailwind', () => {
      expect(tailwindTheme.spacing).toBeDefined()
    })

    it('should export borderRadius for Tailwind', () => {
      expect(tailwindTheme.borderRadius).toBeDefined()
    })

    it('should export boxShadow for Tailwind', () => {
      expect(tailwindTheme.boxShadow).toBeDefined()
    })
  })

  describe('CSS Variables Export', () => {
    it('should export light mode variables', () => {
      expect(cssVariablesLight).toBeDefined()
      expect(cssVariablesLight.primary).toBeDefined()
      expect(cssVariablesLight.background).toBeDefined()
    })

    it('should export dark mode variables', () => {
      expect(cssVariablesDark).toBeDefined()
      expect(cssVariablesDark.primary).toBeDefined()
      expect(cssVariablesDark.background).toBeDefined()
    })

    it('should have different values for light and dark', () => {
      expect(cssVariablesLight.background.DEFAULT).not.toBe(
        cssVariablesDark.background.DEFAULT
      )
    })
  })

  describe('Module Re-exports', () => {
    it('should re-export colors module', () => {
      expect(colors).toBeDefined()
      expect(colors.primitive).toBeDefined()
    })

    it('should re-export typography module', () => {
      expect(typography).toBeDefined()
      expect(typography.fontFamily).toBeDefined()
    })

    it('should re-export spacing module', () => {
      expect(spacing).toBeDefined()
    })

    it('should re-export shadows module', () => {
      expect(shadows).toBeDefined()
      expect(shadows.boxShadow).toBeDefined()
    })

    it('should re-export radius module', () => {
      expect(radius).toBeDefined()
      expect(radius.borderRadius).toBeDefined()
    })
  })

  describe('Token Consistency', () => {
    it('should have consistent primary color across tokens', () => {
      // The primary blue should be consistent
      expect(tokens.colors.blue[500]).toBe('#3b82f6')
    })

    it('should have consistent spacing base unit', () => {
      // 4px base unit
      expect(tokens.spacing.scale[1]).toBe('0.25rem')
      expect(tokens.spacing.scale[4]).toBe('1rem')
    })

    it('should have consistent border radius default', () => {
      expect(tokens.radius.scale.DEFAULT).toBe('0.5rem')
    })

    it('should have matching light/dark semantic structures', () => {
      const lightKeys = Object.keys(cssVariablesLight)
      const darkKeys = Object.keys(cssVariablesDark)

      lightKeys.forEach((key) => {
        expect(darkKeys).toContain(key)
      })
    })
  })

  describe('Type Safety', () => {
    it('should have tokens object defined', () => {
      // Tokens object should be fully defined and immutable via TypeScript
      // Note: `as const` provides compile-time immutability, not runtime
      expect(tokens).toBeDefined()
      expect(typeof tokens).toBe('object')
      expect(tokens.colors.blue[500]).toBe('#3b82f6')
    })
  })
})
