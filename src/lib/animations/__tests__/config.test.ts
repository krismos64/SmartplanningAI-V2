/**
 * Tests unitaires - Animation Config
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect } from 'vitest'
import {
  durations,
  easings,
  springs,
  staggerConfig,
  reducedMotionDurations,
  transitions,
  animationConfig,
} from '../config'

describe('Animation Config', () => {
  describe('Durations', () => {
    it('should export all duration levels', () => {
      expect(durations.instant).toBeDefined()
      expect(durations.fast).toBeDefined()
      expect(durations.quick).toBeDefined()
      expect(durations.normal).toBeDefined()
      expect(durations.medium).toBeDefined()
      expect(durations.slow).toBeDefined()
      expect(durations.slower).toBeDefined()
      expect(durations.slowest).toBeDefined()
    })

    it('should have numeric values in seconds', () => {
      Object.values(durations).forEach((duration) => {
        expect(typeof duration).toBe('number')
        expect(duration).toBeGreaterThan(0)
        expect(duration).toBeLessThanOrEqual(1)
      })
    })

    it('should have increasing order', () => {
      expect(durations.instant).toBeLessThan(durations.fast)
      expect(durations.fast).toBeLessThan(durations.quick)
      expect(durations.quick).toBeLessThan(durations.normal)
      expect(durations.normal).toBeLessThan(durations.medium)
      expect(durations.medium).toBeLessThan(durations.slow)
      expect(durations.slow).toBeLessThan(durations.slower)
      expect(durations.slower).toBeLessThan(durations.slowest)
    })

    it('should have standard values', () => {
      expect(durations.fast).toBe(0.15)
      expect(durations.normal).toBe(0.3)
      expect(durations.slow).toBe(0.5)
    })
  })

  describe('Easings', () => {
    it('should export all easing curves', () => {
      expect(easings.easeOut).toBeDefined()
      expect(easings.easeInOut).toBeDefined()
      expect(easings.easeIn).toBeDefined()
      expect(easings.sharp).toBeDefined()
      expect(easings.linear).toBeDefined()
      expect(easings.anticipate).toBeDefined()
      expect(easings.overshoot).toBeDefined()
    })

    it('should have valid cubic-bezier arrays', () => {
      const bezierEasings = [
        easings.easeOut,
        easings.easeInOut,
        easings.easeIn,
        easings.sharp,
        easings.linear,
        easings.anticipate,
        easings.overshoot,
      ]

      bezierEasings.forEach((easing) => {
        expect(Array.isArray(easing)).toBe(true)
        expect(easing.length).toBe(4)
        easing.forEach((value) => {
          expect(typeof value).toBe('number')
        })
      })
    })

    it('should have Material Design standard values for easeOut', () => {
      expect(easings.easeOut).toEqual([0.0, 0.0, 0.2, 1])
    })

    it('should have linear as [0, 0, 1, 1]', () => {
      expect(easings.linear).toEqual([0, 0, 1, 1])
    })
  })

  describe('Springs', () => {
    it('should export all spring configurations', () => {
      expect(springs.gentle).toBeDefined()
      expect(springs.default).toBeDefined()
      expect(springs.snappy).toBeDefined()
      expect(springs.bouncy).toBeDefined()
      expect(springs.slow).toBeDefined()
      expect(springs.visualDuration).toBeDefined()
    })

    it('should have valid spring properties', () => {
      const standardSprings = [
        springs.gentle,
        springs.default,
        springs.snappy,
        springs.bouncy,
        springs.slow,
      ]

      standardSprings.forEach((spring) => {
        expect(spring.type).toBe('spring')
        expect(spring.stiffness).toBeGreaterThan(0)
        expect(spring.damping).toBeGreaterThan(0)
        expect(spring.mass).toBeGreaterThan(0)
      })
    })

    it('should have visualDuration spring with correct properties', () => {
      expect(springs.visualDuration.type).toBe('spring')
      expect(springs.visualDuration.visualDuration).toBeDefined()
      expect(springs.visualDuration.bounce).toBeDefined()
    })
  })

  describe('Stagger Config', () => {
    it('should export all stagger presets', () => {
      expect(staggerConfig.fast).toBeDefined()
      expect(staggerConfig.default).toBeDefined()
      expect(staggerConfig.slow).toBeDefined()
      expect(staggerConfig.reverse).toBeDefined()
    })

    it('should have staggerChildren and delayChildren', () => {
      expect(staggerConfig.default.staggerChildren).toBeDefined()
      expect(staggerConfig.default.delayChildren).toBeDefined()
    })

    it('should have reverse with staggerDirection -1', () => {
      expect(staggerConfig.reverse.staggerDirection).toBe(-1)
    })

    it('should have increasing stagger delays', () => {
      expect(staggerConfig.fast.staggerChildren).toBeLessThan(
        staggerConfig.default.staggerChildren
      )
      expect(staggerConfig.default.staggerChildren).toBeLessThan(
        staggerConfig.slow.staggerChildren
      )
    })
  })

  describe('Reduced Motion Durations', () => {
    it('should export matching duration keys', () => {
      const durationKeys = Object.keys(durations)
      const reducedKeys = Object.keys(reducedMotionDurations)

      durationKeys.forEach((key) => {
        expect(reducedKeys).toContain(key)
      })
    })

    it('should have reduced values compared to normal', () => {
      expect(reducedMotionDurations.normal).toBeLessThan(durations.normal)
      expect(reducedMotionDurations.slow).toBeLessThan(durations.slow)
    })

    it('should have instant and fast as 0', () => {
      expect(reducedMotionDurations.instant).toBe(0)
      expect(reducedMotionDurations.fast).toBe(0)
    })
  })

  describe('Transitions', () => {
    it('should export all transition presets', () => {
      expect(transitions.instant).toBeDefined()
      expect(transitions.fast).toBeDefined()
      expect(transitions.default).toBeDefined()
      expect(transitions.smooth).toBeDefined()
      expect(transitions.slow).toBeDefined()
      expect(transitions.spring).toBeDefined()
      expect(transitions.springGentle).toBeDefined()
      expect(transitions.springSnappy).toBeDefined()
    })

    it('should have duration and ease for tween transitions', () => {
      expect(transitions.default.duration).toBeDefined()
      expect(transitions.default.ease).toBeDefined()
    })

    it('should reference springs correctly', () => {
      expect(transitions.spring).toBe(springs.default)
      expect(transitions.springGentle).toBe(springs.gentle)
      expect(transitions.springSnappy).toBe(springs.snappy)
    })
  })

  describe('Animation Config Export', () => {
    it('should export all config categories', () => {
      expect(animationConfig.durations).toBe(durations)
      expect(animationConfig.easings).toBe(easings)
      expect(animationConfig.springs).toBe(springs)
      expect(animationConfig.staggerConfig).toBe(staggerConfig)
      expect(animationConfig.reducedMotionDurations).toBe(
        reducedMotionDurations
      )
      expect(animationConfig.transitions).toBe(transitions)
    })
  })
})
