/**
 * Garde-fou sur la configuration des images distantes
 *
 * SP-589 : `next.config.ts` déclarait `hostname: '**'`, ce qui autorisait
 * l'optimiseur d'images à télécharger et retraiter un fichier depuis n'importe
 * quel domaine HTTPS. Le commentaire du fichier disait déjà « à restreindre en
 * prod », et un avis critique de Next.js porte sur un déni de service par
 * cette voie précise.
 *
 * Le défaut n'était visible ni au type-check, ni au lint, ni à l'exécution :
 * un joker est une valeur parfaitement valide. D'où ce test, qui échouera si
 * quelqu'un le remet pour déboguer un chargement d'image et oublie de revenir
 * en arrière.
 *
 * @ticket SP-589
 */

import { describe, it, expect } from 'vitest'

import nextConfig from '../../../next.config'

const remotePatterns = nextConfig.images?.remotePatterns ?? []

describe('next.config images — domaines distants', () => {
  it('déclare au moins un domaine, sinon next/image refuserait les avatars', () => {
    expect(remotePatterns.length).toBeGreaterThan(0)
  })

  it("n'autorise aucun hostname joker", () => {
    for (const pattern of remotePatterns) {
      expect(pattern.hostname).not.toBe('**')
      expect(pattern.hostname).not.toBe('*')
      // Un joker en tête (`**.exemple.fr`) reste acceptable pour un
      // sous-domaine, mais un hostname qui commence par `**.` sans domaine
      // derrière revient au joker total.
      expect(pattern.hostname).not.toMatch(/^\*+\.?$/)
    }
  })

  it('exige HTTPS sur chaque domaine déclaré', () => {
    for (const pattern of remotePatterns) {
      expect(pattern.protocol).toBe('https')
    }
  })

  it('autorise Cloudinary, seule source d\'images distantes du produit', () => {
    const hosts = remotePatterns.map((p) => p.hostname)
    expect(hosts).toContain('res.cloudinary.com')
  })

  it("n'active pas AVIF tant que Next.js n'est pas monté de version", () => {
    // L'avis critique sur l'optimiseur vise le décodeur AVIF. À rétablir dans
    // le temps 2 de SP-589, une fois la 15.5 corrective en place.
    expect(nextConfig.images?.formats ?? []).not.toContain('image/avif')
  })
})
