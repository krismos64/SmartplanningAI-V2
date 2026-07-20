/**
 * types.ts - Types des pages secteur /solutions/[slug]
 *
 * @description Modèle de données du template « page secteur » (SEO/GEO).
 * Les icônes sont des identifiants sérialisables (pas de composant React)
 * pour que les données restent importables côté serveur (sitemap, tests)
 * sans tirer lucide-react.
 *
 * @ticket SP-552
 */

/** Identifiants d'icônes mappés vers lucide-react dans SectorContent */
export type SectorIconName =
  | 'clock'
  | 'users'
  | 'alert'
  | 'scale'
  | 'calendar'
  | 'smartphone'
  | 'bell'
  | 'message'
  | 'file-down'
  | 'user-plus'
  | 'store'
  | 'sun'
  | 'hard-hat'
  | 'map-pin'

export interface SectorFaq {
  question: string
  answer: string
}

export interface SectorChallenge {
  icon: SectorIconName
  title: string
  description: string
}

export interface SectorSolution {
  icon: SectorIconName
  feature: string
  benefit: string
}

export interface SectorPricingExample {
  /** Effectif utilisé pour le calcul per-seat (calculateMonthlyPrice) */
  headcount: number
  /** Ex : « une brigade de 12 personnes » */
  teamLabel: string
  description: string
}

export interface SectorData {
  /** Segment d'URL : /solutions/[slug] */
  slug: string
  /** Nom complet du secteur, ex : « Restauration et hôtellerie » */
  name: string
  /** Version courte pour les titres de section, ex : « restauration » */
  shortName: string
  /** Badge affiché dans le hero */
  badge: string
  /** Title SEO SANS le suffixe « | SmartPlanning » (ajouté par le layout) */
  metaTitle: string
  /** Meta description 150-165 caractères */
  metaDescription: string
  keywords: string[]
  /** H1 en deux parties : texte + portion colorée */
  h1: string
  h1Highlight: string
  /**
   * Réponse directe citable (règle GEO : la réponse à la requête dans
   * les 100 premiers mots de la page)
   */
  directAnswer: string
  /** Paragraphes d'introduction (contexte métier) */
  intro: string[]
  challenges: SectorChallenge[]
  solutions: SectorSolution[]
  pricingExample: SectorPricingExample
  faqs: SectorFaq[]
  /** Date réelle de dernière modification du contenu (YYYY-MM-DD) */
  lastModified: string
}
