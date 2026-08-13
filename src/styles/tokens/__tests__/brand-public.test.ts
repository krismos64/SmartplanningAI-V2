/**
 * Tests de contraste de la palette publique
 *
 * Recalcule les ratios WCAG depuis la palette elle-meme, plutot que de se
 * fier aux valeurs notees a la main : une teinte modifiee sans verification
 * fera rougir ce test.
 *
 * Le seuil AA est de 4.5:1 pour du texte courant, 3:1 pour du grand texte
 * (24px, ou 18.66px en gras).
 *
 * @ticket SP-565
 */

import { describe, it, expect } from 'vitest'
import {
  publicPalette,
  publicSemantic,
  publicContrastReference,
} from '../brand-public'

/** Convertit « 216 50% 11.8% » en luminance relative WCAG. */
function relativeLuminance(hslToken: string): number {
  const [h, s, l] = parseHsl(hslToken)
  const [r, g, b] = hslToRgb(h, s, l)

  const channel = (value: number) => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function parseHsl(token: string): [number, number, number] {
  const parts = token.trim().split(/\s+/)

  if (parts.length < 3) {
    throw new Error(`Token HSL invalide : « ${token} »`)
  }

  const h = Number.parseFloat(parts[0] ?? '')
  const s = Number.parseFloat(parts[1] ?? '') / 100
  const l = Number.parseFloat(parts[2] ?? '') / 100

  if ([h, s, l].some(Number.isNaN)) {
    throw new Error(`Token HSL invalide : « ${token} »`)
  }

  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ]
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/** Resout « coral.700 » ou « white » vers un token HSL. */
function resolve(path: string): string {
  if (path === 'white') return '0 0% 100%'
  if (path === 'black') return '0 0% 0%'

  const [family, shade] = path.split('.')

  if (!family || !shade) {
    throw new Error(`Chemin de teinte invalide : « ${path} »`)
  }

  const group = publicPalette[family as keyof typeof publicPalette] as
    | Record<string, string>
    | undefined

  const token = group?.[shade]
  if (!token) throw new Error(`Teinte inconnue : « ${path} »`)

  return token
}

const AA_TEXT = 4.5
const AA_LARGE = 3

describe('palette publique, contraste WCAG', () => {
  describe('paires declarees valides pour du texte courant', () => {
    it.each(publicContrastReference.textPairs)(
      '$foreground sur $background atteint AA (4.5:1)',
      ({ background, foreground, ratio }) => {
        const measured = contrastRatio(resolve(background), resolve(foreground))

        expect(measured).toBeGreaterThanOrEqual(AA_TEXT)
        // La valeur documentee doit rester fidele a la mesure
        expect(measured).toBeCloseTo(ratio, 1)
      }
    )
  })

  describe('paires reservees aux grands titres', () => {
    it.each(publicContrastReference.largeOnly)(
      '$foreground sur $background atteint AA large (3:1) sans atteindre 4.5:1',
      ({ background, foreground, ratio }) => {
        const measured = contrastRatio(resolve(background), resolve(foreground))

        expect(measured).toBeGreaterThanOrEqual(AA_LARGE)
        expect(measured).toBeLessThan(AA_TEXT)
        expect(measured).toBeCloseTo(ratio, 1)
      }
    )
  })

  describe('paires interdites', () => {
    it.each(publicContrastReference.forbidden)(
      '$foreground sur $background reste sous le seuil, la variante $use est requise',
      ({ background, foreground }) => {
        const measured = contrastRatio(resolve(background), resolve(foreground))

        // Test negatif : si cette paire venait a passer AA, la variante
        // assombrie n'aurait plus lieu d'etre et la documentation mentirait
        expect(measured).toBeLessThan(AA_TEXT)
      }
    )
  })
})

describe('tokens semantiques', () => {
  it('le texte courant est lisible sur son fond', () => {
    expect(
      contrastRatio(publicSemantic.surface, publicSemantic.content)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('le texte secondaire reste lisible', () => {
    expect(
      contrastRatio(publicSemantic.surface, publicSemantic.contentMuted)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('le texte des sections sombres est lisible sur leur fond', () => {
    expect(
      contrastRatio(publicSemantic.surfaceDark, publicSemantic.contentOnDark)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('l accent est lisible sur le fond courant', () => {
    expect(
      contrastRatio(publicSemantic.surface, publicSemantic.accent)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('l accent sur fond sombre est lisible', () => {
    expect(
      contrastRatio(publicSemantic.surfaceDark, publicSemantic.accentOnDark)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  /**
   * Les aplats vifs appellent un texte bleu nuit, jamais du blanc, qui
   * tomberait a 3.19:1 sur le corail. Le token dedie `contentOnVivid`
   * existe pour cela : sur SP-567, un texte pose avec `content` sur le
   * bouton lime etait tombe a 1.06:1.
   */
  it('le texte des aplats vifs est lisible', () => {
    expect(
      contrastRatio(publicSemantic.accentSurface, publicSemantic.contentOnVivid)
    ).toBeGreaterThanOrEqual(AA_TEXT)

    expect(
      contrastRatio(
        publicSemantic.highlightSurface,
        publicSemantic.contentOnVivid
      )
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('l aplat bleu franc porte du texte blanc lisible', () => {
    expect(
      contrastRatio(publicSemantic.brandSurface, '0 0% 100%')
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('le lien bleu est lisible sur le fond clair', () => {
    expect(
      contrastRatio(publicSemantic.surface, publicSemantic.brandOnLight)
    ).toBeGreaterThanOrEqual(AA_TEXT)
  })
})
