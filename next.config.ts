import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Mode strict React
  reactStrictMode: true,

  // Output standalone pour Docker (création d'un dossier .next/standalone)
  output: 'standalone',

  // Configuration Turbopack - Définit le dossier racine du projet
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Subresource Integrity (SRI) - Vérifie l'intégrité des scripts
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
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
    // Content Security Policy - Protection contre XSS, injection de code, clickjacking
    // Note: 'unsafe-eval' et 'unsafe-inline' sont nécessaires pour Next.js 15
    // Pour une sécurité maximale, implémenter un middleware avec nonce (voir Context7)
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'self' https://vercel.live;
      connect-src 'self' https://vercel.live https://*.pusher.com wss://*.pusher.com;
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, ' ')
      .trim()

    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          // Empêche le navigateur de deviner le type MIME
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Empêche l'embedding dans des iframes (protection clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Protection XSS (legacy, remplacé par CSP)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Contrôle les informations de référence envoyées
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Force HTTPS (6 mois) - HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=15552000; includeSubDomains',
          },
          // Désactive les fonctionnalités du navigateur non utilisées
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
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
