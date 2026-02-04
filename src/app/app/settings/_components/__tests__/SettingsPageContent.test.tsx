/**
 * Tests unitaires pour SettingsPageContent
 * @ticket SP-274
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsPageContent } from '../SettingsPageContent'

describe('SettingsPageContent', () => {
  describe('RBAC - Role Based Access Control', () => {
    it('should show all common sections for EMPLOYEE', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)

      expect(screen.getByTestId('settings-section-profile')).toBeInTheDocument()
      expect(
        screen.getByTestId('settings-section-appearance')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('settings-section-notifications')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('settings-section-security')
      ).toBeInTheDocument()
    })

    it('should hide company section for EMPLOYEE', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)
      expect(
        screen.queryByTestId('settings-section-company')
      ).not.toBeInTheDocument()
    })

    it('should hide company section for MANAGER', () => {
      render(<SettingsPageContent userRole="MANAGER" />)
      expect(
        screen.queryByTestId('settings-section-company')
      ).not.toBeInTheDocument()
    })

    it('should show company section for DIRECTOR', () => {
      render(<SettingsPageContent userRole="DIRECTOR" />)
      expect(screen.getByTestId('settings-section-company')).toBeInTheDocument()
    })

    it('should show company section for SYSTEM_ADMIN', () => {
      render(<SettingsPageContent userRole="SYSTEM_ADMIN" />)
      expect(screen.getByTestId('settings-section-company')).toBeInTheDocument()
    })
  })

  describe('Rendering', () => {
    it('should render the settings page container', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)
      expect(screen.getByTestId('settings-page')).toBeInTheDocument()
    })

    it('should render the header', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)
      expect(screen.getByTestId('settings-header')).toBeInTheDocument()
    })

    it('should render sections in a grid', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)
      const grid = screen.getByTestId('settings-page').querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should not display "Bientôt" badges for EMPLOYEE (SP-276 + SP-275)', () => {
      render(<SettingsPageContent userRole="EMPLOYEE" />)
      // SP-276: Appearance badge removed
      // SP-275: Notifications badge removed
      // For EMPLOYEE, no badges should be visible
      const badges = screen.queryAllByText('Bientôt')
      expect(badges.length).toBe(0)
    })

    it('should display "Bientôt" badge only for Company section (DIRECTOR)', () => {
      render(<SettingsPageContent userRole="DIRECTOR" />)
      // Only Company section has "Bientôt" badge for DIRECTOR
      const badges = screen.getAllByText('Bientôt')
      expect(badges.length).toBe(1)
    })

    it('should have correct number of sections for DIRECTOR', () => {
      render(<SettingsPageContent userRole="DIRECTOR" />)
      // profile, appearance, notifications, security, company = 5
      const sections = screen.getAllByTestId(/settings-section-/)
      expect(sections).toHaveLength(5)
    })
  })
})
