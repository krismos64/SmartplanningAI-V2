/**
 * Tests unitaires - Design Tokens Espacements
 *
 * @see SP-259 - Design Tokens
 */

import { describe, it, expect } from 'vitest'
import {
  spacing,
  semanticSpacing,
  sizes,
  containerWidths,
  breakpoints,
  spacingTokens,
} from '../spacing'

describe('Design Tokens - Spacing', () => {
  describe('Spacing Scale', () => {
    it('should export all standard spacing values', () => {
      const standardKeys = [
        'px',
        0,
        0.5,
        1,
        1.5,
        2,
        2.5,
        3,
        3.5,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
      ]
      standardKeys.forEach((key) => {
        expect(spacing).toHaveProperty(String(key))
      })
    })

    it('should export large spacing values', () => {
      const largeKeys = [14, 16, 20, 24, 28, 32, 36, 40, 44, 48]
      largeKeys.forEach((key) => {
        expect(spacing).toHaveProperty(String(key))
      })
    })

    it('should export extra large spacing values', () => {
      const extraLargeKeys = [52, 56, 60, 64, 72, 80, 96]
      extraLargeKeys.forEach((key) => {
        expect(spacing).toHaveProperty(String(key))
      })
    })

    it('should have valid rem values', () => {
      const remRegex = /^\d+(\.\d+)?rem$/
      Object.entries(spacing).forEach(([key, value]) => {
        if (key !== 'px' && key !== '0') {
          expect(value).toMatch(remRegex)
        }
      })
    })

    it('should have 0 and px as special values', () => {
      expect(spacing[0]).toBe('0')
      expect(spacing.px).toBe('1px')
    })

    it('should follow 4px base unit progression', () => {
      expect(spacing[1]).toBe('0.25rem') // 4px
      expect(spacing[2]).toBe('0.5rem') // 8px
      expect(spacing[4]).toBe('1rem') // 16px
      expect(spacing[8]).toBe('2rem') // 32px
    })
  })

  describe('Semantic Spacing', () => {
    it('should export component spacing', () => {
      expect(semanticSpacing.component).toHaveProperty('xs')
      expect(semanticSpacing.component).toHaveProperty('sm')
      expect(semanticSpacing.component).toHaveProperty('md')
      expect(semanticSpacing.component).toHaveProperty('lg')
      expect(semanticSpacing.component).toHaveProperty('xl')
    })

    it('should export gap spacing', () => {
      expect(semanticSpacing.gap).toHaveProperty('xs')
      expect(semanticSpacing.gap).toHaveProperty('sm')
      expect(semanticSpacing.gap).toHaveProperty('md')
      expect(semanticSpacing.gap).toHaveProperty('lg')
      expect(semanticSpacing.gap).toHaveProperty('xl')
    })

    it('should export section spacing', () => {
      expect(semanticSpacing.section).toHaveProperty('sm')
      expect(semanticSpacing.section).toHaveProperty('md')
      expect(semanticSpacing.section).toHaveProperty('lg')
      expect(semanticSpacing.section).toHaveProperty('xl')
    })

    it('should export form spacing', () => {
      expect(semanticSpacing.form).toHaveProperty('labelGap')
      expect(semanticSpacing.form).toHaveProperty('inputPadding')
      expect(semanticSpacing.form).toHaveProperty('fieldGap')
      expect(semanticSpacing.form).toHaveProperty('groupGap')
    })

    it('should export card spacing', () => {
      expect(semanticSpacing.card).toHaveProperty('padding')
      expect(semanticSpacing.card).toHaveProperty('gap')
    })

    it('should export modal spacing', () => {
      expect(semanticSpacing.modal).toHaveProperty('padding')
      expect(semanticSpacing.modal).toHaveProperty('headerGap')
      expect(semanticSpacing.modal).toHaveProperty('footerGap')
    })

    it('should use values from spacing scale', () => {
      expect(semanticSpacing.component.md).toBe(spacing[3])
      expect(semanticSpacing.gap.md).toBe(spacing[4])
    })
  })

  describe('Sizes', () => {
    it('should export icon sizes', () => {
      expect(sizes.icon).toHaveProperty('xs')
      expect(sizes.icon).toHaveProperty('sm')
      expect(sizes.icon).toHaveProperty('md')
      expect(sizes.icon).toHaveProperty('lg')
      expect(sizes.icon).toHaveProperty('xl')
    })

    it('should export avatar sizes', () => {
      expect(sizes.avatar).toHaveProperty('xs')
      expect(sizes.avatar).toHaveProperty('sm')
      expect(sizes.avatar).toHaveProperty('md')
      expect(sizes.avatar).toHaveProperty('lg')
      expect(sizes.avatar).toHaveProperty('xl')
    })

    it('should export button sizes', () => {
      expect(sizes.button).toHaveProperty('xs')
      expect(sizes.button).toHaveProperty('sm')
      expect(sizes.button).toHaveProperty('md')
      expect(sizes.button).toHaveProperty('lg')
    })

    it('should export input sizes', () => {
      expect(sizes.input).toHaveProperty('sm')
      expect(sizes.input).toHaveProperty('md')
      expect(sizes.input).toHaveProperty('lg')
    })

    it('should export sidebar sizes', () => {
      expect(sizes.sidebar).toHaveProperty('collapsed')
      expect(sizes.sidebar).toHaveProperty('expanded')
    })

    it('should have valid rem values for sizes', () => {
      const remRegex = /^\d+(\.\d+)?rem$/
      expect(sizes.icon.md).toMatch(remRegex)
      expect(sizes.avatar.lg).toMatch(remRegex)
      expect(sizes.button.md).toMatch(remRegex)
    })
  })

  describe('Container Widths', () => {
    it('should export all container width levels', () => {
      const levels = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
      ]
      levels.forEach((level) => {
        expect(containerWidths).toHaveProperty(level)
      })
    })

    it('should export special container values', () => {
      expect(containerWidths).toHaveProperty('full')
      expect(containerWidths).toHaveProperty('screen')
    })

    it('should have valid rem values', () => {
      const remRegex = /^\d+(\.\d+)?rem$/
      expect(containerWidths.lg).toMatch(remRegex)
      expect(containerWidths['7xl']).toMatch(remRegex)
    })

    it('should have correct special values', () => {
      expect(containerWidths.full).toBe('100%')
      expect(containerWidths.screen).toBe('100vw')
    })
  })

  describe('Breakpoints', () => {
    it('should export all breakpoint levels', () => {
      expect(breakpoints).toHaveProperty('sm')
      expect(breakpoints).toHaveProperty('md')
      expect(breakpoints).toHaveProperty('lg')
      expect(breakpoints).toHaveProperty('xl')
      expect(breakpoints).toHaveProperty('2xl')
    })

    it('should have valid px values', () => {
      const pxRegex = /^\d+px$/
      Object.values(breakpoints).forEach((bp) => {
        expect(bp).toMatch(pxRegex)
      })
    })

    it('should follow standard Tailwind breakpoints', () => {
      expect(breakpoints.sm).toBe('640px')
      expect(breakpoints.md).toBe('768px')
      expect(breakpoints.lg).toBe('1024px')
      expect(breakpoints.xl).toBe('1280px')
      expect(breakpoints['2xl']).toBe('1536px')
    })

    it('should have ascending order', () => {
      const values = Object.values(breakpoints).map((bp) => parseInt(bp))
      for (let i = 1; i < values.length; i++) {
        expect(values[i]!).toBeGreaterThan(values[i - 1]!)
      }
    })
  })

  describe('Spacing Tokens Export', () => {
    it('should export all spacing categories', () => {
      expect(spacingTokens).toHaveProperty('spacing')
      expect(spacingTokens).toHaveProperty('semantic')
      expect(spacingTokens).toHaveProperty('sizes')
      expect(spacingTokens).toHaveProperty('containerWidths')
      expect(spacingTokens).toHaveProperty('breakpoints')
    })
  })
})
