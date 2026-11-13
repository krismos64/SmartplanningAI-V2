/**
 * Garde-fou : `FormControl` enveloppe directement le champ
 *
 * `FormControl` (un `Slot` Radix) pose `id`, `aria-describedby` et
 * `aria-invalid` sur son enfant direct, et `FormLabel` vise cet `id`. Quand
 * l'enfant est un `<Select>` (aucun élément DOM) ou la `<div>` qui place une
 * icône, le libellé et le message d'erreur ne sont rattachés à rien. Un
 * lecteur d'écran annonce alors « liste déroulante » sans dire laquelle, ou
 * lit le placeholder (« •••••••• ») à la place du libellé. Rien ne l'attrape :
 * ni le type-check, ni les tests, ni l'œil.
 *
 * Mesuré le 13 novembre 2026 au navigateur : 37 champs dans 13 formulaires,
 * dont la connexion, l'inscription et le mot de passe oublié (SP-620).
 *
 * Forme attendue, celle de la documentation Shadcn :
 *
 *   <Select ...><FormControl><SelectTrigger>…</SelectTrigger></FormControl>
 *   <div className="relative"><Icon /><FormControl><Input /></FormControl></div>
 *
 * @ticket SP-620
 */

import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/** Champs qui reçoivent le focus, donc l'`id` visé par le libellé. */
const FIELD = /<(Input|Textarea|SelectTrigger|PasswordInput)\b/

function tsxFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name !== '__tests__' && name !== 'node_modules') {
        out.push(...tsxFiles(path))
      }
    } else if (name.endsWith('.tsx')) {
      out.push(path)
    }
  }
  return out
}

/**
 * Repère les `FormControl` dont l'enfant direct est un `<Select>` ou une
 * `<div>` qui contient un champ. Une `<div>` sans champ (palette de boutons
 * de `TeamForm`) n'a rien à rattacher et n'est pas signalée.
 */
export function misplacedFormControls(source: string): number[] {
  const lines = source.split('\n')
  const found: number[] = []
  lines.forEach((line, index) => {
    if (line.trim() !== '<FormControl>') return
    const child = lines.slice(index + 1).find((l) => l.trim() !== '')
    if (!child || !/^\s*<(Select|div)\b/.test(child)) return
    const closing = lines.findIndex(
      (l, k) => k > index && l.trim() === '</FormControl>'
    )
    const body = lines.slice(index + 1, closing).join('\n')
    if (/^\s*<Select\b/.test(child) || FIELD.test(body)) found.push(index + 1)
  })
  return found
}

describe('SP-620, placement de FormControl', () => {
  it('détecte les deux formes fautives', () => {
    const fautif = [
      '<FormControl>',
      '  <Select onValueChange={f}>',
      '    <SelectTrigger />',
      '  </Select>',
      '</FormControl>',
      '<FormControl>',
      '  <div className="relative">',
      '    <Mail />',
      '    <Input {...field} />',
      '  </div>',
      '</FormControl>',
    ].join('\n')

    expect(misplacedFormControls(fautif)).toEqual([1, 6])
  })

  it('accepte la forme Shadcn et une div sans champ', () => {
    const correct = [
      '<Select onValueChange={f}>',
      '  <FormControl>',
      '    <SelectTrigger />',
      '  </FormControl>',
      '</Select>',
      '<FormControl>',
      '  <div className="flex">',
      '    <button type="button" />',
      '  </div>',
      '</FormControl>',
    ].join('\n')

    expect(misplacedFormControls(correct)).toEqual([])
  })

  it('aucun formulaire de src/ ne détache son libellé du champ', () => {
    const offenders = tsxFiles(SRC).flatMap((file) =>
      misplacedFormControls(readFileSync(file, 'utf-8')).map(
        (line) => `${relative(ROOT, file)}:${line}`
      )
    )

    expect(offenders).toEqual([])
  })
})
