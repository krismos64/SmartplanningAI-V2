/**
 * route.ts - Sert /llms-full.txt
 *
 * @description Route Handler prerendue au build. Le contenu vit dans
 * llms-full.content.ts : un fichier route.ts n'autorise que les exports
 * reconnus par Next.js, y exporter le constructeur casse le build.
 *
 * @ticket SP-564
 */

import { buildLlmsFullText } from './llms-full.content'

/** Prerendu au build : aucune donnee de requete n'intervient. */
export const dynamic = 'force-static'

export function GET(): Response {
  return new Response(buildLlmsFullText(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
