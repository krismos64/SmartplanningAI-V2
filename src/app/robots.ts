/**
 * robots.ts - Configuration des regles pour les crawlers
 *
 * @description Fichier Metadata API Next.js 15 generant /robots.txt
 * Controle l'indexation des pages publiques vs privees
 *
 * @ticket SP-462
 */

import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/app/',
        '/api/',
        '/connexion',
        '/inscription',
        '/mot-de-passe-oublie',
        '/reinitialisation-mot-de-passe',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
