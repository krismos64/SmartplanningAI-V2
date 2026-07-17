/**
 * types.ts - Types des guides pratiques /guides/[slug]
 *
 * @description Modèle de données du hub éditorial (SEO/GEO). Contenu
 * long format (1 200+ mots) : sections H2 ancrées, FAQ, références
 * légales datées. Données pures sérialisables (importables par le
 * sitemap et les tests sans dépendance React).
 *
 * @ticket SP-555
 */

export interface GuideFaq {
  question: string
  answer: string
}

export interface GuideSection {
  /** Ancre HTML (sommaire + liens profonds) */
  id: string
  /** Titre H2 de la section */
  title: string
  paragraphs: string[]
  /** Liste à puces optionnelle affichée après les paragraphes */
  bullets?: string[]
  /**
   * Si renseigné, la section est une étape du schéma HowTo
   * (guides « méthode ») : nom court de l'étape
   */
  stepName?: string
}

export interface GuideData {
  /** Segment d'URL : /guides/[slug] */
  slug: string
  /** Titre H1 et headline Article */
  title: string
  /** Title SEO SANS le suffixe « | SmartPlanning » (ajouté par le layout) */
  metaTitle: string
  /** Meta description 120-165 caractères */
  metaDescription: string
  keywords: string[]
  /** Résumé affiché sur la carte du hub */
  excerpt: string
  /**
   * Réponse directe citable (règle GEO : la réponse à la requête dans
   * les 100 premiers mots de la page)
   */
  directAnswer: string
  sections: GuideSection[]
  faqs: GuideFaq[]
  /** Date de première publication (YYYY-MM-DD, schéma Article) */
  datePublished: string
  /** Date réelle de dernière mise à jour du contenu (YYYY-MM-DD) */
  lastModified: string
  /** Temps de lecture estimé, affiché sur le hub et la page */
  readingMinutes: number
}
