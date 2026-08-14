/**
 * page-last-modified.ts - Dates de derniere modification des pages statiques
 *
 * @description Source unique des dates de fraicheur du contenu public. Deux
 * consommateurs les lisent :
 *   - `sitemap.ts`, pour le `lastmod` de chaque entree
 *   - les composants `StructuredData`, pour le `dateModified` du JSON-LD
 *
 * Ces deux canaux disaient la meme chose sans jamais se parler, et rien ne les
 * empechait de diverger : l'audit SEO du 14 aout 2026 a trouve `/tarifs` et
 * l'accueil sans aucun `dateModified` alors que leur `lastmod` etait a jour
 * dans le sitemap. Les faire lire la meme constante rend cette divergence
 * impossible plutot que simplement improbable.
 *
 * Les pages secteur et les guides ne figurent pas ici : leur date vit dans
 * leur fichier de donnees (`lastModified`), au plus pres du contenu qu'elle
 * decrit, et le registre la propage deja aux deux canaux.
 *
 * A METTRE A JOUR dans toute PR qui modifie le contenu d'une de ces pages.
 * Jamais `new Date()` : un `lastmod` qui bouge a chaque build est ignore par
 * Google.
 *
 * @ticket SP-462, SP-550, SP-552
 */

export const PAGE_LAST_MODIFIED = {
  home: new Date('2026-08-13'),
  tarifs: new Date('2026-08-13'),
  aPropos: new Date('2026-08-13'),
  contact: new Date('2026-08-13'),
  cgu: new Date('2026-08-13'),
  cgv: new Date('2026-08-13'),
  confidentialite: new Date('2026-08-13'),
  mentionsLegales: new Date('2026-08-13'),
  cookies: new Date('2026-08-13'),
} as const

/**
 * Date au format `AAAA-MM-JJ`, celui qu'attend `dateModified` en JSON-LD.
 *
 * `toISOString()` renvoie un horodatage complet en UTC. Schema.org accepte les
 * deux formes, mais la date seule evite d'annoncer une precision a la seconde
 * qui n'existe pas : ces dates sont saisies a la main, au jour pres.
 */
export function toSchemaDate(date: Date): string {
  // `slice` plutot que `split('T')[0]` : sous `noUncheckedIndexedAccess`,
  // l'acces indexe est type `string | undefined`. Un `toISOString()` fait
  // toujours 24 caracteres dont les 10 premiers sont la date, la decoupe est
  // donc sure sans assertion ni operateur non-null.
  return date.toISOString().slice(0, 10)
}
