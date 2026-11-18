/**
 * La CLI Prisma de l'image de production suit la version du projet
 *
 * Le job migrate du CD applique les migrations par `npx prisma migrate deploy`
 * dans l'image finale, qui n'embarque pas node_modules/.bin : c'est la CLI
 * installée en global par le Dockerfile qui s'exécute. Elle était restée en
 * 6.18.0 quand le projet est passé en 6.19.3 (SP-596), sans que rien ne le
 * signale. Constaté le 18 novembre 2026.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(__dirname, '..', '..')

function lockedVersion(pkg: string): string {
  const lock = JSON.parse(
    readFileSync(join(ROOT, 'package-lock.json'), 'utf8')
  ) as { packages: Record<string, { version?: string }> }
  const version = lock.packages[`node_modules/${pkg}`]?.version
  if (!version) throw new Error(`${pkg} absent de package-lock.json`)
  return version
}

describe('Dockerfile de production', () => {
  const dockerfile = readFileSync(join(ROOT, 'docker', 'Dockerfile'), 'utf8')

  it('installe une seule CLI Prisma, à version exacte', () => {
    const installs = [...dockerfile.matchAll(/npm install -g prisma@(\S+)/g)]
    expect(installs).toHaveLength(1)
    expect(installs[0][1]).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('installe la version de Prisma verrouillée par package-lock.json', () => {
    const installed = dockerfile.match(/npm install -g prisma@(\S+)/)?.[1]
    expect(installed).toBe(lockedVersion('prisma'))
  })

  it('reste aligné sur le client Prisma généré au build', () => {
    expect(lockedVersion('prisma')).toBe(lockedVersion('@prisma/client'))
  })
})
