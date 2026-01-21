/**
 * Tests unitaires - Design Tokens Typographie
 *
 * @see SP-259 - Design Tokens
 */

import { describe, it, expect } from 'vitest'
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  googleFontsConfig,
  typography,
} from '../typography'

describe('Design Tokens - Typography', () => {
  describe('Font Families', () => {
    it('should export all font family categories', () => {
      expect(fontFamily).toHaveProperty('display')
      expect(fontFamily).toHaveProperty('sans')
      expect(fontFamily).toHaveProperty('mono')
      expect(fontFamily).toHaveProperty('serif')
    })

    it('should have Rajdhani as display font', () => {
      expect(fontFamily.display[0]).toBe('Rajdhani')
    })

    it('should have Plus Jakarta Sans as sans font', () => {
      expect(fontFamily.sans[0]).toBe('Plus Jakarta Sans')
    })

    it('should have JetBrains Mono as mono font', () => {
      expect(fontFamily.mono[0]).toBe('JetBrains Mono')
    })

    it('should have fallback fonts for each family', () => {
      Object.values(fontFamily).forEach((family) => {
        expect(family.length).toBeGreaterThan(1)
      })
    })
  })

  describe('Font Sizes', () => {
    it('should export all size levels', () => {
      const sizes = [
        'xs',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
        '8xl',
        '9xl',
      ]
      sizes.forEach((size) => {
        expect(fontSize).toHaveProperty(size)
      })
    })

    it('should have size, lineHeight, and letterSpacing for each level', () => {
      Object.values(fontSize).forEach((sizeObj) => {
        expect(sizeObj).toHaveProperty('size')
        expect(sizeObj).toHaveProperty('lineHeight')
        expect(sizeObj).toHaveProperty('letterSpacing')
      })
    })

    it('should have valid rem values for sizes', () => {
      const remRegex = /^\d+(\.\d+)?rem$/
      Object.values(fontSize).forEach((sizeObj) => {
        expect(sizeObj.size).toMatch(remRegex)
      })
    })

    it('should follow a logical size progression', () => {
      const sizeValues = [
        parseFloat(fontSize.xs.size),
        parseFloat(fontSize.sm.size),
        parseFloat(fontSize.base.size),
        parseFloat(fontSize.lg.size),
        parseFloat(fontSize.xl.size),
      ]

      for (let i = 1; i < sizeValues.length; i++) {
        expect(sizeValues[i]!).toBeGreaterThan(sizeValues[i - 1]!)
      }
    })

    it('should have base size of 1rem', () => {
      expect(fontSize.base.size).toBe('1rem')
    })
  })

  describe('Font Weights', () => {
    it('should export all weight levels', () => {
      const weights = [
        'thin',
        'extralight',
        'light',
        'normal',
        'medium',
        'semibold',
        'bold',
        'extrabold',
        'black',
      ]
      weights.forEach((weight) => {
        expect(fontWeight).toHaveProperty(weight)
      })
    })

    it('should have valid numeric string values', () => {
      Object.values(fontWeight).forEach((weight) => {
        expect(parseInt(weight)).toBeGreaterThanOrEqual(100)
        expect(parseInt(weight)).toBeLessThanOrEqual(900)
      })
    })

    it('should have correct standard values', () => {
      expect(fontWeight.normal).toBe('400')
      expect(fontWeight.medium).toBe('500')
      expect(fontWeight.bold).toBe('700')
    })
  })

  describe('Line Heights', () => {
    it('should export all line height levels', () => {
      expect(lineHeight).toHaveProperty('none')
      expect(lineHeight).toHaveProperty('tight')
      expect(lineHeight).toHaveProperty('snug')
      expect(lineHeight).toHaveProperty('normal')
      expect(lineHeight).toHaveProperty('relaxed')
      expect(lineHeight).toHaveProperty('loose')
    })

    it('should have numeric string values', () => {
      Object.values(lineHeight).forEach((lh) => {
        expect(parseFloat(lh)).toBeGreaterThan(0)
      })
    })

    it('should have correct standard values', () => {
      expect(lineHeight.none).toBe('1')
      expect(lineHeight.normal).toBe('1.5')
    })
  })

  describe('Letter Spacing', () => {
    it('should export all letter spacing levels', () => {
      expect(letterSpacing).toHaveProperty('tighter')
      expect(letterSpacing).toHaveProperty('tight')
      expect(letterSpacing).toHaveProperty('normal')
      expect(letterSpacing).toHaveProperty('wide')
      expect(letterSpacing).toHaveProperty('wider')
      expect(letterSpacing).toHaveProperty('widest')
    })

    it('should have valid em values', () => {
      const emRegex = /^-?\d+(\.\d+)?em$/
      Object.entries(letterSpacing).forEach(([key, value]) => {
        if (key !== 'normal') {
          expect(value).toMatch(emRegex)
        }
      })
    })

    it('should have 0 for normal', () => {
      expect(letterSpacing.normal).toBe('0')
    })
  })

  describe('Text Styles', () => {
    it('should export all text style presets', () => {
      const styles = [
        'displayLarge',
        'displayMedium',
        'displaySmall',
        'h1',
        'h2',
        'h3',
        'h4',
        'bodyLarge',
        'bodyBase',
        'bodySmall',
        'label',
        'caption',
        'overline',
        'code',
        'codeBlock',
        'buttonLarge',
        'buttonBase',
        'buttonSmall',
      ]
      styles.forEach((style) => {
        expect(textStyles).toHaveProperty(style)
      })
    })

    it('should have complete style definitions', () => {
      Object.values(textStyles).forEach((style) => {
        expect(style).toHaveProperty('fontFamily')
        expect(style).toHaveProperty('fontSize')
        expect(style).toHaveProperty('lineHeight')
        expect(style).toHaveProperty('fontWeight')
      })
    })

    it('should use display font for headings', () => {
      expect(textStyles.h1.fontFamily).toBe(fontFamily.display)
      expect(textStyles.h2.fontFamily).toBe(fontFamily.display)
      expect(textStyles.displayLarge.fontFamily).toBe(fontFamily.display)
    })

    it('should use sans font for body text', () => {
      expect(textStyles.bodyBase.fontFamily).toBe(fontFamily.sans)
      expect(textStyles.bodySmall.fontFamily).toBe(fontFamily.sans)
    })

    it('should use mono font for code', () => {
      expect(textStyles.code.fontFamily).toBe(fontFamily.mono)
      expect(textStyles.codeBlock.fontFamily).toBe(fontFamily.mono)
    })
  })

  describe('Google Fonts Config', () => {
    it('should have configuration for all custom fonts', () => {
      expect(googleFontsConfig).toHaveProperty('rajdhani')
      expect(googleFontsConfig).toHaveProperty('plusJakartaSans')
      expect(googleFontsConfig).toHaveProperty('jetbrainsMono')
    })

    it('should have required properties for each font config', () => {
      Object.values(googleFontsConfig).forEach((config) => {
        expect(config).toHaveProperty('family')
        expect(config).toHaveProperty('weights')
        expect(config).toHaveProperty('subsets')
        expect(config).toHaveProperty('display')
      })
    })

    it('should include latin subset for all fonts', () => {
      Object.values(googleFontsConfig).forEach((config) => {
        expect(config.subsets).toContain('latin')
      })
    })
  })

  describe('Typography Export', () => {
    it('should export all typography categories', () => {
      expect(typography).toHaveProperty('fontFamily')
      expect(typography).toHaveProperty('fontSize')
      expect(typography).toHaveProperty('fontWeight')
      expect(typography).toHaveProperty('lineHeight')
      expect(typography).toHaveProperty('letterSpacing')
      expect(typography).toHaveProperty('textStyles')
      expect(typography).toHaveProperty('googleFontsConfig')
    })
  })
})
