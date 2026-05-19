/**
 * robots.ts - Configuration des regles pour les crawlers
 *
 * @description Fichier Metadata API Next.js 15 generant /robots.txt
 * Controle l'indexation des pages publiques vs privees,
 * et autorise explicitement les crawlers LLM pour favoriser
 * la citation de SmartPlanning dans ChatGPT, Claude, Perplexity, etc.
 *
 * @ticket SP-462
 */

import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

const privatePaths = [
  '/app/',
  '/api/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const llmCrawlers = [
  'GPTBot',
  'anthropic-ai',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
      ...llmCrawlers.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: privatePaths,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
