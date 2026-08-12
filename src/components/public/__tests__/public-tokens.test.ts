/**
 * Garde-fou des tokens `public-*`
 *
 * Une classe Tailwind qui reference un token inexistant ne produit aucune
 * regle CSS. Elle n'echoue ni au build, ni au type-check, ni a l'audit
 * axe-core : la couleur demandee est simplement ignoree et l'element garde
 * la couleur heritee.
 *
 * C'est exactement ce qui est arrive au CTA « Essayer 21 jours » :
 * `hover:text-public-content-inverted` ne correspondait a aucun token, donc
 * au survol le fond passait en `public-content` (ink 900) pendant que le
 * texte restait sombre. Illisible, et invisible pour toute la chaine de
 * verification, un audit statique ne declenchant pas les etats de survol.
 *
 * Ce test confronte les tokens reellement ecrits dans les sources a ceux
 * declares dans `tailwind.config.ts`.
 *
 * @ticket SP-574
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/**
 * Extrait les cles du groupe `public` de la config Tailwind.
 *
 * La config est lue comme du texte plutot qu'importee : elle tire des
 * plugins et des dependances lourdes dont ce test n'a aucun besoin.
 */
function declaredPublicTokens(): Set<string> {
  const config = readFileSync(join(ROOT, 'tailwind.config.ts'), 'utf-8')

  const groupStart = config.indexOf('public: {')
  expect(groupStart, 'groupe `public` absent de tailwind.config.ts').toBeGreaterThan(-1)

  // Le groupe s'arrete a la premiere ligne qui ferme l'objet a son niveau.
  const groupEnd = config.indexOf('\n        },', groupStart)
  const group = config.slice(groupStart, groupEnd)

  const tokens = new Set<string>()
  // `surface: 'hsl(...)'` et `'surface-subtle': 'hsl(...)'`
  for (const match of group.matchAll(/^\s*'?([a-z][a-z0-9-]*)'?\s*:/gm)) {
    const token = match[1]
    if (token && token !== 'public') tokens.add(token)
  }

  return tokens
}

/** Tous les fichiers de source susceptibles de porter des classes Tailwind. */
function sourceFiles(dir: string): string[] {
  const out: string[] = []

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)

    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      out.push(...sourceFiles(full))
      continue
    }

    if (/\.tsx?$/.test(entry)) out.push(full)
  }

  return out
}

/**
 * Utilitaires Tailwind pouvant porter une couleur. Un token public n'a de
 * sens que derriere l'un d'eux : `text-`, `bg-`, `border-`, `ring-`, etc.
 */
const COLOR_UTILITIES = [
  'text',
  'bg',
  'border',
  'ring',
  'ring-offset',
  'from',
  'via',
  'to',
  'fill',
  'stroke',
  'decoration',
  'outline',
  'shadow',
  'divide',
  'accent',
  'caret',
  'placeholder',
]

describe('tokens public-*', () => {
  const declared = declaredPublicTokens()

  it('declare bien le groupe public dans la config Tailwind', () => {
    // Sanity check : si l'extraction casse, les assertions suivantes
    // passeraient a vide et le garde-fou deviendrait silencieux.
    expect(declared.size).toBeGreaterThan(10)
    expect(declared).toContain('content')
    expect(declared).toContain('content-on-dark')
  })

  it('ne reference aucun token public inexistant', () => {
    const utilities = COLOR_UTILITIES.join('|')
    // Capture `hover:text-public-content-on-dark/75` -> `content-on-dark`,
    // en ignorant le prefixe d'etat et le suffixe d'opacite.
    const pattern = new RegExp(
      `(?:^|[\\s"'\`])(?:[a-z-]+:)*(?:${utilities})-public-([a-z0-9-]+)`,
      'g'
    )

    const unknown: string[] = []

    for (const file of sourceFiles(SRC)) {
      const content = readFileSync(file, 'utf-8')

      for (const match of content.matchAll(pattern)) {
        const token = match[1]?.split('/')[0]
        if (!token || declared.has(token)) continue

        unknown.push(`${file.replace(`${ROOT}/`, '')} : public-${token}`)
      }
    }

    expect(
      unknown,
      `Tokens public-* introuvables dans tailwind.config.ts. ` +
        `Ces classes ne produisent aucun CSS :\n${unknown.join('\n')}`
    ).toEqual([])
  })
})
