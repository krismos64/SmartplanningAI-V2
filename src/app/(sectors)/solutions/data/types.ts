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
   * Résumé affiché sur la carte du hub `/solutions`, 25 à 30 mots.
   *
   * Pendant à `excerpt` côté guides, dont il reprend le calibre. La carte
   * affichait auparavant `intro[0]`, soit le premier paragraphe entier de la
   * page de destination : 88 à 104 mots selon le secteur, trois à quatre fois
   * la longueur d'un aperçu. Le visiteur lisait le texte sur le hub puis
   * retombait dessus à l'identique après avoir cliqué, et ce paragraphe pose
   * le problème du métier sans dire ce que l'outil apporte, donc sans donner
   * de raison d'ouvrir la page.
   *
   * Écrire une phrase qui nomme les contraintes du secteur puis ce que
   * SmartPlanning en fait. Ne pas répéter le nom du secteur, le titre de la
   * carte le porte déjà.
   */
  teaser: string
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
