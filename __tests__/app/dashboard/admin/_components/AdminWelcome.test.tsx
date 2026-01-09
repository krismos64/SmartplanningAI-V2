/**
 * Tests unitaires pour AdminWelcome
 *
 * Teste le composant de bienvenue Super Admin avec :
 * - Message de salutation contextuel
 * - Indicateurs MRR, sante plateforme et churn
 *
 * @ticket SP-148
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminWelcome } from '@/app/app/admin/dashboard/_components/AdminWelcome'

describe('AdminWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Message de salutation
  // ==========================================================================

  describe('message de salutation', () => {
    it('devrait afficher Bonjour le matin (9h)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 9, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      expect(screen.getByText('Bonjour, Admin !')).toBeInTheDocument()
    })

    it('devrait afficher Bon apres-midi a 14h', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 14, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      expect(screen.getByText('Bon apres-midi, Admin !')).toBeInTheDocument()
    })

    it('devrait afficher Bonsoir le soir (20h)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 20, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      expect(screen.getByText('Bonsoir, Admin !')).toBeInTheDocument()
    })

    it('devrait afficher le nom de l administrateur', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Christophe"
          totalCompanies={100}
          totalUsers={1500}
          mrr={30000}
          churnRate={3.0}
        />
      )

      expect(screen.getByText('Bonjour, Christophe !')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Affichage plateforme
  // ==========================================================================

  describe('affichage plateforme', () => {
    it('devrait afficher le texte de la vue globale', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      expect(
        screen.getByText('Vue globale de la plateforme SmartPlanning')
      ).toBeInTheDocument()
    })

    it('devrait afficher la date du jour', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      // Date formatee en francais
      expect(screen.getByText(/dimanche 15 juin 2025/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateur MRR
  // ==========================================================================

  describe('indicateur MRR', () => {
    it('devrait afficher le MRR formate', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      // Format EUR
      expect(screen.getByText(/MRR:/)).toBeInTheDocument()
      expect(screen.getByText(/45.*000.*€|45.*000.*EUR/)).toBeInTheDocument()
    })

    it('devrait afficher le MRR zero correctement', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={10}
          totalUsers={50}
          mrr={0}
          churnRate={0}
        />
      )

      expect(screen.getByText(/MRR:/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateur sante
  // ==========================================================================

  describe('indicateur sante plateforme', () => {
    it('devrait afficher Excellent pour churn <= 2%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={1.5}
        />
      )

      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('devrait afficher Correct pour churn entre 2% et 5%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={3.5}
        />
      )

      expect(screen.getByText('Correct')).toBeInTheDocument()
    })

    it('devrait afficher Attention requise pour churn > 5%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={7.0}
        />
      )

      expect(screen.getByText('Attention requise')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Indicateur churn
  // ==========================================================================

  describe('indicateur churn', () => {
    it('devrait afficher le taux de churn', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      expect(screen.getByText(/Churn: 2\.5%/)).toBeInTheDocument()
    })

    it('devrait afficher churn 0%', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={0}
        />
      )

      expect(screen.getByText(/Churn: 0\.0%/)).toBeInTheDocument()
    })

    it('devrait afficher churn eleve avec style different', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={8.5}
        />
      )

      expect(screen.getByText(/Churn: 8\.5%/)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Classes CSS
  // ==========================================================================

  describe('classes CSS', () => {
    it('devrait appliquer les classes personnalisees', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      const { container } = render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
          className="custom-class"
        />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })

    it('devrait avoir le gradient rose', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0))

      const { container } = render(
        <AdminWelcome
          userName="Admin"
          totalCompanies={150}
          totalUsers={2500}
          mrr={45000}
          churnRate={2.5}
        />
      )

      const card = container.querySelector('.from-rose-500\\/10')
      expect(card).toBeInTheDocument()
    })
  })
})
