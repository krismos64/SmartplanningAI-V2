/**
 * Tests unitaires pour robots.ts
 *
 * @ticket SP-462
 */

import { describe, it, expect } from 'vitest'
import robots from '@/app/robots'

describe('robots.ts', () => {
  const result = robots()

  it('retourne un objet valide', () => {
    expect(result).toBeDefined()
    expect(result.rules).toBeDefined()
  })

  it('autorise le crawl de la racine', () => {
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.allow).toBe('/')
  })

  it('cible tous les user agents', () => {
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.userAgent).toBe('*')
  })

  it('interdit le crawl de /app/ et /api/', () => {
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.disallow).toContain('/app/')
    expect(rules.disallow).toContain('/api/')
  })

  it('interdit le crawl des pages auth', () => {
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.disallow).toContain('/login')
    expect(rules.disallow).toContain('/register')
    expect(rules.disallow).toContain('/forgot-password')
    expect(rules.disallow).toContain('/reset-password')
  })

  it('contient l URL du sitemap', () => {
    expect(result.sitemap).toBe('https://smartplanning.fr/sitemap.xml')
  })
})
