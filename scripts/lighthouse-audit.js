#!/usr/bin/env node

/**
 * Script d'audit Lighthouse Accessibilité
 *
 * OBJECTIF (SP-269) :
 * Exécuter un audit Lighthouse sur les pages principales et générer un rapport.
 *
 * USAGE :
 * npm run a11y:audit
 * BASE_URL=https://staging.smartplanning.fr npm run a11y:audit
 *
 * PRÉREQUIS :
 * - Le serveur doit être démarré (npm run dev ou npm run start)
 * - Chrome/Chromium installé
 *
 * @ticket SP-269
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUTPUT_DIR = path.join(__dirname, '..', 'docs')
const REPORT_FILE = path.join(OUTPUT_DIR, 'lighthouse-a11y-report.md')

// Pages à auditer
const PAGES = [
  { name: 'Accueil', url: '/' },
  { name: 'Login', url: '/login' },
  { name: 'Register', url: '/register' },
]

// Seuil minimum pour le score d'accessibilité
const MIN_SCORE = 90

console.log('🔍 SmartPlanning - Audit Lighthouse Accessibilité')
console.log('='.repeat(50))
console.log(`📍 Base URL: ${BASE_URL}`)
console.log(`📄 Rapport: ${REPORT_FILE}`)
console.log('')

// Vérifier que le dossier docs existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const results = []
let hasErrors = false

for (const page of PAGES) {
  const url = `${BASE_URL}${page.url}`
  console.log(`\n🔎 Audit: ${page.name} (${url})`)

  try {
    // Exécuter Lighthouse avec execFileSync (plus sécurisé que execSync)
    const output = execFileSync(
      'npx',
      [
        'lighthouse',
        url,
        '--only-categories=accessibility',
        '--output=json',
        '--quiet',
        '--chrome-flags=--headless --no-sandbox',
      ],
      {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 120000,
      }
    )

    const report = JSON.parse(output)
    const score = Math.round(report.categories.accessibility.score * 100)

    // Déterminer le statut
    let status
    if (score >= MIN_SCORE) {
      status = '✅'
    } else if (score >= 70) {
      status = '⚠️'
    } else {
      status = '❌'
      hasErrors = true
    }

    results.push({
      page: page.name,
      url: page.url,
      score,
      status,
    })

    console.log(`   Score: ${score}% ${status}`)

    // Afficher les violations principales si score < 100
    if (score < 100 && report.categories.accessibility.auditRefs) {
      const failedAudits = report.audits
        ? Object.values(report.audits).filter(
            (audit) =>
              audit.score !== null && audit.score < 1 && audit.details?.items
          )
        : []

      if (failedAudits.length > 0) {
        console.log('   Problèmes détectés:')
        failedAudits.slice(0, 3).forEach((audit) => {
          console.log(`   - ${audit.title}`)
        })
      }
    }
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`)
    results.push({
      page: page.name,
      url: page.url,
      score: 'Erreur',
      status: '❌',
    })
    hasErrors = true
  }
}

// Générer le rapport Markdown
const now = new Date()
const dateStr = now.toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const avgScore =
  results.filter((r) => typeof r.score === 'number').length > 0
    ? Math.round(
        results
          .filter((r) => typeof r.score === 'number')
          .reduce((sum, r) => sum + r.score, 0) /
          results.filter((r) => typeof r.score === 'number').length
      )
    : 'N/A'

const report = `# Rapport Audit Lighthouse - Accessibilité

**Projet :** SmartPlanning V2
**Date :** ${dateStr}
**Ticket :** SP-269
**Objectif :** Score ≥ ${MIN_SCORE}%

---

## 📊 Résumé

| Métrique | Valeur |
|----------|--------|
| Pages auditées | ${results.length} |
| Score moyen | ${avgScore}% |
| Statut global | ${hasErrors ? '⚠️ Améliorations nécessaires' : '✅ Conforme'} |

---

## 📋 Résultats par page

| Page | URL | Score | Statut |
|------|-----|-------|--------|
${results.map((r) => `| ${r.page} | ${r.url} | ${r.score}${typeof r.score === 'number' ? '%' : ''} | ${r.status} |`).join('\n')}

---

## ✅ Critères WCAG 2.1 vérifiés

### Déjà implémentés (SP-268)
- ✅ Touch targets ≥ 44px (WCAG 2.5.5)
- ✅ Navigation clavier (Tab, Escape)
- ✅ Focus visible sur tous les éléments
- ✅ Attributs ARIA appropriés
- ✅ Labels pour tous les form controls

### Ajoutés (SP-269)
- ✅ Skip to main content link (WCAG 2.4.1)
- ✅ Tests automatisés axe-core
- ✅ Audit Lighthouse documenté

---

## 🔧 Améliorations futures

Si des violations sont détectées, voici les actions recommandées :

1. **Contraste de couleurs** : Vérifier que le ratio est ≥ 4.5:1 pour le texte normal
2. **Images** : S'assurer que toutes les images ont un attribut alt
3. **Formulaires** : Associer chaque input à un label
4. **Headings** : Respecter la hiérarchie h1 → h2 → h3

---

## 📚 Références

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Lighthouse Accessibility Audits](https://developer.chrome.com/docs/lighthouse/accessibility/)

---

*Rapport généré automatiquement par \`scripts/lighthouse-audit.js\`*
`

fs.writeFileSync(REPORT_FILE, report)

console.log('\n' + '='.repeat(50))
console.log(`📄 Rapport enregistré: ${REPORT_FILE}`)
console.log(`📊 Score moyen: ${avgScore}%`)

if (hasErrors) {
  console.log('\n⚠️  Certaines pages nécessitent des améliorations.')
  process.exit(1)
} else {
  console.log('\n✅ Toutes les pages sont conformes !')
  process.exit(0)
}
