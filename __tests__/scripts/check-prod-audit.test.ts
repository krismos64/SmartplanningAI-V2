/**
 * Garde-fou des failles de production : logique de décision (SP-596)
 *
 * Le script lance `npm audit`, ce que ce test ne fait pas : il vérifie ce qui
 * décide du rouge, sur un rapport construit à la forme de celui de npm.
 *
 * @ticket SP-596
 */

import { describe, expect, it } from 'vitest'
// @ts-expect-error module JavaScript sans déclaration de types
import {
  blockingAdvisories,
  evaluate,
} from '../../scripts/ci/check-prod-audit.mjs'

type Advisory = { id: string; severity: string; packages: Set<string> }
type Exception = {
  advisory: string
  package: string
  reason: string
  reviewBy?: string
}
type Verdict = {
  failures: { advisory: Advisory; why: string }[]
  stale: Exception[]
}

const blocking = blockingAdvisories as (report: unknown) => Advisory[]
const judge = evaluate as (
  a: Advisory[],
  e: Exception[],
  today: string
) => Verdict

const report = {
  vulnerabilities: {
    prisma: { via: ['@prisma/config'] },
    '@prisma/config': { via: ['deepmerge-ts'] },
    'deepmerge-ts': {
      via: [
        {
          severity: 'high',
          title: 'stack exhaustion',
          url: 'https://github.com/advisories/GHSA-ggr8-5vv4-36mx',
        },
      ],
    },
    next: {
      via: [
        {
          severity: 'critical',
          title: 'RCE',
          url: 'https://github.com/advisories/GHSA-2464-fhr4-w9xw',
        },
        {
          severity: 'moderate',
          title: 'cache poisoning',
          url: 'https://github.com/advisories/GHSA-4jqv-mc3x-m676',
        },
      ],
    },
  },
}

const exception = (advisory: string, reviewBy?: string): Exception => ({
  advisory,
  package: 'x',
  reason: 'documentée',
  reviewBy,
})

describe('SP-596, blockingAdvisories', () => {
  it('ne retient que les hautes et critiques, une fois par advisory', () => {
    const ids = blocking(report)
      .map((a) => a.id)
      .sort()

    // La modérée est écartée, les renvois en chaîne ne comptent pas double
    expect(ids).toEqual(['GHSA-2464-fhr4-w9xw', 'GHSA-ggr8-5vv4-36mx'])
  })
})

describe('SP-596, evaluate', () => {
  const advisories = blocking(report)

  it('rougit sur une advisory sans exception', () => {
    const { failures } = judge(
      advisories,
      [exception('GHSA-ggr8-5vv4-36mx', '2027-02-13')],
      '2026-11-13'
    )

    expect(failures.map((f) => f.advisory.id)).toEqual(['GHSA-2464-fhr4-w9xw'])
  })

  it('rougit sur une exception expirée ou sans date', () => {
    const { failures } = judge(
      advisories,
      [
        exception('GHSA-ggr8-5vv4-36mx', '2026-11-12'),
        exception('GHSA-2464-fhr4-w9xw'),
      ],
      '2026-11-13'
    )

    expect(failures).toHaveLength(2)
    expect(failures[0]?.why).toContain('expirée')
  })

  it('passe quand chaque advisory est couverte, et signale une exception inutile', () => {
    const { failures, stale } = judge(
      advisories,
      [
        exception('GHSA-ggr8-5vv4-36mx', '2027-02-13'),
        exception('GHSA-2464-fhr4-w9xw', '2026-11-13'),
        exception('GHSA-0000-0000-0000', '2027-02-13'),
      ],
      '2026-11-13'
    )

    expect(failures).toEqual([])
    expect(stale.map((e) => e.advisory)).toEqual(['GHSA-0000-0000-0000'])
  })
})
