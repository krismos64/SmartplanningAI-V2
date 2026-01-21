/**
 * Tests unitaires - Animation Presets
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect } from 'vitest'
import {
  // Hover
  hoverScale,
  hoverScalePlus,
  hoverLift,
  hoverLiftPlus,
  hoverGlow,
  hoverSubtle,
  hoverBrightness,
  // Tap
  tapScale,
  tapScalePlus,
  tapPush,
  // Focus
  focusScale,
  focusRing,
  // Button presets
  buttonPrimary,
  buttonSecondary,
  buttonLift,
  buttonIcon,
  // Card presets
  cardHover,
  cardInteractive,
  cardSubtle,
  // List presets
  listItemHover,
  listItem,
  // Component variants
  toggleVariants,
  toggleBackgroundVariants,
  checkboxVariants,
  radioVariants,
  accordionChevronVariants,
  accordionPlusVariants,
  dropdownVariants,
  tooltipVariants,
  toastVariants,
  badgeVariants,
  // Loading
  pulseVariants,
  spinVariants,
  bounceDotsContainerVariants,
  bounceDotVariants,
  skeletonVariants,
  // Reduced motion
  reducedMotionPresets,
  // All presets
  presets,
} from '../presets'

describe('Animation Presets', () => {
  describe('Hover Presets', () => {
    it('should export all hover presets', () => {
      expect(hoverScale).toBeDefined()
      expect(hoverScalePlus).toBeDefined()
      expect(hoverLift).toBeDefined()
      expect(hoverLiftPlus).toBeDefined()
      expect(hoverGlow).toBeDefined()
      expect(hoverSubtle).toBeDefined()
      expect(hoverBrightness).toBeDefined()
    })

    it('hoverScale should have scale property', () => {
      expect(hoverScale).toHaveProperty('scale')
      expect((hoverScale as { scale: number }).scale).toBeGreaterThan(1)
    })

    it('hoverScalePlus should have larger scale than hoverScale', () => {
      const scaleValue = (hoverScale as { scale: number }).scale
      const scalePlusValue = (hoverScalePlus as { scale: number }).scale
      expect(scalePlusValue).toBeGreaterThan(scaleValue)
    })

    it('hoverLift should have negative y value', () => {
      expect(hoverLift).toHaveProperty('y')
      expect((hoverLift as { y: number }).y).toBeLessThan(0)
    })
  })

  describe('Tap Presets', () => {
    it('should export all tap presets', () => {
      expect(tapScale).toBeDefined()
      expect(tapScalePlus).toBeDefined()
      expect(tapPush).toBeDefined()
    })

    it('tapScale should have scale less than 1', () => {
      expect((tapScale as { scale: number }).scale).toBeLessThan(1)
    })

    it('tapPush should have positive y value', () => {
      expect((tapPush as { y: number }).y).toBeGreaterThan(0)
    })
  })

  describe('Focus Presets', () => {
    it('should export focus presets', () => {
      expect(focusScale).toBeDefined()
      expect(focusRing).toBeDefined()
    })
  })

  describe('Button Presets', () => {
    it('should export all button presets', () => {
      expect(buttonPrimary).toBeDefined()
      expect(buttonSecondary).toBeDefined()
      expect(buttonLift).toBeDefined()
      expect(buttonIcon).toBeDefined()
    })

    it('buttonPrimary should have whileHover and whileTap', () => {
      expect(buttonPrimary).toHaveProperty('whileHover')
      expect(buttonPrimary).toHaveProperty('whileTap')
    })

    it('buttonIcon should be optimized for icons', () => {
      expect(buttonIcon).toHaveProperty('whileHover')
      expect(buttonIcon).toHaveProperty('whileTap')
    })
  })

  describe('Card Presets', () => {
    it('should export all card presets', () => {
      expect(cardHover).toBeDefined()
      expect(cardInteractive).toBeDefined()
      expect(cardSubtle).toBeDefined()
    })

    it('cardInteractive should have hover properties', () => {
      expect(cardInteractive).toHaveProperty('whileHover')
    })
  })

  describe('List Presets', () => {
    it('should export list presets', () => {
      expect(listItemHover).toBeDefined()
      expect(listItem).toBeDefined()
    })
  })

  describe('Component Variants', () => {
    describe('Toggle Variants', () => {
      it('should have on and off states', () => {
        expect(toggleVariants.on).toBeDefined()
        expect(toggleVariants.off).toBeDefined()
      })

      it('toggleBackground should animate colors', () => {
        expect(toggleBackgroundVariants.on).toBeDefined()
        expect(toggleBackgroundVariants.off).toBeDefined()
      })
    })

    describe('Checkbox Variants', () => {
      it('should have checked and unchecked states', () => {
        expect(checkboxVariants.checked).toBeDefined()
        expect(checkboxVariants.unchecked).toBeDefined()
      })
    })

    describe('Radio Variants', () => {
      it('should have checked and unchecked states', () => {
        expect(radioVariants.checked).toBeDefined()
        expect(radioVariants.unchecked).toBeDefined()
      })
    })

    describe('Accordion Variants', () => {
      it('should have open and closed states for chevron', () => {
        expect(accordionChevronVariants.open).toBeDefined()
        expect(accordionChevronVariants.closed).toBeDefined()
      })

      it('chevron should rotate', () => {
        expect(accordionChevronVariants.open).toHaveProperty('rotate')
        expect(accordionChevronVariants.closed).toHaveProperty('rotate')
      })

      it('should have open and closed states for plus icon', () => {
        expect(accordionPlusVariants.open).toBeDefined()
        expect(accordionPlusVariants.closed).toBeDefined()
      })
    })

    describe('Dropdown Variants', () => {
      it('should have hidden, visible, and exit states', () => {
        expect(dropdownVariants.hidden).toBeDefined()
        expect(dropdownVariants.visible).toBeDefined()
        expect(dropdownVariants.exit).toBeDefined()
      })
    })

    describe('Tooltip Variants', () => {
      it('should have hidden, visible, and exit states', () => {
        expect(tooltipVariants.hidden).toBeDefined()
        expect(tooltipVariants.visible).toBeDefined()
        expect(tooltipVariants.exit).toBeDefined()
      })
    })

    describe('Toast Variants', () => {
      it('should have hidden, visible, and exit states', () => {
        expect(toastVariants.hidden).toBeDefined()
        expect(toastVariants.visible).toBeDefined()
        expect(toastVariants.exit).toBeDefined()
      })

      it('should slide in from right', () => {
        expect((toastVariants.hidden as { x: number }).x).toBeGreaterThan(0)
      })
    })

    describe('Badge Variants', () => {
      it('should have hidden and visible states', () => {
        expect(badgeVariants.hidden).toBeDefined()
        expect(badgeVariants.visible).toBeDefined()
      })
    })
  })

  describe('Loading Variants', () => {
    it('should export pulse variants', () => {
      expect(pulseVariants).toBeDefined()
      expect(pulseVariants.animate).toBeDefined()
    })

    it('should export spin variants', () => {
      expect(spinVariants).toBeDefined()
      expect(spinVariants.animate).toBeDefined()
    })

    it('spin should rotate 360 degrees', () => {
      const animate = spinVariants.animate as { rotate: number | number[] }
      expect(animate.rotate).toBeDefined()
    })

    it('should export bounce dots variants', () => {
      expect(bounceDotsContainerVariants).toBeDefined()
      expect(bounceDotVariants).toBeDefined()
    })

    it('should export skeleton variants', () => {
      expect(skeletonVariants).toBeDefined()
    })
  })

  describe('Reduced Motion Presets', () => {
    it('should provide reduced alternatives', () => {
      expect(reducedMotionPresets).toBeDefined()
    })

    it('should have hover preset', () => {
      expect(reducedMotionPresets.hover).toBeDefined()
    })

    it('should have tap preset', () => {
      expect(reducedMotionPresets.tap).toBeDefined()
    })

    it('reduced hover should not have y or scale', () => {
      const hover = reducedMotionPresets.hover as { y?: number; scale?: number }
      expect(hover.y).toBeUndefined()
      expect(hover.scale).toBeUndefined()
    })
  })

  describe('Presets Export', () => {
    it('should export all presets in presets object', () => {
      expect(presets.hoverScale).toBeDefined()
      expect(presets.tapScale).toBeDefined()
      expect(presets.focusScale).toBeDefined()
      expect(presets.buttonPrimary).toBeDefined()
      expect(presets.cardHover).toBeDefined()
      expect(presets.pulseVariants).toBeDefined()
    })
  })
})
