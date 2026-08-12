/**
 * Garde-fou des liens du pied de page des emails
 *
 * Un lien mort dans un email ne se voit nulle part : il n'y a pas de build
 * qui verifie les URL, pas de crawl, et le destinataire ne le signale pas.
 * Il est decouvert par hasard, longtemps apres.
 *
 * C'est ce qui est arrive au lien « Gérer mes préférences email » : il
 * pointait vers `/preferences-email`, une route qui n'a jamais existe.
 * Aucun appelant ne passant `unsubscribeUrl`, le repli etait le seul chemin
 * emprunte. Les deux emails concernes sont ceux de fin d'essai, envoyes aux
 * prospects a J-1 et a expiration.
 *
 * Ce test confronte les URL ecrites dans le pied de page aux routes qui
 * existent reellement dans `src/app`.
 *
 * @ticket SP-574
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FOOTER = join(ROOT, 'emails/components/Footer.tsx')

/**
 * Extrait les chemins passes a `href`, en ne gardant que ceux construits sur
 * `baseUrl` : les URL absolues externes ne concernent pas ce test.
 */
function footerPaths(): string[] {
  const source = readFileSync(FOOTER, 'utf-8')
  const paths: string[] = []

  // href={`${baseUrl}/cgu`} et href={unsubscribeUrl || `${baseUrl}/...`}
  for (const match of source.matchAll(/\$\{baseUrl\}(\/[a-z0-9/_-]*)/gi)) {
    const path = match[1]
    if (path && path !== '/') paths.push(path)
  }

  return [...new Set(paths)]
}

/**
 * Une route App Router existe si un `page.tsx` est present au chemin
 * correspondant, en tenant compte des groupes de routes `(nom)` qui ne
 * figurent pas dans l'URL.
 */
function routeExists(path: string): boolean {
  const segments = path.replace(/^\//, '').split('/')
  const groups = [
    '',
    '(about)',
    '(auth)',
    '(landing)',
    '(legal)',
    '(sectors)',
    '(guides)',
  ]

  return groups.some((group) =>
    existsSync(join(ROOT, 'src/app', group, ...segments, 'page.tsx'))
  )
}

describe('liens du pied de page des emails', () => {
  const paths = footerPaths()

  it('extrait bien des chemins du pied de page', () => {
    // Sanity check : si l'extraction casse, l'assertion suivante passerait
    // a vide et le garde-fou deviendrait silencieux.
    expect(paths.length).toBeGreaterThan(2)
  })

  it('ne pointe que vers des routes existantes', () => {
    const broken = paths.filter((path) => !routeExists(path))

    expect(
      broken,
      `Liens morts dans emails/components/Footer.tsx. ` +
        `Ces chemins n'ont pas de page.tsx correspondant :\n${broken.join('\n')}`
    ).toEqual([])
  })

  it('renvoie les preferences email vers la page reelle', () => {
    // Sur les chemins extraits des `href`, pas sur le texte brut du
    // fichier : `/preferences-email` est cite dans un commentaire qui
    // explique le defaut, et doit pouvoir y rester.
    expect(paths).toContain('/app/settings/notifications')
    expect(paths).not.toContain('/preferences-email')
  })
})
