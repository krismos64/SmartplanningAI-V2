/**
 * Setup des tests d'intégration (SP-619)
 *
 * Ces tests écrivent dans la base de DATABASE_URL. Ils refusent de démarrer si
 * elle n'est pas sur la machine locale : une variable mal positionnée ne doit
 * jamais les faire tourner contre la production.
 */

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

// Comme la suite unitaire : aucun test ne parle au vrai Redis (SP-610)
process.env.REDIS_URL = ''

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

function assertLocalDatabase(url: string | undefined): void {
  if (!url) {
    throw new Error('Tests d’intégration : DATABASE_URL absente')
  }
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    throw new Error('Tests d’intégration : DATABASE_URL illisible')
  }
  if (!LOCAL_HOSTS.has(host)) {
    // L'hôte seul est affiché, jamais l'URL qui porte le mot de passe
    throw new Error(
      `Tests d’intégration : base « ${host} » refusée, seule une base locale est acceptée`
    )
  }
}

assertLocalDatabase(process.env.DATABASE_URL)
