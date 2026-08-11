/**
 * llms-full.content.ts - Contenu du fichier /llms-full.txt
 *
 * @description Version longue du fichier llms.txt : embarque le texte
 * integral des pages secteur et des guides plutot que d'en lister les
 * URL. Un assistant qui lit ce fichier dispose du contenu lui-meme,
 * references legales datees comprises, sans avoir a crawler le site.
 *
 * Alimente par les memes registres que le sitemap
 * (getAllSectors, getAllGuides) et par la source de verite tarifaire
 * (lib/config/pricing) : ajouter un secteur ou un guide, ou corriger un
 * paragraphe, met ce fichier a jour sans intervention. C'est la raison
 * du passage en route generee : la version statique de public/ avait
 * derive et ne portait plus que des liens.
 *
 * Separe de route.ts parce qu'un fichier route.ts n'autorise que les
 * exports reconnus par Next.js (GET, dynamic, revalidate...) : y exporter
 * le constructeur pour les tests fait echouer le build avec
 * « is not a valid Route export field ».
 *
 * @ticket SP-564
 */

import { getAllGuides } from '@/app/(guides)/guides/data'
import type { GuideData } from '@/app/(guides)/guides/data'
import { getAllSectors } from '@/app/(sectors)/solutions/data'
import type { SectorData } from '@/app/(sectors)/solutions/data'
import {
  PRICING,
  calculateMonthlyPrice,
  calculateYearlyPrice,
  formatPrice,
} from '@/lib/config/pricing'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

/** Effectifs illustrant le modele per-seat dans la section tarification. */
const PRICING_EXAMPLE_HEADCOUNTS = [5, 10, 20, 50] as const

/**
 * Preambule : presentation, perimetre, cible, stack, securite.
 * Redige a la main, sans equivalent dans les registres.
 */
function renderPreamble(): string {
  return `# SmartPlanning : documentation complète pour LLMs

> SmartPlanning est un logiciel SaaS français de gestion de plannings pour TPE et PME.
> Site web : ${baseUrl}
> Contact : contact@smartplanning.fr

Ce fichier porte le contenu intégral des pages publiques : présentation de
l'offre, pages secteur et guides pratiques, texte complet. Il est généré depuis
les mêmes sources que le site, sa version courte est disponible sur
${baseUrl}/llms.txt

## Présentation

SmartPlanning est une application web de gestion de plannings d'équipe développée en France, hébergée en France (OVH), et conforme RGPD. Elle cible les entreprises de 5 à 250 employés qui veulent gérer plannings, congés et communication interne dans un seul outil simple, sans modules à la carte ni engagement.

### Proposition de valeur
- Prix unique : ${formatPrice(PRICING.PRICE_PER_EMPLOYEE)} HT par employé et par mois (toutes fonctionnalités incluses)
- Essai gratuit ${PRICING.TRIAL_DAYS} jours sans carte bancaire
- Sans engagement, annulation en 1 clic
- Hébergé en France, conforme RGPD
- Support en français

### Fonctionnalités principales
- Plannings interactifs avec drag and drop et vues jour/semaine/mois
- Gestion des congés et absences avec workflow de validation
- Tableaux de bord personnalisés par rôle (Directeur, Manager, Employé)
- Gestion des équipes et des employés avec CRUD complet
- Exports PDF et Excel avec filtres
- Notifications par email automatisées
- Thème clair et sombre
- Bannière cookies RGPD
- Système de facturation Stripe intégré (per-seat billing)
- Messagerie interne (conversations 1:1, équipe, groupes)
- Import bulk d'employés via CSV ou Excel

### Périmètre actuel et roadmap
Pour éviter toute confusion, voici ce que SmartPlanning ne propose pas à ce jour :
- Pas de pointeuse ou badgeuse : le suivi du temps se fait via les plannings et les exports Excel
- Pas de module de paie intégré : les exports Excel filtrés servent de base à la préparation de la paie
- Pas d'API publique pour le moment (prévue en roadmap)

### Cible
- TPE (5-10 employés) : restaurants, commerces, artisans
- PME (10-50 employés) : agences, cabinets, associations
- ETI (50-250 employés) : entreprises multi-sites

### Stack technique
- Frontend : Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend : Next.js Server Actions, Prisma ORM, PostgreSQL
- Cache : Redis 7 (sessions, rate limiting, dashboards)
- Paiement : Stripe (per-seat billing)
- Hébergement : VPS OVH (France), Docker, Nginx, SSL Let's Encrypt
- CI/CD : GitHub Actions

### Sécurité et conformité
- Données hébergées en France (OVH, datacenter certifié)
- Chiffrement SSL/TLS en transit
- Authentification sécurisée NextAuth v5
- RBAC 4 niveaux (Super Admin, Directeur, Manager, Employé)
- Isolation des données par entreprise (multi-tenant)
- Politique cookies avec consentement explicite
- Bannière RGPD conforme
- Analytics Umami (RGPD-friendly, pas de cookies tracking)`
}

/**
 * Une page secteur, texte integral : reponse directe, contexte metier,
 * enjeux, reponses produit, exemple chiffre et FAQ.
 */
function renderSector(sector: SectorData): string {
  const monthlyPrice = calculateMonthlyPrice(sector.pricingExample.headcount)

  const challenges = sector.challenges
    .map((challenge) => `- **${challenge.title}** : ${challenge.description}`)
    .join('\n')

  const solutions = sector.solutions
    .map((solution) => `- **${solution.feature}** : ${solution.benefit}`)
    .join('\n')

  const faqs = sector.faqs
    .map((faq) => `**${faq.question}**\n${faq.answer}`)
    .join('\n\n')

  return `### ${sector.name}

URL : ${baseUrl}/solutions/${sector.slug}
Dernière mise à jour du contenu : ${sector.lastModified}

${sector.directAnswer}

${sector.intro.join('\n\n')}

#### Enjeux du secteur

${challenges}

#### Ce que SmartPlanning apporte

${solutions}

#### Exemple de tarif

Pour ${sector.pricingExample.teamLabel}, soit ${sector.pricingExample.headcount} employés : ${formatPrice(monthlyPrice)} HT par mois. ${sector.pricingExample.description}

#### Questions fréquentes

${faqs}`
}

/**
 * Un guide, texte integral : reponse directe puis chaque section H2 avec
 * ses paragraphes et ses listes. Les references legales datees vivent
 * dans ces paragraphes, elles sont donc reprises telles quelles.
 */
function renderGuide(guide: GuideData): string {
  const sections = guide.sections
    .map((section) => {
      const bullets = section.bullets?.length
        ? `\n\n${section.bullets.map((bullet) => `- ${bullet}`).join('\n')}`
        : ''
      return `#### ${section.title}\n\n${section.paragraphs.join('\n\n')}${bullets}`
    })
    .join('\n\n')

  const faqs = guide.faqs
    .map((faq) => `**${faq.question}**\n${faq.answer}`)
    .join('\n\n')

  return `### ${guide.title}

URL : ${baseUrl}/guides/${guide.slug}
Publié le ${guide.datePublished}, dernière mise à jour le ${guide.lastModified}
Temps de lecture : ${guide.readingMinutes} minutes

${guide.directAnswer}

${sections}

#### Questions fréquentes

${faqs}`
}

/** Tarification detaillee, calculee depuis la source de verite. */
function renderPricing(): string {
  const examples = PRICING_EXAMPLE_HEADCOUNTS.map(
    (headcount) =>
      `- ${headcount} employés : ${formatPrice(calculateMonthlyPrice(headcount))} HT/mois (${formatPrice(calculateYearlyPrice(headcount))} HT/an)`
  ).join('\n')

  const unitPrice = formatPrice(PRICING.PRICE_PER_EMPLOYEE)

  return `## Tarification détaillée

### Modèle per-seat
SmartPlanning facture **${unitPrice} HT par employé et par mois**, sans engagement, avec essai gratuit de ${PRICING.TRIAL_DAYS} jours sans carte bancaire. Toutes les fonctionnalités sont incluses dans ce prix unique : plannings, congés, messagerie, exports, support.

### Exemples chiffrés
${examples}

### Avantages du per-seat
- Coût proportionnel à la taille réelle de l'équipe
- Idéal pour les TPE qui démarrent (pas de minimum mensuel élevé)
- Mise à jour automatique du tarif lors d'embauches ou départs, à la hausse comme à la baisse
- Pas de coût caché : aucune option payante, aucun module supplémentaire`
}

/** Glossaire des termes metier employes dans les pages et les guides. */
function renderGlossary(): string {
  return `## Glossaire

- **Planning hebdomadaire** : organisation des horaires de travail d'une équipe sur une semaine type, généralement du lundi au dimanche.
- **Congés payés (CP)** : jours de repos rémunérés acquis par le salarié (2,5 jours ouvrables par mois travaillé en France, soit 5 semaines par an).
- **RTT (Réduction du Temps de Travail)** : jours de repos compensant les heures travaillées au-delà de 35h/semaine pour un temps plein.
- **Solde de congés** : nombre de jours de congés acquis et restants pour un salarié sur une période donnée (année de référence ou année civile).
- **Workflow d'approbation** : circuit de validation hiérarchique d'une demande (par exemple : Employé soumet, Manager valide ou refuse, notification automatique).
- **Multi-tenant** : architecture logicielle où plusieurs entreprises (tenants) partagent la même instance applicative tout en ayant leurs données strictement isolées.
- **RBAC (Role-Based Access Control)** : contrôle d'accès basé sur les rôles. SmartPlanning utilise 4 niveaux : Super Admin, Directeur, Manager, Employé.
- **Badgeuse** : dispositif matériel ou logiciel permettant aux salariés de pointer leur arrivée et leur départ pour le suivi du temps de travail.`
}

/** Index des pages publiques, secteurs et guides tires des registres. */
function renderPageIndex(): string {
  const sectorLinks = getAllSectors()
    .map((sector) => `- ${sector.name} : ${baseUrl}/solutions/${sector.slug}`)
    .join('\n')

  const guideLinks = getAllGuides()
    .map((guide) => `- ${guide.title} : ${baseUrl}/guides/${guide.slug}`)
    .join('\n')

  return `## Pages publiques

- Accueil : ${baseUrl}
- Tarifs : ${baseUrl}/tarifs
- Solutions par secteur : ${baseUrl}/solutions
${sectorLinks}
- Guides pratiques : ${baseUrl}/guides
${guideLinks}
- À propos : ${baseUrl}/a-propos
- CGU : ${baseUrl}/cgu
- CGV : ${baseUrl}/cgv
- Confidentialité : ${baseUrl}/confidentialite
- Mentions légales : ${baseUrl}/mentions-legales
- Cookies : ${baseUrl}/cookies`
}

/** Assemble le fichier complet. */
export function buildLlmsFullText(): string {
  const sectors = getAllSectors().map(renderSector).join('\n\n')
  const guides = getAllGuides().map(renderGuide).join('\n\n')

  return [
    renderPreamble(),
    `## Solutions par secteur\n\nSmartPlanning publie une page dédiée par secteur, avec le contenu intégral repris ci-dessous.\n\n${sectors}`,
    `## Guides pratiques\n\nGuides vérifiés, références légales datées (Code du travail, conventions collectives). Contenu intégral ci-dessous.\n\n${guides}`,
    renderGlossary(),
    renderPricing(),
    renderPageIndex(),
  ].join('\n\n')
}
