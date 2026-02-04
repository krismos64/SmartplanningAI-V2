/**
 * Tests unitaires pour notification-categories helper
 *
 * @ticket SP-275
 */

import { describe, it, expect } from 'vitest'
import {
  NOTIFICATION_TYPE_TO_CATEGORY,
  getNotificationCategory,
  NOTIFICATION_CATEGORY_DESCRIPTIONS,
  NOTIFICATION_CATEGORY_COLORS,
} from '../notification-categories'

describe('notification-categories', () => {
  describe('NOTIFICATION_TYPE_TO_CATEGORY', () => {
    it('should map PLANNING to planning', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.PLANNING).toBe('planning')
    })

    it('should map LEAVE to leaves', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.LEAVE).toBe('leaves')
    })

    it('should map TASK to tasks', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.TASK).toBe('tasks')
    })

    it('should map SYSTEM to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.SYSTEM).toBe('system')
    })

    it('should map INFO to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.INFO).toBe('system')
    })

    it('should map SUCCESS to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.SUCCESS).toBe('system')
    })

    it('should map WARNING to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.WARNING).toBe('system')
    })

    it('should map ERROR to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.ERROR).toBe('system')
    })

    it('should map INCIDENT to system', () => {
      expect(NOTIFICATION_TYPE_TO_CATEGORY.INCIDENT).toBe('system')
    })
  })

  describe('getNotificationCategory', () => {
    it('should return planning for PLANNING type', () => {
      expect(getNotificationCategory('PLANNING')).toBe('planning')
    })

    it('should return leaves for LEAVE type', () => {
      expect(getNotificationCategory('LEAVE')).toBe('leaves')
    })

    it('should return tasks for TASK type', () => {
      expect(getNotificationCategory('TASK')).toBe('tasks')
    })

    it('should return system for SYSTEM type', () => {
      expect(getNotificationCategory('SYSTEM')).toBe('system')
    })

    it('should return system for INFO type', () => {
      expect(getNotificationCategory('INFO')).toBe('system')
    })

    it('should return system for INCIDENT type', () => {
      expect(getNotificationCategory('INCIDENT')).toBe('system')
    })
  })

  describe('NOTIFICATION_CATEGORY_DESCRIPTIONS', () => {
    it('should have description for planning', () => {
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.planning).toBeDefined()
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.planning).toContain('planning')
    })

    it('should have description for leaves', () => {
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.leaves).toBeDefined()
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.leaves).toContain('congés')
    })

    it('should have description for tasks', () => {
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.tasks).toBeDefined()
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.tasks).toContain('notes')
    })

    it('should have description for system', () => {
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.system).toBeDefined()
      expect(NOTIFICATION_CATEGORY_DESCRIPTIONS.system).toContain('Annonces')
    })
  })

  describe('NOTIFICATION_CATEGORY_COLORS', () => {
    it('should have color for planning', () => {
      expect(NOTIFICATION_CATEGORY_COLORS.planning).toContain('blue')
    })

    it('should have color for leaves', () => {
      expect(NOTIFICATION_CATEGORY_COLORS.leaves).toContain('green')
    })

    it('should have color for tasks', () => {
      expect(NOTIFICATION_CATEGORY_COLORS.tasks).toContain('orange')
    })

    it('should have color for system', () => {
      expect(NOTIFICATION_CATEGORY_COLORS.system).toContain('purple')
    })
  })
})
