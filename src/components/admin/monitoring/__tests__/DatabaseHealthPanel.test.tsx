/**
 * Tests unitaires pour DatabaseHealthPanel
 *
 * Couvre :
 * - Affichage des 4 checks avec statuts
 * - ProgressBar pour le pool de connexions
 * - Métriques brutes (latence, connexions)
 * - Cas edge : pas de pool metrics
 *
 * @ticket SP-464
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DatabaseHealthPanel } from '../DatabaseHealthPanel'
import type { HealthCheckResult } from '@/lib/db-health'

// ============================================================================
// Fixtures
// ============================================================================

const HEALTHY: HealthCheckResult = {
  status: 'healthy',
  timestamp: new Date('2026-02-20T10:00:00Z'),
  checks: {
    connection: { status: 'pass', message: 'Connexion établie', value: true },
    latency: { status: 'pass', message: 'Latence OK (15ms)', value: 15 },
    migrations: { status: 'pass', message: 'Schéma DB accessible' },
    poolSize: {
      status: 'pass',
      message: 'Pool disponible (30%)',
      value: '3/10',
    },
  },
  metrics: { latency: 15, activeConnections: 3, idleConnections: 7 },
}

const DEGRADED: HealthCheckResult = {
  status: 'degraded',
  timestamp: new Date('2026-02-20T10:00:00Z'),
  checks: {
    connection: { status: 'pass', message: 'Connexion établie', value: true },
    latency: {
      status: 'warn',
      message: 'Latence élevée (120ms > 100ms)',
      value: 120,
    },
    migrations: { status: 'pass', message: 'Schéma DB accessible' },
    poolSize: {
      status: 'warn',
      message: 'Pool usage élevé (85%)',
      value: '17/20',
    },
  },
  metrics: { latency: 120, activeConnections: 17, idleConnections: 3 },
}

const NO_POOL_METRICS: HealthCheckResult = {
  status: 'healthy',
  timestamp: new Date('2026-02-20T10:00:00Z'),
  checks: {
    connection: { status: 'pass', message: 'Connexion établie', value: true },
    latency: { status: 'pass', message: 'Latence OK (10ms)', value: 10 },
    migrations: { status: 'pass', message: 'Schéma DB accessible' },
    poolSize: {
      status: 'pass',
      message: 'Métriques non disponibles',
    },
  },
  metrics: { latency: 10 },
}

// ============================================================================
// Tests
// ============================================================================

describe('DatabaseHealthPanel', () => {
  it('affiche le titre "Santé base de données"', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByText('Santé base de données')).toBeInTheDocument()
  })

  // 4 checks affichés -----------------------------------------------------

  it('affiche les 4 labels de check', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByText('Latence')).toBeInTheDocument()
    expect(screen.getByText('Schéma DB')).toBeInTheDocument()
    expect(screen.getByText('Pool connexions')).toBeInTheDocument()
  })

  it('affiche "OK" pour les checks pass', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    const okElements = screen.getAllByText('OK')
    expect(okElements.length).toBe(4)
  })

  it('affiche "Attention" pour les checks warn', () => {
    render(<DatabaseHealthPanel health={DEGRADED} />)
    const warnElements = screen.getAllByText('Attention')
    expect(warnElements.length).toBe(2) // latency + poolSize
  })

  // Messages de check -----------------------------------------------------

  it('affiche le message de chaque check', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByText('Connexion établie')).toBeInTheDocument()
    expect(screen.getByText('Latence OK (15ms)')).toBeInTheDocument()
    expect(screen.getByText('Schéma DB accessible')).toBeInTheDocument()
    expect(screen.getByText('Pool disponible (30%)')).toBeInTheDocument()
  })

  // ProgressBar pool ------------------------------------------------------

  it('affiche une ProgressBar quand le pool a des métriques', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '30')
  })

  it('affiche 85% pour un pool dégradé', () => {
    render(<DatabaseHealthPanel health={DEGRADED} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('aria-valuenow', '85')
  })

  it("n'affiche pas de ProgressBar sans métriques de pool", () => {
    render(<DatabaseHealthPanel health={NO_POOL_METRICS} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  // Métriques brutes ------------------------------------------------------

  it('affiche la latence dans les métriques brutes', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByText('Latence : 15ms')).toBeInTheDocument()
  })

  it('affiche les connexions actives et idle', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByText('Actives : 3')).toBeInTheDocument()
    expect(screen.getByText('Idle : 7')).toBeInTheDocument()
  })

  it("n'affiche pas les connexions si non disponibles", () => {
    render(<DatabaseHealthPanel health={NO_POOL_METRICS} />)
    expect(screen.queryByText(/Actives/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Idle/)).not.toBeInTheDocument()
  })

  // data-testid -----------------------------------------------------------

  it('a le testid db-health-panel', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByTestId('db-health-panel')).toBeInTheDocument()
  })

  it('a les testid check-* pour chaque vérification', () => {
    render(<DatabaseHealthPanel health={HEALTHY} />)
    expect(screen.getByTestId('check-connection')).toBeInTheDocument()
    expect(screen.getByTestId('check-latency')).toBeInTheDocument()
    expect(screen.getByTestId('check-migrations')).toBeInTheDocument()
    expect(screen.getByTestId('check-poolSize')).toBeInTheDocument()
  })
})
