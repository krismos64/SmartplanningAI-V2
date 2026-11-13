/**
 * Les liens d'aide de la palette de commandes mènent à une page qui existe.
 *
 * SP-627 : `/docs` et `/help` n'avaient aucune route, rien ne le signalait,
 * et un dirigeant en essai a reçu un 404 en production.
 */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { HELP_LINKS, helpItems } from '../menu-items'

const APP_DIR = path.join(process.cwd(), 'src', 'app')

/**
 * Cherche `page.tsx` pour un chemin d'URL, en traversant les groupes de
 * routes `(nom)`, qui n'apparaissent pas dans l'URL.
 */
function routeExists(dir: string, segments: string[]): boolean {
  if (segments.length === 0) {
    return existsSync(path.join(dir, 'page.tsx'))
  }
  const [head, ...rest] = segments
  const entries = readdirSync(dir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory()
  )
  return entries.some((entry) => {
    if (entry.name === head) {
      return routeExists(path.join(dir, entry.name), rest)
    }
    if (entry.name.startsWith('(')) {
      return routeExists(path.join(dir, entry.name), segments)
    }
    return false
  })
}

describe("liens d'aide de la palette de commandes", () => {
  it.each(Object.entries(HELP_LINKS))(
    "l'action %s ouvre une page existante (%s)",
    (_action, href) => {
      expect(routeExists(APP_DIR, href.split('/').filter(Boolean))).toBe(true)
    }
  )

  it('le contrôle rejette une route absente', () => {
    expect(routeExists(APP_DIR, ['docs'])).toBe(false)
    expect(routeExists(APP_DIR, ['help'])).toBe(false)
  })

  it("chaque entrée d'aide qui ouvre une page a un lien déclaré", () => {
    const opening = helpItems
      .map((item) => item.action)
      .filter((action) => action.startsWith('open-'))
    expect(opening.sort()).toEqual(Object.keys(HELP_LINKS).sort())
  })
})
