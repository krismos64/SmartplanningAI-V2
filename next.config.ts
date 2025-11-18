import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Mode strict React
  reactStrictMode: true,

  // Configuration Turbopack - Définit le dossier racine du projet
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Optimisations TypeScript
  typescript: {
    // Ignore les erreurs TypeScript en production (à désactiver pour CDA)
    ignoreBuildErrors: false,
  },

  // Optimisations ESLint
  eslint: {
    // Ignore les warnings ESLint en production (à désactiver pour CDA)
    ignoreDuringBuilds: false,
  },

  // Configuration des images Next.js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Autoriser toutes les images en dev (à restreindre en prod)
      },
    ],
    formats: ['image/webp', 'image/avif'], // Formats modernes pour la performance
  },

  // Headers de sécurité (bonnes pratiques)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Variables d'environnement exposées côté client (préfixées par NEXT_PUBLIC_)
  env: {
    APP_NAME: 'SmartPlanning',
    APP_VERSION: '2.0.0',
  },
}

export default nextConfig
