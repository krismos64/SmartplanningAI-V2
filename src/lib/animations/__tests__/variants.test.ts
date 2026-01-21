/**
 * Tests unitaires - Animation Variants
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect } from 'vitest'
import {
  fadeVariants,
  fadeDelayedVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  scaleSpringVariants,
  popVariants,
  fadeSlideUpVariants,
  fadeScaleVariants,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemFade,
  staggerItemScale,
  pageTransitionFade,
  pageTransitionSlide,
  accordionVariants,
  overlayVariants,
  reducedMotionVariants,
  createSlideVariant,
  createScaleVariant,
  createStaggerContainer,
  variantsMap,
} from '../variants'

describe('Animation Variants', () => {
  describe('Fade Variants', () => {
    it('should have hidden, visible, and exit states', () => {
      expect(fadeVariants.hidden).toBeDefined()
      expect(fadeVariants.visible).toBeDefined()
      expect(fadeVariants.exit).toBeDefined()
    })

    it('should have opacity 0 for hidden', () => {
      expect(fadeVariants.hidden).toHaveProperty('opacity', 0)
    })

    it('should have opacity 1 for visible', () => {
      expect(fadeVariants.visible).toHaveProperty('opacity', 1)
    })

    it('should have transition for visible state', () => {
      expect(fadeVariants.visible).toHaveProperty('transition')
    })
  })

  describe('Fade Delayed Variants', () => {
    it('should support custom delay via function', () => {
      expect(typeof fadeDelayedVariants.visible).toBe('function')
    })
  })

  describe('Slide Variants', () => {
    it('should export all slide directions', () => {
      expect(slideUpVariants).toBeDefined()
      expect(slideDownVariants).toBeDefined()
      expect(slideLeftVariants).toBeDefined()
      expect(slideRightVariants).toBeDefined()
    })

    it('slideUp should have positive y offset when hidden', () => {
      expect(slideUpVariants.hidden).toHaveProperty('y')
      expect((slideUpVariants.hidden as { y: number }).y).toBeGreaterThan(0)
    })

    it('slideDown should have negative y offset when hidden', () => {
      expect(slideDownVariants.hidden).toHaveProperty('y')
      expect((slideDownVariants.hidden as { y: number }).y).toBeLessThan(0)
    })

    it('slideLeft should have positive x offset when hidden', () => {
      expect(slideLeftVariants.hidden).toHaveProperty('x')
      expect((slideLeftVariants.hidden as { x: number }).x).toBeGreaterThan(0)
    })

    it('slideRight should have negative x offset when hidden', () => {
      expect(slideRightVariants.hidden).toHaveProperty('x')
      expect((slideRightVariants.hidden as { x: number }).x).toBeLessThan(0)
    })

    it('all slides should reset to 0 when visible', () => {
      expect((slideUpVariants.visible as { y: number }).y).toBe(0)
      expect((slideDownVariants.visible as { y: number }).y).toBe(0)
      expect((slideLeftVariants.visible as { x: number }).x).toBe(0)
      expect((slideRightVariants.visible as { x: number }).x).toBe(0)
    })
  })

  describe('Scale Variants', () => {
    it('should have scale < 1 when hidden', () => {
      expect((scaleVariants.hidden as { scale: number }).scale).toBeLessThan(1)
    })

    it('should have scale = 1 when visible', () => {
      expect((scaleVariants.visible as { scale: number }).scale).toBe(1)
    })

    it('scaleSpring should use spring transition', () => {
      const transition = (scaleSpringVariants.visible as { transition: { type: string } }).transition
      expect(transition.type).toBe('spring')
    })

    it('pop should have smaller initial scale', () => {
      const popScale = (popVariants.hidden as { scale: number }).scale
      const normalScale = (scaleVariants.hidden as { scale: number }).scale
      expect(popScale).toBeLessThan(normalScale)
    })
  })

  describe('Combined Variants', () => {
    it('fadeSlideUp should combine opacity and y', () => {
      expect(fadeSlideUpVariants.hidden).toHaveProperty('opacity', 0)
      expect(fadeSlideUpVariants.hidden).toHaveProperty('y')
    })

    it('fadeScale should combine opacity and scale', () => {
      expect(fadeScaleVariants.hidden).toHaveProperty('opacity', 0)
      expect(fadeScaleVariants.hidden).toHaveProperty('scale')
    })
  })

  describe('Stagger Variants', () => {
    it('should export container variants', () => {
      expect(staggerContainer).toBeDefined()
      expect(staggerContainerFast).toBeDefined()
      expect(staggerContainerSlow).toBeDefined()
    })

    it('should export item variants', () => {
      expect(staggerItem).toBeDefined()
      expect(staggerItemFade).toBeDefined()
      expect(staggerItemScale).toBeDefined()
    })

    it('container visible should have staggerChildren', () => {
      const transition = (staggerContainer.visible as { transition: { staggerChildren: number } }).transition
      expect(transition.staggerChildren).toBeDefined()
    })

    it('container visible should use beforeChildren', () => {
      const transition = (staggerContainer.visible as { transition: { when: string } }).transition
      expect(transition.when).toBe('beforeChildren')
    })
  })

  describe('Page Transition Variants', () => {
    it('should export page transition variants', () => {
      expect(pageTransitionFade).toBeDefined()
      expect(pageTransitionSlide).toBeDefined()
    })

    it('page transitions should have all states', () => {
      expect(pageTransitionFade.hidden).toBeDefined()
      expect(pageTransitionFade.visible).toBeDefined()
      expect(pageTransitionFade.exit).toBeDefined()
    })
  })

  describe('Special Variants', () => {
    it('accordion should have height animation', () => {
      expect(accordionVariants.hidden).toHaveProperty('height', 0)
      expect(accordionVariants.visible).toHaveProperty('height', 'auto')
    })

    it('overlay should only animate opacity', () => {
      expect(overlayVariants.hidden).toHaveProperty('opacity', 0)
      expect(overlayVariants.visible).toHaveProperty('opacity', 1)
      expect(overlayVariants.hidden).not.toHaveProperty('y')
      expect(overlayVariants.hidden).not.toHaveProperty('scale')
    })
  })

  describe('Reduced Motion Variants', () => {
    it('should only use opacity', () => {
      expect(reducedMotionVariants.hidden).toHaveProperty('opacity', 0)
      expect(reducedMotionVariants.visible).toHaveProperty('opacity', 1)
      expect(reducedMotionVariants.hidden).not.toHaveProperty('y')
      expect(reducedMotionVariants.hidden).not.toHaveProperty('x')
      expect(reducedMotionVariants.hidden).not.toHaveProperty('scale')
    })

    it('should have fast transition', () => {
      const transition = (reducedMotionVariants.visible as { transition: { duration: number } }).transition
      expect(transition.duration).toBeLessThanOrEqual(0.1)
    })
  })

  describe('Factory Functions', () => {
    describe('createSlideVariant', () => {
      it('should create slide up variant', () => {
        const variant = createSlideVariant('up', 30)
        expect((variant.hidden as { y: number }).y).toBe(30)
        expect((variant.visible as { y: number }).y).toBe(0)
      })

      it('should create slide down variant', () => {
        const variant = createSlideVariant('down', 30)
        expect((variant.hidden as { y: number }).y).toBe(-30)
      })

      it('should create slide left variant', () => {
        const variant = createSlideVariant('left', 30)
        expect((variant.hidden as { x: number }).x).toBe(30)
      })

      it('should create slide right variant', () => {
        const variant = createSlideVariant('right', 30)
        expect((variant.hidden as { x: number }).x).toBe(-30)
      })
    })

    describe('createScaleVariant', () => {
      it('should create scale variant with custom from value', () => {
        const variant = createScaleVariant(0.8)
        expect((variant.hidden as { scale: number }).scale).toBe(0.8)
        expect((variant.visible as { scale: number }).scale).toBe(1)
      })
    })

    describe('createStaggerContainer', () => {
      it('should create container with custom stagger', () => {
        const variant = createStaggerContainer(0.2, 0.5)
        const transition = (variant.visible as { transition: { staggerChildren: number; delayChildren: number } }).transition
        expect(transition.staggerChildren).toBe(0.2)
        expect(transition.delayChildren).toBe(0.5)
      })
    })
  })

  describe('Variants Map', () => {
    it('should include all named variants', () => {
      expect(variantsMap.fade).toBe(fadeVariants)
      expect(variantsMap.slideUp).toBe(slideUpVariants)
      expect(variantsMap.slideDown).toBe(slideDownVariants)
      expect(variantsMap.slideLeft).toBe(slideLeftVariants)
      expect(variantsMap.slideRight).toBe(slideRightVariants)
      expect(variantsMap.scale).toBe(scaleVariants)
      expect(variantsMap.scaleSpring).toBe(scaleSpringVariants)
      expect(variantsMap.pop).toBe(popVariants)
      expect(variantsMap.fadeSlideUp).toBe(fadeSlideUpVariants)
      expect(variantsMap.fadeScale).toBe(fadeScaleVariants)
    })
  })
})
