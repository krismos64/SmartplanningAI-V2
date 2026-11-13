#!/usr/bin/env node
/**
 * Garde-fou des failles de production (SP-596)
 *
 * Entre janvier et septembre 2026, les dépendances de production sont passées
 * de 0 à 16 failles hautes sans que rien ne le signale, et à 1 critique et 18
 * hautes en novembre. `npm audit --audit-level=high` brut rougirait en
 * permanence sur les failles acceptées en connaissance de cause, et un
 * contrôle toujours rouge finit ignoré.
 *
 * Ce script rougit sur toute faille haute ou critique de production qui
 * n'est pas dans `audit-exceptions.json`, ou dont l'exception a dépassé sa
 * date de réexamen. Il signale sans rougir une exception devenue inutile.
 *
 * Usage : node scripts/ci/check-prod-audit.mjs
 * Code de sortie : 0 si conforme, 1 sinon, 2 si l'audit n'a pas pu tourner.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const BLOCKING = new Set(['high', 'critical'])

/** Advisories hautes ou critiques, chacune avec les paquets qui la portent. */
export function blockingAdvisories(report) {
  const found = new Map()
  for (const [pkg, vuln] of Object.entries(report.vulnerabilities ?? {})) {
    for (const via of vuln.via ?? []) {
      // Une entrée chaîne renvoie à un autre paquet du rapport : seule
      // l'entrée objet porte l'advisory elle-même
      if (typeof via !== 'object' || !BLOCKING.has(via.severity)) continue
      const id =
        String(via.url ?? '')
          .split('/')
          .pop() || `source-${via.source}`
      const entry = found.get(id) ?? {
        id,
        severity: via.severity,
        title: via.title,
        packages: new Set(),
      }
      entry.packages.add(pkg)
      found.set(id, entry)
    }
  }
  return [...found.values()]
}

/** Confronte les advisories aux exceptions, à la date `today` (AAAA-MM-JJ). */
export function evaluate(advisories, exceptions, today) {
  const byId = new Map(exceptions.map((e) => [e.advisory, e]))
  const failures = []
  for (const advisory of advisories) {
    const exception = byId.get(advisory.id)
    if (!exception) {
      failures.push({ advisory, why: 'aucune exception' })
    } else if (!exception.reviewBy || exception.reviewBy < today) {
      failures.push({
        advisory,
        why: `exception expirée le ${exception.reviewBy ?? '(sans date)'}`,
      })
    }
  }
  const present = new Set(advisories.map((a) => a.id))
  const stale = exceptions.filter((e) => !present.has(e.advisory))
  return { failures, stale }
}

function runAudit() {
  try {
    return execFileSync('npm', ['audit', '--omit=dev', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    // npm audit sort en 1 dès qu'il trouve une faille : le rapport est
    // quand même sur stdout
    if (error.stdout) return error.stdout
    throw error
  }
}

function main() {
  let report
  try {
    report = JSON.parse(runAudit())
  } catch (error) {
    console.error('Audit impossible :', error.message)
    process.exit(2)
  }
  if (report.error) {
    console.error('Audit impossible :', report.error.summary ?? report.error)
    process.exit(2)
  }

  const { exceptions } = JSON.parse(
    readFileSync(join(HERE, 'audit-exceptions.json'), 'utf8')
  )
  const today = new Date().toISOString().slice(0, 10)
  const advisories = blockingAdvisories(report)
  const { failures, stale } = evaluate(advisories, exceptions, today)

  const counts = report.metadata?.vulnerabilities ?? {}
  console.log(
    `Production : ${counts.critical ?? 0} critique(s), ${counts.high ?? 0} haute(s), ` +
      `${advisories.length} advisory bloquante(s), ${advisories.length - failures.length} couverte(s) par une exception`
  )
  for (const e of stale) {
    console.log(
      `Exception devenue inutile, à retirer : ${e.advisory} (${e.package})`
    )
  }
  if (failures.length === 0) {
    console.log('Conforme.')
    return
  }
  for (const { advisory, why } of failures) {
    console.error(
      `[${advisory.severity}] ${advisory.id} ${advisory.title} ` +
        `(${[...advisory.packages].join(', ')}) : ${why}`
    )
  }
  console.error(
    'Corriger la dépendance, ou documenter l’exception dans scripts/ci/audit-exceptions.json.'
  )
  process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
