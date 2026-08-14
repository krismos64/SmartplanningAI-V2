/**
 * Polices des pages publiques
 *
 * Via Context7 (next/font/google, Next.js 15) : les variables de police se
 * declarent sur <html> dans le layout racine, puis se consomment par
 * var(--font-*) depuis Tailwind.
 *
 * Deux familles, reservees aux pages publiques :
 * - Geist : sans-serif des titres et du corps
 * - Instrument Serif italique : seconde ligne des titres, geste signature
 *   de la direction editoriale
 *
 * L'application privee conserve Rajdhani et Plus Jakarta Sans : les
 * familles `sans` et `display` de typography.ts ne sont pas modifiees.
 *
 * @see SP-565 - Socle visuel public
 */

import { Geist, Instrument_Serif } from 'next/font/google'

/**
 * Geist, police sans-serif des pages publiques.
 *
 * Poids variable : un seul fichier couvre toute la plage 100-900, ce qui
 * evite de multiplier les requetes pour les graisses de titre.
 */
export const geist = Geist({
  weight: 'variable',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  /*
   * Prechargee depuis l'audit Lighthouse du 14 aout 2026.
   *
   * Elle etait `preload: false`, ce qui se defendait tant que Rajdhani et
   * Inter occupaient le preload : la variable n'est declaree qu'ici, donc
   * seules les pages publiques la consomment. Mais le layout racine precharge
   * sur TOUTES les routes, si bien que les polices de l'application privee
   * partaient en priorite haute pendant que Geist, seule police reellement
   * peinte sur ces pages, attendait la resolution du CSS.
   *
   * Le preload est desormais porte par la police qui rend le texte visible.
   * Geist est en poids variable : un seul fichier couvre 100-900, le cout du
   * prechargement reste donc une requete.
   */
  preload: true,
})

/**
 * Instrument Serif, uniquement en italique.
 *
 * Un seul poids et un seul style : le fichier reste leger, l'usage etant
 * limite a la seconde ligne des grands titres.
 */
export const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-editorial',
  preload: false,
})

/** Classes de variables a poser sur <html>, cote layout racine. */
export const publicFontVariables = `${geist.variable} ${instrumentSerif.variable}`
