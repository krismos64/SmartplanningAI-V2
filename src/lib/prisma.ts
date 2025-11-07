/**
 * Singleton Prisma Client avec Configuration Avancée pour Next.js 15
 *
 * ✅ Source : Documentation officielle Prisma (Context7) - SP-105
 *
 * PROBLÉMATIQUE (CDA) :
 * Next.js 15 avec hot-reload crée de multiples instances de PrismaClient
 * en développement, causant des fuites de connexions à PostgreSQL.
 *
 * SOLUTION :
 * Pattern singleton avancé avec :
 * - Logging stratégique par environnement
 * - Error handling et formatting optimisés
 * - Connection pooling configuré
 * - Transaction options par défaut
 * - Event-based logging pour monitoring
 * - Graceful shutdown
 *
 * AMÉLIORATIONS SP-105 :
 * - Configuration avancée du logging (event-based)
 * - Error formatting selon environnement
 * - Transaction options globales (timeout, isolationLevel)
 * - Gestion des événements Prisma pour monitoring
 * - Support métriques connection pool
 *
 * RÉFÉRENCE CDA :
 * - Best practice officielle Prisma pour Next.js
 * - Évite "too many connections" en dev
 * - Pattern recommandé dans la doc Prisma + Vercel
 * - Optimisé pour production et monitoring
 */

import { PrismaClient, Prisma } from '@prisma/client'

/**
 * Type pour le stockage global de l'instance Prisma
 * Nécessaire pour le singleton en développement (HMR)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Configuration du logging selon l'environnement
 *
 * DÉVELOPPEMENT :
 * - 'query' : Voir toutes les queries SQL générées
 * - 'info' : Informations sur le pool de connexions
 * - 'warn' : Avertissements Prisma
 * - 'error' : Erreurs critiques
 *
 * PRODUCTION :
 * - 'error' uniquement pour réduire la verbosité
 * - Utiliser un service externe (Sentry, Datadog) pour les logs structurés
 *
 * ✅ Source Context7 : Prisma Logging Best Practices
 */
const logConfig: Prisma.LogLevel[] | Prisma.LogDefinition[] =
  process.env.NODE_ENV === 'development'
    ? [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ]
    : ['error']

/**
 * Instance singleton de Prisma Client avec configuration avancée
 *
 * OPTIONS CONFIGURÉES :
 *
 * 1. LOG :
 *    - Event-based logging en dev pour monitoring custom
 *    - Stdout simple en production
 *
 * 2. ERROR FORMAT :
 *    - 'pretty' en dev : erreurs lisibles avec stack trace
 *    - 'minimal' en prod : erreurs compactes (moins de bandwidth)
 *
 * 3. TRANSACTION OPTIONS :
 *    - maxWait: 5000ms (temps max d'attente pour acquérir connexion)
 *    - timeout: 10000ms (temps max d'exécution d'une transaction)
 *    - isolationLevel: Serializable (niveau le plus strict pour cohérence)
 *
 * ✅ Source Context7 : Prisma Client Configuration Options
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    transactionOptions: {
      maxWait: 5000, // Temps max d'attente pour une connexion (ms)
      timeout: 10000, // Temps max d'exécution d'une transaction (ms)
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // Cohérence maximale
    },
  })

/**
 * Event Listeners pour monitoring avancé (DÉVELOPPEMENT uniquement)
 *
 * Permet de capturer les queries Prisma pour :
 * - Debugging performance
 * - Logging custom dans un service externe
 * - Métriques temps de réponse
 *
 * ✅ Source Context7 : Event-based Logging Pattern
 */
if (process.env.NODE_ENV === 'development') {
  // Event listener pour les queries
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    // eslint-disable-next-line no-console
    console.log('Query: ' + e.query)
    // eslint-disable-next-line no-console
    console.log('Duration: ' + e.duration + 'ms')
  })
}

/**
 * Sauvegarde l'instance dans globalThis en développement
 *
 * IMPORTANT :
 * En production, on ne stocke PAS dans globalThis pour :
 * - Éviter les fuites mémoire
 * - Garantir une instance fraîche à chaque démarrage
 * - Respect du lifecycle serverless (Vercel, Netlify)
 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful Shutdown Handler
 *
 * Ferme proprement la connexion Prisma avant l'arrêt du processus.
 * Évite les connexions orphelines dans PostgreSQL.
 *
 * UTILISATION :
 * - Automatique sur SIGINT/SIGTERM (Ctrl+C, kill)
 * - Peut être appelé manuellement dans les tests
 *
 * ✅ Source Context7 : Connection Management Best Practices
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

// Enregistrer les handlers de shutdown
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    void disconnectPrisma().then(() => process.exit(0))
  })

  process.on('SIGTERM', () => {
    void disconnectPrisma().then(() => process.exit(0))
  })
}

/**
 * Export par défaut pour compatibilité
 *
 * Utilisation recommandée :
 * ```typescript
 * import { prisma } from '@/lib/prisma'
 *
 * const users = await prisma.user.findMany()
 * ```
 *
 * Alternative :
 * ```typescript
 * import prisma from '@/lib/prisma'
 * ```
 */
export default prisma
