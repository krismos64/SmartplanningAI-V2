/**
 * DisplayTitle - Titre a deux registres
 *
 * Rend le motif signature de la direction editoriale : une premiere ligne
 * en Geist grasse, une seconde en serif italique.
 *
 *   Moins d'outils.
 *   Plus de clarte.   <- serif italique, accentuee
 *
 * Server Component : aucune interactivite.
 *
 * Le niveau de titre est configurable et n'est PAS fige a <h1> : une page
 * ne porte qu'un seul h1, alors que ce composant sert aussi les titres de
 * section. Figer le niveau casserait le plan semantique, que les moteurs
 * et les lecteurs d'ecran suivent pour parcourir la page.
 *
 * @see SP-565 - Socle visuel public
 */

import { cn } from '@/lib/utils'

export type DisplayTitleLevel = 'h1' | 'h2' | 'h3'

interface DisplayTitleProps {
  /** Premiere ligne, en Geist */
  children: React.ReactNode
  /**
   * Seconde ligne, en serif italique. Facultative : un titre a une seule
   * ligne reste valide.
   */
  accent?: React.ReactNode
  /**
   * Niveau semantique. `h2` par defaut : le h1 est un choix explicite,
   * pris page par page.
   */
  as?: DisplayTitleLevel
  /**
   * Couleur de la seconde ligne selon le fond.
   * `onVivid` sert les aplats corail et lime : l'accent corail y serait
   * invisible, la seconde ligne y prend donc le bleu nuit du texte.
   */
  tone?: 'onLight' | 'onDark' | 'onVivid'
  /** Identifiant, pour un aria-labelledby porte par la section */
  id?: string
  className?: string
}

/**
 * Tailles par niveau. Le h1 domine nettement, conformement au rythme
 * typographique de la direction.
 */
const LEVEL_CLASSES: Record<DisplayTitleLevel, string> = {
  h1: 'text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
  h2: 'text-4xl sm:text-5xl lg:text-6xl',
  h3: 'text-2xl sm:text-3xl',
}

const ACCENT_TONE_CLASSES = {
  onLight: 'text-public-accent',
  onDark: 'text-public-accent-on-dark',
  onVivid: 'text-public-content-on-vivid',
} as const

export function DisplayTitle({
  children,
  accent,
  as = 'h2',
  tone = 'onLight',
  id,
  className,
}: DisplayTitleProps) {
  const Heading = as

  return (
    <Heading
      id={id}
      className={cn(
        'font-geist font-bold leading-[0.95] tracking-[-0.03em]',
        LEVEL_CLASSES[as],
        className
      )}
    >
      {children}
      {accent ? (
        <>
          {/* Force le retour a la ligne sans injecter de <br> dans le flux
              de texte lu par les technologies d'assistance */}
          <span className="block" />
          <span
            className={cn(
              'font-editorial italic tracking-[-0.01em]',
              ACCENT_TONE_CLASSES[tone]
            )}
          >
            {accent}
          </span>
        </>
      ) : null}
    </Heading>
  )
}
